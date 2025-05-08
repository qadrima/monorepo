import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { setUser, clearUser } from './reducers';
import { AppDispatch } from './store';
import { User as UserAuth } from "../../../packages/shared/user";

let lastUid: string | null = null;

export const listenToAuthChanges = () => (dispatch: AppDispatch) => {
    return onAuthStateChanged(auth, (user: User | null) => {
        if (user?.uid !== lastUid) {
            lastUid = user?.uid ?? null;
            if (user) {
                // console.log('[listenToAuthChanges] setUser', user);
                const userData: UserAuth = { id: user.uid, email: user.email ?? "", token: "", name: user.displayName ?? "" };
                dispatch(setUser(userData));
            } else {
                // console.log('[listenToAuthChanges] clearUser');
                dispatch(clearUser());
            }
        } else {
            // console.log('[listenToAuthChanges] no change');
        }
    });
};
