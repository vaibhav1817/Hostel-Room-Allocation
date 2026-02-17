const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const session = require('express-session');
const passport = require('./config/passport');
// const Razorpay = require('razorpay'); // Uncomment when you have keys

const app = express();
const PORT = process.env.PORT || 5002;
const ALLOWED_ADMIN_IDS = ['ADM-001', 'ADM-002', 'ADM-003', 'ADM-004', 'ADM-005'];

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'hostel-room-allocation-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, '../dist')));


// Configure Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // timestamp-originalName
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static('uploads')); // Serve uploaded files

const DB_FILE = path.join(__dirname, 'maintenance.json');

// Helper to read DB
const readDB = () => {
    if (!fs.existsSync(DB_FILE)) return [];
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Helper to write DB
const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Mock Payment Route (Keep existing)
app.post('/api/create-order', async (req, res) => {
    const { amount } = req.body;
    console.log(`[Mock Server] Creating order for amount: ₹${amount}`);
    res.json({
        id: "order_mock_" + Math.floor(Math.random() * 1000000),
        currency: "INR",
        amount: amount * 100, // paise
        message: "This is a mock order from your local Node server"
    });
});


const PAYMENTS_DB = path.join(__dirname, 'payments.json');

// GET Payment History
app.get('/api/payments', (req, res) => {
    const studentId = req.query.studentId;
    const payments = readJsonDB(PAYMENTS_DB);

    if (studentId) {
        const studentPayments = payments.filter(p => p.studentId === studentId);
        return res.json(studentPayments.reverse());
    }

    res.json(payments.reverse());
});

// Record Payment (After simulated success)
app.post('/api/payments', (req, res) => {
    const { studentId, amount, method, transactionId } = req.body;

    const newPayment = {
        id: transactionId || "TXN" + Date.now(),
        studentId,
        date: new Date().toLocaleDateString('en-GB'), // 14/01/2026
        amount,
        method,
        status: 'Success',
        timestamp: Date.now()
    };

    const payments = readJsonDB(PAYMENTS_DB);
    payments.push(newPayment);
    writeJsonDB(PAYMENTS_DB, payments);

    // Ideally update next payment due date in User/Room DB here

    res.json({ success: true, payment: newPayment });
});

// GET Maintenance Requests
app.get('/api/maintenance', (req, res) => {
    const requests = readDB();
    // Sort by newest first
    res.json(requests.reverse());
});

// Maintenance Request Route
app.post('/api/maintenance', upload.single('image'), (req, res) => {
    const { issueType, priority, description, location } = req.body;
    const file = req.file;

    const newRequest = {
        id: "REQ-" + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toLocaleDateString(),
        type: issueType.charAt(0).toUpperCase() + issueType.slice(1), // Capitalize
        priority: priority.charAt(0).toUpperCase() + priority.slice(1),
        status: 'Pending',
        description,
        location,
        fileUrl: file ? `http://localhost:${PORT}/uploads/${file.filename}` : null,
        timestamp: Date.now()
    };

    console.log(`[Maintenance] New Request: ${newRequest.type} (${newRequest.priority})`);

    // Save to JSON DB
    const requests = readDB();
    requests.push(newRequest);
    writeDB(requests);

    res.json({
        success: true,
        message: "Maintenance request received",
        ticketId: newRequest.id,
        request: newRequest
    });
});

// Update Maintenance Status
app.patch('/api/maintenance/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const requests = readDB();
    const index = requests.findIndex(r => r.id == id); // Loose equality for string/number match

    if (index !== -1) {
        requests[index].status = status;
        if (status === 'Resolved') requests[index].resolvedAt = Date.now();
        writeDB(requests);
        res.json({ success: true, message: 'Status updated' });
    } else {
        res.status(404).json({ success: false, message: 'Request not found' });
    }
});


// DB Paths
const ROOMS_DB = path.join(__dirname, 'rooms.json');
const APPS_DB = path.join(__dirname, 'applications.json');
const USERS_DB = path.join(__dirname, 'users.json');

// Generic Read/Write
const readJsonDB = (filePath) => {
    if (!fs.existsSync(filePath)) return [];
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch { return []; }
};

// --- AUTH ROUTES ---

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const users = readJsonDB(USERS_DB);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (user) {
        const { password: _, ...userWithoutPass } = user;
        res.json(userWithoutPass);
    } else {
        res.status(401).json({ error: 'Invalid email or password' });
    }
});

// Register
app.post('/api/auth/register', (req, res) => {
    const { name, email, password, role, usn, adminId } = req.body;
    const users = readJsonDB(USERS_DB);

    // Check if email already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ error: 'Email already exists' });
    }

    // Role-based validation
    if (role === 'student' && !usn) {
        return res.status(400).json({ error: 'USN is required for students' });
    }
    if (role === 'admin') {
        if (!adminId) {
            return res.status(400).json({ error: 'Admin ID is required for admins' });
        }
        if (!ALLOWED_ADMIN_IDS.includes(adminId)) {
            return res.status(400).json({ error: 'Invalid Admin ID' });
        }
    }



    const newUser = {
        id: String(Date.now()),
        name,
        email,
        password,
        role: role || 'student',
        usn: role === 'student' ? usn : undefined,
        adminId: role === 'admin' ? adminId : undefined
    };

    users.push(newUser);
    // Write back to DB
    fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));

    const { password: _, ...userWithoutPass } = newUser;
    res.status(201).json(userWithoutPass);
});

const writeJsonDB = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// --- ADMIN USER MANAGEMENT ROUTES ---

// Get All Users
app.get('/api/admin/users', (req, res) => {
    const users = readJsonDB(USERS_DB);
    const safeUsers = users.map(u => {
        const { password, ...rest } = u;
        return rest;
    });
    res.json(safeUsers);
});

// Delete User
app.delete('/api/admin/users/:id', (req, res) => {
    const { id } = req.params;
    let users = readJsonDB(USERS_DB);
    const initialLength = users.length;
    users = users.filter(u => u.id !== id);

    if (users.length < initialLength) {
        writeJsonDB(USERS_DB, users);
        res.json({ success: true, message: 'User deleted' });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// --- ADMIN API ROUTES ---

// Auto-Allocate Rooms
app.post('/api/admin/auto-allocate', (req, res) => {
    const apps = readJsonDB(APPS_DB);
    const rooms = readJsonDB(ROOMS_DB);
    const users = readJsonDB(USERS_DB);

    let allocatedCount = 0;

    // Filter pending apps
    const pendingApps = apps.filter(a => a.status === 'Pending');

    pendingApps.forEach(app => {
        const gender = app.gender || 'Male'; // Default fallback
        const validBlocks = (gender === 'Female') ? ['A', 'B'] : ['C', 'D', 'E'];

        // Find room: Match Gender, Type, Capacity
        // Priority 1: Preferred Block
        let room = rooms.find(r =>
            validBlocks.includes(r.block) &&
            r.block === app.preferredBlock &&
            r.type.toLowerCase() === app.roomType.toLowerCase() &&
            r.occupied < r.capacity
        );

        // Priority 2: Any Valid Block
        if (!room) {
            room = rooms.find(r =>
                validBlocks.includes(r.block) &&
                r.type.toLowerCase() === app.roomType.toLowerCase() &&
                r.occupied < r.capacity
            );
        }

        if (room) {
            // Allocate
            room.occupied++;
            room.occupants = room.occupants || [];
            room.occupants.push({
                name: app.student,
                id: app.studentId || 'unknown',
                usn: (app.email || '').split('@')[0].toUpperCase(),
                gender: gender
            });

            // Update Application
            app.status = 'Allocated';
            app.allocatedRoomId = room.number;

            // Update User
            const userIndex = users.findIndex(u => u.id == app.studentId); // Loose eq
            if (userIndex !== -1) {
                users[userIndex].roomDetails = {
                    roomNumber: room.number,
                    building: 'Block ' + room.block,
                    floor: room.floor,
                    roomType: room.type,
                    rentPerMonth: room.rent,
                    roommates: room.occupants.filter(o => o.id != app.studentId)
                };
            }

            allocatedCount++;
        }
    });

    if (allocatedCount > 0) {
        writeJsonDB(ROOMS_DB, rooms);
        writeJsonDB(APPS_DB, apps);
        writeJsonDB(USERS_DB, users);
    }

    res.json({ success: true, allocated: allocatedCount, total: pendingApps.length });
});

// 1. Dashboard Stats
app.get('/api/admin/stats', (req, res) => {
    const rooms = readJsonDB(ROOMS_DB);
    const apps = readJsonDB(APPS_DB);
    const maintenance = readJsonDB(DB_FILE);

    const totalRooms = rooms.reduce((acc, r) => acc + r.capacity, 0); // Total Beds/Capacity
    const occupiedRooms = rooms.reduce((acc, r) => acc + r.occupied, 0);

    // Mock Revenue Calculation (sum of rent of occupied beds)
    // Assuming rent is per student/bed
    const revenue = rooms.reduce((acc, r) => acc + (r.occupied * r.rent), 0);

    const occupancyByType = rooms.reduce((acc, r) => {
        const type = r.type ? r.type.toLowerCase() : 'unknown';
        acc[type] = (acc[type] || 0) + r.occupied;
        return acc;
    }, {});

    const maintenanceByType = maintenance.reduce((acc, m) => {
        const type = m.type || 'Other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const stats = {
        totalRooms: totalRooms, // Capacity
        occupiedRooms: occupiedRooms,
        availableRooms: totalRooms - occupiedRooms,
        pendingApplications: apps.filter(a => a.status === 'Pending').length,
        maintenanceRequests: maintenance.filter(m => m.status === 'Pending').length,
        revenue: revenue,
        occupancyBreakdown: occupancyByType,
        maintenanceBreakdown: maintenanceByType
    };
    res.json(stats);
});

// 2. Room Occupancy Trends (Simulated History based on current capacity)
app.get('/api/admin/occupancy', (req, res) => {
    const rooms = readJsonDB(ROOMS_DB);
    const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
    const currentOccupied = rooms.reduce((acc, r) => acc + r.occupied, 0);

    // Generate 6 months of history trending towards current state
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        let idx = currentMonthIdx - i;
        if (idx < 0) idx += 12;

        // Simulate previous months with some random variance from current
        // The further back, the more variance/lower occupancy to simulate growth
        const variance = Math.floor(Math.random() * 15) + (i * 2);
        let occupied = currentOccupied - variance;
        if (occupied < 0) occupied = 0;

        // For the current month (i=0), show actual
        if (i === 0) occupied = currentOccupied;

        chartData.push({
            month: months[idx],
            occupied: occupied,
            total: totalCapacity
        });
    }

    res.json(chartData);
});

// 3. Recent Activity (Aggregated)
// 3. Recent Activity (Aggregated)
app.get('/api/admin/recent-activity', (req, res) => {
    const apps = readJsonDB(APPS_DB);
    const maintenance = readJsonDB(DB_FILE);
    const payments = readJsonDB(PAYMENTS_DB);

    // Convert to common format
    const activities = [];

    apps.forEach(a => {
        // Application Submission
        activities.push({
            id: 'app-' + a.id,
            type: 'application',
            user: a.student,
            action: `Applied for ${a.roomType || 'room'}`,
            time: a.date,
            timestamp: parseDate(a.date)
        });

        // Allocation Event
        if (a.status === 'Allocated' && a.allocatedRoomId) {
            activities.push({
                id: 'alloc-' + a.id,
                type: 'application',
                user: 'System',
                action: `Allocated Room ${a.allocatedRoomId} to ${a.student?.split(' ')[0] || 'Student'}`,
                time: a.date, // Fallback to app date since we don't store allocation date yet
                timestamp: parseDate(a.date) + 100 // Slightly later than application
            });
        }
    });

    maintenance.forEach(m => {
        activities.push({
            id: 'maint-' + m.id,
            type: 'maintenance',
            user: `Room ${m.location || 'Unknown'}`,
            action: `Reported ${m.type || 'issue'}`,
            time: m.date,
            timestamp: m.timestamp || parseDate(m.date)
        });

        if (m.status === 'Resolved' && m.resolvedAt) {
            activities.push({
                id: 'maint-res-' + m.id,
                type: 'maintenance',
                user: 'Admin',
                action: `Resolved ${m.type || 'issue'} in Room ${m.location}`,
                time: new Date(m.resolvedAt).toLocaleDateString('en-IN'),
                timestamp: m.resolvedAt
            });
        }
    });

    payments.forEach(p => {
        activities.push({
            id: 'pay-' + p.id,
            type: 'payment',
            user: `Student ${p.studentId?.slice(-4) || 'Unknown'}`, // Mask ID
            action: `Paid ₹${p.amount} rent`,
            time: p.date,
            timestamp: p.timestamp || parseDate(p.date)
        });
    });

    // Sort by timestamp desc
    activities.sort((a, b) => b.timestamp - a.timestamp);

    res.json(activities.slice(0, 10)); // Return top 10
});

// Helper to parse DD/MM/YYYY or YYYY-MM-DD
function parseDate(dateStr) {
    if (!dateStr) return 0;
    // Check if timestamp
    if (typeof dateStr === 'number') return dateStr;

    // Try standard date parse
    let ts = Date.parse(dateStr);
    if (!isNaN(ts)) return ts;

    // Handle DD/MM/YYYY manually if standard parse fails
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
    }
    return 0;
}

// 4. Applications List
app.get('/api/applications', (req, res) => {
    res.json(readJsonDB(APPS_DB));
});


// 5. All Rooms List
app.get('/api/admin/rooms', (req, res) => {
    res.json(readJsonDB(ROOMS_DB));
});

// Single Room Details
app.get('/api/rooms/:id', (req, res) => {
    const rooms = readJsonDB(ROOMS_DB);
    const room = rooms.find(r => r.id === req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
});

// 4. Submit Room Application
app.post('/api/applications', (req, res) => {
    const application = req.body;
    application.id = String(Date.now());
    application.status = 'Pending';
    application.date = new Date().toLocaleDateString();

    const apps = readJsonDB(APPS_DB);
    apps.push(application);
    writeJsonDB(APPS_DB, apps);

    res.status(201).json({ success: true, message: 'Application submitted' });
});

app.delete('/api/applications', (req, res) => {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ error: 'Student ID required' });

    let apps = readJsonDB(APPS_DB);
    const initialLength = apps.length;
    apps = apps.filter(a => a.studentId !== studentId);

    if (apps.length === initialLength) {
        return res.status(404).json({ error: 'Application not found' });
    }

    writeJsonDB(APPS_DB, apps);
    res.json({ success: true, message: 'Application withdrawn successfully' });
});

// 5. Assign Room
app.post('/api/admin/assign-room', (req, res) => {
    const { roomId, studentId } = req.body;

    // Update Rooms
    const rooms = readJsonDB(ROOMS_DB);
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    if (roomIndex === -1) return res.status(404).json({ error: 'Room not found' });

    const room = rooms[roomIndex];
    if (room.occupied >= room.capacity) return res.status(400).json({ error: 'Room is full' });

    room.occupied += 1;
    if (room.occupied >= room.capacity) room.status = 'Occupied';
    else room.status = 'Partially Occupied';

    writeJsonDB(ROOMS_DB, rooms);

    // Update Application if exists
    const apps = readJsonDB(APPS_DB);
    const appIndex = apps.findIndex(a => a.studentId === studentId);
    if (appIndex !== -1) {
        apps[appIndex].status = 'Allocated';
        apps[appIndex].allocatedRoomId = roomId; // IMPORTANT: Save the link!
        writeJsonDB(APPS_DB, apps);
    }

    // In a real app, update Users DB too (room_id: roomId)

    res.json({ success: true, message: 'Room assigned successfully', room });
});



// Remove Occupant
app.post('/api/admin/remove-occupant', (req, res) => {
    const { roomId, studentId } = req.body;

    const rooms = readJsonDB(ROOMS_DB);
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    if (roomIndex === -1) return res.status(404).json({ error: 'Room not found' });

    const room = rooms[roomIndex];
    if (room.occupied > 0) room.occupied -= 1;
    if (room.occupants) room.occupants = room.occupants.filter(o => o.id !== studentId);

    if (room.occupied === 0) room.status = 'Available';
    else if (room.occupied < room.capacity) room.status = 'Partially Occupied';

    writeJsonDB(ROOMS_DB, rooms);

    const apps = readJsonDB(APPS_DB);
    const appIndex = apps.findIndex(a => a.studentId === studentId);
    if (appIndex !== -1) {
        apps[appIndex].status = 'Pending';
        delete apps[appIndex].allocatedRoomId;
        writeJsonDB(APPS_DB, apps);
    }

    res.json({ success: true, message: 'Occupant removed successfully' });
});

// Update Room Status (Maintenance/Available)
app.post('/api/admin/update-room-status', (req, res) => {
    const { roomId, status } = req.body;

    const rooms = readJsonDB(ROOMS_DB);
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    if (roomIndex === -1) return res.status(404).json({ error: 'Room not found' });

    const room = rooms[roomIndex];

    // If setting to Available, check if actually occupied
    if (status === 'Available') {
        if (room.occupied >= room.capacity) room.status = 'Occupied';
        else if (room.occupied > 0) room.status = 'Partially Occupied';
        else room.status = 'Available';
    } else {
        room.status = status;
    }

    // Log maintenance request if status is 'Maintenance'
    if (status === 'Maintenance') {
        const maint = readJsonDB(DB_FILE);
        maint.push({
            id: "M-" + Math.floor(1000 + Math.random() * 9000),
            type: 'System Maintenance',
            location: room.number,
            description: 'Room marked for maintenance by admin',
            status: 'Pending',
            date: new Date().toLocaleDateString('en-IN'),
            timestamp: Date.now()
        });
        writeJsonDB(DB_FILE, maint);
    }

    writeJsonDB(ROOMS_DB, rooms);
    res.json({ success: true, message: `Room updated`, room });
});

// 6. Get Student Data (My Room)
app.get('/api/student/me', (req, res) => {
    const studentId = req.query.studentId;
    if (!studentId) return res.status(400).json({ error: 'Student ID required' });

    // Find the application (Source of Truth for Allocation for now)
    const apps = readJsonDB(APPS_DB);
    // Find any application for this student
    const myApp = apps.find(a => a.studentId === studentId);

    if (!myApp) {
        return res.json({ status: 'Not Allocated' });
    }

    if (myApp.status === 'Pending') {
        return res.json({ status: 'Pending', applicationDate: myApp.date });
    }

    if (myApp.status !== 'Allocated') {
        return res.json({ status: 'Not Allocated' });
    }

    const rooms = readJsonDB(ROOMS_DB);
    const room = rooms.find(r => r.id === myApp.allocatedRoomId);

    if (!room) {
        return res.json({ status: 'Not Allocated' });
    }

    // Find Roommates
    const roommates = apps
        .filter(a => a.allocatedRoomId === myApp.allocatedRoomId && a.studentId !== studentId && a.status === 'Allocated')
        .map(a => ({
            name: a.student,
            course: "B.Tech CSE",
            rollNumber: "U23AI" + a.studentId.slice(-3),
            contact: a.emergencyContactPhone || "N/A"
        }));

    const roomDetails = {
        roomNumber: room.number,
        roomType: room.type,
        building: room.block + " Block",
        floor: room.floor,
        facilities: ["Wi-Fi", "Cupboard", "Table", "Chair"],
        rentPerMonth: room.rent,
        allocationDate: myApp.date || "N/A",
        nextPaymentDue: "05-02-2026",
        roommates: roommates
    };

    res.json({
        status: 'Allocated',
        roomDetails
    });
});

// Bulk Reset (New Semester)
app.post('/api/admin/reset-semester', (req, res) => {
    // 1. Reset Rooms
    const rooms = readJsonDB(ROOMS_DB);
    rooms.forEach(room => {
        room.occupied = 0;
        room.occupants = [];
        room.status = 'Available';
    });
    writeJsonDB(ROOMS_DB, rooms);

    // 2. Reset Users
    const users = readJsonDB(USERS_DB);
    users.forEach(user => {
        if (user.role === 'student') {
            user.status = 'Not Allocated';
            user.roomDetails = null;
        }
    });
    writeJsonDB(USERS_DB, users);

    // 3. Archive Applications
    const apps = readJsonDB(APPS_DB);
    apps.forEach(app => {
        if (app.status !== 'Rejected') {
            app.status = 'Archived';
        }
    });
    writeJsonDB(APPS_DB, apps);

    res.json({ success: true, message: "Hostel reset successfully for new semester." });
});

// --- ANNOUNCEMENTS ---
const NOTES_DB = path.join(__dirname, 'announcements.json');

app.get('/api/announcements', (req, res) => {
    const notes = readJsonDB(NOTES_DB);
    res.json(notes.reverse().slice(0, 5));
});

app.post('/api/announcements', (req, res) => {
    const { title, message } = req.body;
    const notes = readJsonDB(NOTES_DB);
    const newNote = {
        id: Date.now(),
        title,
        message,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now()
    };
    notes.push(newNote);
    writeJsonDB(NOTES_DB, notes);
    res.json({ success: true, note: newNote });
});

app.delete('/api/announcements/:id', (req, res) => {
    const { id } = req.params;
    let notes = readJsonDB(NOTES_DB);
    notes = notes.filter(n => n.id != id);
    writeJsonDB(NOTES_DB, notes);
    res.json({ success: true });
});

// ========== GOOGLE OAUTH ROUTES ==========
// Initiate Google OAuth
app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth Callback
app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication
        res.redirect(`/?oauth=success&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    }
);

// Get current user (for checking auth status)
app.get('/api/auth/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ success: true, user: req.user });
    } else {
        res.status(401).json({ success: false, message: 'Not authenticated' });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Serve index.html for all other routes (React Router support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

