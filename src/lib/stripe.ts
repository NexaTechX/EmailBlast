import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "./supabase";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PRICE_LOOKUP = {
  free: "price_free",
  pro: "price_pro",
  enterprise: "price_enterprise",
};

export async function createCheckoutSession(priceId: string) {
  try {
    const {
      data: { session },
    } = await supabase.functions.invoke("create-checkout-session", {
      body: { priceId },
    });

    const stripe = await stripePromise;
    if (!stripe) throw new Error("Stripe failed to load");

    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    });
    if (error) throw error;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function createPortalSession() {
  try {
    const {
      data: { url },
    } = await supabase.functions.invoke("create-portal-session");
    window.location.href = url;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
