import Stripe from 'stripe'

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion })
  : null

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 199,
    searches: 50,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || '',
    features: ['50 candidate searches/mo', 'Basic filters', 'Email support'],
  },
  professional: {
    name: 'Professional',
    price: 499,
    searches: -1, // unlimited
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    features: ['Unlimited searches', 'Advanced filters', 'Saved candidates', 'Priority support'],
  },
  enterprise: {
    name: 'Enterprise',
    price: null, // custom
    searches: -1,
    priceId: '',
    features: ['Everything in Pro', 'API access', 'Bulk verification', 'Dedicated support', 'Custom integrations'],
  },
} as const

export type PlanKey = keyof typeof PLANS
