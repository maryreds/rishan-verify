'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { PLANS, type PlanKey } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading billing...</p></div>}>
      <BillingContent />
    </Suspense>
  )
}

function BillingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState<PlanKey | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_plan, subscription_status, is_employer, role')
        .eq('id', user.id)
        .single()

      if (!profile?.is_employer && profile?.role !== 'employer') {
        router.push('/dashboard')
        return
      }

      setCurrentPlan(profile?.subscription_plan || null)
      setSubscriptionStatus(profile?.subscription_status || null)
      setPageLoading(false)
    }

    loadProfile()
  }, [router])

  async function handleSubscribe(planKey: PlanKey) {
    setLoading(planKey)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Checkout error:', data.error)
        alert(data.error || 'Something went wrong')
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Unlock verified candidate intelligence for your recruiting pipeline.
        </p>
      </div>

      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-center text-green-800">
          Your subscription is now active. Welcome aboard!
        </div>
      )}

      {canceled && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center text-yellow-800">
          Checkout was canceled. No charges were made.
        </div>
      )}

      {subscriptionStatus === 'past_due' && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-800">
          Your payment is past due. Please update your payment method to continue service.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {(Object.entries(PLANS) as [PlanKey, (typeof PLANS)[PlanKey]][]).map(
          ([key, plan]) => {
            const isCurrentPlan = currentPlan === key
            const isPopular = key === 'professional'

            return (
              <Card
                key={key}
                className={`relative flex flex-col ${
                  isCurrentPlan
                    ? 'border-2 border-primary shadow-lg'
                    : isPopular
                    ? 'border-2 border-blue-400 shadow-md'
                    : ''
                }`}
              >
                {isPopular && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white hover:bg-blue-500">
                      Most Popular
                    </Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <div className="mt-2">
                    {plan.price !== null ? (
                      <>
                        <span className="text-4xl font-bold">
                          ${plan.price}
                        </span>
                        <span className="text-muted-foreground">/mo</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold">Custom</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <span className="text-green-600 mt-0.5 shrink-0">
                          &#10003;
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  {key === 'enterprise' ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        (window.location.href = 'mailto:sales@rishanverify.com')
                      }
                    >
                      Contact Sales
                    </Button>
                  ) : isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={isPopular ? 'default' : 'outline'}
                      disabled={loading !== null}
                      onClick={() => handleSubscribe(key)}
                    >
                      {loading === key ? 'Redirecting...' : 'Subscribe'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          }
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        All plans are billed monthly. Cancel anytime from your Stripe dashboard.
      </p>
    </div>
  )
}
