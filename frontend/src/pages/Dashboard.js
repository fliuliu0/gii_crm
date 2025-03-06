import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Card, Row, Col, Button, Navbar, Nav, Modal, Form, Alert } from "react-bootstrap";

function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalCustomers: 0,
        pendingFunding: 0,
        recentInteractions: 0,
        activeDeals: 0,
    });

    // State for user profile
    const [userProfile, setUserProfile] = useState({
        name: "",
        email: "",
        role: ""
    });

    // State to control the visibility of the profile modal
    const [showProfileModal, setShowProfileModal] = useState(false);

    // State for error messages
    const [error, setError] = useState(null);

    // Fetch user profile from the API on component mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        axios.get("http://127.0.0.1:5000/users/profile", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((response) => setUserProfile(response.data))
        .catch((err) => {
            console.error("Failed to load user profile", err);
            setError("Failed to load user profile. Please try again.");
        });
    }, [navigate]);

    // Fetch dashboard statistics
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        axios.get("http://127.0.0.1:5000/dashboard-stats", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((response) => setStats(response.data))
        .catch((err) => {
            console.error("Failed to load stats", err);
            setError("Failed to load dashboard statistics. Please try again.");
        });
    }, [navigate]);

    // Handle changes in the profile form
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setUserProfile((prevProfile) => ({
            ...prevProfile,
            [name]: value
        }));
    };

    // Save profile information
    const handleSaveProfile = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        axios.put("http://127.0.0.1:5000/profile", userProfile, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => setShowProfileModal(false))
        .catch((err) => {
            console.error("Failed to save profile", err);
            setError("Failed to save profile. Please try again.");
        });
    };

    return (
        <>
            <Navbar bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand>CRM Dashboard</Navbar.Brand>
                    <Nav className="ms-auto">
                        <Button variant="outline-light" onClick={() => setShowProfileModal(true)}>
                            Profile
                        </Button>
                        <Button variant="outline-light" onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/login");
                        }} className="ms-2">
                            Logout
                        </Button>
                    </Nav>
                </Container>
            </Navbar>

            <Container className="mt-4">
                <h2>Welcome, {userProfile.name || "User"}!</h2>

                {/* Quick Stats */}
                <Row className="mt-4">
                    <Col md={3}>
                        <Card className="text-center">
                            <Card.Body>
                                <Card.Title>Total Customers</Card.Title>
                                <h2>{stats.totalCustomers}</h2>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-center">
                            <Card.Body>
                                <Card.Title>Pending Approvals</Card.Title>
                                <h2>{stats.pendingFunding}</h2>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-center">
                            <Card.Body>
                                <Card.Title>Recent Interactions</Card.Title>
                                <h2>{stats.recentInteractions}</h2>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-center">
                            <Card.Body>
                                <Card.Title>Active Deals</Card.Title>
                                <h2>{stats.activeDeals}</h2>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Action Shortcuts */}
                <Row className="mt-4">
                    <Col md={6}>
                        <Button variant="primary" className="w-100 mb-3" onClick={() => navigate("/customers")}>
                            📂 Manage Customers
                        </Button>
                    </Col>
                    <Col md={6}>
                        <Button variant="warning" className="w-100 mb-3" onClick={() => navigate("/funding")}>
                            💰 View Funding Requests
                        </Button>
                    </Col>
                    <Col md={6}>
                        <Button variant="success" className="w-100 mb-3" onClick={() => navigate("/interactions")}>
                            📞 View Customer Interactions
                        </Button>
                    </Col>
                    <Col md={6}>
                        <Button variant="info" className="w-100 mb-3" onClick={() => navigate("/analytics")}>
                            📊 View Sales Analytics
                        </Button>
                    </Col>
                </Row>
            </Container>

            {/* Profile Modal */}
            <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>User Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={userProfile.name}
                                onChange={handleProfileChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={userProfile.email}
                                onChange={handleProfileChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Role</Form.Label>
                            <Form.Control
                                type="text"
                                name="role"
                                value={userProfile.role}
                                onChange={handleProfileChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default Dashboard;
