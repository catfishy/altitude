
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, FirestoreError } from 'firebase/firestore';
import { db } from '@/util/firebase';

export type TourDocument = {
  id: string;
  customer_id: string;
  embed_url: string;
  thumbnail: string;
};

const useCustomerTours = (customer_id: string | null) => {
  const [tours, setTours] = useState<TourDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!customer_id) {
      setTours([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'tours'), where('customer_id', '==', customer_id));
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const normalized = snapshot.docs.map(doc => {
          const data = doc.data() as TourDocument;
          return { ...data };
        });
        setTours(normalized);
        setLoading(false);
      },
      (error: FirestoreError) => {
        if (error.code === 'permission-denied') {
          setTours([]);
          console.warn('Firestore permission denied for task_categories:', error);
        } else {
          console.error('Firestore onSnapshot error for task_categories:', error);
        }
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [customer_id]);

  return { tours, loading };
};

export default useCustomerTours;