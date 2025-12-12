"use client";
import { useCallback } from "react";
import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import CloseIcon from "@mui/icons-material/Close";
import styles from "./TourDialog.module.css";
import { TourDocument } from "@/hooks/useCustomerTours";

interface TourDialogProps {
  tour: TourDocument | null;
  open: boolean;
  onClose: () => void;
}

export default function TourDialog({ tour, open, onClose }: TourDialogProps) {
  const theme = useTheme();
  const isSmallWidth = useMediaQuery(theme.breakpoints.down("sm"));
  const isPhoneLandscape = useMediaQuery(
    "(orientation: landscape) and (max-height: 600px)"
  );
  const fullScreenDialog = isSmallWidth || isPhoneLandscape;

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!tour) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="tour-preview-title"
      fullScreen={fullScreenDialog}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: fullScreenDialog ? "100%" : "80vw",
          height: fullScreenDialog ? "100%" : "80vh",
          maxWidth: "none",
          maxHeight: "none",
          margin: 0,
        },
      }}
    >
      <DialogTitle id="tour-preview-title" sx={{ display: "none" }}>
        {tour.name ?? "Tour preview"}
      </DialogTitle>
      <DialogContent className={styles.modalContent}>
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
            onClick={handleClose}
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
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.78)",
                transform: "translateY(-1px)",
              },
              "&:focus-visible": {
                outline: "3px solid rgba(255,255,255,0.9)",
                outlineOffset: "2px",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <iframe
          src={tour.embed_url}
          title={tour.name ?? "Tour preview"}
          className={styles.modalIframe}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </DialogContent>
    </Dialog>
  );
}
