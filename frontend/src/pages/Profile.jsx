import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Toolbar,
  IconButton
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

function Profile() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'user'
  });
  const [formErrors, setFormErrors] = useState({
    username: false,
    password: false
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid token format');
        }
        
        const payloadBase64 = parts[1]
          .replace(/-/g, '+')
          .replace(/_/g, '/');
        
        const paddedBase64 = payloadBase64.padEnd(
          payloadBase64.length + (4 - payloadBase64.length % 4) % 4, 
          '='
        );
        
        const payloadJson = atob(paddedBase64);
        const payload = JSON.parse(payloadJson);
        
        let extractedUsername = '';
        let isAdmin = false;

        if (typeof payload.sub === 'string') {
          extractedUsername = payload.sub;
        } else if (typeof payload.sub === 'object' && payload.sub !== null) {
          extractedUsername = payload.sub.username || '';
          isAdmin = payload.sub.isAdmin || false;
        }

        if (payload.isAdmin !== undefined) {
          isAdmin = payload.isAdmin;
        }

        setUsername(extractedUsername);
        setRole(isAdmin ? 'admin' : 'user');
        
        if (isAdmin) {
          fetchUsers();
        }
        
      } catch (error) {
        console.error('Failed to decode token:', error);
        setUsername('');
        setRole('');
      }
    } else {
      console.warn('No access_token found in localStorage');
      setUsername('');
      setRole('');
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        console.error('No access token available');
        return;
      }
      
      const response = await axios.get('/users', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 5000
      });

      const usersWithRole = response.data.map(user => ({
        ...user,
        role: user.isAdmin ? 'admin' : 'user'
      }));
      
      setUsers(usersWithRole);
    } catch (error) {
      console.error('User fetch error:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        headers: error.config?.headers
      });
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewUser({ username: '', password: '', role: 'user' });
    setFormErrors({ username: false, password: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'username' || name === 'password') {
      setFormErrors(prev => ({
        ...prev,
        [name]: value.trim() === ''
      }));
    }
  };

  const handleAddUser = async () => {
    const errors = {
      username: newUser.username.trim() === '',
      password: newUser.password.trim() === ''
    };
    
    setFormErrors(errors);
    
    if (errors.username || errors.password) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      await axios.post('/users', {
        username: newUser.username,
        password: newUser.password,
        isAdmin: newUser.role === 'admin'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchUsers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleDeleteUser = async (usernameToDelete) => {
    if (!usernameToDelete || usernameToDelete === username) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const encodedUsername = encodeURIComponent(usernameToDelete);
      
      await axios.delete(`/users/${encodedUsername}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <Box sx={{ 
      width: '80vw', 
      margin: '30px auto 0',
      paddingBottom: '30px',
    }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        mb: 2,
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
        borderBottom: '2px solid #e0e0e0'
      }}>
        <AccountCircleIcon sx={{ 
          fontSize: '2.5rem', 
          color: '#235c23',
          mr: 2 
        }} />
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontWeight: 'bold',
            color: 'black',
            letterSpacing: '0.5px',
            textAlign: 'center'
          }}
        >
          User Profile
        </Typography>
      </Box>

      {/* Centered White Square */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px',
        padding: '20px'
      }}>
        <Box sx={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0px 6px 25px rgba(0, 0, 0, 0.2)',
          width: 350,
          height: 350,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'scale(1.04)',
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.25)'
          }
        }}>
          <AccountCircleIcon sx={{ 
            fontSize: '10rem', 
            color: '#235c23',
            mb: 2
          }} />
          
          {username ? (
            <>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#333', 
                  fontWeight: '500',
                  textTransform: 'capitalize',
                  maxWidth: '90%',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                  mb: 1
                }}
              >
                {username}
              </Typography>
              
              <Typography 
                variant="h6"
                sx={{ 
                  color: role === 'admin' ? '#d32f2f' : '#1976d2',
                  fontWeight: '600',
                  fontSize: '1.2rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                {role || 'user'}
              </Typography>
            </>
          ) : (
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#333', 
                fontWeight: '500',
                fontStyle: 'italic'
              }}
            >
              User not found
            </Typography>
          )}
        </Box>
      </Box>

      {/* Admin User Table */}
      {role === 'admin' && (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '40px',
          padding: '0 20px'
        }}>
          <TableContainer 
            component={Paper} 
            sx={{
              borderRadius: '12px',
              boxShadow: '0px 6px 25px rgba(0, 0, 0, 0.2)',
              width: '100%',
              maxWidth: 800,
            }}
          >
            {/* Table Header with Title and Add Button */}
            <Toolbar sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              backgroundColor: '#f8f9fa',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              borderBottom: '1px solid #e0e0e0',
              padding: '8px 16px'
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                }}
              >
                User Management
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleOpenDialog}
                sx={{
                  backgroundColor: '#235c23',
                  '&:hover': {
                    backgroundColor: '#1a471a'
                  }
                }}
              >
                Add User
              </Button>
            </Toolbar>
            
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.username}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <Typography 
                          sx={{ 
                            color: user.role === 'admin' ? '#d32f2f' : '#1976d2',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}
                        >
                          {user.role}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {user.username !== username && (
                          <IconButton 
                            onClick={() => handleDeleteUser(user.username)}
                            aria-label="delete"
                            sx={{ color: '#d32f2f' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ fontStyle: 'italic' }}>
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Add User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
          Add New User
        </DialogTitle>
        <DialogContent sx={{ padding: '20px' }}>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              name="username"
              value={newUser.username}
              onChange={handleInputChange}
              error={formErrors.username}
              helperText={formErrors.username && "Username is required"}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={newUser.password}
              onChange={handleInputChange}
              error={formErrors.password}
              helperText={formErrors.password && "Password is required"}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={newUser.role}
                label="Role"
                onChange={handleInputChange}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddUser}
            sx={{ backgroundColor: '#235c23', '&:hover': { backgroundColor: '#1a471a' } }}
          >
            Add User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Profile;