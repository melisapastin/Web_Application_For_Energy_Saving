import { useState } from 'react';
import '../App.css';
import { useNavigate, Link } from 'react-router-dom';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Registration successful');
        navigate('/login');
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="login-container">
      {/* Title Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 4,
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
          borderBottom: '2px solid #e0e0e0',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: 'black',
            letterSpacing: '0.5px',
            textAlign: 'center',
          }}
        >
          Smart Application for Energy Saving
        </Typography>
      </Box>

      {/* Registration Card - Updated design */}
      <Card 
        sx={{ 
          width: '400px',
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
          borderRadius: '10px'
        }}
      >
        <CardContent>
          {/* Card Header with bottom border */}
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              color: 'black',
              mb: 3,
              paddingBottom: '10px',
              borderBottom: '1px solid #eee',
              textAlign: 'center'
            }}
          >
            Register
          </Typography>
          
          {/* Centered form container */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <form 
              onSubmit={handleRegister} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                width: '300px' 
              }}
            >
              <TextField
                id="username"
                value={username}
                label="Username"
                variant="outlined"
                size="small"
                sx={{ backgroundColor: '#fff' }}
                onChange={(e) => setUsername(e.target.value)}
              />
              
              <TextField
                id="password"
                type="password"
                value={password}
                label="Password"
                variant="outlined"
                size="small"
                sx={{ backgroundColor: '#fff' }}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              <Button 
                variant="contained" 
                type="submit" 
                sx={{ 
                  py: 1.5,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#2d6a2d', 
                  '&:hover': {
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
                    backgroundColor: '#235c23'
                  }
                }}
              >
                Register
              </Button>
            </form>
          </Box>
          
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <span>Already have an account? </span>
            <Link to="/login">Login</Link>
          </div>
          
          {message && <p style={{ textAlign: 'center', marginTop: '16px' }}>{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

export default Register;