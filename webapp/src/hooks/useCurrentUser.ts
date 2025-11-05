import { useEffect, useState } from 'react';
import { auth } from '@/util/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { User } from 'firebase/auth';

const useCurrentUser = () => {
  const [user, setUser] = useState<User | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(true);
      setUser(undefined);
      // Clean up any previous doc listener
      if (!firebaseUser) {
        setLoading(false);
        return;
      }
      setUser(firebaseUser as User); // Temporary until we define a proper user type
      setLoading(false);
      }, (error) => {
        console.warn('Error subscribing to current user doc:', error);
        setLoading(false);
      });

    return () => {
      unsubscribeAuth();
    };
  }, []);
  return { user, loading };
};

export default useCurrentUser;
