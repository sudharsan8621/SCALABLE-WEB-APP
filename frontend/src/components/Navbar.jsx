import React from 'react';
import { Navbar as BootstrapNavbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <BootstrapNavbar 
      bg="white" 
      expand="lg" 
      fixed="top" 
      className="shadow-sm"
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '70px'
      }}
    >
      <Container>
        <LinkContainer to="/">
          <BootstrapNavbar.Brand 
            className="fw-bold text-white"
            style={{ fontSize: '1.5rem' }}
          >
            📋 TaskMaster
          </BootstrapNavbar.Brand>
        </LinkContainer>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated && (
              <>
                <LinkContainer to="/dashboard">
                  <Nav.Link className="text-white fw-medium">
                    Dashboard
                  </Nav.Link>
                </LinkContainer>
                <LinkContainer to="/tasks">
                  <Nav.Link className="text-white fw-medium">
                    Tasks
                  </Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>

          <Nav className="ms-auto">
            {isAuthenticated ? (
              <>
                <NavDropdown
                  title={
                    <span className="text-white fw-medium">
                      👤 {user?.name || 'User'}
                    </span>
                  }
                  id="user-dropdown"
                  className="text-white"
                >
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>
                      👤 Profile
                    </NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    🚪 Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <div className="d-flex gap-2">
                <LinkContainer to="/login">
                  <Button 
                    variant="outline-light" 
                    size="sm"
                    className="fw-medium"
                  >
                    Login
                  </Button>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Button 
                    variant="light" 
                    size="sm"
                    className="fw-medium text-primary"
                  >
                    Sign Up
                  </Button>
                </LinkContainer>
              </div>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;