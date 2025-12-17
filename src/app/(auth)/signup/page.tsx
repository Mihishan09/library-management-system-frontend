"use client";

import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  Link as MuiLink,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type RoleOption = "LIBRARIAN" | "USER";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleOption>("USER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "LIBRARIAN") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    }
  }, [isAuthenticated, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(email, password, role);
      // redirect handled in useEffect
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to sign up. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          p: 4,
          borderRadius: 3,
          boxShadow: 3,
          bgcolor: "background.paper",
        }}
      >
        <Typography component="h1" variant="h5" fontWeight={600} gutterBottom>
          Create an account
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Sign up as a library user or librarian.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value as RoleOption)}
            >
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="LIBRARIAN">Librarian</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </Button>

          <Typography variant="body2" align="center">
            Already have an account?{" "}
            <MuiLink component={Link} href="/login" underline="hover">
              Log in
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}


