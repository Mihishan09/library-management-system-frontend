"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";

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
  category?: Category;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8085";

export default function AdminBooksPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [form, setForm] = useState({
    title: "",
    author: "",
    genre: "",
    language: "",
    isbn: "",
    imageUrl: "",
    categoryId: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        if (catRes.ok) {
          setCategories(await catRes.json());
        }
        if (booksRes.ok) {
          setBooks(await booksRes.json());
        }
      } catch {
        // ignore for now
      }
    };
    fetchInitial();
  }, [token]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (
    e: React.ChangeEvent<{ value: unknown }> | { target: { value: unknown } }
  ) => {
    setForm((prev) => ({ ...prev, categoryId: String(e.target.value) }));
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        author: form.author,
        genre: form.genre || undefined,
        language: form.language || undefined,
        isbn: form.isbn || undefined,
        imageUrl: form.imageUrl || undefined,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
      };

      const res = await fetch(`${API_BASE_URL}/api/admin/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const message =
          (data && (data as string)) || "Failed to create book. Check fields.";
        setError(message);
      } else {
        setBooks((prev) => [...prev, data as Book]);
        setForm({
          title: "",
          author: "",
          genre: "",
          language: "",
          isbn: "",
          imageUrl: "",
          categoryId: "",
        });
        setSuccess("Book added successfully");
      }
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (book: Book, nextStatus: Book["status"]) => {
    if (!token || book.status === nextStatus) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/books/${book.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      if (res.ok) {
        setBooks((prev) =>
          prev.map((b) =>
            b.id === book.id ? { ...b, status: nextStatus } : b
          )
        );
      }
    } catch {
      // ignore for now
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Manage Books
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Add Book
        </Typography>

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

        <Box
          component="form"
          onSubmit={handleCreateBook}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          <TextField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleInputChange}
            required
          />
          <TextField
            label="Author"
            name="author"
            value={form.author}
            onChange={handleInputChange}
            required
          />
          <TextField
            label="Genre"
            name="genre"
            value={form.genre}
            onChange={handleInputChange}
          />
          <TextField
            label="Language"
            name="language"
            value={form.language}
            onChange={handleInputChange}
          />
          <TextField
            label="ISBN"
            name="isbn"
            value={form.isbn}
            onChange={handleInputChange}
          />
          <TextField
            label="Image URL"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleInputChange}
          />
          <FormControl fullWidth>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={form.categoryId}
              label="Category"
              onChange={handleCategoryChange}
              required
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={
                loading ||
                !form.title.trim() ||
                !form.author.trim() ||
                !form.categoryId
              }
            >
              {loading ? "Saving..." : "Add Book"}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Existing Books
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.title}</TableCell>
                <TableCell>{b.author}</TableCell>
                <TableCell>{b.category?.name ?? "-"}</TableCell>
                <TableCell>{b.status}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    onClick={() => handleStatusChange(b, "AVAILABLE")}
                    disabled={b.status === "AVAILABLE"}
                  >
                    Mark Available
                  </Button>
                  <Button
                    size="small"
                    onClick={() => handleStatusChange(b, "RESERVED")}
                    disabled={b.status === "RESERVED"}
                  >
                    Mark Reserved
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {books.length === 0 && (
          <Typography variant="body2" color="text.secondary" mt={2}>
            No books found.
          </Typography>
        )}
      </Paper>
    </Container>
  );
}


