"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import Link from "next/link";
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
  status: "AVAILABLE" | "RESERVED";
  category?: Category;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8085";

/**
 * Books browsing page component.
 * Displays a list of books with filtering capabilities by category, author, genre, and language.
 * Requires authentication (USER or LIBRARIAN role).
 */
export default function BooksPage() {
  const { token, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [filters, setFilters] = useState({
    category: "",
    author: "",
    genre: "",
    language: "",
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const fetchInitial = async () => {
      if (!token) return;
      try {
        const [catRes, booksRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/books`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (catRes.ok) setCategories(await catRes.json());
        if (booksRes.ok) setBooks(await booksRes.json());
      } catch {
        // ignore
      }
    };
    fetchInitial();
  }, [token]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (
    e: React.ChangeEvent<{ value: unknown }> | { target: { value: unknown } }
  ) => {
    setFilters((prev) => ({ ...prev, category: String(e.target.value) }));
  };

  const applyFilters = async () => {
    if (!token) return;
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.author) params.append("author", filters.author);
    if (filters.genre) params.append("genre", filters.genre);
    if (filters.language) params.append("language", filters.language);

    const qs = params.toString();
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/books${qs ? `?${qs}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        setBooks(await res.json());
      }
    } catch {
      // ignore
    }
  };

  if (!isAuthenticated && !loading) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Browse Books
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Filters
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
            gap: 2,
            mb: 2,
          }}
        >
          <FormControl fullWidth>
            <InputLabel id="category-filter-label">Category</InputLabel>
            <Select
              labelId="category-filter-label"
              value={filters.category}
              label="Category"
              onChange={handleCategoryChange}
            >
              <MenuItem value="">All</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.name}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            name="author"
            label="Author"
            value={filters.author}
            onChange={handleFilterChange}
          />
          <TextField
            name="genre"
            label="Genre"
            value={filters.genre}
            onChange={handleFilterChange}
          />
          <TextField
            name="language"
            label="Language"
            value={filters.language}
            onChange={handleFilterChange}
          />
        </Box>
        <Button variant="contained" onClick={applyFilters}>
          Apply Filters
        </Button>
      </Paper>

      <Grid container spacing={3}>
        {books.map((book) => (
          <Grid item xs={12} sm={6} md={4} key={book.id}>
            <Paper sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" fontWeight={600}>
                {book.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {book.author}
              </Typography>
              {book.category && (
                <Typography variant="body2" color="text.secondary">
                  Category: {book.category.name}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Status: {book.status}
              </Typography>
              <Box sx={{ mt: "auto", pt: 2 }}>
                <Button
                  component={Link}
                  href={`/books/${book.id}`}
                  variant="outlined"
                  fullWidth
                >
                  View Details
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
        {books.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No books found.
          </Typography>
        )}
      </Grid>
    </Container>
  );
}


