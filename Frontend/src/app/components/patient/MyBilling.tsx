import { useContext, useState } from 'react';
import { PatientContext } from '../../context/PatientContext';
import { CreditCard, Calendar, DollarSign, CheckCircle, Clock, Star, AlertTriangle, Eye, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentModal } from '../PaymentModal';

const billingQuotes = [
  "Transparency in healthcare billing builds trust and peace of mind.",
  "Understanding your medical expenses helps you plan better.",
  "Every bill paid is an investment in your health and wellbeing.",
  "Clear billing practices reflect quality healthcare services.",
  "Your health is priceless, but healthcare should be transparent."
];

export function MyBilling() {
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
  
  const { billing, loading, setBilling, refreshPatientData } = patientContext;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handlePayNow = (bill: any) => {
    console.log('=== PAY NOW CLICKED ===');
    console.log('Bill data:', bill);
    console.log('Bill ID:', bill?._id);
    console.log('Bill amount:', bill?.amount);
    console.log('Bill status:', bill?.paymentStatus);
    
    setSelectedBill(bill);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (updatedBill: any) => {
    console.log('=== PAYMENT SUCCESS HANDLER ===');
    console.log('Updated bill:', updatedBill);
    
    try {
      // Update the billing state with the correct structure
      setBilling(prev => {
        const newBilling = prev.map(bill => 
          bill._id === updatedBill._id 
            ? { 
                ...bill, 
                paymentStatus: 'paid', 
                paidAt: updatedBill.paidAt || new Date().toISOString(),
                paymentMethod: updatedBill.paymentMethod || bill.paymentMethod,
                transactionId: updatedBill.transactionId || bill.transactionId
              } 
            : bill
        );
        console.log('Updated billing state:', newBilling);
        return newBilling;
      });
      
      toast.success('Payment completed successfully!');
      setShowPaymentModal(false);
      setSelectedBill(null);
      
      // Optionally refresh data from server without full page reload
      try {
        await refreshPatientData();
      } catch (refreshError) {
        console.warn('Could not refresh billing data:', refreshError);
        // Don't show error to user as payment was successful
      }
    } catch (error) {
      console.error('Error handling payment success:', error);
      toast.error('Payment was successful but there was an error updating the display. Please refresh the page.');
    }
  };

  const handleDownloadReceipt = (bill: any) => {
    const receiptContent = `
MEDICAL BILL RECEIPT

Bill ID: ${bill._id.slice(-6).toUpperCase()}
Date: ${new Date(bill.createdAt).toLocaleDateString()}
${bill.paidAt ? `Payment Date: ${new Date(bill.paidAt).toLocaleDateString()}` : ''}

DESCRIPTION:
${bill.description || 'Medical consultation and services'}

AMOUNT: ₹${bill.amount}
STATUS: ${bill.paymentStatus.toUpperCase()}
${bill.paymentMethod ? `PAYMENT METHOD: ${bill.paymentMethod.toUpperCase()}` : ''}

${bill.notes ? `
NOTES:
${bill.notes}
` : ''}

Thank you for choosing our healthcare services.

This is a computer-generated receipt.
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${bill._id.slice(-6)}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Receipt downloaded successfully');
  };

  const handleViewDetails = (bill: any) => {
    setSelectedBill(bill);
    setShowDetailsModal(true);
  };

  const totalAmount = billing.reduce((sum: number, bill: any) => sum + (bill.amount || 0), 0);
  const paidAmount = billing.filter((bill: any) => bill.paymentStatus === 'paid').reduce((sum: number, bill: any) => sum + (bill.amount || 0), 0);
  const pendingAmount = totalAmount - paidAmount;
  const unpaidBills = billing.filter((bill: any) => bill.paymentStatus === 'unpaid');

  const todayQuote = billingQuotes[new Date().getDay() % billingQuotes.length];

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/Public/departments/cardio.jpg" 
          alt="Billing Background"
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
            <h1 className="text-3xl font-bold text-gray-800">My Billing</h1>
            <button
              onClick={() => {
                toast.info('Refreshing billing data...');
                refreshPatientData();
              }}
              className="ml-4 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              title="Refresh billing data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mb-4">View your medical bills and payment history</p>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-700 font-medium italic">"{todayQuote}"</p>
                <p className="text-gray-500 text-sm mt-1">— Billing Transparency</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-blue-700">₹{totalAmount}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid Amount</p>
                <p className="text-2xl font-bold text-green-700">₹{paidAmount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-orange-700">₹{pendingAmount}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Outstanding Bills Alert */}
        {unpaidBills.length > 0 && (
          <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-red-800">Outstanding Bills</h3>
            </div>
            <p className="text-red-700 mb-4">
              You have {unpaidBills.length} unpaid bill(s) totaling ₹{pendingAmount}. 
              Please review and pay to avoid late fees.
            </p>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium">
              Pay Now
            </button>
          </div>
        )}

        {/* Bills List */}
        <div className="space-y-4">
          {billing.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-gray-200">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No billing records found</p>
              <p className="text-gray-400">Your medical bills will appear here</p>
            </div>
          ) : (
            billing.map((bill: any) => (
              <div key={bill._id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Bill #{bill._id.slice(-6)}</h3>
                      <p className="text-gray-600">{bill.description || 'Medical consultation'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      bill.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : bill.paymentStatus === 'partially_paid'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {bill.paymentStatus === 'paid' ? 'Paid' :
                       bill.paymentStatus === 'partially_paid' ? 'Partially Paid' :
                       'Unpaid'}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">Created: {new Date(bill.createdAt).toLocaleDateString()}</span>
                    </div>
                    {bill.paidAt && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-700">Paid: {new Date(bill.paidAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="text-2xl font-bold text-gray-800">₹{bill.amount}</p>
                    </div>
                    
                    {bill.paymentMethod && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="font-medium capitalize text-gray-800">{bill.paymentMethod}</p>
                      </div>
                    )}
                  </div>

                  {bill.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Notes:</p>
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{bill.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                    {bill.paymentStatus === 'unpaid' && (
                      <button 
                        onClick={() => handlePayNow(bill)}
                        className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
                      >
                        Pay Now
                      </button>
                    )}
                    <button 
                      onClick={() => handleDownloadReceipt(bill)}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Receipt
                    </button>
                    <button 
                      onClick={() => handleViewDetails(bill)}
                      className="flex-1 bg-gray-50 text-gray-600 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment History Summary */}
        {billing.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-green-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              Payment Summary
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{billing.length}</div>
                <div className="text-sm text-blue-600">Total Bills</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {billing.filter((b: any) => b.paymentStatus === 'paid').length}
                </div>
                <div className="text-sm text-green-600">Paid Bills</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{unpaidBills.length}</div>
                <div className="text-sm text-red-600">Unpaid Bills</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {billing.length > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}%
                </div>
                <div className="text-sm text-purple-600">Payment Rate</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bill Details Modal */}
      {showDetailsModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Bill Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl text-gray-500">×</span>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bill ID</label>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="font-mono text-gray-800">{selectedBill._id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedBill.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : selectedBill.paymentStatus === 'partially_paid'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedBill.paymentStatus === 'paid' ? 'Paid' :
                         selectedBill.paymentStatus === 'partially_paid' ? 'Partially Paid' :
                         'Unpaid'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-blue-800">{selectedBill.description || 'Medical consultation and services'}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-2xl font-bold text-green-800">₹{selectedBill.amount}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Created Date</label>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-800">{new Date(selectedBill.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {selectedBill.paidAt && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <p className="text-green-800">{new Date(selectedBill.paidAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {selectedBill.paymentMethod && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-blue-800 capitalize">{selectedBill.paymentMethod}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedBill.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-yellow-800">{selectedBill.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => handleDownloadReceipt(selectedBill)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
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
    </div>
  );
}