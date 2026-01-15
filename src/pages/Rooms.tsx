
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Search, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  Available: 'bg-green-100 text-green-800',
  Occupied: 'bg-red-100 text-red-800',
  'Partially Occupied': 'bg-amber-100 text-amber-800',
  Maintenance: 'bg-blue-100 text-blue-800'
};



const ROOMS_PER_PAGE = 12;

const Rooms = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assignStudentId = searchParams.get('assignStudentId');
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('all');
  const [filterFloor, setFilterFloor] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/admin/rooms');
        if (response.ok) {
          setRooms(await response.json());
        }
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // Filter logic
  const filteredRooms = rooms.filter(room => {
    const matchesSearch =
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.block.toLowerCase().includes(searchTerm.toLowerCase());

    // Normalize block check (handles "Block A" vs "A")
    const matchesBlock = filterBlock === 'all'
      ? true
      : room.block === filterBlock || room.block === `Block ${filterBlock}` || room.block.endsWith(` ${filterBlock}`);

    const matchesType = filterType === 'all' ? true : room.type.toLowerCase() === filterType.toLowerCase();
    const matchesFloor = filterFloor === 'all' ? true : String(room.floor) === String(filterFloor);

    let matchesTab = true;
    if (activeTab === 'available') matchesTab = room.status === 'Available';
    if (activeTab === 'occupied') matchesTab = room.status === 'Occupied' || room.capacity > room.occupied && room.occupied > 0;
    if (activeTab === 'maintenance') matchesTab = room.status === 'Maintenance';

    return matchesSearch && matchesBlock && matchesType && matchesTab && matchesFloor;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredRooms.length / ROOMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROOMS_PER_PAGE;
  const paginatedRooms = filteredRooms.slice(startIndex, startIndex + ROOMS_PER_PAGE);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterBlock, filterType, filterFloor, activeTab]);


  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Rooms Management</h2>
            <p className="text-muted-foreground">View and manage all hostel rooms</p>
          </div>
          {user?.role === 'admin' && (
            <Button onClick={() => navigate('/rooms/add')}>
              <Plus className="mr-2 h-4 w-4" /> Add New Room
            </Button>
          )}
        </div>

        {assignStudentId && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 font-medium">
              <UserCheck className="h-5 w-5" />
              Select a room to assign to the student
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/rooms')} className="hover:bg-blue-100 text-blue-900">Cancel Assignment</Button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by room number or block..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={filterBlock} onValueChange={setFilterBlock}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Block" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blocks</SelectItem>
                <SelectItem value="A">Block A</SelectItem>
                <SelectItem value="B">Block B</SelectItem>
                <SelectItem value="C">Block C</SelectItem>
                <SelectItem value="D">Block D</SelectItem>
                <SelectItem value="E">Block E</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterFloor} onValueChange={setFilterFloor}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                <SelectItem value="1">1st Floor</SelectItem>
                <SelectItem value="2">2nd Floor</SelectItem>
                <SelectItem value="3">3rd Floor</SelectItem>
                <SelectItem value="4">4th Floor</SelectItem>
                <SelectItem value="5">5th Floor</SelectItem>
                <SelectItem value="6">6th Floor</SelectItem>
                <SelectItem value="7">7th Floor</SelectItem>
                <SelectItem value="8">8th Floor</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Double">Double</SelectItem>
                <SelectItem value="Triple">Triple</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Rooms</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="occupied">Occupied</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-[200px] w-full rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedRooms.length > 0 ? (
                    paginatedRooms.map((room) => (
                      <Card key={room.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>
                                Room {room.number}
                                <span className="ml-2 text-sm font-normal text-muted-foreground">
                                  • {room.block}, Floor {room.floor}
                                </span>
                              </CardTitle>
                              <CardDescription>{room.type} Room</CardDescription>
                            </div>
                            <Badge className={statusColors[room.status as keyof typeof statusColors] || 'bg-gray-100'}>
                              {room.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Capacity:</span>
                              <span>{room.occupied}/{room.capacity} Occupied</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Rent:</span>
                              <span>₹{room.rent}/month</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Facilities: </span>
                              <span>AC, WiFi, Study Table</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => navigate(`/rooms/${room.id}`)}
                          >
                            View Details
                          </Button>
                          {user?.role === 'admin' && (
                            <Button
                              className="flex-1"
                              disabled={room.occupied >= room.capacity}
                              onClick={() => navigate(`/assign-room?roomId=${room.id}${assignStudentId ? `&studentId=${assignStudentId}` : ''}`)}
                            >
                              Assign
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                      <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold">No Rooms Found</h3>
                      <p className="text-muted-foreground max-w-md">
                        No rooms match your current filters. Try adjusting your search criteria or filters.
                      </p>
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Rooms;
