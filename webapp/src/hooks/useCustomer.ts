import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore'; // replaced getDoc with onSnapshot
import { db, storage } from "@/util/firebase";
import useCurrentUser from './useCurrentUser';
import { getDownloadURL, ref as storageRef } from "firebase/storage";

export type AltitudeCustomer = {
  id: string;
  name: string;
  description: string;
  logo?: string;
  logo_url?: string;
  website?: string;
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
    const customerDocRef = doc(db, 'customers', customerId);
    const unsubscribe = onSnapshot(
      customerDocRef,
      (snap) => {
        if (cancelled) return;
        if (snap.exists()) {
          const docData = snap.data() as AltitudeCustomer;
          // set the base customer data immediately
          setCustomer(docData);

          // if there's a logo filename, load the download URL asynchronously
          if (docData.logo) {
            (async () => {
              try {
                const url = await getDownloadURL(
                  storageRef(storage, `customer_logos/${docData.logo}`)
                );
                if (cancelled) return;
                // merge the loaded logo_url into the current customer state
                setCustomer((prev) => {
                  // if prev exists and matches id, merge; otherwise use docData
                  if (prev && prev.id === docData.id) {
                    return { ...prev, logo_url: url } as AltitudeCustomer;
                  }
                  return { ...docData, logo_url: url } as AltitudeCustomer;
                });
                console.log('Preloaded customer logo URL:', url);
              } catch (error) {
                console.error('Failed to preload customer logo URL:', error);
              }
            })();
          }
        } else {
          setCustomer(null);
        }
        setLoading(false);
      },
      (error) => {
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

