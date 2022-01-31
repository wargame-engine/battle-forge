import { Stripe, loadStripe } from "@stripe/stripe-js";

let stripePromise: Stripe | null;

const initializeStripe = async () => {
  if (!stripePromise) {
    stripePromise = await loadStripe("pk_live_51JWYvOCGe6eMCP7cKe04lqFA7Zu43gQy3SKfCuRCXP2cDfnYgy7F0FuKAhfGapzKSvlwK4T0parR5gMWs9PLNBVP00DeojoGch");
  }
  return stripePromise;
};

export default initializeStripe;
