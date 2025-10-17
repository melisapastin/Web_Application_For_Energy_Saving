import "./App.css";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import NavSidebar from "./components/NavSidebar";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import AddDeviceForm from "./components/AddDeviceForm";
import ManageUsers from "./pages/ManageUsers";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

function App() {

    const SidebarLayout = () => (
      <div className="app">
        <NavSidebar />
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    );


    return (
      <BrowserRouter>

          <Routes>
            <Route element={<SidebarLayout/>}>
              <Route path="/home" element={<Home/>} />
              <Route path="/dashboard" element={<Dashboard/>} />
              <Route path="/devices" element={<Devices/>}/>
              <Route path="/add-device" element={<AddDeviceForm/>} />
              <Route path="/profile" element={<Profile/>} />
              <Route path="/manage-users" element={<ManageUsers/>} />


            </Route>
            <Route path="/" element={<Login />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Routes>
      </BrowserRouter>
    );
}

export default App;
