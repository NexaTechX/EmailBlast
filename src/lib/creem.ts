import axios from "axios";

interface CreateCheckoutParams {
  productId: string;
}

export async function createCheckoutSession({
  productId,
}: CreateCheckoutParams) {
  try {
    const response = await axios.post(
      "https://api.creem.io/v1/checkouts",
      {
        product_id: productId,
      },
      {
        headers: {
          "x-api-key": import.meta.env.VITE_CREEM_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    // Redirect to the checkout URL
    window.location.href = response.data.checkout_url;
    return response.data;
  } catch (error) {
    console.error("Error creating checkout:", error);
    throw error;
  }
}
