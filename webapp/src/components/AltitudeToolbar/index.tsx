"use client";
import { signOut } from "firebase/auth";
import { useCallback } from "react";
import { Toolbar, Box, AppBar, Button, Stack } from "@mui/material";
import { auth } from "@/util/firebase";
import useCustomer from "@/hooks/useCustomer";

export default function AltitudeToolbar() {
  const { customer } = useCustomer();
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: "#ffffff",
          color: "#000000",
          top: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              component="a"
              href="https://www.ahrpc.ca/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "#000000",
                fontWeight: 600,
                display: "flex",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              About AHRPC
            </Button>
            {customer?.website && (
              <Button
                href={customer.website}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: "#000000",
                  display: "flex",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                {customer.name} Homepage
              </Button>
            )}
            <Button
              onClick={handleLogout}
              sx={{
                color: "#000000",
                display: "flex",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              Log Out
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
