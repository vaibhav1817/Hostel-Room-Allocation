
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/api';
import { ArrowLeft, Search, UserPlus } from 'lucide-react';
import { getYearFromUSN } from './RoomDetailsDefinitions';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ... (MOCK CONSTANTS would be here, but I can't skip them in replace unless I use a chunk. 
// Wait, I am replacing from imports down to AssignRoom definition start?
// No, that's too much.

// I will just do the imports and the hook call separately.
// Step 1: imports.


// Status colors and labels
const statusColors = {
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-red-100 text-red-800',
  partially_occupied: 'bg-amber-100 text-amber-800',
  maintenance: 'bg-blue-100 text-blue-800'
};

const statusLabels = {
  available: 'Available',
  occupied: 'Fully Occupied',
  partially_occupied: 'Partially Occupied',
  maintenance: 'Under Maintenance'
};

const getStatusKey = (status: string) => {
  if (!status) return 'available';
  const s = status.toLowerCase();
  if (s.includes('partially')) return 'partially_occupied';
  if (s === 'under maintenance' || s === 'maintenance') return 'maintenance';
  return s; // 'occupied', 'available'
};

const AssignRoom = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('roomId');
  const preSelectedStudentId = searchParams.get('studentId');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Only show students without a room
  const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [roomRes, appsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/rooms/${id}`),
          fetch(`${API_BASE_URL}/api/applications`)
        ]);

        if (roomRes.ok) {
          const foundRoom = await roomRes.json();
          setRoom(foundRoom);
        }

        if (appsRes.ok) {
          const allApps = await appsRes.json();
          const pendingApps = allApps.filter((a: any) => a.status === 'Pending');

          const students = pendingApps.map((a: any) => ({
            id: a.studentId,
            name: a.student || 'Unknown',
            rollNumber: (a.usn || a.email?.split('@')[0] || 'N/A').toUpperCase(),
            course: 'B.Tech',
            year: getYearFromUSN(a.usn || a.email?.split('@')[0] || '') || 'N/A',
            gender: a.gender,
            bookingId: a.id,
            hasRoom: false
          }));

          setEligibleStudents(students);

          if (preSelectedStudentId) {
            const preSelected = students.find((s: any) => s.id === preSelectedStudentId);
            if (preSelected) {
              setSearchTerm(preSelected.name);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch assignment data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, preSelectedStudentId]);

  // Filter students based on search and gender
  const filteredStudents = eligibleStudents.filter(student => {
    const term = searchTerm.toLowerCase();
    const name = student.name?.toLowerCase() || '';
    const roll = student.rollNumber?.toLowerCase() || '';

    // Gender Check
    if (room?.gender) {
      if (student.gender && student.gender !== room.gender) return false;
    }

    return name.includes(term) || roll.includes(term);
  });

  const handleAssignStudent = async (studentId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/assign-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: id, studentId }),
      });

      if (response.ok) {
        toast.success(`Student assigned to room successfully!`);
        navigate(`/rooms/${id}`);
      } else {
        const err = await response.json();
        throw new Error(err.error || 'Failed to assign');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Assignment failed");
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
        <div className="space-y-6">
          <Button variant="outline" onClick={() => navigate('/rooms')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Rooms
          </Button>
          <Card className="mt-6">
            <CardHeader><CardTitle>Room Not Found</CardTitle></CardHeader>
            <CardFooter><Button onClick={() => navigate('/rooms')}>Back to List</Button></CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  // Admin Check
  if (user?.role !== 'admin') {
    // If user is not admin, we essentially render null (or could redirect)
    // But since this is inside layout, we should stick to a clean return or redirect.
    // The useEffect redirect in simpler components works, here we just return null 
    // but React Router usually handles redirects. 
    // Let's just return a generic unauthorized if somehow they got here.
    return <Layout><div>Unauthorized</div></Layout>;
  }

  const roomStatusKey = getStatusKey(room.status);

  // If room is fully occupied or under maintenance, redirect
  // Note: We check safe keys now.
  if (roomStatusKey === 'occupied' || roomStatusKey === 'maintenance') {
    // We return a message instead of instant redirect to avoid flash
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <h2 className="text-xl font-bold text-red-600">Room Unavailable</h2>
          <p>This room is {room.status} and cannot accept new students.</p>
          <Button onClick={() => navigate(`/rooms/${id}`)}>Back to details</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(`/rooms/${id}`)} className="mr-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Room Details
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Assign Student to Room {room?.number}</CardTitle>
                <CardDescription>
                  Block {room?.block}, Floor {room?.floor} - {room?.type} Room
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={statusColors[roomStatusKey as keyof typeof statusColors]}>
                  {statusLabels[roomStatusKey as keyof typeof statusLabels]}
                </Badge>
                {(room.gender) && (
                  <Badge variant="outline" className={`${room.gender === 'Female' ? 'text-pink-600 border-pink-200 bg-pink-50' : 'text-blue-600 border-blue-200 bg-blue-50'}`}>
                    {room.gender} Only
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-4">
                This room has {room?.capacity - room?.occupied} vacant spots remaining.
                Select a student to assign.
              </p>

              <div className="relative mb-6">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {filteredStudents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>USN</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell>{student.gender || 'Unknown'}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => handleAssignStudent(student.id)}>
                            <UserPlus className="mr-2 h-4 w-4" /> Assign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 border rounded-lg">
                  <UserPlus className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">No Eligible Students</h3>
                  <p className="text-muted-foreground">All students have rooms or search mismatch.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AssignRoom;
