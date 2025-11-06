"use client";
import { signOut } from "firebase/auth";
import { useCallback } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Toolbar,
  Box,
  AppBar,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import { auth } from "@/util/firebase";
import useCurrentUser from "hooks/useCurrentUser";

export default function AltitudeToolbar() {
  const currentUser = useCurrentUser();
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);
  return (
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
            CTFN Tours
        </Typography>

        <Button color="inherit" onClick={handleLogout}>
            Log Out
        </Button>
        </Toolbar>
    </AppBar>
    </Box>
  );
}
