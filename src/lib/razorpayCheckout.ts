/**
 * Razorpay Checkout — Client-side integration
 * Dynamically loads Razorpay script and opens payment modal
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

let scriptLoaded = false;

function loadRazorpayScript(): Promise<void> {
  if (scriptLoaded && window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (document.querySelector('script[src*="checkout.razorpay.com"]')) {
      scriptLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.head.appendChild(script);
  });
}

export interface RazorpayCheckoutOptions {
  subscriptionId: string;
  planName: string;
  amount: number; // in paise
  userEmail: string;
  userName: string;
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure: (error: any) => void;
}

export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
  await loadRazorpayScript();

  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!keyId) {
    options.onFailure(new Error('Razorpay Key ID not configured. Set VITE_RAZORPAY_KEY_ID in .env'));
    return;
  }

  const isTestMode = keyId.startsWith('rzp_test_');

  const rzpOptions = {
    key: keyId,
    subscription_id: options.subscriptionId,
    name: 'Reflyt',
    description: `${options.planName} Plan Subscription${isTestMode ? ' (Test Mode)' : ''}`,
    image: '',
    handler: function (response: any) {
      options.onSuccess({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_subscription_id: response.razorpay_subscription_id,
        razorpay_signature: response.razorpay_signature,
      });
    },
    prefill: {
      name: options.userName,
      email: options.userEmail,
    },
    notes: {
      plan: options.planName,
    },
    theme: {
      color: '#141414',
    },
    modal: {
      ondismiss: function () {
        console.log('[Razorpay] Checkout closed by user');
      },
    },
  };

  const rzp = new window.Razorpay(rzpOptions);

  rzp.on('payment.failed', function (response: any) {
    options.onFailure(response.error);
  });

  rzp.open();
}

/**
 * Create a subscription on the server side
 */
export async function createSubscription(
  planId: string,
  userEmail: string
): Promise<{ subscription_id: string } | { error: string }> {
  try {
    const response = await fetch('/api/razorpay/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: planId, email: userEmail }),
    });

    const text = await response.text();

    // If response is HTML (Vite SPA fallback), the API route doesn't exist
    if (text.startsWith('<!') || text.startsWith('<html')) {
      return { error: 'Server API not running. Please start the server with "npm run dev" instead of "npx vite".' };
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return { error: `Server returned invalid response: ${text.slice(0, 200)}` };
    }

    if (!response.ok) {
      return { error: data.error || 'Failed to create subscription' };
    }
    return { subscription_id: data.subscription_id };
  } catch (err: any) {
    return { error: err.message || 'Network error creating subscription' };
  }
}

/**
 * Verify payment on the server side
 */
export async function verifyPayment(data: {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
  plan: string;
  billing_cycle: string;
  user_id: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/razorpay/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const text = await response.text();

    if (text.startsWith('<!') || text.startsWith('<html')) {
      return { success: false, error: 'Server API not running. Start with "npm run dev".' };
    }

    let result: any;
    try {
      result = JSON.parse(text);
    } catch {
      return { success: false, error: `Server returned invalid response` };
    }

    if (!response.ok) {
      return { success: false, error: result.error || 'Verification failed' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during verification' };
  }
}
