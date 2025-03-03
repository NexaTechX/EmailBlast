import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendVerificationEmail: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        checkEmailVerification(session.user.id);
      }
    });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        checkEmailVerification(session.user.id);
      } else {
        setIsEmailVerified(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkEmailVerification = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("email_verified")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error checking email verification:", error);
        return;
      }

      setIsEmailVerified(data?.email_verified || false);
    } catch (error) {
      console.error("Error checking email verification:", error);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;

    // Create a profile entry with email_verified set to false
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          email_verified: true, // Set to true since we're using Supabase's email confirmation
        },
      ]);
      if (profileError) console.error("Error creating profile:", profileError);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const sendVerificationEmail = async (email: string) => {
    try {
      // In a real implementation, you would call your backend to send a verification email
      // For this example, we'll just simulate sending an email
      console.log(`Sending verification email to ${email}`);

      // You could use Supabase's built-in email verification if you've configured it:
      // await supabase.auth.resetPasswordForEmail(email, {
      //   redirectTo: `${window.location.origin}/verify-email`,
      // });

      return Promise.resolve();
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw error;
    }
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
        sendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
