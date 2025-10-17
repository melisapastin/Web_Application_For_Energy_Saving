import { useState } from 'react';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

axios.defaults.baseURL = 'http://localhost:5000';

const AddDeviceForm = () => {
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceSlNo: '',
    deviceType: '',
    hwType: '',
    site: '',
    group: '',
    owner: '',
    connectivityType: '',
    ip: '',
    port: '',
    loginUser: '',
    password: '',
    readCommunity: '',
    writeCommunity: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/device', formData);
      navigate("/devices");
      console.log('Device added successfully');
    } catch (error) {
      console.error('Error adding device:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <br />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            name="deviceName"
            label="Device Name"
            value={formData.deviceName}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="deviceSlNo"
            label="Device Serial Number"
            value={formData.deviceSlNo}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="deviceType"
            label="Device Type"
            value={formData.deviceType}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="hwType"
            label="Hardware Type"
            value={formData.hwType}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="site"
            label="Site"
            value={formData.site}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="group"
            label="Group"
            value={formData.group}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="owner"
            label="Owner"
            value={formData.owner}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth required>
            <InputLabel>Connectivity Type</InputLabel>
            <Select
              name="connectivityType"
              value={formData.connectivityType}
              onChange={handleChange}
            >
              <MenuItem value="ssh">SSH</MenuItem>
              <MenuItem value="snmp">SNMP</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="ip"
            label="IP Address"
            value={formData.ip}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="port"
            label="Port"
            value={formData.port}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="loginUser"
            label="Login User"
            value={formData.loginUser}
            onChange={handleChange}
            fullWidth
            required={formData.connectivityType === 'ssh'}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            required={formData.connectivityType === 'ssh'}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="readCommunity"
            label="Read Community"
            value={formData.readCommunity}
            onChange={handleChange}
            fullWidth
            required={formData.connectivityType === 'snmp'}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="writeCommunity"
            label="Write Community"
            value={formData.writeCommunity}
            onChange={handleChange}
            fullWidth
            required={formData.connectivityType === 'snmp'}
          />
        </Grid>
      </Grid>
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </form>
  );
};

export default AddDeviceForm;
