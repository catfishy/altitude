"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemText,
} from "@mui/material";
import Image from "next/image";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, firebaseConfig } from "@/util/firebase";
import { useSnackbar } from "notistack";
import useCurrentUser from "hooks/useCurrentUser";
import useAllCustomers from "@/hooks/useAllCustomers";


const DEFAULT_FORM_STATE = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  customerId: "",
  hasError: false,
  showPassword: false,
};

const DEFAULT_VALIDATION_STATE = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  customerId: "",
};

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function CreateUser() {
  const [formState, setFormState] = useState(DEFAULT_FORM_STATE);
  const [validationErrors, setValidationErrors] = useState(DEFAULT_VALIDATION_STATE);
  const [loading, setLoading] = useState(false);
  const { user, loading: userLoading } = useCurrentUser();
  const { customerList, loading: customerListLoading } = useAllCustomers();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  // redirect to if user is not an admin or user not logged in
  useEffect(() => {
    console.log("here")
    if (!userLoading && !user) {
      console.log('redirecting to login from create-user')
      router.replace("/login");
    }
    if (user && user.role !== 'admin') {
      console.log('redirecting to home from create-user')
      console.log(user)
      router.replace("/");
    }
  }, [router, user, userLoading]);

  const changeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormState({
        ...formState,
        [e.target.name]: e.target.value,
      });
    },
    [formState, setFormState]
  );

  const selectChangeHandler = useCallback(
    (e: { target: { value: string } }) => {
      setFormState({
        ...formState,
        customerId: e.target.value,
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

  const validateForm = useCallback(() => {
    const errors = { ...DEFAULT_VALIDATION_STATE };
    let isValid = true;

    if (!formState.firstName.trim()) {
      errors.firstName = "First name is required";
      isValid = false;
    }

    if (!formState.lastName.trim()) {
      errors.lastName = "Last name is required";
      isValid = false;
    }

    if (!formState.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(formState.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formState.password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (formState.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!formState.customerId) {
      errors.customerId = "Please select a customer";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  }, [formState]);

  const createUser = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Create a secondary Firebase app to create the user without signing out the admin
      const secondaryApp = initializeApp(firebaseConfig, "secondaryApp");
      const secondaryAuth = getAuth(secondaryApp);

      // Create user in Firebase Auth using secondary app
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        formState.email,
        formState.password
      );
      const newUser = userCredential.user;

      // Sign out from secondary app (cleanup)
      await secondaryAuth.signOut();

      // Create user document in Firestore
      await setDoc(doc(db, "users", newUser.uid), {
        first_name: formState.firstName,
        last_name: formState.lastName,
        email: formState.email,
        customer_id: formState.customerId,
        role: "user",
        id: newUser.uid,
        created_at: serverTimestamp(),
      });

      console.log("User created successfully:", newUser.uid);
      // Reset form on success
      setFormState(DEFAULT_FORM_STATE);
      setValidationErrors(DEFAULT_VALIDATION_STATE);
      enqueueSnackbar("User created successfully!", { variant: "success" });
    } catch (e) {
      console.error("User creation failed:", e);
      setFormState({ ...formState, hasError: true });
      enqueueSnackbar(
        e instanceof Error ? e.message : "Failed to create user. Please try again.",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  }, [formState, setFormState, validateForm, enqueueSnackbar]);

  const hasFormErrors = useCallback(() => {
    return formState.hasError;
  }, [formState]);

  if (userLoading || customerListLoading) {
    return null;
  }
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) {
            createUser();
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
          <FormControl
            sx={{
              mt: "15px",
            }}
            variant="outlined"
            required={true}
            error={!!validationErrors.customerId}
          >
            <InputLabel id="customer-select-label">Customer</InputLabel>
            <Select
              labelId="customer-select-label"
              id="customer-select"
              value={formState.customerId}
              label="Customer"
              onChange={selectChangeHandler}
              error={!!validationErrors.customerId}
              renderValue={(selected) => {
                const customer = customerList.find((c) => c.id === selected);
                return customer?.name || "";
              }}
            >
              {customerList.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {customer.logo_url ? (
                      <Image
                        src={customer.logo_url}
                        alt={`${customer.name} logo`}
                        width={32}
                        height={32}
                        style={{ objectFit: "contain", borderRadius: 4 }}
                        unoptimized
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: "#e0e0e0",
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          color: "#666",
                        }}
                      >
                        {customer.name?.charAt(0) || "?"}
                      </Box>
                    )}
                    <ListItemText primary={customer.name} />
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {validationErrors.customerId && (
              <Box sx={{ color: "#d32f2f", fontSize: 12, mt: 0.5, ml: 1.75 }}>
                {validationErrors.customerId}
              </Box>
            )}
          </FormControl>

          <TextField
            id="firstName"
            type="text"
            label="First Name"
            name="firstName"
            value={formState.firstName}
            onChange={changeHandler}
            sx={{
              mt: "15px",
            }}
            variant="outlined"
            required={true}
            error={!!validationErrors.firstName}
            helperText={validationErrors.firstName}
          />

          <TextField
            id="lastName"
            type="text"
            label="Last Name"
            name="lastName"
            value={formState.lastName}
            onChange={changeHandler}
            sx={{
              mt: "15px",
            }}
            variant="outlined"
            required={true}
            error={!!validationErrors.lastName}
            helperText={validationErrors.lastName}
          />
          
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
            error={!!validationErrors.email}
            helperText={validationErrors.email}
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
            error={!!validationErrors.password}
            helperText={validationErrors.password}
            slotProps={{
              input: {
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
              },
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mt: 2,
          }}
        >
          <Button
            sx={{
              backgroundColor: "#FCDD4F",
              color: "#13161A",
              fontWeight: 500,
              height: "55px",
              flex: 1,
            }}
            variant="contained"
            type="submit"
            name="submit"
            disabled={loading}
          >
            {loading ? <CircularProgress size={2} color="inherit" /> : "Create User"}
          </Button>

          <Button
            sx={{
              height: "55px",
              flex: 1,
            }}
            variant="outlined"
            type="button"
            onClick={() => {
              setFormState(DEFAULT_FORM_STATE);
              setValidationErrors(DEFAULT_VALIDATION_STATE);
            }}
            disabled={loading}
          >
            Clear Form
          </Button>
        </Box>
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
            There was a issue. Please try again or contact your Altitude admin.
          </Box>
        </Box>
      )}
    </Box>
  );
}
