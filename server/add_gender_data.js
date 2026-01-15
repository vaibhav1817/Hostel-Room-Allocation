
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, 'users.json');
const appsPath = path.join(__dirname, 'applications.json');

const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
const apps = JSON.parse(fs.readFileSync(appsPath, 'utf8'));

console.log('Updating student genders...');

const studentGenderMap = {};

// 1. Determine gender from Applications (Allocation or Preference)
apps.forEach(app => {
    let gender = 'Male'; // Default

    // Check allocation first
    if (app.allocatedRoomId) {
        const block = app.allocatedRoomId.split('-')[0];
        if (block === 'A' || block === 'B') gender = 'Female';
        else gender = 'Male';
    }
    // Check preference
    else if (app.preferredBlock) {
        if (app.preferredBlock === 'A' || app.preferredBlock === 'B') gender = 'Female';
        else gender = 'Male';
    }
    // Random fallback for pending with no clear preference (approx 40% female)
    else {
        gender = Math.random() < 0.4 ? 'Female' : 'Male';
    }

    app.gender = gender;
    studentGenderMap[app.studentId] = gender;
});

// 2. Update Users
let updatedUsers = 0;
users.forEach(user => {
    if (user.role === 'student') {
        // Use mapped gender or random if no app
        if (studentGenderMap[user.id]) {
            user.gender = studentGenderMap[user.id];
        } else {
            user.gender = Math.random() < 0.4 ? 'Female' : 'Male';
        }
        updatedUsers++;
    }
});

// 3. SPECIAL FIX: Vaibhav Girish Patil (allocated to E-120) should be Male
// Find Vaibhav
const vaibhavApp = apps.find(a => a.student && a.student.includes('Vaibhav'));
if (vaibhavApp) {
    vaibhavApp.gender = 'Male';
    studentGenderMap[vaibhavApp.studentId] = 'Male';
}
const vaibhavUser = users.find(u => u.name && u.name.includes('Vaibhav'));
if (vaibhavUser) {
    vaibhavUser.gender = 'Male';
}


fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
fs.writeFileSync(appsPath, JSON.stringify(apps, null, 2));

console.log(`Updated ${updatedUsers} users and ${apps.length} applications with gender.`);
