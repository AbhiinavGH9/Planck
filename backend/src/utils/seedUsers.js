const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');

const users = [
    { username: 'shuklaji', email: 'shuklaji@point.app', password: 'tesla_was@great720', avatar: 'https://i.pravatar.cc/150?u=shuklaji' },
    { username: 'aditya', email: 'aditya@point.app', password: "expect_the_unexpected@369%27", avatar: 'https://i.pravatar.cc/150?u=aditya' },
    { username: 'samyak', email: 'samyak@point.app', password: "SMYK@TOPPINGwith%27", avatar: 'https://i.pravatar.cc/150?u=samyak' },
    { username: 'abhinavji', email: 'abhinavji@point.app', password: "abhinavji_369@i_don't%copy", avatar: 'https://i.pravatar.cc/150?u=abhinavji' },
    { username: 'showcase', email: 'showcase@point.app', password: "showcase@school%27", avatar: 'https://i.pravatar.cc/150?u=showcase' }
];

const seedUsers = async () => {
    if (!db) {
        console.log("⚠️  Skipping User Seeding: DB not connected.");
        return;
    }

    try {
        console.log("🌱 Seeding Users...");
        console.log("🌱 Seeding Users...");
        const usersRef = db.collection('users');

        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);

            // Check if user exists
            const userQuery = await usersRef.where('username', '==', user.username).limit(1).get();

            if (userQuery.empty) {
                // Create
                await usersRef.add({
                    username: user.username,
                    email: user.email,
                    password: hashedPassword,
                    avatar: user.avatar,
                    createdAt: new Date(),
                    isOnline: false,
                    lastSeen: new Date()
                });
                console.log(`✅ Created user: ${user.username}`);
            } else {
                // Update credentials
                const docId = userQuery.docs[0].id;
                await usersRef.doc(docId).update({
                    password: hashedPassword,
                    // Optional: update other fields if needed, but password is the critical one
                });
                console.log(`🔄 Updated credentials for: ${user.username}`);
            }
        }
    } catch (error) {
        console.error("❌ Seed Error:", error);
    }
};

module.exports = seedUsers;
