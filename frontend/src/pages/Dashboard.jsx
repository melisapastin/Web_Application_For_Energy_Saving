import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Grid,
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, IconButton
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';

function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [energyData, setEnergyData] = useState({ 
    today: 0, 
    month: 0 
  });
  const [dailyChartData, setDailyChartData] = useState([]);
  const [monthlyChartData, setMonthlyChartData] = useState([]);

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

  const calculateDeviceConsumption = (device) => {
    const [onHours, onMinutes] = device.powerOnTime.split(':').map(Number);
    const [offHours, offMinutes] = device.powerOffTime.split(':').map(Number);
    
    const startMinutes = onHours * 60 + onMinutes;
    const endMinutes = offHours * 60 + offMinutes;
    
    let operatingMinutes = endMinutes - startMinutes;
    if (operatingMinutes < 0) {
      operatingMinutes += 24 * 60;
    }
    
    const operatingHours = operatingMinutes / 60;
    const dailyConsumption = operatingHours * device.consumptionPerHour * device.count;
    
    return dailyConsumption;
  };

  const calculateEnergySavings = (devices) => {
    let totalDailySaved = 0;
    const today = new Date();
    const currentDayOfMonth = today.getDate();

    devices.forEach(device => {
      const dailyConsumption = calculateDeviceConsumption(device);
      const potentialConsumption = 24 * device.consumptionPerHour * device.count;
      const dailySavings = potentialConsumption - dailyConsumption;
      
      totalDailySaved += dailySavings;
    });

    setEnergyData({
      today: totalDailySaved,
      month: totalDailySaved * currentDayOfMonth
    });
  };

  const handleChartToggle = (device) => {
    const isInDailyChart = dailyChartData.some(item => item.deviceName === device.deviceName);
    
    if (isInDailyChart) {
      // Remove device from both charts
      setDailyChartData(prevData => 
        prevData.filter(item => item.deviceName !== device.deviceName)
      );
      setMonthlyChartData(prevData => 
        prevData.filter(item => item.deviceName !== device.deviceName)
      );
    } else {
      // Add device to both charts
      const dailyConsumption = calculateDeviceConsumption(device);
      const monthlyConsumption = dailyConsumption * new Date().getDate(); // Current day of month
      
      setDailyChartData(prevData => [
        ...prevData,
        {
          deviceName: device.deviceName,
          group: device.group,
          consumption: parseFloat(dailyConsumption.toFixed(2)),
          operatingHours: calculateOperatingHours(device)
        }
      ]);

      setMonthlyChartData(prevData => [
        ...prevData,
        {
          deviceName: device.deviceName,
          group: device.group,
          consumption: parseFloat(monthlyConsumption.toFixed(2)),
          operatingHours: calculateOperatingHours(device)
        }
      ]);
    }
  };

  const calculateOperatingHours = (device) => {
    const [onHours, onMinutes] = device.powerOnTime.split(':').map(Number);
    const [offHours, offMinutes] = device.powerOffTime.split(':').map(Number);
    
    const startMinutes = onHours * 60 + onMinutes;
    const endMinutes = offHours * 60 + offMinutes;
    
    let operatingMinutes = endMinutes - startMinutes;
    if (operatingMinutes < 0) {
      operatingMinutes += 24 * 60;
    }
    
    return (operatingMinutes / 60).toFixed(1);
  };

  const getBarColor = (deviceName, chartType = 'daily') => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28'];
    const data = chartType === 'daily' ? dailyChartData : monthlyChartData;
    const index = data.findIndex(item => item.deviceName === deviceName);
    return colors[index % colors.length];
  };

  const getButtonColor = (isInChart) => {
    return isInChart ? '#ff4444' : '#235c23';
  };

  const getButtonHoverColor = (isInChart) => {
    return isInChart ? '#cc0000' : '#1a451a';
  };

  const isInChart = (deviceName) => {
    return dailyChartData.some(item => item.deviceName === deviceName);
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

      {/* Charts Section - Now stacked vertically */}
      {(dailyChartData.length > 0 || monthlyChartData.length > 0) && (
        <Box sx={{ mb: 4 }}>
          {/* Daily Consumption Chart */}
          {dailyChartData.length > 0 && (
            <Card sx={{ 
              borderRadius: '10px',
              boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
              mb: 3
            }}>
              <CardContent>
                <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Daily Energy Consumption
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Energy consumption per day for selected devices
                </Typography>
                
                {/* Fixed: Use explicit dimensions instead of percentage height */}
                <Box sx={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyChartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="deviceName" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Energy (kWh)', 
                          angle: -90, 
                          position: 'insideLeft',
                          offset: -10
                        }} 
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} kWh`, 'Daily Consumption']}
                        labelFormatter={(label) => `Device: ${label}`}
                      />
                      <Legend />
                      <Bar 
                        dataKey="consumption" 
                        name="Daily Consumption"
                      >
                        {dailyChartData.map((entry, index) => (
                          <Cell key={`cell-daily-${index}`} fill={getBarColor(entry.deviceName, 'daily')} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Monthly Consumption Chart */}
          {monthlyChartData.length > 0 && (
            <Card sx={{ 
              borderRadius: '10px',
              boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
            }}>
              <CardContent>
                <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Monthly Energy Consumption
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Energy consumption this month for selected devices
                </Typography>
                
                {/* Fixed: Use explicit dimensions instead of percentage height */}
                <Box sx={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyChartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="deviceName" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Energy (kWh)', 
                          angle: -90, 
                          position: 'insideLeft',
                          offset: -10
                        }} 
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} kWh`, 'Monthly Consumption']}
                        labelFormatter={(label) => `Device: ${label}`}
                      />
                      <Legend />
                      <Bar 
                        dataKey="consumption" 
                        name="Monthly Consumption"
                      >
                        {monthlyChartData.map((entry, index) => (
                          <Cell key={`cell-monthly-${index}`} fill={getBarColor(entry.deviceName, 'monthly')} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Instruction Box */}
      {(dailyChartData.length > 0 || monthlyChartData.length > 0) && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, mb: 4 }}>
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            💡 Click the + button next to devices to add them to the charts. Click again to remove.
          </Typography>
        </Box>
      )}

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
            {dailyChartData.length > 0 && (
              <Typography variant="body2" color="textSecondary">
                {dailyChartData.length} device(s) in charts
              </Typography>
            )}
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: '50px' }}>Charts</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Device Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Group</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Power On</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Power Off</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Count</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Consumption (kWh/hr)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {devices.map((device, index) => {
                  const inChart = isInChart(device.deviceName);
                  
                  return (
                    <TableRow 
                      key={device.id || `device-${index}`}
                      sx={{ 
                        backgroundColor: inChart ? '#f0f8ff' : 'inherit',
                        '&:hover': {
                          backgroundColor: inChart ? '#e6f3ff' : '#fafafa'
                        }
                      }}
                    >
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleChartToggle(device)}
                          sx={{
                            backgroundColor: getButtonColor(inChart),
                            color: 'white',
                            '&:hover': {
                              backgroundColor: getButtonHoverColor(inChart),
                            }
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {device.deviceName}
                          {inChart && (
                            <Box
                              sx={{
                                ml: 1,
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: getBarColor(device.deviceName, 'daily')
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{device.group}</TableCell>
                      <TableCell>{device.powerOnTime}</TableCell>
                      <TableCell>{device.powerOffTime}</TableCell>
                      <TableCell>{device.count}</TableCell>
                      <TableCell>{device.consumptionPerHour}</TableCell>
                    </TableRow>
                  );
                })}
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