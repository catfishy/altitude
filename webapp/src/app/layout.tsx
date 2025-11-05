"use client";
import type { Metadata } from "next";
import { signOut } from "firebase/auth";
import { useCallback } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { SnackbarProvider } from "notistack";
import MenuIcon from "@mui/icons-material/Menu";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import DarkTheme from "theme";
import {
  Toolbar,
  Box,
  AppBar,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import useCurrentUser from "hooks/useCurrentUser";

/* eslint-disable */
import { auth } from "@/util/firebase"; // Initializes Firebase
/* eslint-enable */

import "styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = useCurrentUser();
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <StyledEngineProvider injectFirst>
          {/* <ThemeProvider theme={DarkTheme}> */}
          <SnackbarProvider
            anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
          >
            {currentUser.user && (
              <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                  <Toolbar>
                    <IconButton
                      size="large"
                      edge="start"
                      color="inherit"
                      aria-label="menu"
                      sx={{ mr: 2 }}
                    >
                      <MenuIcon />
                    </IconButton>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ flexGrow: 1 }}
                    >
                      Tours
                    </Typography>

                    <Button color="inherit" onClick={handleLogout}>
                      Log Out
                    </Button>
                  </Toolbar>
                </AppBar>
              </Box>
            )}
            {children}
          </SnackbarProvider>
          {/* </ThemeProvider> */}
        </StyledEngineProvider>
      </body>
    </html>
  );
}
