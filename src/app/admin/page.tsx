import { Box, Typography, Paper } from "@mui/material";
import Link from "next/link";

export default function AdminHomePage() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Welcome, Librarian
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Manage categories, books, and users from this dashboard.
      </Typography>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        <Paper
          component={Link}
          href="/admin/categories"
          sx={{
            p: 2.5,
            minWidth: 220,
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add and manage book categories.
          </Typography>
        </Paper>

        <Paper
          component={Link}
          href="/admin/books"
          sx={{
            p: 2.5,
            minWidth: 220,
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Books
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add new books and update their status.
          </Typography>
        </Paper>

        <Paper
          component={Link}
          href="/admin/users"
          sx={{
            p: 2.5,
            minWidth: 220,
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View users and manage blacklist status.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}


