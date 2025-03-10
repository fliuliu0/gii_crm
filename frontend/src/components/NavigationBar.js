import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function NavigationBar() {
    const [role, setRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token); // Decode JWT
                setRole(decoded.role); // Extract user role
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem("token");
                navigate("/login");
            }
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand>CRM System</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {role === "Admin" && (
                            <>
                                <Nav.Link as={Link} to="/admindashboard">Admin Dashboard</Nav.Link>
                                <Nav.Link as={Link} to="/customers">Customers</Nav.Link>
                                <Nav.Link as={Link} to="/projects">Projects</Nav.Link>
                                <Nav.Link as={Link} to="/sales">Sales</Nav.Link>
                            </>
                        )}

                        {role === "Sales" && (
                            <>
                                <Nav.Link as={Link} to="/salesdashboard">Sales Dashboard</Nav.Link>
                                <Nav.Link as={Link} to="/customers">Customers</Nav.Link>
                                <Nav.Link as={Link} to="/sales">Sales</Nav.Link>
                            </>
                        )}

                        {role === "Project Manager" && (
                            <>
                                <Nav.Link as={Link} to="/projectmanagerdashboard">Project Manager Dashboard</Nav.Link>
                                <Nav.Link as={Link} to="/projects">Projects</Nav.Link>
                            </>
                        )}

                        {role && (
                            <Nav.Link as={Link} to="/login" onClick={handleLogout}>
                                Log Out
                            </Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavigationBar;
