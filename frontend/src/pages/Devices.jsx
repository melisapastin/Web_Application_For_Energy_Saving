import { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, TextField, Button, Box, Snackbar, Alert, Typography,
  Card, CardContent, FormControl, IconButton, Menu, MenuItem,
  InputAdornment, Select, InputLabel, Chip, Grid
} from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import axios from 'axios';

const DeviceTable = () => {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filter states
  const [filters, setFilters] = useState({
    deviceName: '',
    group: '',
    powerOnTime: '',
    powerOffTime: '',
    count: '',
    consumptionPerHour: ''
  });

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchDevices();
  }, []);

  // Extract unique values for filter dropdowns
  const getUniqueValues = (key) => {
    const uniqueValues = [...new Set(devices.map(device => device[key]))];
    return uniqueValues.sort();
  };

  // Update filtered devices when devices, search term, or filters change
  useEffect(() => {
    let filtered = devices;

    // Apply search term filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(device =>
        device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.powerOnTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.powerOffTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.count.toString().includes(searchTerm) ||
        device.consumptionPerHour.toString().includes(searchTerm)
      );
    }

    // Apply column filters
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        if (key === 'count' || key === 'consumptionPerHour') {
          // For numeric fields, compare as numbers
          filtered = filtered.filter(device => 
            device[key].toString() === filters[key]
          );
        } else {
          // For string fields, compare as strings
          filtered = filtered.filter(device => 
            device[key].toString().toLowerCase() === filters[key].toLowerCase()
          );
        }
      }
    });

    setFilteredDevices(filtered);
  }, [devices, searchTerm, filters]);

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
      setFilteredDevices(formattedDevices);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setError(`Fetch error: ${error.message}`);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleFilterChange = (column, value) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      deviceName: '',
      group: '',
      powerOnTime: '',
      powerOffTime: '',
      count: '',
      consumptionPerHour: ''
    });
  };

  const handleMenuOpen = (event, device) => {
    setAnchorEl(event.currentTarget);
    setSelectedDevice(device);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
      handleRemoveDevice();
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
      setSelectedDevice(null);
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

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

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

      {/* Search Section */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search devices by name, group, time, count, or consumption..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={clearSearch}
                  edge="end"
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: '#fff',
              boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
            }
          }}
        />
      </Box>

      {/* Filters Section */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1, color: '#235c23' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Filters
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip 
              label={`${activeFiltersCount} active`} 
              size="small" 
              sx={{ ml: 2, color: '#235c23'}}
            />
          )}
          <Button 
            size="small" 
            onClick={clearAllFilters}
            sx={{ ml: 'auto', color: '#235c23' }}
            disabled={activeFiltersCount === 0}
          >
            Clear All
          </Button>
        </Box>

        <Grid container spacing={2}>
          {/* Device Name Filter */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Device Name</InputLabel>
              <Select
                value={filters.deviceName}
                label="Device Name"
                onChange={(e) => handleFilterChange('deviceName', e.target.value)}
              >
                <MenuItem value="">
                  <em>All Devices</em>
                </MenuItem>
                {getUniqueValues('deviceName').map(name => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Group Filter */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Group</InputLabel>
              <Select
                value={filters.group}
                label="Group"
                onChange={(e) => handleFilterChange('group', e.target.value)}
              >
                <MenuItem value="">
                  <em>All Groups</em>
                </MenuItem>
                {getUniqueValues('group').map(group => (
                  <MenuItem key={group} value={group}>{group}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Power On Time Filter */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Power On Time</InputLabel>
              <Select
                value={filters.powerOnTime}
                label="Power On Time"
                onChange={(e) => handleFilterChange('powerOnTime', e.target.value)}
              >
                <MenuItem value="">
                  <em>All Times</em>
                </MenuItem>
                {getUniqueValues('powerOnTime').map(time => (
                  <MenuItem key={time} value={time}>{time}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Power Off Time Filter */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Power Off Time</InputLabel>
              <Select
                value={filters.powerOffTime}
                label="Power Off Time"
                onChange={(e) => handleFilterChange('powerOffTime', e.target.value)}
              >
                <MenuItem value="">
                  <em>All Times</em>
                </MenuItem>
                {getUniqueValues('powerOffTime').map(time => (
                  <MenuItem key={time} value={time}>{time}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Count Filter */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Count</InputLabel>
              <Select
                value={filters.count}
                label="Count"
                onChange={(e) => handleFilterChange('count', e.target.value)}
              >
                <MenuItem value="">
                  <em>All Counts</em>
                </MenuItem>
                {getUniqueValues('count').map(count => (
                  <MenuItem key={count} value={count.toString()}>{count}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Consumption Filter */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Consumption</InputLabel>
              <Select
                value={filters.consumptionPerHour}
                label="Consumption"
                onChange={(e) => handleFilterChange('consumptionPerHour', e.target.value)}
              >
                <MenuItem value="">
                  <em>All Values</em>
                </MenuItem>
                {getUniqueValues('consumptionPerHour').map(consumption => (
                  <MenuItem key={consumption} value={consumption.toString()}>{consumption}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Results Info */}
      {searchTerm || activeFiltersCount > 0 ? (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredDevices.length} of {devices.length} devices
            {filteredDevices.length === 0 && ' - No matches found'}
          </Typography>
          
          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.entries(filters).map(([key, value]) => 
                value && (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    size="small"
                    sx={{ color: '#235c23'}}
                    onDelete={() => handleFilterChange(key, '')}
                    variant="outlined"
                  />
                )
              )}
            </Box>
          )}
        </Box>
      ) : null}

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
            {filteredDevices.map((device, index) => (
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
            {filteredDevices.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    {devices.length === 0 ? 'No devices found' : 'No devices match your search and filters'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
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