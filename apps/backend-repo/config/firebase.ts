const serviceAccount = require("../../../config.json");
if (serviceAccount['localhost'] === true) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
}

import admin from "firebase-admin";
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount['be']),
});

export default admin;
export const firestore = admin.firestore();
