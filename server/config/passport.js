const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '../users.json');

// Helper to read users
const readUsers = () => {
    try {
        return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    } catch (err) {
        return [];
    }
};

// Helper to save users
const saveUsers = (users) => {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const users = readUsers();
    const user = users.find(u => u.id === id);
    done(null, user);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'your-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5002/api/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const users = readUsers();

            // Check if user already exists
            let user = users.find(u => u.googleId === profile.id);

            if (user) {
                // User exists, return it
                return done(null, user);
            }

            // Create new user from Google profile
            const email = profile.emails[0].value;
            const name = profile.displayName;

            // Check if user with same email exists
            const existingUser = users.find(u => u.email === email);
            if (existingUser) {
                // Link Google account to existing user
                existingUser.googleId = profile.id;
                saveUsers(users);
                return done(null, existingUser);
            }

            // Create new user
            const newUser = {
                id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                googleId: profile.id,
                name: name,
                email: email,
                role: 'student', // Default role
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            saveUsers(users);

            return done(null, newUser);
        } catch (error) {
            return done(error, null);
        }
    }
));

module.exports = passport;
