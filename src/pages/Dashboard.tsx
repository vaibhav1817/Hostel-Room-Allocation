
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import Layout from '@/components/Layout';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, UserCheck, AlertCircle, CreditCard, Sun, Moon, Utensils, Coffee, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import gmLogo from '@/assets/gm-university-logo-new.jpg';
import {
  TrendingUp,
  Clock,
  UserPlus,
  Users,
  Trash2,
  ShieldCheck,
  Volume2
} from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    pendingApplications: 0,
    maintenanceRequests: 0,
    revenue: 0,
    occupancyBreakdown: {},
    maintenanceBreakdown: {}
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteMessage, setNoteMessage] = useState('');
  const [adminAnnouncements, setAdminAnnouncements] = useState<any[]>([]);

  const fetchAnnouncements = () => {
    fetch('http://localhost:5002/api/announcements')
      .then(res => res.json())
      .then(data => setAdminAnnouncements(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleAddAnnouncement = async () => {
    try {
      await fetch('http://localhost:5002/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: noteTitle, message: noteMessage })
      });
      toast.success("Announcement posted!");
      setNoteTitle('');
      setNoteMessage('');
      fetchAnnouncements();
    } catch { toast.error("Failed to post"); }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await fetch(`http://localhost:5002/api/announcements/${id}`, { method: 'DELETE' });
      fetchAnnouncements();
      toast.success("Announcement deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleResetSemester = async () => {
    if (!confirm("CRITICAL WARNING: This will DELETE all current room allocations. Are you absolutely sure?")) return;

    const prompt = window.prompt("Type 'CONFIRM' to proceed:");
    if (prompt !== 'CONFIRM') return;

    try {
      const res = await fetch('http://localhost:5002/api/admin/reset-semester', { method: 'POST' });
      if (res.ok) {
        toast.success("Hostel reset successfully.");
        window.location.reload();
      }
    } catch { toast.error("Reset failed"); }
  };
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timestamp = Date.now();
        const [statsRes, activityRes, appsRes] = await Promise.all([
          fetch(`http://localhost:5002/api/admin/stats?t=${timestamp}`),
          fetch(`http://localhost:5002/api/admin/recent-activity?t=${timestamp}`),
          fetch(`http://localhost:5002/api/applications?t=${timestamp}`)
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (activityRes.ok) setRecentActivities(await activityRes.json());
        if (appsRes.ok) setApplications(await appsRes.json());
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <PageLayout title="Admin Dashboard" description="Loading data...">
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    )
  }

  const occupancyRate = stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0;

  // Rebuild Activities Client-Side to ensure freshness
  // 1. Keep non-application events from backend (e.g. maintenance, payments)
  const otherActivities = recentActivities.filter(a => a.type !== 'application');

  // 2. Generate Application & Allocation events from fresh data
  const appActivities: any[] = [];
  applications.forEach(app => {
    // Date parsing helper
    const parseAppDate = (dateStr: string) => {
      if (!dateStr) return 0;
      const parts = dateStr.split('/');
      if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
      return 0;
    };
    const timestamp = parseAppDate(app.date);

    // Applied Event
    appActivities.push({
      id: `app-local-${app.id}`,
      type: 'application',
      user: app.student || 'Unknown',
      action: `Applied for ${app.roomType || 'room'}`,
      time: app.date,
      timestamp: timestamp
    });

    // Allocated Event
    if (app.status === 'Allocated' && app.allocatedRoomId) {
      appActivities.push({
        id: `alloc-local-${app.id}`,
        type: 'application',
        user: 'System',
        action: `Allocated Room ${app.allocatedRoomId} to ${app.student?.split(' ')[0]}`,
        time: app.date,
        timestamp: timestamp + 3600000 // +1 hour to show on top of application
      });
    }
  });

  // 3. Merge and Sort
  const allActivities = [...otherActivities, ...appActivities].sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));

  return (
    <PageLayout
      title="Admin Dashboard"
      description="Overview of hostel operations & analytics"
      action={
        <div className="flex items-center gap-4">
          <img src={gmLogo} alt="University Logo" className="h-16 w-auto object-contain mix-blend-multiply opacity-90" />
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Key Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-indigo-500" onClick={() => navigate('/rooms')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Occupancy</CardTitle>
              <div className="p-2 bg-indigo-50 rounded-full">
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.occupiedRooms}/{stats.totalRooms}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                {occupancyRate}% Occupancy Rate
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-amber-500" onClick={() => navigate('/applications')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
              <div className="p-2 bg-amber-50 rounded-full">
                <UserCheck className="w-4 h-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApplications}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <Clock className="w-3 h-3 mr-1 text-amber-500" />
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-rose-500" onClick={() => navigate('/maintenance')}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance Issues</CardTitle>
              <div className="p-2 bg-rose-50 rounded-full">
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.maintenanceRequests}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1 text-rose-500" />
                Active tickets
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Occupancy Donut Chart */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-500">Occupancy Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.occupiedRooms === 0 ? (
                <div className="text-center text-slate-400 py-10">No occupancy data</div>
              ) : (
                <div className="flex items-center justify-around">
                  <div className="relative w-32 h-32 rounded-full shadow-inner" style={{
                    background: `conic-gradient(
                                #4f46e5 0% ${((stats.occupancyBreakdown?.single || 0) / (stats.occupiedRooms || 1)) * 100}%,
                                #eab308 ${((stats.occupancyBreakdown?.single || 0) / (stats.occupiedRooms || 1)) * 100}% ${(((stats.occupancyBreakdown?.single || 0) + (stats.occupancyBreakdown?.double || 0)) / (stats.occupiedRooms || 1)) * 100}%,
                                #f43f5e ${(((stats.occupancyBreakdown?.single || 0) + (stats.occupancyBreakdown?.double || 0)) / (stats.occupiedRooms || 1)) * 100}% 100%
                            )`
                  }}>
                    <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <span className="font-bold text-slate-700">{occupancyRate}%</span>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-600 rounded-full shadow-sm"></div> Single ({stats.occupancyBreakdown?.single || 0})</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div> Double ({stats.occupancyBreakdown?.double || 0})</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-500 rounded-full shadow-sm"></div> Triple ({stats.occupancyBreakdown?.triple || 0})</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Maintenance Bar Chart */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-500">Maintenance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.keys(stats.maintenanceBreakdown || {}).length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-8 flex flex-col items-center gap-2">
                    <AlertCircle className="h-6 w-6 opacity-20" />
                    No maintenance data available
                  </div>
                ) : (
                  Object.entries((stats.maintenanceBreakdown || {}) as Record<string, number>)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([type, count]) => (
                      <div key={type} className="space-y-1 group">
                        <div className="flex justify-between text-xs font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">
                          <span>{type}</span>
                          <span>{count}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-800 group-hover:bg-indigo-600 transition-colors rounded-full"
                            style={{ width: `${(count / (Math.max(...Object.values(stats.maintenanceBreakdown || {}) as number[]) || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Quick Actions */}
          <Card className="shadow-md bg-gradient-to-br from-indigo-50 to-white border-indigo-100 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-indigo-900">Quick Actions</CardTitle>
              <CardDescription>Manage hostel operations efficiently</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 bg-white hover:bg-indigo-50 border-indigo-200 text-indigo-700 hover:scale-105 transition-transform" onClick={() => navigate('/assign-room')}>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <UserPlus className="h-6 w-6 text-indigo-600" />
                </div>
                Assign Room
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 bg-white hover:bg-amber-50 border-amber-200 text-amber-700 hover:scale-105 transition-transform" onClick={() => navigate('/applications')}>
                <div className="p-3 bg-amber-100 rounded-full">
                  <UserCheck className="h-6 w-6 text-amber-600" />
                </div>
                Applications
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 bg-white hover:bg-rose-50 border-rose-200 text-rose-700 hover:scale-105 transition-transform" onClick={() => navigate('/maintenance')}>
                <div className="p-3 bg-rose-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-rose-600" />
                </div>
                Maintenance
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700 hover:scale-105 transition-transform" onClick={() => navigate('/rooms')}>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <Building2 className="h-6 w-6 text-emerald-600" />
                </div>
                Manage Rooms
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 bg-white hover:bg-cyan-50 border-cyan-200 text-cyan-700 hover:scale-105 transition-transform col-span-2" onClick={() => navigate('/students')}>
                <div className="p-3 bg-cyan-100 rounded-full">
                  <Users className="h-6 w-6 text-cyan-600" />
                </div>
                Student Directory
              </Button>
            </CardContent>
          </Card>
          {/* Announcements Card */}
          <Card className="shadow-md h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Broadcast Announcement</CardTitle>
              <CardDescription>Post updates for all students</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3">
              <div className="space-y-3">
                <Input
                  placeholder="Title"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Message..."
                  value={noteMessage}
                  onChange={(e) => setNoteMessage(e.target.value)}
                  className="resize-none min-h-[80px]"
                />
                <Button onClick={handleAddAnnouncement} disabled={!noteTitle || !noteMessage} className="w-full">
                  Post Announcement
                </Button>
              </div>

              <div className="mt-2 pt-4 border-t">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recent Posts</h4>
                <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                  {adminAnnouncements.length === 0 ? <span className="text-xs text-muted-foreground">No history</span> :
                    adminAnnouncements.slice(0, 3).map(n => (
                      <div key={n.id} className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 group relative pr-10">
                        <div className="flex justify-between">
                          <span className="font-semibold text-indigo-900 truncate max-w-[150px]">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.date}</span>
                        </div>
                        <span className="opacity-80 line-clamp-1">{n.message}</span>

                        <button
                          onClick={() => handleDeleteAnnouncement(n.id)}
                          className="absolute right-2 top-2 h-6 w-6 flex items-center justify-center bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded shadow-sm transition-all"
                          title="Delete Announcement"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dangerous Zone */}
        <div className="mt-8 border-t pt-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            Advanced Operations
          </h3>
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-rose-800 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                End of Semester Reset
              </h4>
              <p className="text-sm text-rose-600 mt-1">
                This will clear ALL room allocations and archive current applications.
                Use this only when starting a new academic term.
              </p>
            </div>
            <Button variant="destructive" onClick={handleResetSemester}>
              Reset Hostel Data
            </Button>
          </div>
        </div>
        <Card className="shadow-md h-full">
          <CardHeader className="pb-3 border-b bg-slate-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {allActivities.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No recent activity</div>
              ) : (
                allActivities.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex items-start pb-3 border-b last:border-0 last:pb-0 hover:bg-slate-50 p-2 rounded-lg transition-colors">
                    <div className={`mt-1 h-2.5 w-2.5 rounded-full mr-3 shrink-0 ${activity.type === 'application' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' :
                      activity.type === 'maintenance' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                        activity.type === 'payment' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-500'
                      }`} />
                    <div className="space-y-1 w-full">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-semibold leading-none text-slate-800">{activity.user}</p>
                        <span className="text-[10px] text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded border">{activity.time}</span>
                      </div>
                      <p className="text-xs text-slate-600">{activity.action}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout >
  );
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData } = useUserData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:5002/api/announcements')
      .then(res => res.json())
      .then(data => setAnnouncements(data))
      .catch(err => console.error("Failed to load announcements", err));

    if (user?.email) {
      fetch('http://localhost:5002/api/applications')
        .then(res => res.json())
        .then(apps => {
          const myApp = apps.find((a: any) => a.email === user.email && a.status !== 'Archived');
          if (myApp) setApplicationStatus(myApp.status);
        })
        .catch(console.error);
    }
  }, [user]);

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  // Import icons for SpeedDial
  // Note: These need to be imported at the top of the file, but I am in a ReplaceChunk. 
  // I will assume I can edit the imports separately or I should include a separate edit for imports.
  // Wait, I can't add imports in this chunk easily if they are top level.
  // I will assume the imports are already there or I need to do a multi-replace.

  if (!userData) return <div>Loading...</div>;

  const isAllocated = userData.status === 'Allocated' && userData.roomDetails;
  const { roomDetails } = userData;


  return (
    <PageLayout
      title={`Welcome, ${user?.name?.split(' ')[0] || 'Student'}!`}
      description="Manage your hostel life, payments, and complaints all in one place."
      action={
        <div className="flex items-center gap-4">
          <img src={gmLogo} alt="University Logo" className="h-16 w-auto object-contain mix-blend-multiply opacity-90" />
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Announcements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="col-span-2 lg:col-span-3"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-indigo-600" />
                Important Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No new announcements at this time.</p>
                ) : (
                  announcements.map((note) => (
                    <div key={note.id} className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-indigo-900">{note.title}</h4>
                        <span className="text-xs text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">{note.date}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{note.message}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="col-span-2 lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-white hover:bg-emerald-50 hover:border-emerald-200 border-white/60 shadow-sm" onClick={() => navigate('/payments')}>
            <CreditCard className="h-5 w-5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-800">Pay Rent</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-white hover:bg-rose-50 hover:border-rose-200 border-white/60 shadow-sm" onClick={() => navigate('/maintenance')}>
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <span className="text-xs font-semibold text-rose-800">Report Issue</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-white hover:bg-blue-50 hover:border-blue-200 border-white/60 shadow-sm" onClick={() => navigate('/my-room')}>
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-xs font-semibold text-blue-800">My Room</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 bg-white hover:bg-violet-50 hover:border-violet-200 border-white/60 shadow-sm" onClick={() => navigate('/rules')}>
            <ShieldCheck className="h-5 w-5 text-violet-600" />
            <span className="text-xs font-semibold text-violet-800">Hostel Rules</span>
          </Button>
        </motion.div>

        {/* Your Room Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="col-span-2 lg:col-span-2"
        >

          <Card className="bg-gradient-to-br from-white/80 to-blue-50/30 backdrop-blur-xl border-white/50 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-500" />
                Your Room
              </CardTitle>
              <CardDescription>
                Details about your current accommodation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAllocated ? (
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left Side: Visual Room Number Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="md:w-1/3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white flex flex-col justify-between shadow-lg relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-500" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-12 -mb-12" />

                    <div className="relative z-10">
                      <div className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Room No.</div>
                      <div className="text-5xl font-black tracking-tighter">{roomDetails?.roomNumber}</div>
                      <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium border border-white/10">
                        <div className={`w-1.5 h-1.5 rounded-full ${userData.status === 'Allocated' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                        {userData.status}
                      </div>
                    </div>

                    <div className="relative z-10 mt-8">
                      <div className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Type</div>
                      <div className="text-xl font-semibold flex items-center gap-2">
                        {roomDetails?.roomType}
                      </div>
                    </div>
                  </motion.div>

                  {/* Right Side: Detailed Grid */}
                  <div className="md:w-2/3 flex flex-col justify-between gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Building</div>
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary/60" />
                          {roomDetails?.building?.replace('Block ', '')}
                        </div>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Floor</div>
                        <div className="font-bold text-slate-800">{roomDetails?.floor}</div>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Roommates</div>
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-primary/60" />
                          {roomDetails?.roommates && roomDetails.roommates.length > 0
                            ? roomDetails.roommates.map(r => r.name.split(' ')[0]).join(', ')
                            : 'None'}
                        </div>
                      </motion.div>
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="p-3 rounded-xl bg-red-50 border border-red-100">
                        <div className="text-xs text-red-600 uppercase tracking-wider font-semibold mb-1">Payment Due</div>
                        <div className="font-bold text-red-700 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          {roomDetails?.nextPaymentDue?.split('-').reverse().join('-')}
                        </div>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.1 }}
                      className="mt-2"
                    >
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-11"
                        onClick={() => navigate('/my-room')}
                      >
                        View Full Room Details
                      </Button>
                    </motion.div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center py-12 border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/50 relative overflow-hidden">
                  {applicationStatus === 'Pending' && (
                    <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200 shadow-sm animate-pulse">
                      Application Pending
                    </div>
                  )}

                  <div className="mx-auto w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-2 animate-pulse">
                    {applicationStatus === 'Pending' ? <Clock className="h-8 w-8 text-indigo-600" /> : <Building2 className="h-8 w-8 text-indigo-600" />}
                  </div>

                  <h3 className="text-xl font-bold text-indigo-900">
                    {applicationStatus === 'Pending' ? 'Application Under Review' : 'No Room Allocated Yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-xs mx-auto">
                    {applicationStatus === 'Pending'
                      ? 'Your room application has been submitted and is currently being reviewed by the admin.'
                      : 'You currently have no room allocated. Apply now to secure your spot.'}
                  </p>

                  {applicationStatus === 'Pending' ? (
                    <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-100" onClick={() => navigate('/applications')}>
                      View Application Status
                    </Button>
                  ) : (
                    <Button onClick={() => navigate('/applications')} className="shadow-lg shadow-indigo-500/20">
                      Apply for a Room
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Mess Menu Widget with Sliding Navigation */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="col-span-2 lg:col-span-1 border border-white/40 rounded-xl bg-white/20 backdrop-blur-md shadow-lg overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-white/30 flex justify-between items-center bg-white/40">
            <div className="flex items-center gap-2 text-orange-800">
              <Utensils className="h-5 w-5" />
              <h3 className="font-bold">Mess Menu</h3>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/50" onClick={() => changeDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-xs font-medium bg-white/60 px-3 py-1.5 rounded-full min-w-[100px] text-center shadow-sm">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/50" onClick={() => changeDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden p-4 min-h-[350px]">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={selectedDate.toDateString()}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="h-full"
              >
                {(() => {
                  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  const dayName = days[selectedDate.getDay()];
                  const isToday = selectedDate.toDateString() === new Date().toDateString();

                  // Mock Data (Re-using the data structure, ideally this would be outside or memoized)
                  const weeklyMenu: Record<string, any> = {
                    'Monday': {
                      Breakfast: ['Idli & Sambar', 'Kesari Bath', 'Coffee'],
                      Lunch: ['Veg Biryani', 'Raita', 'Chapati', 'Dal Fry'],
                      Snacks: ['Veg Puff', 'Tea'],
                      Dinner: ['Rice', 'Rasam', 'Aloo Curry', 'Buttermilk']
                    },
                    'Tuesday': {
                      Breakfast: ['Pongal', 'Vada', 'Chutney'],
                      Lunch: ['Lemon Rice', 'Curd Rice', 'Chips'],
                      Snacks: ['Samosa', 'Coffee'],
                      Dinner: ['Chapati', 'Paneer Butter Masala', 'Salad']
                    },
                    'Wednesday': {
                      Breakfast: ['Dosa', 'Sambar', 'Chutney'],
                      Lunch: ['White Rice', 'Sambar', 'Beans Poriyal'],
                      Snacks: ['Bajji', 'Tea'],
                      Dinner: ['Fried Rice', 'Gobi Manchurian', 'Soup']
                    },
                    'Thursday': {
                      Breakfast: ['Poori', 'Saagu', 'Tea'],
                      Lunch: ['Bisibele Bath', 'Kara Boondi', 'Curd'],
                      Snacks: ['Cake', 'Coffee'],
                      Dinner: ['Roti', 'Dal Tadka', 'Jeera Rice']
                    },
                    'Friday': {
                      Breakfast: ['Upma', 'Kesari', 'Chutney'],
                      Lunch: ['Pulav', 'Kurma', 'Raitha'],
                      Snacks: ['Bondas', 'Tea'],
                      Dinner: ['Rice', 'Sambar', 'Ladies Finger Fry']
                    },
                    'Saturday': {
                      Breakfast: ['Chow Chow Bath', 'Chutney'],
                      Lunch: ['Ghee Rice', 'Dal', 'Papad'],
                      Snacks: ['Biscuits', 'Coffee'],
                      Dinner: ['Chapati', 'Mixed Veg Curry', 'Milk']
                    },
                    'Sunday': {
                      Breakfast: ['Masala Dosa', 'Sambar', 'Coffee'],
                      Lunch: ['Special Thali', 'Sweet', 'Ice Cream'],
                      Snacks: ['Corn', 'Tea'],
                      Dinner: ['Light Khichdi', 'Pickle', 'Curd']
                    }
                  };

                  const menu = weeklyMenu[dayName] || weeklyMenu['Monday'];

                  return (
                    <div className="space-y-3 h-full overflow-y-auto pr-1">
                      {isToday && (
                        <div className="mb-2 text-center">
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Today's Menu</span>
                        </div>
                      )}

                      {[
                        { type: 'Breakfast', label: 'Breakfast', time: '7:30 - 9:30 AM', items: menu.Breakfast, icon: Sun, color: 'text-amber-500', bg: 'bg-amber-100' },
                        { type: 'Lunch', label: 'Lunch', time: '12:30 - 2:00 PM', items: menu.Lunch, icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-100' },
                        { type: 'Snacks', label: 'Snacks', time: '4:30 - 5:30 PM', items: menu.Snacks, icon: Coffee, color: 'text-rose-500', bg: 'bg-rose-100' },
                        { type: 'Dinner', label: 'Dinner', time: '7:30 - 9:00 PM', items: menu.Dinner, icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-100' },
                      ].map((meal) => (
                        <div key={meal.type} className="bg-white/50 rounded-lg p-3 border border-white/50 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-full ${meal.bg} ${meal.color}`}>
                                <meal.icon className="h-3.5 w-3.5" />
                              </div>
                              <h4 className="font-semibold text-sm text-gray-800">{meal.label}</h4>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium bg-white/60 px-2 py-0.5 rounded-full border border-white/50">{meal.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground pl-8 leading-snug">
                            {meal.items.join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>


      </div>
    </PageLayout>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Layout>
      {user?.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
    </Layout>
  );
};

export default Dashboard;
