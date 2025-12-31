import React, { useState } from 'react';
import { Check, Zap, Shield, Users, BarChart, Clock, Infinity } from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';

interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

const PricingView: React.FC = () => {
  const { showInfo } = useAlert();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const plans: PricingPlan[] = [
    {
      name: 'Starter',
      price: billingPeriod === 'monthly' ? 29 : 24,
      period: billingPeriod === 'monthly' ? 'month' : 'month',
      description: 'Perfect for individuals and small teams',
      features: [
        'Up to 100 test executions/month',
        '3 team members',
        'Basic test automation',
        '1 concurrent execution',
        'Email support',
        '7 days data retention',
        'Community access',
      ],
      cta: 'Start Free Trial',
    },
    {
      name: 'Professional',
      price: billingPeriod === 'monthly' ? 99 : 82,
      period: billingPeriod === 'monthly' ? 'month' : 'month',
      description: 'For growing teams with advanced needs',
      popular: true,
      features: [
        'Up to 1,000 test executions/month',
        '10 team members',
        'Advanced test automation',
        '5 concurrent executions',
        'Priority email & chat support',
        '30 days data retention',
        'Jira, GitLab, Slack integrations',
        'Custom test reports',
        'API access',
      ],
      cta: 'Start Free Trial',
    },
    {
      name: 'Enterprise',
      price: billingPeriod === 'monthly' ? 299 : 249,
      period: billingPeriod === 'monthly' ? 'month' : 'month',
      description: 'For large organizations with custom requirements',
      features: [
        'Unlimited test executions',
        'Unlimited team members',
        'AI-powered test generation',
        'Unlimited concurrent executions',
        '24/7 dedicated support',
        'Unlimited data retention',
        'All integrations included',
        'Custom workflows & plugins',
        'SSO & advanced security',
        'On-premise deployment option',
        'SLA guarantees',
      ],
      cta: 'Contact Sales',
    },
  ];

  const features = [
    {
      icon: <Zap className="text-blue-600" size={24} />,
      title: 'Lightning Fast',
      description: 'Execute tests 10x faster with parallel execution',
    },
    {
      icon: <Shield className="text-green-600" size={24} />,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption and compliance certifications',
    },
    {
      icon: <Users className="text-purple-600" size={24} />,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with your entire team',
    },
    {
      icon: <BarChart className="text-orange-600" size={24} />,
      title: 'Advanced Analytics',
      description: 'Gain insights with comprehensive test reports',
    },
    {
      icon: <Clock className="text-indigo-600" size={24} />,
      title: '24/7 Monitoring',
      description: 'Continuous testing and instant notifications',
    },
    {
      icon: <Infinity className="text-pink-600" size={24} />,
      title: 'Unlimited Scalability',
      description: 'Scale effortlessly as your testing needs grow',
    },
  ];

  const handleSubscribe = (planName: string) => {
    console.log('Subscribe to:', planName);
    showInfo(`Subscribing to ${planName} plan! (This is a demo)`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose the perfect plan for your testing needs. All plans include a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center bg-white rounded-full p-1 shadow-md">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingPeriod === 'annual'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-xl border-2 ${
                plan.popular
                  ? 'border-blue-500 ring-4 ring-blue-100 transform scale-105'
                  : 'border-slate-200'
              } p-8 relative`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-600 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-slate-900">${plan.price}</span>
                  <span className="text-slate-600 ml-2">/{plan.period}</span>
                </div>
                {billingPeriod === 'annual' && (
                  <p className="text-sm text-green-600 mt-2">
                    Billed ${plan.price * 12} annually
                  </p>
                )}
              </div>

              <button
                onClick={() => handleSubscribe(plan.name)}
                className={`w-full py-3 rounded-lg font-semibold transition-all mb-6 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {plan.cta}
              </button>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-900 mb-3">What's included:</p>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="text-green-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-slate-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="bg-white rounded-2xl shadow-xl p-12 mb-20">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Everything You Need to Test Faster
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-2xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Can I change my plan later?
              </h4>
              <p className="text-slate-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-slate-600">
                We accept all major credit cards, PayPal, and wire transfers for enterprise plans.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Is there a free trial?
              </h4>
              <p className="text-slate-600">
                Absolutely! All plans come with a 14-day free trial. No credit card required.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                What happens after my trial ends?
              </h4>
              <p className="text-slate-600">
                You'll be notified before your trial ends. Choose a plan to continue or downgrade to our free tier.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Do you offer discounts for non-profits?
              </h4>
              <p className="text-slate-600">
                Yes! We offer special pricing for educational institutions and non-profit organizations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Can I cancel anytime?
              </h4>
              <p className="text-slate-600">
                Yes, you can cancel your subscription at any time. No questions asked, no cancellation fees.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of teams already testing smarter with iBotTester
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleSubscribe('Professional')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors shadow-lg"
            >
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Talk to Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingView;
