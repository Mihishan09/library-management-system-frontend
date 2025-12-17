"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

type Book = {
  id: number;
  title: string;
  author: string;
  genre?: string;
  language?: string;
  isbn?: string;
  status: "AVAILABLE" | "RESERVED";
  imageUrl?: string;
  category?: Category;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8085";

/**
 * Book detail page component.
 * Displays book information and allows authenticated users to reserve the book.
 * Supports reservation periods of 7, 14, or 21 days.
 */
export default function BookDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { token, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [days, setDays] = useState<number>(14);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const fetchBook = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/books/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          setBook(await res.json());
        } else {
          setError("Failed to load book details");
        }
      } catch {
        setError("Failed to load book details");
      }
    };
    fetchBook();
  }, [token, params.id]);

  const handleReserve = async () => {
    if (!token || !book) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId: book.id, days }),
      });
      let errorMessage = "Failed to reserve book. It may already be reserved.";
      if (!res.ok) {
        try {
          const data = await res.json();
          // Handle both string and object error responses
          if (typeof data === "string") {
            errorMessage = data;
          } else if (data && typeof data === "object") {
            errorMessage = (data as { message?: string }).message || errorMessage;
          }
        } catch {
          // If response is not JSON, try to get text
          try {
            const text = await res.text();
            if (text) errorMessage = text;
          } catch {
            // Use default error message
          }
        }
        setError(errorMessage);
      } else {
        setSuccess("Book reserved successfully");
        setBook((prev) =>
          prev ? { ...prev, status: "RESERVED" } : prev
        );
      }
    } catch {
      setError("Unexpected error while reserving book");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated && !loading) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {book && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {book.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {book.author}
          </Typography>

          {book.category && (
            <Typography variant="body2" color="text.secondary">
              Category: {book.category.name}
            </Typography>
          )}
          {book.genre && (
            <Typography variant="body2" color="text.secondary">
              Genre: {book.genre}
            </Typography>
          )}
          {book.language && (
            <Typography variant="body2" color="text.secondary">
              Language: {book.language}
            </Typography>
          )}
          {book.isbn && (
            <Typography variant="body2" color="text.secondary">
              ISBN: {book.isbn}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" mt={1}>
            Status: {book.status}
          </Typography>

          <Box sx={{ mt: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Reserve this book
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                alignItems: { sm: "center" },
              }}
            >
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel id="days-label">Days</InputLabel>
                <Select
                  labelId="days-label"
                  value={days}
                  label="Days"
                  onChange={(e) => setDays(Number(e.target.value))}
                >
                  <MenuItem value={7}>7 days</MenuItem>
                  <MenuItem value={14}>14 days</MenuItem>
                  <MenuItem value={21}>21 days</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleReserve}
                disabled={book.status === "RESERVED" || submitting}
              >
                {book.status === "RESERVED"
                  ? "Already Reserved"
                  : submitting
                  ? "Reserving..."
                  : "Reserve"}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
      {!book && !error && (
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      )}
      {error && !book && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}
    </Container>
  );
}


