"use client";
import type { Metadata } from "next";
import { signOut } from "firebase/auth";
import { useCallback } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { SnackbarProvider } from "notistack";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import DarkTheme from "theme";
import useCurrentUser from "hooks/useCurrentUser";
import AltitudeToolbar from "components/AltitudeToolbar";

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
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <StyledEngineProvider injectFirst>
          {/* <ThemeProvider theme={DarkTheme}> */}
          <SnackbarProvider
            anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
          >
            {currentUser.user && (
              <AltitudeToolbar />
            )}
            {children}
          </SnackbarProvider>
          {/* </ThemeProvider> */}
        </StyledEngineProvider>
      </body>
    </html>
  );
}
