const serviceAccount = require("../../../config.json");
const projectId = serviceAccount['be']['project_id'] ?? '';

if (serviceAccount['localhost'] === true) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
    process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
    process.env.FIREBASE_DATABASE_EMULATOR_HOST = "localhost:9000";
}

// Initialize Firebase Admin SDK
import admin from "firebase-admin";
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount['be']),
    databaseURL: serviceAccount['localhost'] === true
        ? `http://localhost:9000?ns=${projectId}`
        : `https://${projectId}.firebaseio.com`
});

export default admin;
export const firestore = admin.firestore();
export const account = serviceAccount