import { useContext, useState, useEffect } from 'react';
import { PatientContext } from '../../context/PatientContext';
import { toast } from 'sonner';
import { CreditCard, DollarSign, User, Star, Shield, CheckCircle } from 'lucide-react';
import { PaymentModal } from '../PaymentModal';
import paymentService from '../../services/paymentService';
import { formatCurrency } from '../../config/stripe';
import api from '../../services/api';

const paymentQuotes = [
  "Secure and timely payments ensure continued quality healthcare.",
  "Your prompt payment helps us provide better medical services.",
  "Easy payment options make healthcare more accessible.",
  "Transparent billing and secure payments build trust.",
  "Investing in your health through timely payments is wise."
];

export function PayBills() {
  const patientContext = useContext(PatientContext);
  
  if (!patientContext) {
    return (
      <div className="flex items-center justify-center h-64">
        <img 
          src="/Public/Patient/loading.gif" 
          alt="Loading"
          className="w-16 h-16"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/Public/Admin and doctors/loading.gif';
          }}
        />
      </div>
    );
  }
  
  const { billing, setBilling } = patientContext;
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load payment methods and history on component mount
  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        setIsLoading(true);
        const [methods, history] = await Promise.all([
          paymentService.getPaymentMethods(),
          paymentService.getPaymentHistory(1, 5)
        ]);
        setPaymentMethods(methods);
        setPaymentHistory(history);
      } catch (error) {
        console.error('Failed to load payment data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentData();
  }, []);

  const unpaidBills = billing.filter((bill: any) => bill.paymentStatus === 'unpaid');
  const paidBills = billing.filter((bill: any) => bill.paymentStatus === 'paid');

  const handlePayNow = (bill: any) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (updatedBill: any) => {
    // Update the billing state
    setBilling(prev => prev.map(bill => 
      bill._id === updatedBill._id ? updatedBill : bill
    ));
    
    toast.success('Payment completed successfully!');
    setShowPaymentModal(false);
    setSelectedBill(null);
  };

  // Keep the demo payment function as backup
  const handleDemoPayment = async (billId: string) => {
    try {
      setIsProcessing(true);
      
      if (!paymentMethod) {
        toast.error('Please select a payment method');
        return;
      }
      
      // Call the backend API to update payment status
      const response = await api.put(`/patient/billing/${billId}/pay`, {
        paymentMethod: paymentMethod,
        notes: `Paid via ${paymentMethod} on ${new Date().toLocaleDateString()}`,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      });
      
      // Update local state with the updated bill from backend
      setBilling(prev => prev.map(bill => 
        bill._id === billId ? response.data.bill : bill
      ));
      
      toast.success('Payment completed successfully!');
      setSelectedBill(null);
      setPaymentMethod('');
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalUnpaid = unpaidBills.reduce((sum: number, bill: any) => sum + bill.amount, 0);
  const totalPaid = paidBills.reduce((sum: number, bill: any) => sum + bill.amount, 0);
  const todayQuote = paymentQuotes[new Date().getDay() % paymentQuotes.length];

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/Public/departments/cardio.jpg" 
          alt="Payment Background"
          className="w-full h-full object-cover opacity-10"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/Public/Admin and doctors/docHolder.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 to-green-50/90"></div>
      </div>

      <div className="relative z-10 space-y-6 p-6">
        {/* Header with Quote */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Billing & Payments</h1>
          </div>
          <p className="text-gray-600 mb-4">Manage your medical bills and payments securely</p>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-700 font-medium italic">"{todayQuote}"</p>
                <p className="text-gray-500 text-sm mt-1">— Payment Security</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-600 font-medium">Outstanding Balance</p>
                <p className="text-2xl font-bold text-red-700">${totalUnpaid.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/90 backdrop-blur-sm border border-blue-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Unpaid Bills</p>
                <p className="text-2xl font-bold text-blue-700">{unpaidBills.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50/90 backdrop-blur-sm border border-green-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Paid Bills</p>
                <p className="text-2xl font-bold text-green-700">{paidBills.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50/90 backdrop-blur-sm border border-blue-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-blue-800">Secure Payment Processing</h3>
          </div>
          <p className="text-blue-700">
            Your payment information is protected with bank-level security. All transactions are encrypted and processed securely.
          </p>
        </div>

        {/* Unpaid Bills */}
        {unpaidBills.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-red-200">
            <div className="p-6 border-b border-red-200">
              <h2 className="text-xl font-bold text-red-600">Outstanding Bills</h2>
              <p className="text-gray-600">Please pay these bills to avoid late fees</p>
            </div>
            <div className="divide-y divide-red-100">
              {unpaidBills.map((bill: any) => (
                <div key={bill._id} className="p-6 hover:bg-red-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{bill.description}</h3>
                        <p className="text-gray-600">Dr. {bill.doctorId?.userId?.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(bill.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">₹{bill.amount.toFixed(2)}</p>
                      <div className="mt-2 space-y-2">
                        <button
                          onClick={() => handlePayNow(bill)}
                          className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors font-medium shadow-md hover:shadow-lg"
                        >
                          💳 Pay with Stripe
                        </button>
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors font-medium shadow-md hover:shadow-lg text-sm"
                        >
                          🎭 Demo Payment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paid Bills */}
        {paidBills.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-200">
            <div className="p-6 border-b border-green-200">
              <h2 className="text-xl font-bold text-green-600">Payment History</h2>
              <p className="text-gray-600">Your completed payments</p>
            </div>
            <div className="divide-y divide-green-100">
              {paidBills.map((bill: any) => (
                <div key={bill._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{bill.description}</h3>
                        <p className="text-gray-600">Dr. {bill.doctorId?.userId?.name}</p>
                        <p className="text-sm text-gray-500">
                          Paid on {new Date(bill.paidAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">₹{bill.amount.toFixed(2)}</p>
                      <span className="inline-block mt-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Paid via {bill.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {unpaidBills.length === 0 && paidBills.length === 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-gray-200">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No bills found</p>
            <p className="text-gray-400">Bills will appear here after your appointments</p>
          </div>
        )}

        {/* Real Stripe Payment Modal */}
        {showPaymentModal && selectedBill && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedBill(null);
            }}
            bill={selectedBill}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {/* Demo Payment Modal (Backup) */}
        {selectedBill && !showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">Demo Payment</h2>
                <p className="text-gray-600">{selectedBill.description}</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-gradient-to-r from-cyan-50 to-purple-50 p-4 rounded-lg border border-cyan-200">
                  <p className="text-sm text-cyan-600 font-medium">Amount Due</p>
                  <p className="text-3xl font-bold text-purple-800">₹{selectedBill.amount.toFixed(2)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="card">Credit/Debit Card</option>
                    <option value="cash">Cash</option>
                    <option value="insurance">Insurance</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm font-medium text-yellow-800">Demo Payment System</p>
                  </div>
                  <p className="text-sm text-yellow-700">
                    This is a demonstration payment. For real Stripe payments, use the "Pay with Stripe" button above.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t flex gap-3">
                <button
                  onClick={() => setSelectedBill(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDemoPayment(selectedBill._id)}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    'Demo Pay'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}