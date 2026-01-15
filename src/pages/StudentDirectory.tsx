
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    ArrowLeft,
    User,
    Mail,
    Phone,
    MoreHorizontal,
    Shield,
    Trash2,
    RefreshCcw
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/api';

const StudentDirectory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchStudents();
    }, [user, navigate]);

    const fetchStudents = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users`);
            if (res.ok) {
                const data = await res.json();
                // Filter only students
                setStudents(data.filter((u: any) => u.role !== 'admin'));
            } else {
                toast.error("Failed to load student directory");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error loading students");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success("User deleted successfully");
                setStudents(prev => prev.filter(s => s.id !== userId));
            } else {
                toast.error("Failed to delete user");
            }
        } catch (error) {
            toast.error("Error deleting user");
        }
    };

    const filteredStudents = students.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <PageLayout
                title="Student Directory"
                description="Manage all registered students in the system."
                action={
                    <Button variant="outline" onClick={() => navigate('/')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                }
            >
                <Card className="border-none shadow-md mb-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">All Students ({students.length})</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by name or email..."
                                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-slate-100 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                    <tr>
                                        <th className="p-4 pl-6">Student</th>
                                        <th className="p-4">Contact</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Joined</th>
                                        <th className="p-4 text-right pr-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {loading ? (
                                        <tr><td colSpan={5} className="p-8 text-center">Loading directory...</td></tr>
                                    ) : filteredStudents.length === 0 ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-slate-500">No students found.</td></tr>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="p-4 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                                            {student.name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900">{student.name || 'Unknown'}</div>
                                                            <div className="text-xs text-slate-500">ID: {student.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1 text-slate-600">
                                                        <span className="flex items-center gap-1.5 text-xs"><Mail className="h-3 w-3" /> {student.email}</span>
                                                        {student.phone && <span className="flex items-center gap-1.5 text-xs"><Phone className="h-3 w-3" /> {student.phone}</span>}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">
                                                        {student.role || 'Student'}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-slate-500 text-xs">
                                                    {new Date(parseInt(student.id)).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 text-right pr-6">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(student.email)}>
                                                                Copy Email
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDeleteUser(student.id)}>
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Student
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </PageLayout>
        </Layout>
    );
};

export default StudentDirectory;
