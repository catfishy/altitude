"use client";
import { signOut } from "firebase/auth";
import { useCallback } from "react";
import {
  Toolbar,
  Box,
  AppBar,
  Button,
  Stack,
} from "@mui/material";
import { auth } from "@/util/firebase";

export default function AltitudeToolbar() {
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
        position="static"
        elevation={0}
        sx={{ backgroundColor: "#ffffff", color: "#000000" }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              component="a"
              href="https://www.ahrpc.ca/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "#000000", fontWeight: 600 }}
            >
              About AHRPC
            </Button>
            <Button
              color="inherit"
              onClick={handleLogout}
              sx={{ color: "#000000" }}
            >
              Log Out
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
