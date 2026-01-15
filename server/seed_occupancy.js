
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, 'users.json');
const appsPath = path.join(__dirname, 'applications.json');
const roomsPath = path.join(__dirname, 'rooms.json');

// 1. Load Data
const rooms = JSON.parse(fs.readFileSync(roomsPath, 'utf8'));
let users = []; // Start fresh for generated users
let apps = [];  // Start fresh

// Keep admin and the main test student "Vaibhav" if needed, or just keep admin.
// Let's keep the existing users but filter out the generated ones from previous run if possible.
// Actually, safer to just keep hardcoded admin/student and rebuild the rest to avoid duplicates.
const existingUsers = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
const fixedUsers = existingUsers.filter(u => u.id.length < 10 || u.email.includes('vaibhav') || u.role === 'admin'); // Keep manual users
users = [...fixedUsers];

// 2. Reset Rooms
let totalCapacity = 0;
rooms.forEach(room => {
    room.occupied = 0;
    room.status = 'Available';
    room.occupants = []; // Clear occupant refs if we store them here (though we don't in JSON usually, but good to be safe if expanding)
    totalCapacity += room.capacity;
});

console.log(`Total Capacity: ${totalCapacity}`);

// 3. Calculate Targets
const TARGET_OCCUPANCY_PERCENT = 0.78;
const targetOccupiedCount = Math.floor(totalCapacity * TARGET_OCCUPANCY_PERCENT);
const pendingCount = 50; // Some pending apps for testing

console.log(`Target Occupied Beds: ${targetOccupiedCount}`);
console.log(`Target Pending Apps: ${pendingCount}`);

// 4. Generators
const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Neel', 'Siddharth', 'Shiv', 'Kabir', 'Ansh', 'Rudra', 'Rohan', 'Dhruv', 'Diya', 'Saanvi', 'Ananya', 'Aadhya', 'Pari', 'Myra', 'Ira', 'Riya', 'Aarohi', 'Anika', 'Meera', 'Sara', 'Aditi', 'Prisha', 'Kavya'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Malhotra', 'Bhatia', 'Mehta', 'Joshi', 'Nair', 'Patil', 'Reddy', 'Singh', 'Kapoor', 'Khan', 'Kumar', 'Das', 'Chopra', 'Desai', 'Rao', 'Yadav', 'Gowda'];
const branches = ['AI', 'CS', 'IS', 'CY', 'EC', 'ME'];
const years = ['23', '24', '25'];

function generateName() {
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function generateUSN(index) {
    const yy = years[Math.floor(Math.random() * years.length)];
    const xx = branches[Math.floor(Math.random() * branches.length)];
    // Use index to ensure some uniqueness or random
    const num = String(index % 999 + 1).padStart(3, '0');
    return `U${yy}E01${xx}${num}`;
}

// 5. Allocation Loop
let allocatedCount = 0;
let studentIndex = 1000;

// Helper to create student and app
function createStudent(status, assignedRoomId = null) {
    const name = generateName();
    const usn = generateUSN(studentIndex++);
    const email = `${usn.toLowerCase()}@example.com`;
    const id = String(Date.now() + studentIndex);

    // User
    users.push({
        id,
        name,
        email,
        password: 'password123',
        role: 'student',
        usn // Add USN to user record as well
    });

    // Application
    const app = {
        id: String(Date.now() + studentIndex + 5000),
        status: status,
        date: new Date().toLocaleDateString(),
        studentId: id,
        student: name,
        email,
        preferredBlock: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
        roomType: ['single', 'double', 'triple'][Math.floor(Math.random() * 3)],
        preferredFloor: String(Math.floor(Math.random() * 8) + 1),
        hasRoommatePreference: 'no',
        roommateUSN: '',
        agreeToTerms: true,
        ...(assignedRoomId ? { allocatedRoomId: assignedRoomId } : {})
    };
    apps.push(app);
    return app;
}

// Fill Rooms until Target Reached
// We iterate through rooms and fill them partially or fully to simulate realistic distribution
// But simple sequential filling is safer to ensure we hit the number exactly.

for (const room of rooms) {
    if (allocatedCount >= targetOccupiedCount) break;

    // Determine how many to put in this room
    // Try to fill it fully if possible, but leave some partially occupied for realism?
    // Let's just fill sequentially for now to guarantee the 78% logic.
    const space = room.capacity - room.occupied;
    const canFill = Math.min(space, targetOccupiedCount - allocatedCount);

    for (let k = 0; k < canFill; k++) {
        createStudent('Allocated', room.id);
        room.occupied++;
        allocatedCount++;
    }

    // Update Status
    if (room.occupied === room.capacity) room.status = 'Occupied';
    else if (room.occupied > 0) room.status = 'Partially Occupied';
    else room.status = 'Available';
}

// 6. Create Pending Students
for (let i = 0; i < pendingCount; i++) {
    createStudent('Pending');
}

// 7. Write Back
fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
fs.writeFileSync(appsPath, JSON.stringify(apps, null, 2));
fs.writeFileSync(roomsPath, JSON.stringify(rooms, null, 2));

console.log('-----------------------------------');
console.log(`Generation Complete.`);
console.log(`Allocated Students: ${allocatedCount}`);
console.log(`Pending Applications: ${pendingCount}`);
console.log(`Total Users: ${users.length}`);
console.log(`Room Occupancy set to ~${(allocatedCount / totalCapacity * 100).toFixed(1)}%`);
