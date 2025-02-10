import { supabase } from "./supabase";

interface CreateCheckoutParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession({
  priceId,
  successUrl,
  cancelUrl,
}: CreateCheckoutParams) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Call your backend to create a Creem checkout session
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priceId,
        userId: user.id,
        successUrl,
        cancelUrl,
      }),
    });

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function createPortalSession() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Call your backend to create a Creem customer portal session
    const response = await fetch("/api/create-portal-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
      }),
    });

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
