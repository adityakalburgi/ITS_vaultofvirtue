const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Firebase admin initialization
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };