import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import PageLayout from '@/components/PageLayout';
import { useUserData } from '@/contexts/UserDataContext';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRightLeft, Building2, Send, Info, Shield, CheckCircle2, Lock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const RoomChange = () => {
  const navigate = useNavigate();
  const { userData } = useUserData();

  const [preferredBlock, setPreferredBlock] = useState('');
  const [preferredFloor, setPreferredFloor] = useState('');
  const [preferredType, setPreferredType] = useState('');
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!preferredType || !reason) {
      toast.error('Please fill all required fields');
      setLoading(false);
      return;
    }

    // In a real app, this would send data to an API
    setTimeout(() => {
      toast.success('Room change request submitted successfully');
      navigate('/');
      setLoading(false);
    }, 1500);
  };

  return (
    <Layout>
      <PageLayout
        title="Room Change Request"
        description="Apply for a room swap or transfer"
        action={
          <Button variant="outline" onClick={() => navigate('/')} className="hover:bg-slate-100">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Current & Form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Current Allocation Card */}
            {userData?.roomDetails && (
              <Card className="bg-gradient-to-r from-cyan-950 to-blue-900 text-white border-none shadow-lg overflow-hidden relative">
                {/* Decorative circle */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-white/5 blur-3xl"></div>

                <CardHeader className="pb-2 relative z-10">
                  <CardTitle className="text-cyan-50 flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5 text-cyan-200" /> Current Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight">{userData.roomDetails.roomNumber}</h2>
                      <p className="text-cyan-200">Block {userData.roomDetails.building}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-cyan-100 border-cyan-500/30 bg-cyan-500/10 mb-1 block w-fit ml-auto">
                        Single Occupancy
                      </Badge>
                      <p className="text-xs text-cyan-300">Allocated: Jan 2026</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Request Form OR Restriction Message */}
            {userData?.roomDetails?.wasAllocatedWithPreference ? (
              <Card className="border-none shadow-xl bg-orange-50/80 backdrop-blur-md border border-orange-200 ">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Lock className="h-5 w-5 text-orange-600" />
                    Action Not Available
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-orange-900 font-medium">
                    You are unable to request a room change at this time.
                  </p>
                  <div className="bg-white/80 p-4 rounded-lg border border-orange-100 shadow-sm">
                    <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" /> Reason:
                    </h4>
                    <p className="text-sm text-orange-800/80 leading-relaxed">
                      Our records indicate that your current room was allocated based on your specific <strong>Preferred Roommate</strong> request.
                      <br /><br />
                      To maintain the integrity of group allocations, individual transfers are disabled for students who opted for specific roommates. This policy ensures fairness to your chosen roommates.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button
                      className="w-full bg-white text-orange-700 hover:bg-orange-100 border border-orange-200 shadow-sm"
                      onClick={() => navigate('/')}
                    >
                      Return to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <ArrowRightLeft className="h-5 w-5 text-cyan-700" />
                    New Request
                  </CardTitle>
                  <CardDescription>
                    Please specify your preferences for the new room.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="preferredType">Preferred Room Type*</Label>
                        <Select value={preferredType} onValueChange={setPreferredType}>
                          <SelectTrigger id="preferredType" className="bg-slate-50 border-slate-200 focus:ring-cyan-500">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single Room</SelectItem>
                            <SelectItem value="double">Double Sharing</SelectItem>
                            <SelectItem value="triple">Triple Sharing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="preferredBlock">Preferred Block</Label>
                        <Select value={preferredBlock} onValueChange={setPreferredBlock}>
                          <SelectTrigger id="preferredBlock" className="bg-slate-50 border-slate-200 focus:ring-cyan-500">
                            <SelectValue placeholder="Any Block" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">Block A (Boys)</SelectItem>
                            <SelectItem value="B">Block B (Boys)</SelectItem>
                            <SelectItem value="C">Block C (Girls)</SelectItem>
                            <SelectItem value="any">No Preference</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="preferredFloor">Preferred Floor</Label>
                        <Select value={preferredFloor} onValueChange={setPreferredFloor}>
                          <SelectTrigger id="preferredFloor" className="bg-slate-50 border-slate-200 focus:ring-cyan-500">
                            <SelectValue placeholder="Any Floor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1st Floor</SelectItem>
                            <SelectItem value="2">2nd Floor</SelectItem>
                            <SelectItem value="3">3rd Floor</SelectItem>
                            <SelectItem value="4">4th Floor</SelectItem>
                            <SelectItem value="5">5th Floor</SelectItem>
                            <SelectItem value="6">6th Floor</SelectItem>
                            <SelectItem value="7">7th Floor</SelectItem>
                            <SelectItem value="8">8th Floor</SelectItem>
                            <SelectItem value="any">No Preference</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Urgency</Label>
                        <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-md border border-slate-200">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="normal"
                              name="urgency"
                              checked={urgency === 'normal'}
                              onChange={() => setUrgency('normal')}
                              className="text-cyan-600 focus:ring-cyan-500"
                            />
                            <Label htmlFor="normal" className="font-normal cursor-pointer">Normal</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="urgent"
                              name="urgency"
                              checked={urgency === 'urgent'}
                              onChange={() => setUrgency('urgent')}
                              className="text-amber-600 focus:ring-amber-500"
                            />
                            <Label htmlFor="urgent" className="font-normal cursor-pointer text-amber-600">Urgent</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Change*</Label>
                      <Textarea
                        id="reason"
                        placeholder="Explain why you need a room change (e.g. medical reasons, conflict with roommate, etc.)"
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="bg-slate-50 border-slate-200 focus:ring-cyan-500 resize-none"
                      />
                    </div>

                  </CardContent>
                  <CardFooter className="bg-slate-50/50 p-6">
                    <Button type="submit" className="w-full bg-cyan-700 hover:bg-cyan-800 text-white shadow-md transition-all hover:shadow-lg" disabled={loading}>
                      {loading ? (
                        <div className="flex items-center gap-2">
                          Loading...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Submit Modification Request <Send className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN: Policy & Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-cyan-50/50 border-cyan-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-cyan-800 flex items-center gap-2 text-base">
                  <Info className="h-5 w-5" /> Change Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-cyan-700/80 space-y-3">
                <p>Student requests are processed based on availability. Priority is given to medical cases.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>You can only request 1 change per semester.</li>
                  <li>Processing time: 3-5 working days.</li>
                  <li>A fee of ₹500 applies for non-essential swaps.</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-slate-500" />
                  Eligibility Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {userData?.roomDetails?.wasAllocatedWithPreference ? (
                  <div className="flex items-center gap-3 text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <Lock className="h-5 w-5" />
                    <div className="text-sm font-medium">Ineligible (Preferred Group)</div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <CheckCircle2 className="h-5 w-5" />
                    <div className="text-sm font-medium">Eligible for Transfer</div>
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-2 text-center">
                  Last checked: Today
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageLayout>
    </Layout>
  );
};

export default RoomChange;
