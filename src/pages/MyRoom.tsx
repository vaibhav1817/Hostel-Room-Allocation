import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/api';
import Layout from '@/components/Layout';
import PageLayout from '@/components/PageLayout';
import RoomVisualizer from '@/components/RoomVisualizer';
import { ArrowLeft, Building2, Wrench, User, Building, CreditCard, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

const MyRoom = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch room data from API
  useEffect(() => {
    const fetchRoom = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/student/me?studentId=${user?.id}`);
        const data = await res.json();
        setRoomData(data);
      } catch (error) {
        console.error("Failed to fetch room:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [user]);

  const handleReportIssue = () => {
    navigate('/maintenance');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  if (roomData?.status === 'Pending') {
    return (
      <Layout>
        <PageLayout title="My Room" description="View and manage your room allocation">
          <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-6 text-center border-2 border-dashed border-amber-200 rounded-3xl bg-amber-50/50 p-8">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center animate-pulse">
              <FileText size={40} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-900">Application Under Review</h2>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Your room application submitted on <span className="font-semibold">{roomData.applicationDate}</span> is currently being processed by the admin.
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate('/')}>Back to Dashboard</Button>
            </div>
          </div>
        </PageLayout>
      </Layout>
    );
  }

  if (!roomData || roomData.status === 'Not Allocated') {
    return (
      <Layout>
        <PageLayout title="My Room" description="View and manage your room allocation">
          <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-6 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 p-8">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
              <Building2 size={40} className="text-slate-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-700">No Room Assigned</h2>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">You haven't been allocated a room yet. Please submit an application to proceed.</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => navigate('/applications')} className="shadow-lg shadow-primary/20">Apply for a Room</Button>
              <Button variant="outline" onClick={() => navigate('/')}>Back to Dashboard</Button>
            </div>
          </div>
        </PageLayout>
      </Layout>
    );
  }

  const roomDetails = roomData.roomDetails;

  return (
    <Layout>
      <PageLayout
        title={`Room ${roomDetails.roomNumber}`}
        description={`${roomDetails.building}, ${roomDetails.floor} Floor`}
        action={
          <Button variant="outline" onClick={() => navigate('/')} className="hover:bg-slate-100">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        }
      >

        <div className="space-y-8">
          {/* 3D Visualizer Section */}


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Room Details Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="h-full border-none shadow-lg bg-white/80 backdrop-blur">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Building2 className="h-5 w-5 text-indigo-600" />
                        Details
                      </CardTitle>
                      <CardDescription>
                        Full specifications of your allocated space
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30 px-3 py-1">
                      Allocated
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Floor Plan Integrated Here */}


                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Allocated Since</p>
                      <p className="font-bold text-slate-800">{roomDetails.allocationDate}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Monthly Rent</p>
                      <p className="font-bold text-slate-800">₹{roomDetails.rentPerMonth}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                      <p className="text-xs text-red-600 uppercase tracking-wider font-semibold mb-1">Next Payment Due</p>
                      <p className="font-bold text-red-700">{roomDetails.nextPaymentDue}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center text-sm uppercase tracking-wide text-muted-foreground">
                      Included Facilities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {roomDetails.facilities.map((facility: string, index: number) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center text-sm uppercase tracking-wide text-muted-foreground">
                      Roommates Info
                    </h3>
                    {roomDetails.roommates && roomDetails.roommates.length > 0 ? (
                      <div className="space-y-3">
                        {roomDetails.roommates.map((mate: any, index: number) => (
                          <div key={index} className="bg-slate-50 border rounded-xl p-4 flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200">
                              <User size={24} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{mate.name}</p>
                              <p className="text-sm text-slate-500">
                                {mate.rollNumber} • {mate.course}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                Contact: {mate.contact}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic bg-slate-50 p-3 rounded-lg border border-dashed">
                        {roomDetails.roomType.includes('Single') ? 'Single occupancy room - Enjoy your privacy!' : 'No roommates assigned yet.'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-1 space-y-6"
            >
              <Card className="h-fit border-none shadow-lg bg-indigo-900 text-white relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-indigo-300" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-indigo-200/80">
                    Manage your stay
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 relative z-10">
                  <Button
                    className="flex flex-col items-center justify-center h-24 bg-white/10 hover:bg-white/20 border border-white/10 text-white gap-2 transition-all hover:scale-[1.02]"
                    variant="ghost"
                    onClick={handleReportIssue}
                  >
                    <div className="p-2 rounded-full bg-white/10">
                      <Wrench className="h-5 w-5 text-indigo-200" />
                    </div>
                    Report Issue
                  </Button>

                  <Button
                    className="flex flex-col items-center justify-center h-24 bg-white/10 hover:bg-white/20 border border-white/10 text-white gap-2 transition-all hover:scale-[1.02]"
                    variant="ghost"
                    onClick={() => navigate('/payments')}
                  >
                    <div className="p-2 rounded-full bg-white/10">
                      <CreditCard className="h-5 w-5 text-indigo-200" />
                    </div>
                    Payments
                  </Button>

                  <Button
                    className="flex flex-col items-center justify-center h-24 bg-white/10 hover:bg-white/20 border border-white/10 text-white gap-2 transition-all hover:scale-[1.02]"
                    variant="ghost"
                    onClick={() => navigate('/room-change')}
                  >
                    <div className="p-2 rounded-full bg-white/10">
                      <Building2 className="h-5 w-5 text-indigo-200" />
                    </div>
                    Change Req
                  </Button>

                  <Button
                    className="flex flex-col items-center justify-center h-24 bg-white/10 hover:bg-white/20 border border-white/10 text-white gap-2 transition-all hover:scale-[1.02]"
                    variant="ghost"
                    onClick={() => navigate('/rules')}
                  >
                    <div className="p-2 rounded-full bg-white/10">
                      <FileText className="h-5 w-5 text-indigo-200" />
                    </div>
                    Hostel Rules
                  </Button>
                </CardContent>
              </Card>

              {/* Floor Plan Card (Moved) */}
              <Card className="border-none shadow-lg bg-white/80 backdrop-blur overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building className="h-4 w-4 text-indigo-500" />
                    Floor Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center p-4 pt-0">
                  <div className="scale-90 origin-top">
                    <RoomVisualizer
                      roomType={roomDetails.roomType}
                      roomNumber={roomDetails.roomNumber}
                      roommates={roomDetails.roommates}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </PageLayout>
    </Layout>
  );
};

export default MyRoom;
