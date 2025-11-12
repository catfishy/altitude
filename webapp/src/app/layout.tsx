"use client";
import { Geist, Geist_Mono } from "next/font/google";
import { SnackbarProvider } from "notistack";
import { StyledEngineProvider } from "@mui/material/styles";
import { useEffect } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";
import useCustomer from "@/hooks/useCustomer";
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
  const customer = useCustomer();
  useEffect(() => {
    const customerName = customer.customer?.name?.trim();
    if (customerName) {
      document.title = customerName;
      return;
    }
    document.title = "Altitude";
  }, [customer.customer?.name, currentUser.user?.name]);
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <StyledEngineProvider injectFirst>
          <SnackbarProvider
            anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
          >
            {currentUser.user && (
              <AltitudeToolbar />
            )}
            {children}
          </SnackbarProvider>
        </StyledEngineProvider>
      </body>
    </html>
  );
}
