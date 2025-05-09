import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const serviceAccount = require("../../../config.json");

const projectId = serviceAccount['fe']['projectId'] ?? serviceAccount['fe']['project_id'] ?? '';
const useEmulator = serviceAccount['localhost'] === true;

const firebaseConfig = {
    apiKey: serviceAccount['fe']['apiKey'] ?? '',
    authDomain: serviceAccount['fe']['authDomain'] ?? '',
    projectId,
    databaseURL: useEmulator
        ? `http://localhost:9000?ns=${projectId}`
        : serviceAccount['fe']['databaseURL'] || `https://${projectId}.firebaseio.com`,
    appId: serviceAccount['fe']['appId'] ?? '',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

if (useEmulator) {
    console.log("Using Firebase Emulators");
    connectAuthEmulator(auth, "http://localhost:9099");
    connectDatabaseEmulator(rtdb, "localhost", 9000);
}

export { auth, rtdb, db };
