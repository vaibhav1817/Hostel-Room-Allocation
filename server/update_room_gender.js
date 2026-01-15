
const fs = require('fs');
const path = require('path');

const roomsPath = path.join(__dirname, 'rooms.json');
const rooms = JSON.parse(fs.readFileSync(roomsPath, 'utf8'));

console.log('Updating room genders...');

// A and B -> Girls. C, D, E -> Boys.
let updatedCount = 0;
rooms.forEach(room => {
    // Check block
    if (room.block === 'Block A' || room.block === 'Block B' || room.id.startsWith('A-') || room.id.startsWith('B-')) {
        room.gender = 'Female';
        updatedCount++;
    } else {
        room.gender = 'Male';
        updatedCount++;
    }
});

fs.writeFileSync(roomsPath, JSON.stringify(rooms, null, 2));
console.log(`Updated ${updatedCount} rooms with gender restriction.`);
