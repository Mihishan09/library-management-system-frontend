"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";

type Category = {
  id: number;
  name: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8085";

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch {
        // ignore for now
      }
    };
    fetchCategories();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message =
          (data && (data as string)) || "Failed to create category";
        setError(message);
      } else {
        setCategories((prev) => [...prev, data as Category]);
        setName("");
        setSuccess("Category created successfully");
      }
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Manage Categories
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Add Category
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

        <Box component="form" onSubmit={handleCreate} sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !name.trim()}
          >
            {loading ? "Saving..." : "Add"}
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Existing Categories
        </Typography>
        <List dense>
          {categories.map((c) => (
            <ListItem key={c.id} divider>
              <ListItemText primary={c.name} />
            </ListItem>
          ))}
          {categories.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No categories yet.
            </Typography>
          )}
        </List>
      </Paper>
    </Container>
  );
}


