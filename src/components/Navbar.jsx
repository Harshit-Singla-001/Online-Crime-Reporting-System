import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { RiShieldUserLine, RiSettings4Line, RiLogoutBoxRLine, RiUser3Line } from 'react-icons/ri';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await logout();
    if (res.success) {
      navigate('/auth/login');
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
                <Nav.Link as={NavLink} to="/admin/tips/manage">Manage Tips</Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav className="align-items-center">
            {user ? (
              <div className="d-flex align-items-center gap-2">
                <span className="text-light d-none d-lg-inline me-2" style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                  {user.full_name}
                </span>
                <NavDropdown
                  align="end"
                  title={
                    <div className="avatar-circle">
                      {getFirstLetter(user.full_name)}
                    </div>
                  }
                  id="avatar-dropdown"
                >
                  <NavDropdown.Item as={Link} to={isAdmin ? "/admin/profile" : "/user/pages/profile"} className="d-flex align-items-center gap-2 py-2">
                    <RiUser3Line /> My Profile
                  </NavDropdown.Item>
                  
                  {isAdmin && (
                    <NavDropdown.Item as={Link} to="/admin/settings" className="d-flex align-items-center gap-2 py-2">
                      <RiSettings4Line /> Site Settings
                    </NavDropdown.Item>
                  )}
                  
                  <NavDropdown.Divider />
                  
                  <NavDropdown.Item onClick={handleLogout} className="text-danger d-flex align-items-center gap-2 py-2">
                    <RiLogoutBoxRLine /> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </div>
            ) : (
              <Nav.Link as={Link} to="/auth/login" className="btn-grad text-white px-4 py-2 border-0">
                Log In
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
