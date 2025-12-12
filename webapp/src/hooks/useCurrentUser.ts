import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";

import { auth, db } from "@/util/firebase";

export type AltitudeUser = {
  id: string;
  name: string | null;
  customer_id: string | null;
  email: string;
  role: string | null;
};

// Default duration of 24 hours
const sessionDuration = 1000 * 60 * 60 * 24;

const useCurrentUser = () => {
  const [user, setUser] = useState<AltitudeUser | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;
    let sessionTimeout: NodeJS.Timeout | null = null;
    
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (firebaseUser: User | null) => {
        setLoading(true);
        setUser(undefined);

        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = undefined;
        }

        if (!firebaseUser) {
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
          setLoading(false);
          if (sessionTimeout) {
            clearTimeout(sessionTimeout);
          }
          sessionTimeout = null;
          return;
        }

        const loadedUser: AltitudeUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email ?? "",
          customer_id: null,
          name: null,
          role: null,
        };

        const ref = doc(db, "users", firebaseUser.uid);

        // listen to user doc
        unsubscribeDoc = onSnapshot(
          ref,
          (snap) => {
            if (snap.exists()) {
              const firestoreUserData = snap.data();
              loadedUser.customer_id = firestoreUserData.customer_id || null
              loadedUser.role = firestoreUserData.role || null;
              loadedUser.name =
                firestoreUserData.first_name && firestoreUserData.last_name
                  ? `${firestoreUserData.first_name} ${firestoreUserData.last_name}`
                  : firestoreUserData.first_name || firestoreUserData.last_name || null;
            } else {
              console.warn("User document does not exist for uid:", firebaseUser.uid);
            }
            setUser({ ...loadedUser });
            setLoading(false);
          },
          (error) => {
            console.error("Firestore onSnapshot error for users:", error);
            setUser(undefined);
            setLoading(false);
          }
        );

        // Fetch the decoded ID token and create a session timeout which signs the user out.
        firebaseUser.getIdTokenResult().then((idTokenResult) => {
          document.cookie = `token=${idTokenResult.token}; path=/`;
          const authTime = idTokenResult.claims.auth_time ? (Number(idTokenResult.claims.auth_time) * 1000) : Date.now();
          const millisecondsUntilExpiration = sessionDuration - (Date.now() - authTime);
          console.log("User auth time is", authTime, "and has ms until exp", millisecondsUntilExpiration)
          sessionTimeout = setTimeout(() => auth.signOut(), millisecondsUntilExpiration);
        });
      },
      (error) => {
        console.warn("Error subscribing to current user doc:", error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
    };
  }, []);
  return { user, loading };
};

export default useCurrentUser;
