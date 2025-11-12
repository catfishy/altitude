"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { getDownloadURL, ref } from "firebase/storage";

import styles from "styles/page.module.css";
import useCurrentUser from "hooks/useCurrentUser";
import useCustomerTours, { TourDocument } from "hooks/useCustomerTours";
import { storage } from "@/util/firebase";

type TourWithMetadata = TourDocument & {
  name?: string | null;
  thumbnail?: string | null;
};

export default function Home() {
  const { user, loading: userLoading } = useCurrentUser();
  const { tours, loading: toursLoading } = useCustomerTours(user?.customer_id || null);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});
  const [selectedTour, setSelectedTour] = useState<TourWithMetadata | null>(null);

  useEffect(() => {
    if (!tours || tours.length === 0) {
      setThumbnailUrls({});
      return;
    }

    let cancelled = false;
    const toursWithMetadata = tours as TourWithMetadata[];
    const thumbnailKeys = Array.from(
      new Set(
        toursWithMetadata
          .map((tour) => tour.thumbnail)
          .filter((key): key is string => Boolean(key))
      )
    );

    if (thumbnailKeys.length === 0) {
      setThumbnailUrls({});
      return;
    }

    const loadThumbnails = async () => {
      try {
        const entries = await Promise.all(
          thumbnailKeys.map(async (thumbnailName) => {
            try {
              console.log(`Fetching thumbnail: ${thumbnailName}`);
              const url = await getDownloadURL(ref(storage, `thumbnails/${thumbnailName}`));
              return [thumbnailName, url] as const;
            } catch (error) {
              console.error(`Failed to fetch thumbnail ${thumbnailName}:`, error);
              return null;
            }
          })
        );

        if (cancelled) {
          return;
        }

        const validEntries = entries.filter(
          (entry): entry is readonly [string, string] => entry !== null
        );

        const nextUrls: Record<string, string> = {};
        validEntries.forEach(([key, value]) => {
          nextUrls[key] = value;
        });

        setThumbnailUrls(nextUrls);
      } catch (error) {
        if (!cancelled) {
          console.error("Error loading thumbnails:", error);
        }
      }
    };

    loadThumbnails();

    return () => {
      cancelled = true;
    };
  }, [tours]);

  useEffect(() => {
    if (!selectedTour) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedTour(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTour]);

  const handleThumbnailClick = useCallback((tour: TourWithMetadata) => {
    if (!tour.embed_url) {
      return;
    }
    setSelectedTour(tour);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTour(null);
  }, []);

  const handleOpenFullPage = useCallback(() => {
    if (!selectedTour?.embed_url) {
      return;
    }
    window.open(selectedTour.embed_url, "_blank", "noopener,noreferrer");
  }, [selectedTour?.embed_url]);

  if (userLoading || toursLoading) {
    return null;
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  const toursWithMetadata = (tours as TourWithMetadata[]) ?? [];

  return (
    <>
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.tourGrid}>
            {toursWithMetadata.length === 0 ? (
              <p className={styles.emptyState}>No tours available yet.</p>
            ) : (
              toursWithMetadata.map((tour, index) => {
                const thumbnailKey = tour.thumbnail ?? "";
                const thumbnailUrl = thumbnailKey ? thumbnailUrls[thumbnailKey] : undefined;
                const cardKey = tour.id ?? `tour-${index}`;

                return (
                  <div className={styles.tourCard} key={cardKey}>
                    <button
                      type="button"
                      className={styles.thumbnailButton}
                      onClick={() => handleThumbnailClick(tour)}
                      disabled={!tour.embed_url}
                    >
                      {thumbnailUrl ? (
                        <Image
                          src={thumbnailUrl}
                          alt={tour.name ? `${tour.name} thumbnail` : "Tour thumbnail"}
                          width={400}
                          height={225}
                          className={styles.thumbnailImage}
                          loading={index === 0 ? "eager" : "lazy"}
                          sizes="(max-width: 768px) 100vw, 400px"
                          unoptimized
                        />
                      ) : (
                        <div className={styles.thumbnailPlaceholder}>
                          <span>Thumbnail unavailable</span>
                        </div>
                      )}
                    </button>
                    {tour.name && <span className={styles.tourName}>{tour.name}</span>}
                  </div>
                );
              })
            )}
          </div>
        </main>
        <footer className={styles.footer}>
          <a
            href="https://www.ahrpc.ca/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />
            Go home →
          </a>
        </footer>
      </div>

      {selectedTour && selectedTour.embed_url && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={selectedTour.name ?? "Tour preview"}
          onClick={handleCloseModal}
        >
          <div
            className={styles.modalContent}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalFullPageButton}
                onClick={handleOpenFullPage}
                aria-label="Open tour in full page"
              >
                Full page
              </button>
              <button
                type="button"
                aria-label="Close tour preview"
                className={styles.modalClose}
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <iframe
                src={selectedTour.embed_url}
                title={selectedTour.name ?? "Tour preview"}
                className={styles.modalIframe}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
