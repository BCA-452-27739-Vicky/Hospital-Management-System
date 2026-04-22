import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";

const AppNavbar = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">🏥 Hospital</Navbar.Brand>

        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="ms-auto">

             <Nav.Link as={Link} to="/Home">Home</Nav.Link>
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/ambulance">Ambulance</Nav.Link>
            <Nav.Link as={Link} to="/bloodbank">Blood Bank</Nav.Link>
            
            <Nav.Link as={Link} to="/login">Login</Nav.Link>
            
          
            
            
          
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
  

            


export default AppNavbar;
