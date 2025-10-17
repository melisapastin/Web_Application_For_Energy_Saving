import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Grid,
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import axios from 'axios';

function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [energyData, setEnergyData] = useState({ 
    today: 0, 
    month: 0 
  });

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get('/devices');
        setDevices(response.data);
        calculateEnergySavings(response.data);
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    fetchDevices();
  }, []);

  const calculateEnergySavings = (devices) => {
    let totalDailySaved = 0;
    const today = new Date();
    const currentDayOfMonth = today.getDate();

    devices.forEach(device => {
      // Parse time strings to minutes
      const [onHours, onMinutes] = device.powerOnTime.split(':').map(Number);
      const [offHours, offMinutes] = device.powerOffTime.split(':').map(Number);
      
      const startMinutes = onHours * 60 + onMinutes;
      const endMinutes = offHours * 60 + offMinutes;
      
      // Calculate operating duration
      let operatingMinutes = endMinutes - startMinutes;
      if (operatingMinutes < 0) {
        operatingMinutes += 24 * 60; // Handle overnight schedules
      }
      
      const operatingHours = operatingMinutes / 60;
      const dailySavingsPerDevice = (24 - operatingHours) * device.consumptionPerHour;
      const groupDailySavings = dailySavingsPerDevice * device.count;
      
      totalDailySaved += groupDailySavings;
    });

    setEnergyData({
      today: totalDailySaved,
      month: totalDailySaved * currentDayOfMonth
    });
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
        <DashboardIcon sx={{ 
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
          Energy Dashboard
        </Typography>
      </Box>

      {/* Energy Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: '10px',
            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
            height: '100%'
          }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{
                backgroundColor: '#e6f7ff',
                borderRadius: '50%',
                width: 60,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 3
              }}>
                <FlashOnIcon sx={{ fontSize: 30, color: '#1890ff' }} />
              </Box>
              <Box>
                <Typography 
                  variant="body1" 
                  color="textSecondary"
                  sx={{ mb: 0.5 }}
                >
                  Energy Saved Today:
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {energyData.today.toFixed(1)} kWh
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: '10px',
            boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
            height: '100%'
          }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{
                backgroundColor: '#f6ffed',
                borderRadius: '50%',
                width: 60,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 3
              }}>
                <CalendarMonthIcon sx={{ fontSize: 30, color: '#52c41a' }} />
              </Box>
              <Box>
                <Typography 
                  variant="body1" 
                  color="textSecondary"
                  sx={{ mb: 0.5 }}
                >
                  Energy Saved This Month:
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {energyData.month.toFixed(1)} kWh
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Device Table Section */}
      <Card sx={{ 
        borderRadius: '10px',
        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
      }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            borderBottom: '1px solid #e0e0e0',
            pb: 2
          }}>
            <Typography 
              variant="h5" 
              component="h2"
              sx={{ 
                fontWeight: 'bold',
                color: 'black',
                flexGrow: 1
              }}
            >
              Registered Devices
            </Typography>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Device Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Group</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Power On</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Power Off</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Count</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Consumption (kWh/hr)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>{device.deviceName}</TableCell>
                    <TableCell>{device.group}</TableCell>
                    <TableCell>{device.powerOnTime}</TableCell>
                    <TableCell>{device.powerOffTime}</TableCell>
                    <TableCell>{device.count}</TableCell>
                    <TableCell>{device.consumptionPerHour}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {devices.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1">
                No devices registered yet.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Dashboard;