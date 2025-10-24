"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Box, Button, TextField, CircularProgress, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase';
import styles from "../../styles/page.module.css";


const DEFAULT_FORM_STATE = {
  email: "",
  password: "",
  hasError: false,
  showPassword: false,
};

export default function Login() {
  const [formState, setFormState] = useState(DEFAULT_FORM_STATE);
  const [loading, setLoading] = useState(false);

  const changeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState({
        ...formState,
        [e.target.name]: e.target.value,
      });
    },
    [formState, setFormState]
  );

  const toggleShowPassword = useCallback(() => {
    setFormState({
      ...formState,
      showPassword: !formState.showPassword,
    });
  }, [formState, setFormState]);

  const login = useCallback(async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(
        auth,
        formState.email,
        formState.password
      );
      console.log("Login successful");
    } catch (e) {
      console.error("Login failed:", e);
      setFormState({ ...formState, hasError: true });
    } finally {
      // If auth state change causes redirect/unmount quickly this may be moot; safe to reset.
      setLoading(false);
    }
  }, [formState, setFormState]);

  const hasFormErrors = useCallback(() => {
    return formState.hasError;
  }, [formState]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        opacity: 1,
        position: "fixed",
        width: "100%",
        alignItems: "center",
      }}
    >
      <Image
        className={styles.logo}
        src="/altitude-logo.png"
        alt="Altitude Logo"
        width={300}
        height={280}
        priority
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) {
            login();
          }
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            mb: 2,
            mt: 2,
            width: "300px",
          }}
        >
          <TextField
            id="email"
            type="text"
            label="Email"
            name="email"
            value={formState.email}
            onChange={changeHandler}
            sx={{
              mt: "15px",
            }}
            variant="outlined"
            required={true}
          />

          <TextField
            id="password"
            type={formState.showPassword ? "text" : "password"}
            label="Password"
            name="password"
            value={formState.password}
            onChange={changeHandler}
            sx={{
              mt: "15px",
            }}
            variant="outlined"
            required={true}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleShowPassword} size="large">
                    {formState.showPassword ? (
                      <Visibility />
                    ) : (
                      <VisibilityOff />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Button
          sx={{
            backgroundColor: "#FCDD4F",
            color: "#13161A",
            fontWeight: 500,
            height: "55px",
            width: "300px",
          }}
          variant="contained"
          type="submit"
          name="submit"
          disabled={loading}
        >
          {loading ? <CircularProgress size={2} color="inherit" /> : "Login"}
        </Button>
      </form>

      {hasFormErrors() && (
        <Box
          sx={{
            marginTop: "20px",
          }}
        >
          <Box
            sx={{
              color: "rgb(252,221,79)",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            There was a login issue. Please try again or contact your Jia
            admin.
          </Box>
        </Box>
      )}
    </Box>
  );
}
