import { createContext, useContext, useEffect, useState } from "react";
import { client } from "./neon";

// Minimal user shape we rely on (Neon Auth user via the Supabase-compatible adapter).
type AuthUser = {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ needsVerification: boolean }>;
  signOut: () => Promise<void>;
  verifyEmailOtp: (
    email: string,
    token: string,
    password?: string,
  ) => Promise<{ hasSession: boolean }>;
  resendVerification: (email: string) => Promise<void>;
  sendVerificationEmail: (email: string) => Promise<void>;
};

// skipcq: JS-W1042 — React's createContext<T> requires a default arg; `undefined` is the intended sentinel.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Idempotent: make sure the signed-in user has a profiles row. Runs on every
// session bootstrap so BOTH email/password and social logins get a profile
// (the old code only created it inside signUp, so OAuth users never got one).
// `id` is omitted so the DB default `auth.user_id()` fills it and RLS passes.
async function ensureProfile() {
  try {
    // Non-empty body (PostgREST rejects an empty insert). `id` is omitted so the
    // DB default `auth.user_id()` fills it; ignoreDuplicates skips existing rows.
    await client
      .from("profiles")
      .upsert(
        { updated_at: new Date().toISOString() },
        { onConflict: "id", ignoreDuplicates: true },
      );
  } catch (error) {
    console.error("Error ensuring profile:", error);
  }
}

// Provides auth state and actions (sign in/up/out, OTP verification) to the tree.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    // Check active session and set the user
    client.auth.getSession().then(({ data: { session } }) => {
      const sessionUser = (session?.user as AuthUser) ?? null;
      setUser(sessionUser);
      setLoading(false);
      if (sessionUser) {
        setIsEmailVerified(Boolean(sessionUser.email_confirmed_at) || true);
        ensureProfile();
      }
    });

    // Listen for auth state changes (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      const sessionUser = (session?.user as AuthUser) ?? null;
      setUser(sessionUser);
      setLoading(false);
      if (sessionUser) {
        setIsEmailVerified(Boolean(sessionUser.email_confirmed_at) || true);
        ensureProfile();
      } else {
        setIsEmailVerified(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Registers a new account; reports whether email verification is still pending.
  const signUp = async (
    email: string,
    password: string,
    name?: string,
  ): Promise<{ needsVerification: boolean }> => {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: name ? { displayName: name } : undefined,
      },
    });
    if (error) {
      // Neon Auth created the account but issued no session — this happens when
      // email verification is required. Treat it as "verification pending"
      // rather than a hard failure (the account already exists).
      if (
        /retrieve user session|session.{0,3}not.{0,3}found/i.test(
          error.message ?? "",
        )
      ) {
        return { needsVerification: true };
      }
      throw error;
    }
    // No error: a session exists only when verification is NOT required.
    // Profile creation is handled by ensureProfile() on the resulting session.
    return { needsVerification: !data?.session };
  };

  // Signs the user in with email and password.
  const signIn = async (email: string, password: string) => {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  // Ends the current session.
  const signOut = async () => {
    const { error } = await client.auth.signOut();
    if (error) throw error;
  };

  // Verify the email code the user received and make sure a session is open.
  // A password signup issues an *email-verification* OTP, verified with the
  // "signup" type (Better Auth emailOtp.verifyEmail). A passwordless flow would
  // instead issue a sign-in OTP ("email" / signIn.emailOtp), so fall back to
  // that if the signup verification is rejected. The signup path can confirm
  // the email without opening a session, so we sign in with the password to
  // guarantee one and report whether we have it.
  const verifyEmailOtp = async (
    email: string,
    token: string,
    password?: string,
  ): Promise<{ hasSession: boolean }> => {
    const signupResult = await client.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });
    if (signupResult.error) {
      const emailResult = await client.auth.verifyOtp({
        email,
        token,
        type: "email",
      });
      if (emailResult.error) throw emailResult.error;
    }

    let session = (await client.auth.getSession()).data.session;
    if (!session && password) {
      try {
        await client.auth.signInWithPassword({ email, password });
        session = (await client.auth.getSession()).data.session;
      } catch (signInError) {
        console.warn("Sign-in after verification failed:", signInError);
      }
    }
    return { hasSession: Boolean(session) };
  };

  // Re-send the verification email / code.
  const resendVerification = async (email: string) => {
    const { error } = await client.auth.resend({ email, type: "signup" });
    if (error) throw error;
  };

  const sendVerificationEmail = (_email: string): Promise<void> => {
    // Email verification is handled by Neon Auth's built-in flow.
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isEmailVerified,
        signIn,
        signUp,
        signOut,
        verifyEmailOtp,
        resendVerification,
        sendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to read the auth context; throws if used outside an AuthProvider.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
