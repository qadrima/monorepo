import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const serviceAccount = require("../../../config.json");
const firebaseConfig = {
    apiKey: serviceAccount['fe']['apiKey'] ?? '',
    authDomain: serviceAccount['fe']['authDomain'] ?? '',
    projectId: serviceAccount['fe']['projectId'] ?? serviceAccount['fe']['project_id'] ?? '',
    databaseURL: serviceAccount['localhost']
        ? "http://localhost:9000"
        : serviceAccount['fe']['databaseURL'] || `https://${serviceAccount['fe']['projectId'] || serviceAccount['fe']['project_id']}.firebaseio.com`,
    appId: serviceAccount['fe']['appId'] ?? '',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

// Connect to emulators if in local development
if (serviceAccount['localhost'] === true) {
    console.log("Using Firebase Emulators");
    connectAuthEmulator(auth, "http://localhost:9099");
    connectDatabaseEmulator(rtdb, "localhost", 9000);
}

export { auth, rtdb, db };