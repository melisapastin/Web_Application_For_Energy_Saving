import { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, TextField, Button, Box, Snackbar, Alert, Typography,
  Card, CardContent, FormControl, IconButton, Menu, MenuItem
} from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';

const DeviceTable = () => {
  const [devices, setDevices] = useState([]);
  const [newDevice, setNewDevice] = useState({
    deviceName: '',
    group: '',
    powerOnTime: '',
    powerOffTime: '',
    count: 1,
    consumptionPerHour: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingDeviceId, setEditingDeviceId] = useState(null);

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchDevices();
  }, []);

  // Extract MongoDB ObjectId strings from backend response
  const extractId = (idObj) => {
    if (typeof idObj === 'string') return idObj;
    if (idObj && idObj.$oid) return idObj.$oid;
    return idObj;
  };

  const fetchDevices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/devices`);
      
      // Format devices with proper string IDs
      const formattedDevices = response.data.map(device => ({
        ...device,
        _id: extractId(device._id)
      }));
      
      setDevices(formattedDevices);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setError(`Fetch error: ${error.message}`);
    }
  };

  const handleMenuOpen = (event, device) => {
    setAnchorEl(event.currentTarget);
    setSelectedDevice(device);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Don't reset selectedDevice here
  };

  const handleMenuAction = (action) => {
    if (action === 'edit') {
      setEditMode(true);
      setEditingDeviceId(selectedDevice._id);
      setNewDevice({
        deviceName: selectedDevice.deviceName,
        group: selectedDevice.group,
        powerOnTime: selectedDevice.powerOnTime,
        powerOffTime: selectedDevice.powerOffTime,
        count: selectedDevice.count,
        consumptionPerHour: selectedDevice.consumptionPerHour
      });
    }
    else if (action === 'remove') {
      handleRemoveDevice(); // Directly call removal without confirmation
    }
    handleMenuClose();
  };

  // Handle device deletion
  const handleRemoveDevice = async () => {
    if (!selectedDevice) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/device/${selectedDevice._id}`);
      
      // Update UI by removing the deleted device
      setDevices(devices.filter(device => device._id !== selectedDevice._id));
      setSuccess('Device removed successfully!');
    } catch (error) {
      console.error('Error removing device:', error);
      setError(`Failed to remove device: ${error.message}`);
    } finally {
      setSelectedDevice(null); // Reset here after deletion
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDevice({
      ...newDevice,
      [name]: value
    });
  };

  const validateDevice = () => {
    if (!newDevice.deviceName || !newDevice.group || 
        !newDevice.powerOnTime || !newDevice.powerOffTime || 
        !newDevice.consumptionPerHour) {
      setError('All fields are required');
      return false;
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newDevice.powerOnTime) || !timeRegex.test(newDevice.powerOffTime)) {
      setError('Time must be in HH:MM format (e.g., 08:00)');
      return false;
    }

    const count = parseInt(newDevice.count);
    const consumption = parseFloat(newDevice.consumptionPerHour);
    
    if (isNaN(count) || count < 1) {
      setError('Count must be at least 1');
      return false;
    }
    
    if (isNaN(consumption) || consumption <= 0) {
      setError('Consumption must be a positive number');
      return false;
    }

    return true;
  };

  const handleAddDevice = async () => {
    setError(null);
    
    if (!validateDevice()) {
      return;
    }

    try {
      const payload = {
        ...newDevice,
        count: parseInt(newDevice.count),
        consumptionPerHour: parseFloat(newDevice.consumptionPerHour)
      };

      await axios.post(`${API_BASE_URL}/device`, payload);
      fetchDevices();
      setSuccess('Device added successfully!');
      resetForm();
      
    } catch (error) {
      console.error('Error adding device:', error);
      const errorMessage = error.response?.data?.error || error.message;
      
      if (errorMessage.includes('unique')) {
        setError('Device name must be unique');
      } else {
        setError(`Error: ${errorMessage}`);
      }
    }
  };

  const handleUpdateDevice = async () => {
    setError(null);
    
    if (!validateDevice()) {
      return;
    }

    if (!editingDeviceId) {
      setError('No device selected for editing');
      return;
    }

    try {
      const payload = {
        ...newDevice,
        count: parseInt(newDevice.count),
        consumptionPerHour: parseFloat(newDevice.consumptionPerHour)
      };

      await axios.put(`${API_BASE_URL}/device/${editingDeviceId}`, payload);
      fetchDevices();
      setSuccess('Device updated successfully!');
      cancelEdit();
      
    } catch (error) {
      console.error('Error updating device:', error);
      
      let errorMessage = 'Update failed';
      if (error.response) {
        if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'No response from server';
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditingDeviceId(null);
    resetForm();
  };

  const resetForm = () => {
    setNewDevice({
      deviceName: '',
      group: '',
      powerOnTime: '',
      powerOffTime: '',
      count: 1,
      consumptionPerHour: ''
    });
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Box sx={{ 
      width: '80vw', 
      margin: '30px auto 0',
      paddingBottom: '30px'
    }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        mb: 4,
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
        borderBottom: '2px solid #e0e0e0'
      }}>
        <DevicesIcon sx={{ 
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
          Device Management System
        </Typography>
      </Box>

      {/* Device Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          marginBottom: 4,
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.08)',
          borderRadius: '10px'
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Device Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Group</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Power On Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Power Off Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Count</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Consumption per Hour (kWh)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device, index) => (
              <TableRow 
                key={index}
                sx={{ 
                  '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                  '&:last-child td, &:last-child th': { border: 0 }
                }}
              >
                <TableCell>{device.deviceName}</TableCell>
                <TableCell>{device.group}</TableCell>
                <TableCell>{device.powerOnTime}</TableCell>
                <TableCell>{device.powerOffTime}</TableCell>
                <TableCell>{device.count}</TableCell>
                <TableCell>{device.consumptionPerHour}</TableCell>
                <TableCell>
                  <IconButton
                    aria-label="actions"
                    onClick={(e) => handleMenuOpen(e, device)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleMenuAction('edit')}>Edit</MenuItem>
        <MenuItem onClick={() => handleMenuAction('remove')}>Remove</MenuItem>
      </Menu>

      {/* Add/Edit Device Form in Card */}
      <Card 
        sx={{ 
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
          borderRadius: '10px'
        }}
      >
        <CardContent>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              color: 'black',
              mb: 3,
              paddingBottom: '10px',
              borderBottom: '1px solid #eee'
            }}
          >
            {editMode ? 'Edit Device' : 'Add New Device'}
          </Typography>
          
          <FormControl fullWidth sx={{ gap: 2.5 }}>
            <TextField
              fullWidth
              label="Device Name *"
              name="deviceName"
              value={newDevice.deviceName}
              onChange={handleInputChange}
              error={!!error && error.includes('unique')}
              size="small"
              variant="outlined"
              sx={{ backgroundColor: '#fff' }}
            />
            
            <TextField
              fullWidth
              label="Group *"
              name="group"
              value={newDevice.group}
              onChange={handleInputChange}
              size="small"
              variant="outlined"
              sx={{ backgroundColor: '#fff' }}
            />
            
            <TextField
              fullWidth
              label="Power On Time (HH:MM) *"
              name="powerOnTime"
              value={newDevice.powerOnTime}
              onChange={handleInputChange}
              placeholder="08:00"
              error={!!error && error.includes('Time')}
              size="small"
              variant="outlined"
              sx={{ backgroundColor: '#fff' }}
            />
            
            <TextField
              fullWidth
              label="Power Off Time (HH:MM) *"
              name="powerOffTime"
              value={newDevice.powerOffTime}
              onChange={handleInputChange}
              placeholder="18:00"
              error={!!error && error.includes('Time')}
              size="small"
              variant="outlined"
              sx={{ backgroundColor: '#fff' }}
            />
            
            <TextField
              fullWidth
              label="Count"
              name="count"
              type="number"
              value={newDevice.count}
              onChange={handleInputChange}
              inputProps={{ min: 1 }}
              error={!!error && error.includes('Count')}
              size="small"
              variant="outlined"
              sx={{ backgroundColor: '#fff' }}
            />
            
            <TextField
              fullWidth
              label="Consumption per Hour (kWh) *"
              name="consumptionPerHour"
              type="number"
              value={newDevice.consumptionPerHour}
              onChange={handleInputChange}
              inputProps={{ step: "0.01", min: "0.01" }}
              error={!!error && error.includes('Consumption')}
              size="small"
              variant="outlined"
              sx={{ backgroundColor: '#fff' }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={editMode ? handleUpdateDevice : handleAddDevice}
                sx={{ 
                  flex: 1,
                  py: 1.5,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  textTransform: 'none',
                  backgroundColor: '#235c23',
                  boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
                    backgroundColor: '#1a451a'
                  }
                }}
              >
                {editMode ? 'Update Device' : 'Add Device'}
              </Button>
              
              {editMode && (
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={cancelEdit}
                  sx={{ 
                    flex: 0.5,
                    py: 1.5,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    textTransform: 'none'
                  }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </FormControl>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="error" 
          sx={{ 
            width: '100%',
            boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ 
            width: '100%',
            boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DeviceTable;