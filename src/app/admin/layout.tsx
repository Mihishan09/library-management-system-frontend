"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Books", href: "/admin/books" },
  { label: "Users", href: "/admin/users" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || user?.role !== "LIBRARIAN") {
        router.replace("/login");
      }
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || !isAuthenticated || user?.role !== "LIBRARIAN") {
    return null;
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="nav"
        sx={{
          width: 240,
          bgcolor: "grey.100",
          borderRight: 1,
          borderColor: "divider",
          p: 2,
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={2}>
          Librarian
        </Typography>
        <List component="nav">
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={pathname === item.href}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="static"
          color="transparent"
          elevation={0}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography variant="h6" component="div">
              Library Admin Dashboard
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              <Button
                color="inherit"
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, bgcolor: "background.default" }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}


