import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  FormControlLabel,
  Switch,
  Grid,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  TablePagination,
} from "@mui/material";
import {
  SupervisorAccount,
  Add,
  Edit,
  Delete,
  MoreVert,
  PersonAdd,
  AccountCircle,
  Email,
  AdminPanelSettings,
  Person,
  Save,
  Cancel,
  Search,
  FilterList,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../types";

interface CreateUserForm {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
  is_active: boolean;
}

interface EditUserForm {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
  is_active: boolean;
}

const UserAdministration: React.FC = () => {
  const { user: currentUser, isAdmin, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<User | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showAdminsOnly, setShowAdminsOnly] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    email: "",
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    is_superuser: false,
    is_active: true,
  });

  const [editForm, setEditForm] = useState<EditUserForm>({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    is_superuser: false,
    is_active: true,
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      setError("Access denied. Admin privileges required.");
      return;
    }
    fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/v1/users/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8000/api/v1/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(createForm),
        }
      );

      if (response.ok) {
        setSuccess("User created successfully");
        setCreateDialogOpen(false);
        setCreateForm({
          email: "",
          username: "",
          password: "",
          first_name: "",
          last_name: "",
          is_superuser: false,
          is_active: true,
        });
        fetchUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to create user");
      }
    } catch (err) {
      setError("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/v1/users/${selectedUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      if (response.ok) {
        setSuccess("User updated successfully");
        setEditDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to update user");
      }
    } catch (err) {
      setError("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/v1/users/${selectedUser.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setSuccess("User deleted successfully");
        setDeleteDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to delete user");
      }
    } catch (err) {
      setError("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuUser(user);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuUser(null);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email,
      username: user.username,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      is_superuser: user.is_superuser,
      is_active: user.is_active,
    });
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.first_name &&
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.last_name &&
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesActiveFilter = !showActiveOnly || user.is_active;
    const matchesAdminFilter = !showAdminsOnly || user.is_superuser;

    return matchesSearch && matchesActiveFilter && matchesAdminFilter;
  });

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. Admin privileges required to view this page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            <SupervisorAccount sx={{ mr: 2, fontSize: "inherit" }} />
            User Administration
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage all users in the system
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<PersonAdd />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          {/* Search and Filters */}
          <Box mb={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Search sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" gap={2} alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showActiveOnly}
                        onChange={(e) => setShowActiveOnly(e.target.checked)}
                      />
                    }
                    label="Active Only"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showAdminsOnly}
                        onChange={(e) => setShowAdminsOnly(e.target.checked)}
                      />
                    }
                    label="Admins Only"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Users Table */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              sx={{
                                bgcolor: user.is_superuser
                                  ? "error.main"
                                  : "primary.main",
                              }}
                            >
                              {user.is_superuser ? (
                                <AdminPanelSettings />
                              ) : (
                                <Person />
                              )}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                fontWeight="medium"
                              >
                                {user.first_name && user.last_name
                                  ? `${user.first_name} ${user.last_name}`
                                  : user.username}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                @{user.username}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{user.email}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.is_superuser ? "Admin" : "User"}
                            color={user.is_superuser ? "error" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.is_active ? "Active" : "Inactive"}
                            color={user.is_active ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(user.created_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Actions">
                            <IconButton
                              onClick={(e) => handleMenuOpen(e, user)}
                              disabled={user.id === currentUser?.id}
                            >
                              <MoreVert />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEditClick(menuUser!)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(menuUser!)}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create User Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={createForm.first_name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, first_name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={createForm.last_name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, last_name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                required
                value={createForm.username}
                onChange={(e) =>
                  setCreateForm({ ...createForm, username: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                required
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={createForm.is_superuser}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        is_superuser: e.target.checked,
                      })
                    }
                  />
                }
                label="Admin User"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={createForm.is_active}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        is_active: e.target.checked,
                      })
                    }
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCreateDialogOpen(false)}
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateUser}
            disabled={
              loading ||
              !createForm.email ||
              !createForm.username ||
              !createForm.password
            }
            startIcon={<Save />}
          >
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={editForm.first_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, first_name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={editForm.last_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, last_name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                required
                value={editForm.username}
                onChange={(e) =>
                  setEditForm({ ...editForm, username: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.is_superuser}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        is_superuser: e.target.checked,
                      })
                    }
                    disabled={selectedUser?.id === currentUser?.id} // Can't change own admin status
                  />
                }
                label="Admin User"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.is_active}
                    onChange={(e) =>
                      setEditForm({ ...editForm, is_active: e.target.checked })
                    }
                    disabled={selectedUser?.id === currentUser?.id} // Can't deactivate own account
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditDialogOpen(false)}
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditUser}
            disabled={loading || !editForm.email || !editForm.username}
            startIcon={<Save />}
          >
            Update User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user "{selectedUser?.username}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserAdministration;
