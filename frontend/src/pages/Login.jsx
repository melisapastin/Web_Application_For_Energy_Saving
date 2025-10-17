import { useState } from 'react';
import '../App.css';
import { useNavigate, Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.access_token) {
        // Store access token
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('username', username);
        
        // Extract admin status from token (NEW)
        const tokenPayload = JSON.parse(atob(data.access_token.split('.')[1]));
        const isAdmin = tokenPayload.isAdmin || false;
        localStorage.setItem('isAdmin', isAdmin);
        
        setMessage('Login successful');
        navigate('/home');
      } else {
        setMessage(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Connection error. Please try again.');
    }
  };

  return (
    <div className="login-container">
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

      <Card 
        sx={{ 
          width: '400px',
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
              borderBottom: '1px solid #eee',
              textAlign: 'center'
            }}
          >
            Login
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <form 
              onSubmit={handleLogin} 
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
                required
                autoFocus
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
                required
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
                    backgroundColor: '#235c23'
                  }
                }}
              >
                Login
              </Button>
            </form>
          </Box>
          
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <span>Don't have an account? </span>
            <Link to="/register">Register</Link>
          </div>
          
          {message && (
            <Typography 
              sx={{ 
                textAlign: 'center', 
                marginTop: '16px',
                color: message === 'Login successful' ? 'green' : 'red'
              }}
            >
              {message}
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;