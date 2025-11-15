"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CircularProgress,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Grid,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
// import OpenInFullIcon from "@mui/icons-material/OpenInFull";
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

  // detect small screens to show the dialog full-screen
  const theme = useTheme();
  const isSmallWidth = useMediaQuery(theme.breakpoints.down("sm"));
  // treat phones in landscape (short viewport height) as small screens too
  const isPhoneLandscape = useMediaQuery("(orientation: landscape) and (max-height: 600px)");
  const fullScreenDialog = isSmallWidth || isPhoneLandscape;

  if (loading) {
    return (
      <div className={styles.page} style={{ alignItems: "center", justifyContent: "center", minHeight: "100vh", display: "flex" }}>
        <main className={styles.main}>
          <CircularProgress />
        </main>
      </div>
    );
  }

  return (
    <>
      <Box className={styles.page}>
        <main className={styles.main}>
          <Grid container spacing={2} className={styles.customerContent}>
            <Grid size={{xs: 12}} textAlign="center">
              {customer.logo_url && (
                <div className={styles.customerLogo}>
                  <Image
                    src={customer.logo_url}
                    alt={customer.name ? `${customer.name} logo` : 'Customer logo'}
                    width={360}
                    height={240}
                    className={styles.customerLogoImage}
                    priority
                    unoptimized
                  />
                </div>
              )}
              <Typography variant="h4">{customer.name} Virtual Tours</Typography>
              <Typography variant="subtitle1" gutterBottom sx={{marginTop: 1}}>{customer.description}</Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            {tours.map((tour, index) => {
              const thumbnailUrl = thumbnailUrls.find(
                (thumbnail) => thumbnail.tour_id === tour.id
              )?.thumbnail_url;
              const cardKey = tour.id ?? `tour-${index}`;
              return (
                <Grid size={{xs: 12, sm: 6, md: 3 }} key={cardKey} display="flex" justifyContent="center">
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
      </Box>

      {selectedTour && selectedTour.embed_url && (
        <Dialog
          open={true}
          onClose={handleCloseModal}
          aria-labelledby="tour-preview-title"
          fullWidth
          fullScreen={fullScreenDialog}
          maxWidth={fullScreenDialog ? false : "lg"}
        >
          <DialogTitle id="tour-preview-title" sx={{ display: 'none' }}>
            {selectedTour.name ?? 'Tour preview'}
          </DialogTitle>
          <DialogContent className={styles.modalContent}>
            {fullScreenDialog && (
              <Box
                sx={{
                  position: "fixed",
                  top: "env(safe-area-inset-top, 12px)",
                  right: "calc(env(safe-area-inset-right, 12px))",
                  zIndex: 4000,
                  background: "transparent",
                  padding: "6px",
                }}
              >
                <IconButton
                  onClick={handleCloseModal}
                  aria-label="Close tour preview"
                  size="medium"
                  sx={{
                    backgroundColor: "rgba(0,0,0,0.65)",
                    color: "#fff",
                    borderRadius: "999px",
                    padding: "6px",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.24)",
                    backdropFilter: "blur(6px)",
                    transition: "background 0.12s ease, transform 0.12s ease",
                    '&:hover': {
                      backgroundColor: "rgba(0,0,0,0.78)",
                      transform: "translateY(-1px)",
                    },
                    '&:focus-visible': {
                      outline: "3px solid rgba(255,255,255,0.9)",
                      outlineOffset: "2px",
                    },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
            <Box className={styles.modalBody}>
              <iframe
                src={selectedTour.embed_url}
                title={selectedTour.name ?? "Tour preview"}
                className={styles.modalIframe}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
