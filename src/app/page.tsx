"use client";

import Link from "next/link";
import { Button, Container, Typography, Box } from "@mui/material";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Container
      maxWidth="md"
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
          textAlign: "center",
          p: 4,
          borderRadius: 3,
          boxShadow: 3,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Library Management System
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          {isAuthenticated
            ? `You are logged in as ${user?.role.toLowerCase()}: ${user?.email}`
            : "Manage books, categories, and reservations with a modern library interface."}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          {!isAuthenticated && (
            <>
              <Button
                component={Link}
                href="/login"
                variant="contained"
                color="primary"
              >
                Login
              </Button>
              <Button
                component={Link}
                href="/signup"
                variant="outlined"
                color="primary"
              >
                Sign Up
              </Button>
            </>
          )}
          {isAuthenticated && user?.role === "LIBRARIAN" && (
            <Button
              component={Link}
              href="/admin"
              variant="contained"
              color="primary"
            >
              Go to Admin Dashboard
            </Button>
          )}
          {isAuthenticated && user?.role === "USER" && (
            <Button
              component={Link}
              href="/books"
              variant="contained"
              color="primary"
            >
              Browse Books
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
}
