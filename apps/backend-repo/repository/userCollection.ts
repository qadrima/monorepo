import { firestore } from "../config/firebase";
import { User } from "@/shared/user";

const userCollection = firestore.collection("users");

export interface GetUsersOptions {
    limit?: number;
    startAfter?: string;
    descending?: boolean;
}

export const getUsers = async (options: GetUsersOptions = {}): Promise<User[]> => {
    const {
        limit = 20,
        startAfter,
        descending = true
    } = options;

    let query = userCollection
        .orderBy("compositeScore", descending ? "desc" : "asc")
        .limit(limit);

    if (startAfter) {
        const startDoc = await userCollection.doc(startAfter).get();
        if (startDoc.exists) {
            query = query.startAfter(startDoc);
        }
    }

    const snapshot = await query.get();
    const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    // console.log("results", results);
    return results;
};

export const setUserData = async (data: Partial<User>): Promise<void> => {
    if (!data.id) throw new Error("User ID is required");

    try {
        const docRef = userCollection.doc(data.id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            const newUserData = {
                id: data.id,
                email: data.email || "",
                name: data.name || "",
                totalAverageWeightRatings: data.totalAverageWeightRatings || 0,
                numberOfRents: data.numberOfRents || 0,
                recentlyActive: data.recentlyActive || Date.now(),
                compositeScore: data.compositeScore || 0
            };
            await docRef.set(newUserData);
            // console.log("New user data set:", newUserData);
        }
        else {
            await docRef.set(data, { merge: true });
            // console.log("User data updated:", data);
        }

    } catch (error) {
        console.error("Error in setUserData:", error);
        throw error;
    }
};
