import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/api';
import Layout from '@/components/Layout';
import PageLayout from '@/components/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/contexts/UserDataContext';
import { toast } from 'sonner';
import { ArrowLeft, Send, Wrench, AlertTriangle, Clock, FileImage, History, X } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MaintenanceRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userData } = useUserData();
  const roomInfo = userData?.roomDetails ? `Room ${userData.roomDetails.roomNumber}, ${userData.roomDetails.building}` : '';

  const [issueType, setIssueType] = useState('');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(roomInfo);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/maintenance`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (roomInfo) setLocation(roomInfo);
  }, [roomInfo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File size too large (Max 5MB)");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!issueType || !description || !location) {
      toast.error('Please fill all required fields');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('issueType', issueType);
      formData.append('priority', priority);
      formData.append('description', description);
      formData.append('location', location);

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/maintenance`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Request Submitted! Ticket: ${data.ticketId}`);
        // Reset Form
        setIssueType('');
        setPriority('medium');
        setDescription('');
        setSelectedFile(null);
        setPreviewUrl(null);

        fetchHistory(); // Refresh list
        setLoading(false);
      } else {
        throw new Error(data.message || 'Submission failed');
      }

    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("Failed to submit request. Is the server running?");
      setLoading(false);
    }
  };
  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedRequest) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/maintenance/${selectedRequest.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Ticket ${selectedRequest.id} marked as ${newStatus}`);
        setIsUpdateDialogOpen(false);
        fetchHistory(); // Refresh list
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating status");
    }
  };

  // ADMIN VIEW
  if (user?.role === 'admin') {
    return (
      <Layout>
        <PageLayout
          title="Maintenance Requests"
          description="Manage and track all reported issues"
          action={
            <Button variant="outline" onClick={() => navigate('/')} className="hover:bg-slate-100">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          }
        >
          <div className="space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>All Active Tickets</CardTitle>
                <CardDescription>View and manage maintenance requests from students.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {history.filter(req => req.status !== 'Resolved').length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                      No active requests found.
                    </div>
                  ) : (
                    history.filter(req => req.status !== 'Resolved').map((req, i) => (
                      <Card key={i} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge variant="outline">#{req.id}</Badge>
                                <h4 className="font-semibold text-lg">{req.type}</h4>
                                <Badge className={req.priority === 'High' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-500 hover:bg-slate-600'}>{req.priority}</Badge>
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {req.location}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">{req.description}</p>
                              <div className="flex items-center gap-4 text-xs text-slate-400">
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {req.date}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 min-w-[120px]">
                              <Badge variant="secondary" className={`
                                ${req.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                  req.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}
                              `}>
                                {req.status}
                              </Badge>
                              {req.fileUrl && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                  onClick={() => setViewImageUrl(req.fileUrl)}
                                >
                                  <FileImage className="mr-2 h-3 w-3" /> View Image
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setIsUpdateDialogOpen(true);
                                }}
                              >
                                Update Status
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Ticket Status</DialogTitle>
                  <DialogDescription>
                    Change the status for Ticket ID: <b>{selectedRequest?.id}</b>
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-4 justify-center py-4">
                  <Button
                    variant="outline"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800"
                    onClick={() => handleStatusUpdate('Pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-200"
                    variant="outline"
                    onClick={() => handleStatusUpdate('In Progress')}
                  >
                    In Progress
                  </Button>
                  <Button
                    className="bg-green-100 hover:bg-green-200 text-green-800 border-green-200"
                    variant="outline"
                    onClick={() => handleStatusUpdate('Resolved')}
                  >
                    Resolved
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={!!viewImageUrl} onOpenChange={() => setViewImageUrl(null)}>
              <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center outline-none">
                {viewImageUrl && (
                  <div className="relative text-center">
                    <button
                      onClick={() => setViewImageUrl(null)}
                      className="absolute -top-12 right-0 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                    <img
                      src={viewImageUrl}
                      alt="Evidence"
                      className="rounded-lg max-w-full max-h-[85vh] object-contain shadow-2xl"
                    />
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </PageLayout>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageLayout
        title="Maintenance"
        description="Report issues and track repairs"
        action={
          <Button variant="outline" onClick={() => navigate('/')} className="hover:bg-slate-100">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Request Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-amber-600" />
                  Report New Issue
                </CardTitle>
                <CardDescription>
                  Describe the problem clearly for quick resolution
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="issueType">Issue Category*</Label>
                      <Select value={issueType} onValueChange={setIssueType}>
                        <SelectTrigger id="issueType" className="bg-slate-50">
                          <SelectValue placeholder="Select functionality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plumbing">💧 Plumbing (Water/Taps)</SelectItem>
                          <SelectItem value="electrical">⚡ Electrical (Lights/Fans)</SelectItem>
                          <SelectItem value="furniture">🪑 Furniture (Bed/Table)</SelectItem>
                          <SelectItem value="ac">❄️ Air Conditioning</SelectItem>
                          <SelectItem value="cleaning">🧹 Hygiene & Cleaning</SelectItem>
                          <SelectItem value="wifi">📶 Wi-Fi / Internet</SelectItem>
                          <SelectItem value="other">🔧 Other Issue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Urgency Level*</Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger id="priority" className="bg-slate-50">
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">🟢 Low (Can wait)</SelectItem>
                          <SelectItem value="medium">🟡 Medium (Standard)</SelectItem>
                          <SelectItem value="high">🟠 High (Urgent)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location*</Label>
                    <Input
                      id="location"
                      placeholder="Room Number / Area"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="bg-slate-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Detailed Description*</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      placeholder="Describe the issue... (e.g. The fan regulator is loose and making noise)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-slate-50 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileImage className="h-4 w-4 text-slate-500" />
                      Attach Photo (Optional)
                    </Label>

                    <input
                      type="file"
                      accept="image/*"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    {!previewUrl ? (
                      <label
                        htmlFor="file-upload"
                        className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <FileImage className="h-8 w-8 mb-2 opacity-20" />
                        <span className="text-xs">Click to upload image (JPG/PNG, Max 5MB)</span>
                      </label>
                    ) : (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 h-48 bg-slate-100 flex items-center justify-center group">
                        <img src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={removeFile}
                            className="gap-2"
                          >
                            <X className="h-4 w-4" /> Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 p-6 flex justify-end">
                  <Button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white min-w-[150px]"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : (
                      <div className="flex items-center gap-2">
                        Submit Report <Send className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* RIGHT: History & Info */}
          <div className="lg:col-span-1 space-y-6">

            {/* Emergency Card */}
            <Card className="bg-red-50 border-red-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-700 flex items-center gap-2 text-base">
                  <AlertTriangle className="h-5 w-5" /> Emergency?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-red-600/90">
                For immediate hazards (fire, sparking, flooding), call the warden directly.
                <div className="mt-3 font-bold text-lg">📞 +91 99887 76655</div>
              </CardContent>
            </Card>

            {/* History Card */}
            <Card className="h-fit border-none shadow-lg">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <History className="h-5 w-5 text-slate-500" />
                  Previous Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                  {history.slice(0, 3).map((req, i) => (
                    <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-slate-800">{req.type}</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 text-[10px]">
                          {req.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {req.date}</span>
                        <span>ID: {req.id}</span>
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <div className="p-4 text-center text-slate-400 text-sm">No reports yet</div>
                  )}
                  <div className="p-4 text-center border-t border-slate-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 text-xs w-full hover:text-amber-600"
                      onClick={() => setShowHistory(true)}
                    >
                      View All History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* History Dialog */}
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Maintenance History</DialogTitle>
              <DialogDescription>
                Complete record of your maintenance requests and their status.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {history.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  No requests found.
                </div>
              ) : (
                history.map((req, i) => (
                  <Card key={i} className="bg-slate-50 border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">#{req.id}</Badge>
                            <h4 className="font-semibold text-lg">{req.type}</h4>
                            <Badge className={req.priority === 'High' ? 'bg-orange-500' : 'bg-slate-500'}>{req.priority}</Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{req.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {req.date}</span>
                            <span>Location: {req.location}</span>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            {req.status}
                          </Badge>
                          {req.fileUrl && (
                            <a href={req.fileUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-600 hover:underline flex items-center justify-end gap-1">
                              <FileImage className="h-3 w-3" /> View Attachment
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </PageLayout>
    </Layout>
  );
};

export default MaintenanceRequest;
