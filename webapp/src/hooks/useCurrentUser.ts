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


const useCurrentUser = () => {
  const [user, setUser] = useState<AltitudeUser | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;

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
          setLoading(false);
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
