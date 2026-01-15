
const fs = require('fs');
const path = require('path');

const roomsPath = path.join(__dirname, 'rooms.json');
const rooms = JSON.parse(fs.readFileSync(roomsPath, 'utf8'));

const counts = {
    Single: 0,
    Double: 0,
    Triple: 0,
    Other: 0
};

rooms.forEach(room => {
    // Normalize type check
    const type = room.type ? room.type.toLowerCase() : 'unknown';
    if (type.includes('single')) counts.Single++;
    else if (type.includes('double')) counts.Double++;
    else if (type.includes('triple')) counts.Triple++;
    else counts.Other++;
});

console.log('Room Type Counts:');
console.log(`Single Sharing: ${counts.Single}`);
console.log(`Double Sharing: ${counts.Double}`);
console.log(`Triple Sharing: ${counts.Triple}`);
if (counts.Other > 0) console.log(`Other: ${counts.Other}`);
console.log(`Total Rooms: ${rooms.length}`);
