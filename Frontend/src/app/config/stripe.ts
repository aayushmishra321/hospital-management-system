import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RQKzBFjky9wHK6tca2NxUZxKxrI2mpH9isbU23Kvi4jQfAA2x4cmrCpXD7tAhpbORyansnFbpjMH1tLDg3SCrbB00bEuXQUZp';

// Initialize Stripe
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Stripe configuration
export const stripeConfig = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0ea5e9', // Cyan-500
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px'
    }
  },
  loader: 'auto' as const
};

// Payment element options
export const paymentElementOptions = {
  layout: {
    type: 'tabs' as const,
    defaultCollapsed: false
  },
  paymentMethodOrder: ['card'], // Only enable card payments for now
  fields: {
    billingDetails: {
      name: 'auto' as const,
      email: 'auto' as const,
      phone: 'auto' as const,
      address: {
        country: 'auto' as const,
        line1: 'auto' as const,
        line2: 'auto' as const,
        city: 'auto' as const,
        state: 'auto' as const,
        postalCode: 'auto' as const
      }
    }
  }
};

// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// Payment status colors
export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'paid':
      return 'text-green-600 bg-green-100';
    case 'unpaid':
      return 'text-red-600 bg-red-100';
    case 'partially_paid':
      return 'text-yellow-600 bg-yellow-100';
    case 'refunded':
      return 'text-gray-600 bg-gray-100';
    case 'partially_refunded':
      return 'text-orange-600 bg-orange-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Payment method icons
export const getPaymentMethodIcon = (method: string): string => {
  switch (method) {
    case 'card':
      return '💳';
    case 'bank_transfer':
      return '🏦';
    case 'digital_wallet':
      return '📱';
    case 'cash':
      return '💵';
    case 'insurance':
      return '🛡️';
    default:
      return '💳';
  }
};