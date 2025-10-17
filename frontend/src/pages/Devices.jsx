import { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, TextField, Button, Box, Snackbar, Alert, Typography,
  Card, CardContent, FormControl, IconButton, Menu, MenuItem,
  InputAdornment, Collapse, Select
} from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FilterListIcon from '@mui/icons-material/FilterList';
import axios from 'axios';

const DeviceTable = () => {
  const [devices, setDevices] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
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
  const [deviceNameFilter, setDeviceNameFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [powerOnTimeFilter, setPowerOnTimeFilter] = useState('');
  const [powerOffTimeFilter, setPowerOffTimeFilter] = useState('');
  const [countFilter, setCountFilter] = useState('');
  const [consumptionFilter, setConsumptionFilter] = useState('');

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchDevices();
  }, []);

  // Extract unique values for filters
  const deviceNameOptions = [...new Set(devices.map(device => device.deviceName))].sort();
  const groupOptions = [...new Set(devices.map(device => device.group))].sort();
  const powerOnTimeOptions = [...new Set(devices.map(device => device.powerOnTime))].sort();
  const powerOffTimeOptions = [...new Set(devices.map(device => device.powerOffTime))].sort();
  const countOptions = [...new Set(devices.map(device => device.count.toString()))].sort((a, b) => parseInt(a) - parseInt(b));
  const consumptionOptions = [...new Set(devices.map(device => device.consumptionPerHour.toString()))].sort((a, b) => parseFloat(a) - parseFloat(b));

  // Update search results when devices, search term, or filters change
  useEffect(() => {
    if (searchTerm.trim() === '' && 
        !deviceNameFilter && 
        !groupFilter && 
        !powerOnTimeFilter && 
        !powerOffTimeFilter && 
        !countFilter && 
        !consumptionFilter) {
      setSearchResults([]);
      setShowSearchResults(false);
    } else {
      let filtered = devices;

      // Apply text search
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

      // Apply filters
      if (deviceNameFilter) {
        filtered = filtered.filter(device => device.deviceName === deviceNameFilter);
      }
      if (groupFilter) {
        filtered = filtered.filter(device => device.group === groupFilter);
      }
      if (powerOnTimeFilter) {
        filtered = filtered.filter(device => device.powerOnTime === powerOnTimeFilter);
      }
      if (powerOffTimeFilter) {
        filtered = filtered.filter(device => device.powerOffTime === powerOffTimeFilter);
      }
      if (countFilter) {
        filtered = filtered.filter(device => device.count.toString() === countFilter);
      }
      if (consumptionFilter) {
        filtered = filtered.filter(device => device.consumptionPerHour.toString() === consumptionFilter);
      }

      setSearchResults(filtered);
      setShowSearchResults(filtered.length > 0);
    }
  }, [devices, searchTerm, deviceNameFilter, groupFilter, powerOnTimeFilter, powerOffTimeFilter, countFilter, consumptionFilter]);

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const clearAllFilters = () => {
    setDeviceNameFilter('');
    setGroupFilter('');
    setPowerOnTimeFilter('');
    setPowerOffTimeFilter('');
    setCountFilter('');
    setConsumptionFilter('');
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const toggleSearchResults = () => {
    setShowSearchResults(!showSearchResults);
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

  // Button styles
  const primaryButtonStyle = {
    backgroundColor: '#235c23',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.875rem',
    textTransform: 'none',
    borderRadius: '8px',
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
    padding: '8px 16px',
    '&:hover': {
      backgroundColor: '#1a451a',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
    }
  };

  const secondaryButtonStyle = {
    backgroundColor: 'white',
    color: '#235c23',
    border: '1.5px solid #235c23',
    fontWeight: 'bold',
    fontSize: '0.875rem',
    textTransform: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    '&:hover': {
      backgroundColor: '#f0f7f0',
      border: '1.5px solid #1a451a',
    }
  };

  const textButtonStyle = {
    color: '#235c23',
    fontWeight: '600',
    fontSize: '0.875rem',
    textTransform: 'none',
    borderRadius: '6px',
    padding: '4px 12px',
    '&:hover': {
      backgroundColor: '#f0f7f0',
    }
  };

  // Reusable table component
  const DeviceTableContent = ({ devices, title }) => (
    <TableContainer 
      component={Paper} 
      sx={{ 
        marginBottom: 4,
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.08)',
        borderRadius: '10px'
      }}
    >
      {title && (
        <Box sx={{ 
          padding: '16px', 
          backgroundColor: '#f8f9fa',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              color: 'black',
              letterSpacing: '0.5px'
            }}
          >
            {title}
          </Typography>
        </Box>
      )}
      <Table>
        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Device Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Group</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Power On Time</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Power Off Time</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Count</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Consumption per Hour (kWh)</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'black' }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {devices.map((device, index) => (
            <TableRow 
              key={`${device._id}-${index}`}
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
                  sx={{
                    color: '#235c23',
                    '&:hover': {
                      backgroundColor: '#f0f7f0',
                    }
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {devices.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  No devices found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

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

      {/* Search Filter Section */}
      <Box sx={{ mb: 3 }}>
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
                  sx={{
                    color: '#666',
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                    }
                  }}
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
        
        {/* Filter Row */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
            <FilterListIcon sx={{ mr: 1, color: '#235c23' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: '600' }}>
              Filter by:
            </Typography>
          </Box>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={deviceNameFilter}
              onChange={(e) => setDeviceNameFilter(e.target.value)}
              displayEmpty
              renderValue={(selected) => selected || "Device Name"}
              sx={{
                borderRadius: '8px',
                backgroundColor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#235c23',
                }
              }}
            >
              <MenuItem value="">All Devices</MenuItem>
              {deviceNameOptions.map((name) => (
                <MenuItem key={name} value={name}>{name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              displayEmpty
              renderValue={(selected) => selected || "Group"}
              sx={{
                borderRadius: '8px',
                backgroundColor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#235c23',
                }
              }}
            >
              <MenuItem value="">All Groups</MenuItem>
              {groupOptions.map((group) => (
                <MenuItem key={group} value={group}>{group}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={powerOnTimeFilter}
              onChange={(e) => setPowerOnTimeFilter(e.target.value)}
              displayEmpty
              renderValue={(selected) => selected || "Power On Time"}
              sx={{
                borderRadius: '8px',
                backgroundColor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#235c23',
                }
              }}
            >
              <MenuItem value="">All Times</MenuItem>
              {powerOnTimeOptions.map((time) => (
                <MenuItem key={time} value={time}>{time}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={powerOffTimeFilter}
              onChange={(e) => setPowerOffTimeFilter(e.target.value)}
              displayEmpty
              renderValue={(selected) => selected || "Power Off Time"}
              sx={{
                borderRadius: '8px',
                backgroundColor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#235c23',
                }
              }}
            >
              <MenuItem value="">All Times</MenuItem>
              {powerOffTimeOptions.map((time) => (
                <MenuItem key={time} value={time}>{time}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={countFilter}
              onChange={(e) => setCountFilter(e.target.value)}
              displayEmpty
              renderValue={(selected) => selected || "Count"}
              sx={{
                borderRadius: '8px',
                backgroundColor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#235c23',
                }
              }}
            >
              <MenuItem value="">All Counts</MenuItem>
              {countOptions.map((count) => (
                <MenuItem key={count} value={count}>{count}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={consumptionFilter}
              onChange={(e) => setConsumptionFilter(e.target.value)}
              displayEmpty
              renderValue={(selected) => selected || "Consumption"}
              sx={{
                borderRadius: '8px',
                backgroundColor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#235c23',
                }
              }}
            >
              <MenuItem value="">All Values</MenuItem>
              {consumptionOptions.map((consumption) => (
                <MenuItem key={consumption} value={consumption}>{consumption} kWh</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button 
            variant="outlined" 
            size="small" 
            onClick={clearAllFilters}
            sx={secondaryButtonStyle}
          >
            Clear All
          </Button>
        </Box>

        {(searchTerm || deviceNameFilter || groupFilter || powerOnTimeFilter || powerOffTimeFilter || countFilter || consumptionFilter) && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ flexGrow: 1 }}
            >
              Found {searchResults.length} matching device{searchResults.length !== 1 ? 's' : ''}
              {searchResults.length === 0 && ' - No matches found'}
            </Typography>
            {searchResults.length > 0 && (
              <Button
                startIcon={showSearchResults ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={toggleSearchResults}
                size="small"
                sx={textButtonStyle}
              >
                {showSearchResults ? 'Hide Results' : 'Show Results'}
              </Button>
            )}
          </Box>
        )}
      </Box>

      {/* Search Results Section */}
      {(searchTerm || deviceNameFilter || groupFilter || powerOnTimeFilter || powerOffTimeFilter || countFilter || consumptionFilter) && searchResults.length > 0 && (
        <Collapse in={showSearchResults}>
          <DeviceTableContent 
            devices={searchResults} 
            title={`Search Results (${searchResults.length} device${searchResults.length !== 1 ? 's' : ''} found)`}
          />
        </Collapse>
      )}

      {/* Main Device Table */}
      <DeviceTableContent 
        devices={devices} 
        title="All Devices"
      />

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <MenuItem 
          onClick={() => handleMenuAction('edit')}
          sx={{
            '&:hover': {
              backgroundColor: '#f0f7f0',
            }
          }}
        >
          Edit
        </MenuItem>
        <MenuItem 
          onClick={() => handleMenuAction('remove')}
          sx={{
            color: '#d32f2f',
            '&:hover': {
              backgroundColor: '#ffebee',
            }
          }}
        >
          Remove
        </MenuItem>
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
              sx={{ 
                backgroundColor: '#fff',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Group *"
              name="group"
              value={newDevice.group}
              onChange={handleInputChange}
              size="small"
              variant="outlined"
              sx={{ 
                backgroundColor: '#fff',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
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
              sx={{ 
                backgroundColor: '#fff',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
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
              sx={{ 
                backgroundColor: '#fff',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
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
              sx={{ 
                backgroundColor: '#fff',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
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
              sx={{ 
                backgroundColor: '#fff',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button 
                variant="contained" 
                onClick={editMode ? handleUpdateDevice : handleAddDevice}
                sx={{ 
                  flex: 1,
                  py: 1.5,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  textTransform: 'none',
                  backgroundColor: '#235c23',
                  borderRadius: '8px',
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
                  onClick={cancelEdit}
                  sx={{ 
                    flex: 0.5,
                    py: 1.5,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    textTransform: 'none',
                    color: '#235c23',
                    borderColor: '#235c23',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: '#f0f7f0',
                      borderColor: '#1a451a',
                    }
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
            boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
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
            boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px'
          }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DeviceTable;