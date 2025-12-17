"use client";

import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Link as MuiLink,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on role after login
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
      await login(email, password);
      // redirect handled in useEffect
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to login. Please try again.";
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
          Library Login
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Sign in to access your library dashboard.
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <Typography variant="body2" align="center">
            Don&apos;t have an account?{" "}
            <MuiLink component={Link} href="/signup" underline="hover">
              Sign up
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}


