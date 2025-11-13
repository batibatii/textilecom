import 'server-only';

import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors on Vercel
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;

    if (!apiKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not defined. Please add it to your environment variables.'
      );
    }

    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2025-10-29.clover',
    });
  }

  return stripeInstance;
}

// For backward compatibility, export as a getter
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});
