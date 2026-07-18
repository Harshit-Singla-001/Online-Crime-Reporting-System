import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { RiShieldUserLine, RiSettings4Line, RiLogoutBoxRLine, RiUser3Line, RiSunLine, RiMoonLine } from 'react-icons/ri';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  const handleLogout = async () => {
    const res = await logout();
    if (res.success) {
      navigate('/');
    }
  };

  const getFirstLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <Navbar expand="lg" className="navbar-glass" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to={isAdmin ? "/admin/dashboard" : "/user/home"} className="d-flex align-items-center gap-2" style={{ fontWeight: '800', letterSpacing: '0.5px' }}>
          <RiShieldUserLine size={28} className="text-info" />
          <span>
            {isAdmin ? "CRS " : "OCRS"}
            {isAdmin && <span className="text-info" style={{ fontSize: '0.8rem', fontWeight: '500', marginLeft: '5px' }}>ADMIN PANEL</span>}
          </span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto ms-lg-4">
            {!isAdmin ? (
              <>
                <Nav.Link as={NavLink} to="/user/home">Home</Nav.Link>
                <Nav.Link as={NavLink} to="/user/fir/fir-records">FIR Records</Nav.Link>
                <Nav.Link as={NavLink} to="/user/pages/safety-tips">Safety Tips</Nav.Link>
                <Nav.Link as={NavLink} to="/user/pages/about">About</Nav.Link>
                <Nav.Link as={NavLink} to="/user/pages/contact">Contact</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/admin/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={NavLink} to="/admin/fir/manage">Manage FIRs</Nav.Link>
                <Nav.Link as={NavLink} to="/admin/users/manage">Manage Users</Nav.Link>
                <Nav.Link as={NavLink} to="/admin/messages">Contact Messages</Nav.Link>
                <Nav.Link as={NavLink} to="/admin/tips/manage">Manage Tips</Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav className="align-items-center gap-2">
            {/* Day/Night Mode Toggle */}
            <Button
              variant="link"
              className="text-light p-1 d-flex align-items-center justify-content-center theme-toggle-btn"
              onClick={() => setIsLightMode(!isLightMode)}
              style={{ fontSize: '1.35rem', textDecoration: 'none', boxShadow: 'none', color: 'var(--color-text-main)' }}
              title={isLightMode ? "Switch to Night Mode" : "Switch to Day Mode"}
            >
              {isLightMode ? <RiMoonLine className="text-warning" /> : <RiSunLine className="text-warning" />}
            </Button>

            {user ? (
              <NavDropdown
                align="end"
                title={
                  <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                    <span className="text-light d-none d-lg-inline me-1" style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                      {user.full_name}
                    </span>
                    <div className="avatar-circle">
                      {getFirstLetter(user.full_name)}
                    </div>
                  </div>
                }
                id="avatar-dropdown"
              >
                <NavDropdown.Item as={Link} to={isAdmin ? "/admin/profile" : "/user/pages/profile"} className="d-flex align-items-center gap-2 py-2">
                  <RiUser3Line /> My Profile
                </NavDropdown.Item>
                
                <NavDropdown.Divider />
                
                <NavDropdown.Item onClick={handleLogout} className="text-danger d-flex align-items-center gap-2 py-2">
                  <RiLogoutBoxRLine /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Link to="/" className="btn-grad text-white px-4 py-2 border-0 rounded-2 text-decoration-none d-inline-flex align-items-center justify-content-center" style={{ color: '#ffffff' }}>
                Log In
              </Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
