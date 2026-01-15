
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, 'users.json');
const appsPath = path.join(__dirname, 'applications.json');
const roomsPath = path.join(__dirname, 'rooms.json');

const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
const apps = JSON.parse(fs.readFileSync(appsPath, 'utf8'));
const rooms = JSON.parse(fs.readFileSync(roomsPath, 'utf8'));

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Neel', 'Siddharth', 'Shiv', 'Kabir', 'Ansh', 'Rudra', 'Rohan', 'Dhruv', 'Diya', 'Saanvi', 'Ananya', 'Aadhya', 'Pari', 'Myra', 'Ira', 'Riya', 'Aarohi', 'Anika', 'Meera', 'Sara', 'Aditi', 'Prisha', 'Kavya'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Malhotra', 'Bhatia', 'Mehta', 'Joshi', 'Nair', 'Patil', 'Reddy', 'Singh', 'Kapoor', 'Khan', 'Kumar', 'Das', 'Chopra', 'Desai', 'Rao', 'Yadav', 'Gowda'];

function generateName() {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${first} ${last}`;
}

function generateUSN(index) {
    // Generate USN like U23E01AI001
    const num = String(index).padStart(3, '0');
    return `U23E01AI${num}`;
}

console.log('Generating 1523 students...');

const TARGET_COUNT = 1523;

for (let i = 0; i < TARGET_COUNT; i++) {
    const studentName = generateName();
    const usn = generateUSN(i + 100); // Start from 100 to avoid conflicts
    const email = `${usn.toLowerCase()}@example.com`;
    const studentId = String(Date.now() + i);

    // 1. Create User
    const newUser = {
        id: studentId,
        name: studentName,
        email: email,
        password: 'password123',
        role: 'student',
        usn: usn
    };
    users.push(newUser);

    // 2. Find Room
    // Simple strategy: fill sequentially
    let assignedRoom = null;
    let room = rooms.find(r => r.occupied < r.capacity);

    // Randomize: 80% chance to be allocated if room exists
    const shouldAssign = Math.random() < 0.8;

    if (shouldAssign && room) {
        assignedRoom = room.id;
        room.occupied++;
        if (room.occupied >= room.capacity) {
            room.status = 'Occupied';
        } else {
            room.status = 'Partially Occupied';
        }
    }

    // 3. Create Application
    const newApp = {
        id: String(Date.now() + i + 5000),
        status: assignedRoom ? 'Allocated' : 'Pending',
        date: new Date().toLocaleDateString(),
        studentId: studentId,
        student: studentName,
        email: email,
        preferredBlock: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
        roomType: ['single', 'double', 'triple'][Math.floor(Math.random() * 3)],
        preferredFloor: String(Math.floor(Math.random() * 8) + 1),
        hasRoommatePreference: 'no',
        roommateUSN: usn, // Storing own USN here as per previous logic seen in app
        agreeToTerms: true,
        ...(assignedRoom ? { allocatedRoomId: assignedRoom } : {})
    };
    apps.push(newApp);
}

// Write back
fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
fs.writeFileSync(appsPath, JSON.stringify(apps, null, 2));
fs.writeFileSync(roomsPath, JSON.stringify(rooms, null, 2));

console.log('Successfully generated students and allocations!');
console.log('Total Users:', users.length);
console.log('Total Apps:', apps.length);
