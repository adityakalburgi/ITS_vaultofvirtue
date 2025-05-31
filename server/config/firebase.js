const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Firebase admin initialization
let serviceAccount;

// If using environment variables for credentials
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Or use a service account file
  serviceAccount = require('../config/serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };