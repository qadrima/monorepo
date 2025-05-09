import admin, { firestore } from '../config/firebase';
import schedule from 'node-schedule';

export const initStatusListener = () => {
    const database = admin.database();
    const statusRef = database.ref('/status');

    statusRef.on('child_changed', async (snapshot) => {
        const uid = snapshot.key;
        const status = snapshot.val();

        if (uid && status) {
            try {
                if (status.state === 'online') {
                    await recalculateUserScore(uid);
                } else if (status.state === 'offline') {
                    // Update recentlyActive when user goes offline
                    console.log(`User ${uid} went offline, updating recentlyActive...`);
                    const userRef = firestore.collection('users').doc(uid);
                    await userRef.update({
                        recentlyActive: Date.now()
                    });
                }
            } catch (error) {
                console.error(`Error updating recentlyActive or compositeScore for user ${uid}:`, error);
            }
        }
    });

    console.log('Firebase status listener initialized');

    scheduleOfflineUsersRecalculation();
};

export const scheduleOfflineUsersRecalculation = () => {
    schedule.scheduleJob('0 1 * * *', () => {
        recalculateOfflineUsersScore();
    });

    console.log('Scheduled offline users recalculation at 1:00 AM daily');

    // Run immediately
    recalculateOfflineUsersScore();
};

export const recalculateOfflineUsersScore = async () => {
    const database = admin.database();
    const statusRef = database.ref('/status');

    try {
        const snapshot = await statusRef.orderByChild('state').equalTo('offline').once('value');
        const offlineUsers = snapshot.val();

        if (!offlineUsers) {
            console.log('No offline users found');
            return;
        }

        console.log(`Found ${Object.keys(offlineUsers).length} offline users, recalculating scores...`);

        const promises = Object.keys(offlineUsers).map(uid => {
            return recalculateUserScore(uid).catch(error => {
                console.error(`Error recalculating score for user ${uid}:`, error);
            });
        });

        await Promise.all(promises);
        console.log('Completed recalculation for all offline users');
    } catch (error) {
        console.error('Error fetching offline users:', error);
    }
};

export const recalculateUserScore = async (uid: string) => {
    const userRef = firestore.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
        console.warn(`User ${uid} does not exist in Firestore`);
        return;
    }

    const userData = userSnap.data();
    const avgRating = userData?.totalAverageWeightRatings ?? 0;
    const rents = userData?.numberOfRents ?? 0;
    const recentlyActive = Date.now();
    const compositeScore = formulaScore(avgRating, rents, recentlyActive);

    await userRef.update({
        recentlyActive,
        compositeScore
    });

    // console.log(`Updated recentlyActive and compositeScore for user: ${uid}`);
}

export const formulaScore = (avgRating: number, rents: number, recentlyActive: number) => {
    const now = Date.now();
    const daysSinceLastActive = Math.floor((now - recentlyActive) / (1000 * 60 * 60 * 24));

    let normalizedRecent = 0;

    if (daysSinceLastActive <= 1) {
        normalizedRecent = 100;
    } else if (daysSinceLastActive <= 3) {
        normalizedRecent = 70;
    } else if (daysSinceLastActive <= 7) {
        normalizedRecent = 50;
    } else if (daysSinceLastActive <= 14) {
        normalizedRecent = 30;
    } else if (daysSinceLastActive <= 30) {
        normalizedRecent = 10;
    }

    const compositeScore = (avgRating * 1000) + (rents * 10) + normalizedRecent;
    return compositeScore
}