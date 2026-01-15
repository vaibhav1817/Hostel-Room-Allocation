
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Building2,
  BedDouble,
  Home,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import Layout from '@/components/Layout';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Room,
  statusColors,
  statusLabels,
  facilityIcons,
  getYearFromUSN
} from './RoomDetailsDefinitions';

// Helper for status case insensitivity
const getStatusKey = (status: string) => {
  if (!status) return 'available';
  const s = status.toLowerCase();
  if (s.includes('partially')) return 'partially_occupied';
  if (s === 'under maintenance' || s === 'maintenance') return 'maintenance';
  return s;
};

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      try {
        const [roomRes, appsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/rooms/${id}`),
          fetch(`${API_BASE_URL}/api/applications`)
        ]);

        if (roomRes.ok) {
          const roomData = await roomRes.json();
          // Ensure arrays exist to prevent crashes
          if (!roomData.facilities) roomData.facilities = [];

          let occupants: any[] = [];

          if (appsRes.ok) {
            const appsData = await appsRes.json();
            // Find allocated students for this room
            occupants = appsData
              .filter((app: any) => app.allocatedRoomId === id && app.status === 'Allocated')
              .map((app: any) => ({
                id: app.studentId,
                name: app.student || 'Unknown',
                rollNumber: (app.usn || app.email?.split('@')[0] || 'N/A').toUpperCase(),
                course: 'B.Tech',
                year: getYearFromUSN(app.usn || app.email?.split('@')[0] || '') || 'N/A',
                contact: app.email || 'N/A'
              }));
          }

          roomData.occupants = occupants;
          setRoom(roomData);
        } else {
          setRoom(null);
        }
      } catch (error) {
        console.error("Failed to fetch room details", error);
        setRoom(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  const handleApplyForRoom = () => {
    toast.success("Application submitted successfully!");
    navigate('/apply');
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/remove-occupant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: id, studentId })
      });

      if (response.ok) {
        toast.success("Student removed from room successfully!");
        // Refresh to show updated occupancy
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error("Failed to remove student");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error removing student");
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/update-room-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: id, status })
      });
      if (response.ok) {
        toast.success(`Room marked as ${status}`);
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!room) {
    return (
      <Layout>
        <PageLayout
          title="Room Not Found"
          description="The room you are looking for does not exist."
          action={
            <Button variant="outline" onClick={() => navigate('/rooms')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Rooms List
            </Button>
          }
        >
          <div className="flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
            <Home className="h-16 w-16 mb-4 opacity-20" />
            <p>Please check the room number and try again.</p>
          </div>
        </PageLayout>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageLayout
        title={`Room ${room.number}`}
        description={`Block ${room.block}, Floor ${room.floor}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/rooms')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Rooms
            </Button>
            {user?.role === 'student' && room.status !== 'occupied' && room.status !== 'maintenance' && (
              <Button onClick={handleApplyForRoom}>
                Apply for this Room
              </Button>
            )}
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl font-bold">
                      Room {room.number}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Block {room.block}, Floor {room.floor}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={statusColors[getStatusKey(room.status) as keyof typeof statusColors]}>
                      {statusLabels[getStatusKey(room.status) as keyof typeof statusLabels]}
                    </Badge>
                    {(room.gender) && (
                      <Badge variant="outline" className={`${room.gender === 'Female' ? 'text-pink-600 border-pink-200 bg-pink-50' : 'text-blue-600 border-blue-200 bg-blue-50'}`}>
                        {room.gender} Only
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <BedDouble className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{room.type} Room</p>
                      <p className="text-sm text-muted-foreground">Room Type</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{room.occupied}/{room.capacity}</p>
                      <p className="text-sm text-muted-foreground">Occupancy</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Block {room.block}</p>
                      <p className="text-sm text-muted-foreground">Hostel Block</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <Home className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Floor {room.floor}</p>
                      <p className="text-sm text-muted-foreground">Floor Level</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 border rounded-lg col-span-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">₹{room.rent} per month</p>
                      <p className="text-sm text-muted-foreground">Rent Amount</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Facilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {room.facilities.map((facility) => {
                      const IconComponent = facilityIcons[facility] || Home;
                      return (
                        <div key={facility} className="flex items-center gap-1 p-2 border rounded-lg">
                          <IconComponent className="h-4 w-4 text-primary" />
                          <span className="text-sm">{facility}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {room.occupants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Occupants</CardTitle>
                  <CardDescription>Students currently assigned to this room</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>USN</TableHead>
                        <TableHead className="hidden md:table-cell">Course</TableHead>
                        <TableHead className="hidden md:table-cell">Year</TableHead>
                        <TableHead className="hidden md:table-cell">Contact</TableHead>
                        {user?.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {room.occupants.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.rollNumber}</TableCell>
                          <TableCell className="hidden md:table-cell">{student.course}</TableCell>
                          <TableCell className="hidden md:table-cell">{student.year}</TableCell>
                          <TableCell className="hidden md:table-cell">{student.contact}</TableCell>
                          {user?.role === 'admin' && (
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="destructive" size="sm">Remove</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirm Removal</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to remove {student.name} from Room {room.number}? This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => { }}>Cancel</Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleRemoveStudent(student.id)}
                                    >
                                      Remove Student
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Room Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Capacity:</span>
                    <span className="font-medium">{room.capacity} {room.capacity > 1 ? 'Students' : 'Student'}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Available Spots:</span>
                    <span className="font-medium">{room.capacity - room.occupied}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Status:</span>
                    <Badge className={statusColors[getStatusKey(room.status) as keyof typeof statusColors]}>
                      {statusLabels[getStatusKey(room.status) as keyof typeof statusLabels]}
                    </Badge>
                  </div>

                  <div className="mt-2 pt-2 border-t">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Occupancy:</span>
                      <span className="text-sm font-medium">{room.occupied}/{room.capacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {user?.role === 'admin' && (
              <Card>
                <CardHeader>
                  <CardTitle>Administrative Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full justify-start"
                    onClick={() => navigate(`/assign-room?roomId=${room.id}`)}
                    disabled={room.status === 'maintenance' || room.occupied >= room.capacity}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Assign Student
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => toast.info("Edit feature coming soon")}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Edit Room Details
                  </Button>

                  {room.status !== 'maintenance' ? (
                    <Button
                      variant="outline"
                      className="w-full justify-start text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => handleUpdateStatus('Maintenance')}
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      Mark for Maintenance
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => handleUpdateStatus('Available')}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark as Available
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </PageLayout>
    </Layout>
  );
};

export default RoomDetails;
