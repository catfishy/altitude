"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SnackbarProvider } from 'notistack';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import DarkTheme from 'theme';
/* eslint-disable */
import { auth } from 'firebase'; // Initializes Firebase
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
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <StyledEngineProvider injectFirst>
            {/* <ThemeProvider theme={DarkTheme}> */}
              <SnackbarProvider anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}>
                {children}
              </SnackbarProvider>
            {/* </ThemeProvider> */}
          </StyledEngineProvider>
      </body>
    </html>
  );
}
