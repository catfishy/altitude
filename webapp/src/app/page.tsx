"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CircularProgress,
  IconButton,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Grid,
} from "@mui/material";
// import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseIcon from "@mui/icons-material/Close";
import styles from "styles/page.module.css";
import useCurrentUser from "hooks/useCurrentUser";
import useCustomerTours, { TourDocument } from "hooks/useCustomerTours";
import useTourThumbnails from "@/hooks/useTourThumbnails";
import useCustomer from "@/hooks/useCustomer";

export default function Home() {
  const router = useRouter();
  const { customer, loading: customerLoading } = useCustomer();
  const { user, loading: userLoading } = useCurrentUser();
  const { tours, loading: toursLoading } = useCustomerTours(
    user?.customer_id || null
  );
  const { thumbnailUrls, loading: thumbnailsLoading } = useTourThumbnails(
    user?.customer_id || null
  );
  const [selectedTour, setSelectedTour] = useState<TourDocument | null>(null);
  const loading =
    userLoading ||
    toursLoading ||
    thumbnailsLoading ||
    customerLoading ||
    !user ||
    !customer ||
    tours.length === 0;

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

  const handleThumbnailClick = useCallback((tour: TourDocument) => {
    if (!tour.embed_url) {
      return;
    }
    setSelectedTour(tour);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTour(null);
  }, []);

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/login");
    }
  }, [router, user, userLoading]);

  if (loading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <CircularProgress />
        </main>
      </div>
    );
  }

  return (
    <>
      <div className={styles.page}>
        <main className={styles.main}>
          <Grid container spacing={2}>
            <Grid size={{xs: 12}} textAlign="center">
              <Typography variant="h4" gutterBottom>{customer.name} Virtual Tours</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            {tours.map((tour, index) => {
              const thumbnailUrl = thumbnailUrls.find(
                (thumbnail) => thumbnail.tour_id === tour.id
              )?.thumbnail_url;
              const cardKey = tour.id ?? `tour-${index}`;
              return (
                <Grid size={{xs: 12, sm: 4, md: 3 }} key={cardKey}>
                  <Card className={styles.tourCard}>
                    <CardActionArea onClick={() => handleThumbnailClick(tour)}>
                      {thumbnailUrl ? (
                        <div className={styles.thumbnailWrapper}>
                          <Image
                            src={thumbnailUrl}
                            alt={
                              tour.name
                                ? `${tour.name} thumbnail`
                                : "Tour thumbnail"
                            }
                            width={400}
                            height={225}
                            className={styles.thumbnailImage}
                            loading={index === 0 ? "eager" : "lazy"}
                            sizes="(max-width: 768px) 100vw, 400px"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className={styles.thumbnailPlaceholder}>
                          <span>Thumbnail unavailable</span>
                        </div>
                      )}
                      {tour.name && (
                        <CardContent>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            className={styles.tourName}
                          >
                            {tour.name}
                          </Typography>
                        </CardContent>
                      )}
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </main>
        <footer className={styles.footer}></footer>
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
            <Box className={styles.modalActions} sx={{ mr: 1 }}>
              {/* <IconButton
                onClick={handleOpenFullPage}
                aria-label="Open tour in full page"
                color="inherit"
                size="small"
              >
                <OpenInFullIcon fontSize="small" />
              </IconButton> */}
              <IconButton
                onClick={handleCloseModal}
                aria-label="Close tour preview"
                color="inherit"
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box className={styles.modalBody}>
              <iframe
                src={selectedTour.embed_url}
                title={selectedTour.name ?? "Tour preview"}
                className={styles.modalIframe}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Box>
          </div>
        </div>
      )}
    </>
  );
}
