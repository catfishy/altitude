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
  const { user } = useCurrentUser();
  const { customer } = useCustomer();
  useEffect(() => {
    const customerName = customer?.name?.trim();
    if (customerName) {
      document.title = `${customerName} Virtual Tours`;
      return;
    }
    document.title = "Altitude";
  }, [customer?.name, user?.name]);

  // update the favicon to the customer's logo when available
  useEffect(() => {
    const logoUrl = customer?.logo_url;
    if (!logoUrl) return;

    // capture existing favicon hrefs so we can restore them
    const head = document.getElementsByTagName("head")[0];
    const iconSelectors = "link[rel~='icon'], link[rel='shortcut icon']";
    const existing = Array.from(head.querySelectorAll(iconSelectors)) as HTMLLinkElement[];
    const originalHrefs = existing.map((l) => l.getAttribute("href"));

    // set or create a favicon link
    if (existing.length > 0) {
      existing.forEach((link) => link.setAttribute("href", logoUrl));
    } else {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = logoUrl;
      head.appendChild(link);
    }

    return () => {
      // restore original hrefs
      const current = Array.from(head.querySelectorAll(iconSelectors)) as HTMLLinkElement[];
      if (originalHrefs.length > 0) {
        current.forEach((link, i) => {
          const orig = originalHrefs[i];
          if (orig) {
            link.setAttribute("href", orig);
          }
        });
      }
    };
  }, [customer?.logo_url]);
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <StyledEngineProvider injectFirst>
          <SnackbarProvider
            anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
          >
            {user && (
              <AltitudeToolbar />
            )}
            {children}
          </SnackbarProvider>
        </StyledEngineProvider>
      </body>
    </html>
  );
}
