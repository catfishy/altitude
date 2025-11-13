
import { useEffect, useState } from 'react';
import { storage } from '@/util/firebase';
import { getDownloadURL, ref } from "firebase/storage";
import useCustomerTours, { TourDocument } from './useCustomerTours';

export type ThumbnailDocument = {
  tour_id: string;
  thumbnail_url: string;
};

const useTourThumbnails = (customer_id: string | null) => {
  const { tours } = useCustomerTours(customer_id);
  const [thumbnailUrls, setThumbnailUrls] = useState<ThumbnailDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!customer_id) {
      setThumbnailUrls([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;

    const loadThumbnails = async () => {
      try {
        const entries = await Promise.all(
          tours.map(async (tour: TourDocument) => {
            try {
              if (!tour.thumbnail) {
                return null;
              }
              console.log(`Fetching thumbnail: ${tour.thumbnail}`);
              const url = await getDownloadURL(ref(storage, `thumbnails/${tour.thumbnail}`));
              return { tour_id: tour.id, thumbnail_url: url } as ThumbnailDocument;
            } catch (error) {
              console.error(`Failed to fetch thumbnail ${tour.thumbnail}:`, error);
              return null;
            }
          })
        );

        if (cancelled) {
          setThumbnailUrls([]);
          setLoading(false);          
          return;
        }

        const validEntries = entries.filter(
          (entry) => entry !== null
        ) as ThumbnailDocument[];
        setThumbnailUrls(validEntries);
        setLoading(false);
      } catch (error) {
        if (!cancelled) {
          console.error("Error loading thumbnails:", error);
        }
        setThumbnailUrls([]);
        setLoading(false);
      }
    };
    loadThumbnails();

    return () => {
      cancelled = true;
    };
  }, [customer_id, tours]);

  return { thumbnailUrls, loading };
};

export default useTourThumbnails;