import { useEffect } from 'react';
import { ref, onValue, onDisconnect, set } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { rtdb, auth } from "@/config/firebase";
import { setTempUid } from '@/store/reducers';

export function usePresence() {

  const dispatch = useDispatch<AppDispatch>();
  const thisAuth = useSelector((state: RootState) => state.auth);
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  useEffect(() => {
    // console.log("thisAuth value:", thisAuth.user);
    // console.log("tempUid value:", thisAuth.tempUid);

    if (!thisAuth.user && thisAuth.tempUid) {
      const thisTempUid = thisAuth.tempUid;
      dispatch(setTempUid(null));
      set(ref(rtdb, `/status/${thisTempUid}`), {
        state: "offline",
        forceLogout: true
      });
    }
    else if (thisAuth.user && thisAuth.tempUid) {
      set(ref(rtdb, `/status/${thisAuth.tempUid}`), {
        state: "online"
      });
    }
  }, [thisAuth.user]);

  onAuthStateChanged(auth, (user) => {
    if (!user) return;
    const uid = user.uid;
    const userStatusRef = ref(rtdb, `/status/${uid}`);
    const connectedRef = ref(rtdb, ".info/connected");
    let isForfeLogout = false;

    onValue(ref(rtdb, `/status/${uid}`), (snapshot) => {
      const thisState = snapshot.val();
      isForfeLogout = thisState.forceLogout;

      if (thisState.state === "offline" && thisAuth.user && !isForfeLogout) {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
          // console.log("still online", thisAuth.user);
          set(userStatusRef, {
            state: "online"
          });
          timeoutId = null;
        }, 2000);
      }

    });

    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === false) {
        return;
      }

      onDisconnect(userStatusRef).set({
        state: "offline"
      }).then(() => {
        if (!isForfeLogout) {
          set(userStatusRef, {
            state: "online"
          });
        }
      });
    });


  });
}
