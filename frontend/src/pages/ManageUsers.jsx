import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Box,
  Grid,
} from '@mui/material';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [site, setSite] = useState('');
  const [group, setGroup] = useState('');
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role, site, group }),
      });

      const data = await response.json();
      setMessage(data.message);
      setUsername('');
      setPassword('');
      setRole('user');
      setSite('');
      setGroup('');
      fetchData(); // Refresh user data after registration
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>

      <form onSubmit={handleRegister}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Site</InputLabel>
              <Select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                required
              >
                <MenuItem value="Romania">Romania</MenuItem>
                <MenuItem value="India">India</MenuItem>
                <MenuItem value="Poland">Poland</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Group</InputLabel>
              <Select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                required
              >
                <MenuItem value="group1">Group 1</MenuItem>
                <MenuItem value="group2">Group 2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Register
            </Button>
          </Grid>
        </Grid>
      </form>
      <br />

      {message && (
        <Typography variant="body1" gutterBottom>
          {message}
        </Typography>
      )}

      <Divider />

      <Box marginTop={4}>
        <Typography variant="h5" gutterBottom>
          User List
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Site</TableCell>
                <TableCell>Group</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.site}</TableCell>
                  <TableCell>{user.group}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  );
};

export default ManageUsers;
