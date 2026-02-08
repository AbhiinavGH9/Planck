const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

let db;

try {
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        console.log("🔥 Firebase Connected Successfully");
    } else {
        console.warn("⚠️  serviceAccountKey.json not found in backend root. Firebase features will fail.");
        console.warn("Please place your Firebase Admin SDK JSON file at backend/serviceAccountKey.json");
    }
} catch (error) {
    console.error("❌ Firebase Initialization Error:", error);
}

module.exports = { admin, db };
