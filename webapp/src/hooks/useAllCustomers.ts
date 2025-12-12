import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
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

const useAllCustomers = () => {
  const { user } = useCurrentUser();
  const [loading, setLoading] = useState<boolean>(true);
  const [customerList, setCustomerList] = useState<AltitudeCustomer[]>([]);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      setLoading(false);
      setCustomerList([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const customersCollectionRef = collection(db, 'customers');
    const unsubscribe = onSnapshot(
      customersCollectionRef,
      async (snapshot) => {
        if (cancelled) return;

        const customers: AltitudeCustomer[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AltitudeCustomer[];

        // Load logo URLs for all customers that have a logo
        const customersWithLogos = await Promise.all(
          customers.map(async (customer) => {
            if (customer.logo) {
              try {
                const url = await getDownloadURL(
                  storageRef(storage, `customer_logos/${customer.logo}`)
                );
                return { ...customer, logo_url: url };
              } catch (error) {
                console.error(`Failed to load logo for customer ${customer.id}:`, error);
                return customer;
              }
            }
            return customer;
          })
        );

        if (cancelled) return;
        setCustomerList(customersWithLogos);
        setLoading(false);
      },
      (error) => {
        if (cancelled) return;
        console.error('Firestore onSnapshot error for customers:', error);
        setCustomerList([]);
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [user]);

  return { customerList, loading };
};

export default useAllCustomers;

