import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, CheckCircle2, Clock, CalendarDays, History, ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData } = useUserData();
  const rentAmount = userData?.roomDetails?.rentPerMonth || 0;

  const [amount, setAmount] = useState(rentAmount.toString());
  const [paymentType, setPaymentType] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState<any[]>([]);

  // Fetch Payment History
  const fetchHistory = async () => {
    if (!user?.id || !userData?.roomDetails) return;
    try {
      const res = await fetch(`http://localhost:5002/api/payments?studentId=${user.id}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load payment history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, userData]);

  // Helper to load Razorpay SDK (Uncomment when using Real Integration)
  /*
  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!paymentType) {
      toast.error('Please select a payment method');
      setLoading(false);
      return;
    }

    // For demonstration purposes, we are using a SIMULATED payment flow.
    // When you have your Razorpay Keys, uncomment the 'Real Integration' block below.

    // --- SIMULATION START ---

    toast.info("Processing Payment...");

    // Simulate API processing delay
    setTimeout(async () => {
      // Record Transaction
      const transactionId = `TXN${Math.floor(Math.random() * 10000000)}`;
      try {
        const res = await fetch('http://localhost:5002/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: user?.id, // Assuming user ID is here or mapped via auth
            amount: parseFloat(amount), // Ensure amount is a number
            method: paymentType === 'upi' ? 'UPI' : paymentType === 'card' ? 'Card' : 'NetBanking',
            transactionId,
            date: new Date().toISOString().split('T')[0], // Current date
            status: 'Success' // Assuming success for simulation
          })
        });

        if (res.ok) {
          toast.success(`Payment Successful! Transaction ID: ${transactionId}`);
          await fetchHistory(); // Refresh history after successful payment
          navigate('/my-room');
        } else {
          throw new Error('Payment recording failed');
        }
      } catch (error) {
        console.error("Error recording payment:", error);
        toast.error("Payment failed to record on server");
      } finally {
        setLoading(false);
      }
    }, 2000);

    // --- SIMULATION END ---


    /* 
    // --- REAL INTEGRATION (Uncomment when keys are available) ---
    
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
        const data = await fetch('http://localhost:5002/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: parseInt(amount) })
        }).then((t) => t.json());

        const options = {
            key: "YOUR_RAZORPAY_KEY", 
            amount: data.amount, 
            currency: data.currency,
            name: "Hostel Allocation System",
            description: "Room Rent Payment",
            order_id: data.id, 
            handler: async function (response: any) { // Made handler async
                // After successful Razorpay payment, record it in your DB
                const transactionId = response.razorpay_payment_id;
                try {
                    const recordRes = await fetch('http://localhost:5002/api/payments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            studentId: userData?.id,
                            amount: parseFloat(amount),
                            method: paymentType === 'upi' ? 'UPI' : paymentType === 'card' ? 'Card' : 'NetBanking',
                            transactionId,
                            date: new Date().toISOString().split('T')[0],
                            status: 'Success'
                        })
                    });

                    if (recordRes.ok) {
                        toast.success(`Payment Successful! Transaction ID: ${transactionId}`);
                        await fetchHistory(); // Refresh history
                        navigate('/my-room');
                    } else {
                        throw new Error('Failed to record payment on server after Razorpay success');
                    }
                } catch (recordError) {
                    console.error("Error recording payment after Razorpay success:", recordError);
                    toast.error("Payment successful but failed to record. Please contact support.");
                } finally {
                    setLoading(false);
                }
            },
            prefill: {
                name: userData?.name || "Student",
                email: "student@example.com",
                contact: "9999999999"
            },
            theme: { color: "#10b981" }
        };

        // @ts-ignore
        const paymentObject = new window.Razorpay(options);
        // @ts-ignore
        paymentObject.open();

    } catch (err) {
        console.error(err);
        toast.error('Payment Server Error');
        setLoading(false);
    }
    */
  };

  if (!userData?.roomDetails) {
    return (
      <Layout>
        <PageLayout title="Payments" description="Manage your hostel fees">
          <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 p-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} className="text-slate-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-700">No Dues Pending</h2>
              <p className="text-muted-foreground mt-1">You need to have an allocated room to make payments.</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>Back to Dashboard</Button>
          </div>
        </PageLayout>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageLayout
        title="Details & Payments"
        description="View dues and transaction history"
        action={
          <Button variant="outline" onClick={() => navigate('/')} className="hover:bg-slate-100">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <CreditCard className="h-5 w-5 text-emerald-600" />
                      Make Payment
                    </CardTitle>
                    <CardDescription>Pay your monthly rent securely</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 text-sm font-medium">
                    Due: ₹{rentAmount}
                  </Badge>
                </div>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount to Pay (<span className="text-muted-foreground">INR</span>)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                        <Input
                          id="amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="pl-8 font-mono font-bold text-lg bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
                          readOnly
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Rent is fixed based on your room type ({userData.roomDetails.roomType})</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentType">Payment Method</Label>
                      <Select value={paymentType} onValueChange={setPaymentType}>
                        <SelectTrigger id="paymentType" className="bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upi">UPI / QR Code</SelectItem>
                          <SelectItem value="card">Credit / Debit Card</SelectItem>
                          <SelectItem value="netbanking">Net Banking</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Payment Method Specific Fields */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 min-h-[160px] flex flex-col justify-center">
                    {!paymentType && (
                      <div className="text-center text-muted-foreground flex flex-col items-center">
                        <CreditCard className="h-8 w-8 mb-2 opacity-20" />
                        Select a payment method above to proceed
                      </div>
                    )}

                    {paymentType === 'upi' && (
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-32 h-32 bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center">
                          {/* Mock QR */}
                          <div className="w-full h-full bg-slate-900 pattern-grid-lg opacity-80" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
                        </div>
                        <p className="text-sm font-medium text-slate-600">Scan to Pay via any UPI App</p>
                      </div>
                    )}

                    {paymentType === 'card' && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                          <Input
                            id="cardNumber"
                            placeholder="XXXX XXXX XXXX XXXX"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            maxLength={19}
                            className="bg-white font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input placeholder="MM / YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="bg-white text-center" />
                          <Input placeholder="CVV" type="password" maxLength={3} value={cvv} onChange={(e) => setCvv(e.target.value)} className="bg-white text-center" />
                        </div>
                        <Input placeholder="Cardholder Name" value={cardName} onChange={(e) => setCardName(e.target.value)} className="bg-white" />
                      </div>
                    )}

                    {paymentType === 'netbanking' && (
                      <div className="space-y-4 text-center">
                        <p className="text-sm text-muted-foreground">You will be redirected to the bank's secure gateway.</p>
                        <div className="flex gap-2 justify-center flex-wrap">
                          {['HDFC', 'SBI', 'ICICI', 'Axis'].map(bank => (
                            <Badge key={bank} variant="secondary" className="cursor-pointer hover:bg-slate-200 px-3 py-2 text-sm">
                              {bank}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </CardContent>
                <CardFooter className="bg-slate-50/50 p-6">
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 text-lg h-12"
                    disabled={loading || !paymentType}
                  >
                    {loading ? (
                      <>Processing Secure Payment...</>
                    ) : (
                      <span className="flex items-center gap-2">Pay <span className="font-mono">₹{amount}</span> Now <ArrowRight className="h-4 w-4" /></span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Note */}
            <div className="flex items-start gap-3 bg-blue-50 text-blue-800 p-4 rounded-xl text-sm">
              <Clock className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                Payments usually reflect instantly. In case of failure, money will be refunded within 3-5 working days.
                For issues, contact accounts@hostel.edu.
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: History */}
          <div className="lg:col-span-1">
            <Card className="h-fit sticky top-6 border-none shadow-lg">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <History className="h-5 w-5 text-indigo-500" />
                  History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {history.map((txn, i) => (
                    <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                      <div>
                        <p className="font-bold text-slate-700">Rent Payment</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <CalendarDays className="h-3 w-3" /> {txn.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-slate-900">-₹{txn.amount}</p>
                        <Badge variant="outline" className="text-[10px] px-1.5 h-5 bg-green-50 text-green-700 border-green-200">
                          {txn.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <div className="p-4 text-center">
                    <Button variant="link" size="sm" className="text-indigo-600 h-auto p-0">View All Transactions</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </PageLayout>
    </Layout>
  );
};

export default PaymentPage;
