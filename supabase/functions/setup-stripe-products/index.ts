import Stripe from "stripe";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const products = [
  {
    name: "Free Plan",
    description: "Up to 500 subscribers, 1,000 emails per month",
    price: 0,
  },
  {
    name: "Pro Plan",
    description: "Up to 5,000 subscribers, 20,000 emails per month",
    price: 2900, // $29.00
  },
  {
    name: "Enterprise Plan",
    description: "Unlimited subscribers and emails",
    price: 9900, // $99.00
  },
];

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Serves.serve(async () => {
  try {
    const createdProducts = [];

    for (const product of products) {
      // Create or update product
      const stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description,
      });

      // Create price for the product
      if (product.price > 0) {
        const price = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: product.price,
          currency: "usd",
          recurring: {
            interval: "month",
          },
        });

        createdProducts.push({
          ...product,
          stripeProductId: stripeProduct.id,
          stripePriceId: price.id,
        });
      }
    }

    return new Response(JSON.stringify({ products: createdProducts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
