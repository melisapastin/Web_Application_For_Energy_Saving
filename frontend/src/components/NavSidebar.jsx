/* eslint-disable react/prop-types */
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { Home } from '@mui/icons-material';
import CellTowerIcon from '@mui/icons-material/CellTower';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

const NavSidebar = () => {
  let navigate = useNavigate();

  const logoutUser = () => {
    localStorage.clear();
    navigate("/login");
  }
  
  const isAdmin = localStorage.getItem("role")?.includes("admin");

  return (
    <div>
      <Sidebar className='sidebar' style={{ position: 'relative' }}>
        <Menu style={{ marginTop: "2rem" }}>
          <MenuItem icon={<Home />} onClick={() => navigate("/home")}>Home</MenuItem>
          <MenuItem icon={<CellTowerIcon />} onClick={() => navigate("/devices")}>Devices</MenuItem>
          <MenuItem icon={<BarChartIcon />} onClick={() => navigate("/dashboard")}>Dashboard</MenuItem>
          <MenuItem icon={<PersonIcon />} onClick={() => navigate("/profile")}>Profile</MenuItem>

          {isAdmin && (
            <MenuItem icon={<ManageAccountsIcon />} onClick={() => navigate("/manage-users")}>
              Manage Users
            </MenuItem>
          )}
        </Menu>
        
        {/* Updated Logout Button */}
        <Button 
          variant="contained" 
          startIcon={<LogoutIcon />} 
          onClick={logoutUser}
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 2rem)",
            maxWidth: "200px",
            backgroundColor: "#235c23",
            color: "white",
            fontWeight: "bold",
            padding: "8px 16px",
            borderRadius: "4px",
            boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
            transition: "background-color 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1a451a"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#235c23"}
        >
          Logout
        </Button>
      </Sidebar>
    </div>
  );
}

export default NavSidebar;