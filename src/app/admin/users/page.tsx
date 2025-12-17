"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";

type AdminUser = {
  id: number;
  email: string;
  role: "LIBRARIAN" | "USER";
  isBlacklisted: boolean;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8085";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch {
        // ignore for now
      }
    };
    fetchUsers();
  }, [token]);

  const updateBlacklist = async (user: AdminUser, isBlacklisted: boolean) => {
    if (!token) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/users/${user.id}/blacklist`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isBlacklisted }),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        setError(text || "Failed to update blacklist status");
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, isBlacklisted } : u
          )
        );
        setSuccess("User blacklist status updated");
      }
    } catch {
      setError("Unexpected error updating user");
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Manage Users
      </Typography>

      <Paper sx={{ p: 3 }}>
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

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Blacklisted</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.isBlacklisted ? "Yes" : "No"}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    color={u.isBlacklisted ? "success" : "warning"}
                    onClick={() => updateBlacklist(u, !u.isBlacklisted)}
                  >
                    {u.isBlacklisted ? "Unblacklist" : "Blacklist"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users.length === 0 && (
          <Typography variant="body2" color="text.secondary" mt={2}>
            No users found.
          </Typography>
        )}
      </Paper>
    </Container>
  );
}


