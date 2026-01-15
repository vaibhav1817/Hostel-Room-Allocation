
const fs = require('fs');
const path = require('path');

const appsPath = path.join(__dirname, 'applications.json');
const roomsPath = path.join(__dirname, 'rooms.json');
const usersPath = path.join(__dirname, 'users.json');

const apps = JSON.parse(fs.readFileSync(appsPath, 'utf8'));
const rooms = JSON.parse(fs.readFileSync(roomsPath, 'utf8'));
const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

console.log('Re-allocating rooms based on Gender...');

// 1. Separate Allocated Students by Gender
const males = [];
const females = [];

// Helper to get gender
const getGender = (app) => {
    // Check app gender first
    if (app.gender) return app.gender;
    // Check user gender
    const user = users.find(u => u.id === app.studentId);
    if (user && user.gender) return user.gender;
    // Fallback
    return Math.random() < 0.4 ? 'Female' : 'Male';
};

// 2. Clear Room Allocations
rooms.forEach(room => {
    room.occupied = 0;
    room.occupants = [];
    room.status = 'Available';
});

// 3. Collect allocated students
// We filter for "Allocated" status
const allocatedApps = apps.filter(a => a.status === 'Allocated');

console.log(`Found ${allocatedApps.length} allocated students.`);

allocatedApps.forEach(app => {
    const gender = getGender(app);
    app.gender = gender; // Ensure app has gender
    if (gender === 'Female') females.push(app);
    else males.push(app);
});

// Preserve Vaibhav's assignment if possible (E-120)
// Remove Vaibhav from males list and handle him manually first?
// Actually E-120 is a Male room, so normal allocation will likely overwrite it unless we reserve it.
// Let's explicitly handle Vaibhav.
const vaibhavIndex = males.findIndex(m => m.email === 'vvaibhavgp@gmail.com');
let vaibhav = null;
if (vaibhavIndex !== -1) {
    vaibhav = males.splice(vaibhavIndex, 1)[0];
}

console.log(`Females: ${females.length}, Males: ${males.length + (vaibhav ? 1 : 0)}`);

// 4. Helper to find room
const assignToRoom = (app, roomList) => {
    // Find a room with space
    const room = roomList.find(r => r.occupied < r.capacity);
    if (!room) {
        console.warn(`No room found for ${app.student} (${app.gender})`);
        return;
    }

    // Update Room
    room.occupied++;
    if (room.occupied >= room.capacity) room.status = 'Occupied';
    else room.status = 'Partially Occupied';

    // Add occupant
    room.occupants.push({
        id: app.studentId,
        name: app.student,
        rollNumber: (app.usn || app.email.split('@')[0]).toUpperCase(),
        course: "B.Tech",
        year: "Unknown", // Simplified for script
        contact: app.email
    });

    // Update App
    app.allocatedRoomId = room.id;
};

// 5. Categorize Rooms
const femaleRooms = rooms.filter(r => r.block === 'Block A' || r.block === 'Block B' || r.id.startsWith('A-') || r.id.startsWith('B-'));
const maleRooms = rooms.filter(r => !(r.block === 'Block A' || r.block === 'Block B' || r.id.startsWith('A-') || r.id.startsWith('B-')));

console.log(`Female Rooms: ${femaleRooms.length}, Male Rooms: ${maleRooms.length}`);

// 6. Assign Vaibhav First (E-120)
if (vaibhav) {
    const specificRoom = maleRooms.find(r => r.id === 'E-120');
    if (specificRoom) {
        assignToRoom(vaibhav, [specificRoom]);
    } else {
        assignToRoom(vaibhav, maleRooms);
    }
}

// 7. Assign Everyone Else
females.forEach(f => assignToRoom(f, femaleRooms));
males.forEach(m => assignToRoom(m, maleRooms));

// 8. Save
fs.writeFileSync(appsPath, JSON.stringify(apps, null, 2));
fs.writeFileSync(roomsPath, JSON.stringify(rooms, null, 2));

console.log('Re-allocation complete.');
