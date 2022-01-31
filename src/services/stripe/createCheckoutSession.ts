import firebase, { analytics, auth, firestore, storage } from "../../firebase";
import initializeStripe from "./initializeStripe";

export async function createCheckoutSession(uid: string) {
  // Create a new checkout session in the subollection inside this users document
  const checkoutSessionRef = await firestore
    .collection("users")
    .doc(uid)
    .collection("checkout_sessions")
    .add({
      price: "price_1JWuJ0CGe6eMCP7cRNqcUImK",
      success_url: window.location.origin,
      cancel_url: window.location.origin,
    });

  // Wait for the CheckoutSession to get attached by the extension
  checkoutSessionRef.onSnapshot(async (snap) => {
    const data = snap.data();
    console.log(data);
    const sessionId = data?.sessionId;
    if (sessionId) {
      // We have a session, let's redirect to Checkout
      // Init Stripe
      const stripe = await initializeStripe();
      stripe?.redirectToCheckout({ sessionId });
    }
  });
}
