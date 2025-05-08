import { User } from "@/shared/user";
import { firestore } from "../config/firebase";

export const calculateCompositeScore = (
    totalAverageWeightRatings: number = 0,
    numberOfRents: number = 0,
    recentlyActive: number = 0
): number => {

    const ratings = totalAverageWeightRatings || 0;
    const rents = numberOfRents || 0;
    const lastActive = recentlyActive || Date.now();

    return (ratings * 1_000_000) + (rents * 1_000) + lastActive;
};

export const updateCompositeScore = async (userData: Partial<User>): Promise<Partial<User>> => {

    if (!userData.id) {
        console.error("User ID is missing");
        return userData;
    }

    // Create a new object to avoid reference issues
    let mergedData: Partial<User> = { ...userData };

    // Check if we need to fetch existing data
    const needsExistingData =
        userData.totalAverageWeightRatings === undefined ||
        userData.numberOfRents === undefined ||
        userData.recentlyActive === undefined;

    if (needsExistingData) {
        try {
            const userDoc = await firestore.collection("users").doc(userData.id).get();

            if (userDoc.exists) {
                const existingData = userDoc.data() as Partial<User>;
                // Merge data, prioritizing new values over existing ones
                mergedData = {
                    ...existingData,
                    ...userData
                };
            } else {
                mergedData.totalAverageWeightRatings = mergedData.totalAverageWeightRatings || 0;
                mergedData.numberOfRents = mergedData.numberOfRents || 0;
                mergedData.recentlyActive = mergedData.recentlyActive || Date.now();
            }
        } catch (error) {
            mergedData.totalAverageWeightRatings = mergedData.totalAverageWeightRatings || 0;
            mergedData.numberOfRents = mergedData.numberOfRents || 0;
            mergedData.recentlyActive = mergedData.recentlyActive || Date.now();
        }
    }

    // Calculate composite score
    const compositeScore = calculateCompositeScore(
        mergedData.totalAverageWeightRatings,
        mergedData.numberOfRents,
        mergedData.recentlyActive
    );

    // Create the final data object to return
    const result = {
        ...userData, // Only include fields from the original input
        compositeScore // Add the calculated composite score
    };

    console.log("Final result:", JSON.stringify(result, null, 2));
    return result;
}; 