
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, Bed, ArrowRight, CheckCircle2, Building, ShieldCheck, Asterisk, FileText, ArrowLeft, Search, RefreshCcw } from 'lucide-react';

const RoomApplication = () => {
  const { user } = useAuth();
  const { assignRoom, userData, updateUserData } = useUserData();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [searchUSN, setSearchUSN] = useState('');
  const [isAutoAllocating, setIsAutoAllocating] = useState(false);

  const handleAutoAllocate = async () => {
    if (!confirm("This will automatically assign rooms to ALL pending applicants based on availability. Continue?")) return;

    setIsAutoAllocating(true);
    try {
      const res = await fetch('http://localhost:5002/api/admin/auto-allocate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully allocated ${data.allocated} students!`);
        window.location.reload();
      } else {
        toast.error("Allocation failed");
      }
    } catch (e) {
      toast.error("Error during auto-allocation");
    } finally {
      setIsAutoAllocating(false);
    }
  };

  // Admin: Fetch Applications
  useEffect(() => {
    if (user?.role === 'admin') {
      fetch('http://localhost:5002/api/applications')
        .then(res => res.json())
        .then(data => setApplications(data))
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleWithdraw = async () => {
    if (!window.confirm("Are you sure you want to withdraw your application?")) return;

    try {
      const response = await fetch('http://localhost:5002/api/applications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user?.id })
      });

      if (response.ok) {
        toast.success("Application withdrawn successfully");
        updateUserData({ status: 'Not Allocated' });
      } else {
        toast.error("Failed to withdraw application");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error withdrawing application");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Auto-uppercase for USN fields
    const newValue = (name === 'roommateUSN' || name === 'roommate2USN') ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const [formData, setFormData] = useState({
    gender: '',
    preferredBlock: '',
    roomType: '',
    roommateName: '',
    roommateUSN: '',
    roommate2Name: '',
    roommate2USN: '',
    hasRoommatePreference: 'no',
    preferredFloor: '',
    specialRequirements: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    agreeToTerms: false
  });


  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string) => (checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      toast.error('You must agree to the terms and conditions');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5002/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          studentId: user?.id || 'unknown',
          student: user?.name || 'Unknown Student',
          email: user?.email || 'unknown@example.com'
        }),
      });

      if (response.ok) {
        toast.success('Application submitted successfully!');
        // Update local context status (optional, for immediate feedback)
        assignRoom({ ...formData, status: 'Pending' });
        navigate('/');
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (error) {
      console.error('Submission Error:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ADMIN VIEW
  if (user?.role === 'admin') {
    const pendingApps = applications
      .filter(app => app.status === 'Pending')
      .filter(app => {
        const usn = (app.email?.split('@')[0] || '').toUpperCase();
        return usn.includes(searchUSN.toUpperCase());
      });

    return (
      <Layout>
        <PageLayout
          title="Applications Management"
          description="Review and process student room applications"
          action={
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          }
        >
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Received Applications</CardTitle>
                <CardDescription>Total Pending: {pendingApps.length}</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleAutoAllocate}
                  disabled={isAutoAllocating || pendingApps.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 h-9"
                  size="sm"
                >
                  <RefreshCcw className={`mr-2 h-4 w-4 ${isAutoAllocating ? 'animate-spin' : ''}`} />
                  {isAutoAllocating ? 'Running...' : 'Auto-Allocate'}
                </Button>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter by USN..."
                    value={searchUSN}
                    onChange={(e) => setSearchUSN(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="p-3">USN</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Student</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Preferences</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingApps.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">No pending applications found matching your criteria.</td>
                      </tr>
                    ) : (
                      pendingApps.map((app, i) => {
                        const usn = (app.email?.split('@')[0] || '').toUpperCase();
                        return (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-medium">{usn}</td>
                            <td className="p-3">{app.date}</td>
                            <td className="p-3">
                              <div className="font-medium">{app.student}</div>
                              <div className="text-xs text-muted-foreground">{app.email}</div>
                            </td>
                            <td className="p-3 capitalize">{app.roomType || 'N/A'}</td>
                            <td className="p-3 text-xs text-slate-600">
                              <div>Block {app.preferredBlock}, Floor {app.preferredFloor}</div>
                              {app.hasRoommatePreference === 'yes' && (
                                <div className="mt-1 p-1 bg-indigo-50 border border-indigo-100 rounded text-indigo-700">
                                  <span className="font-semibold text-[10px] uppercase">Roommates: </span>
                                  <div>{app.roommateName} <span className="text-[10px] opacity-75">({app.roommateUSN})</span></div>
                                  {app.roommate2Name && (
                                    <div>{app.roommate2Name} <span className="text-[10px] opacity-75">({app.roommate2USN})</span></div>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-1 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
                                Pending
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <Button size="sm" onClick={() => navigate(`/rooms?assignStudentId=${app.studentId}`)}>
                                Assign Room
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </PageLayout>
      </Layout>
    );
  }

  if (userData?.status && userData.status !== 'Not Allocated') {
    return (
      <Layout>
        <PageLayout
          title="Room Application"
          description="View your application status"
          action={
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          }
        >
          <div className="max-w-2xl mx-auto">
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl">
              <div className={`h-2 w-full ${userData.status === 'Allocated' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <CardHeader>
                <div className="mx-auto bg-green-100 p-4 rounded-full w-fit mb-4">
                  {userData.status === 'Allocated' ? (
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  ) : (
                    <FileText className="h-10 w-10 text-yellow-600" />
                  )}
                </div>
                <CardTitle className="text-center text-2xl">
                  {userData.status === 'Allocated' ? 'Room Already Allocated!' : 'Application Under Review'}
                </CardTitle>
                <CardDescription className="text-center text-base mt-2">
                  {userData.status === 'Allocated'
                    ? "You have already been allocated a room. You can check your room details in the 'My Room' section."
                    : "Your application has been received and is currently being processed. You will be notified once a room is allocated."}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center pb-8">
                {userData.status === 'Allocated' ? (
                  <Button onClick={() => navigate('/my-room')} className="bg-primary">
                    Go to My Room <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex gap-4">
                    <Button onClick={() => navigate('/')} variant="ghost">
                      Dashboard
                    </Button>
                    <Button onClick={handleWithdraw} variant="destructive">
                      Withdraw Application
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
        </PageLayout>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageLayout
        title="Room Application"
        description="Secure your spot in the campus residence"
        action={
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        }
      >
        <div className="max-w-4xl mx-auto">
          <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
            <form onSubmit={handleSubmit}>
              <CardHeader className="border-b bg-white/50">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Application Details
                </CardTitle>
                <CardDescription>
                  Complete the form below to submit your preferences.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-8 p-8">
                {/* Gender Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Select Gender <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.gender} onValueChange={handleSelectChange('gender')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Room Type Selection - Visual Cards */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Bed className="h-4 w-4 text-primary" />
                    Select Room Type <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'single', label: 'Single Room', icon: User, desc: 'Private space for focused study', price: 'High Demand' },
                      { id: 'double', label: 'Double Sharing', icon: Users, desc: 'Balance of social and private', price: 'Standard' },
                      { id: 'triple', label: 'Triple Sharing', icon: Users, desc: 'Community living, best value', price: 'Economy' }
                    ].map((room) => (
                      <div
                        key={room.id}
                        onClick={() => handleSelectChange('roomType')(room.id)}
                        className={`
                                    cursor-pointer relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center text-center gap-3 hover:shadow-md
                                    ${formData.roomType === room.id
                            ? 'border-indigo-600 bg-indigo-50/50'
                            : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                          }
                                 `}
                      >
                        {formData.roomType === room.id && (
                          <div className="absolute top-2 right-2 text-indigo-600">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        )}
                        <div className={`p-3 rounded-full ${formData.roomType === room.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                          <room.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="font-bold text-sm">{room.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">{room.desc}</div>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-1 rounded border shadow-sm mt-auto">
                          {room.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Location Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-primary" />
                      Preferred Block
                    </Label>
                    <Select value={formData.preferredBlock} onValueChange={handleSelectChange('preferredBlock')}>
                      <SelectTrigger className="bg-white/50 border-slate-200">
                        <SelectValue placeholder="Select block" />
                      </SelectTrigger>
                      <SelectContent>
                        {(!formData.gender || formData.gender === 'Female') && (
                          <>
                            <SelectItem value="A">Block A (Girls)</SelectItem>
                            <SelectItem value="B">Block B (Girls)</SelectItem>
                          </>
                        )}
                        {(!formData.gender || formData.gender === 'Male') && (
                          <>
                            <SelectItem value="C">Block C (Boys)</SelectItem>
                            <SelectItem value="D">Block D (Boys)</SelectItem>
                            <SelectItem value="E">Block E (Boys)</SelectItem>
                          </>
                        )}
                        <SelectItem value="any">No Preference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      Preferred Floor
                    </Label>
                    <Select value={formData.preferredFloor} onValueChange={handleSelectChange('preferredFloor')}>
                      <SelectTrigger className="bg-white/50 border-slate-200">
                        <SelectValue placeholder="Select floor" />
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
                </div>

                {/* Roommate Preferences */}
                <div className="space-y-4 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Roommate Preference</Label>
                    <RadioGroup
                      value={formData.hasRoommatePreference}
                      onValueChange={handleRadioChange('hasRoommatePreference')}
                      className="flex space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="roommate-yes" className="text-primary" />
                        <Label htmlFor="roommate-yes" className="cursor-pointer">I have specific roommate(s)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="roommate-no" className="text-primary" />
                        <Label htmlFor="roommate-no" className="cursor-pointer">Match me automatically</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <AnimatePresence>
                    {formData.hasRoommatePreference === 'yes' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 pt-2 overflow-hidden"
                      >
                        <div className="grid gap-4">
                          {/* Roommate 1 */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-3 rounded-lg border border-slate-100">
                            <div className="space-y-2">
                              <Label htmlFor="roommateName">
                                {formData.roomType === 'triple' ? "First Roommate's Name" : "Roommate's Name"}
                              </Label>
                              <Input
                                id="roommateName"
                                name="roommateName"
                                placeholder="Enter full name"
                                value={formData.roommateName}
                                onChange={handleChange}
                                className="bg-slate-50"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="roommateUSN">
                                {formData.roomType === 'triple' ? "First Roommate's USN" : "Roommate's USN"}
                              </Label>
                              <Input
                                id="roommateUSN"
                                name="roommateUSN"
                                placeholder="e.g. U23E01AI064"
                                value={formData.roommateUSN}
                                onChange={handleChange}
                                className="bg-slate-50 uppercase"
                                maxLength={12}
                              />
                            </div>
                          </div>

                          {/* Roommate 2 */}
                          {formData.roomType === 'triple' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-3 rounded-lg border border-slate-100">
                              <div className="space-y-2">
                                <Label htmlFor="roommate2Name">Second Roommate's Name</Label>
                                <Input
                                  id="roommate2Name"
                                  name="roommate2Name"
                                  placeholder="Enter full name"
                                  value={formData.roommate2Name}
                                  onChange={handleChange}
                                  className="bg-slate-50"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="roommate2USN">Second Roommate's USN</Label>
                                <Input
                                  id="roommate2USN"
                                  name="roommate2USN"
                                  placeholder="e.g. U23E01AI064"
                                  value={formData.roommate2USN}
                                  onChange={handleChange}
                                  className="bg-slate-50 uppercase"
                                  maxLength={12}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                          <Asterisk className="h-3 w-3 mt-0.5" />
                          Your requested roommates must also submit an application and request you to ensure a match.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Emergency Contact
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Contact Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="emergencyContactName"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleChange}
                        required
                        className="bg-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactRelation">Relationship <span className="text-red-500">*</span></Label>
                      <Input
                        id="emergencyContactRelation"
                        name="emergencyContactRelation"
                        value={formData.emergencyContactRelation}
                        onChange={handleChange}
                        required
                        className="bg-white/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Phone Number <span className="text-red-500">*</span></Label>
                      <Input
                        id="emergencyContactPhone"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleChange}
                        required
                        className="bg-white/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={handleCheckboxChange('agreeToTerms')}
                      className="mt-1"
                    />
                    <Label htmlFor="agreeToTerms" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                      I confirm that the information provided is accurate. I agree to abide by the Hostel Rules & Regulations. I understand that room allocation is subject to availability and administrative discretion.
                    </Label>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-slate-50/50 p-6 flex flex-col sm:flex-row gap-4 justify-between items-center border-t">
                <p className="text-xs text-muted-foreground">
                  Processing time: approx. 1-3 business days
                </p>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button variant="outline" type="button" onClick={() => navigate('/')} className="flex-1 sm:flex-none">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 min-w-[140px]"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </PageLayout>
    </Layout>
  );
};

export default RoomApplication;
