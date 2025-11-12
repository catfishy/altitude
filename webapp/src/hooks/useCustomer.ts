import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore'; // replaced getDoc with onSnapshot
import { db } from "@/util/firebase";
import useCurrentUser from './useCurrentUser';

export type AltitudeCustomer = {
  id: string;
  name: string | null;
};

const useCustomer = () => {
  const { user } = useCurrentUser();
  const customerId = user?.customer_id ?? null;

  const [loading, setLoading] = useState<boolean>(true);
  const [customer, setCustomer] = useState<AltitudeCustomer | null>(null);

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      setCustomer(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const ref = doc(db, 'customers', customerId);
    const unsubscribe = onSnapshot(
      ref,
      snap => {
        if (cancelled) return;
        if (snap.exists()) {
          const docData = snap.data() as AltitudeCustomer;
            setCustomer(docData);
        } else {
          setCustomer(null);
        }
        setLoading(false);
      },
      error => {
        if (cancelled) return;
        console.error('Firestore onSnapshot error for customers:', error);
        setCustomer(null);
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [customerId]);

  return { customer, loading };
};

export default useCustomer;

