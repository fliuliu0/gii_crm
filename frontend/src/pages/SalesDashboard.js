import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Button, Card } from "react-bootstrap";

function SalesDashboard() {
    const navigate = useNavigate();
    
    const [userProfile, setUserProfile] = useState({
        id: "",
        name: "Loading...",
        email: "",
        role: ""
    });

    const [stats, setStats] = useState({
        customers: 0,
        projects: 0,
        salesOpportunities: 0,
    });

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
        .catch(() => {
            navigate("/login"); 
        });
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        Promise.all([
            axios.get("http://127.0.0.1:5000/customers", { headers: { Authorization: `Bearer ${token}` } }),
            axios.get("http://127.0.0.1:5000/sales_opportunity", { headers: { Authorization: `Bearer ${token}` } })
        ])
        .then(([customersRes, salesRes]) => {
            setStats({
                customers: customersRes.data.length,
                salesOpportunities: salesRes.data.length
            });
        })
        .catch(() => {
            console.error("Failed to fetch statistics");
        });
    }, [navigate]);

    return (
        <Container className="mt-4">
            <h2>Welcome, {userProfile.name}!</h2>
            <hr />

            {/* User Profile Details */}
            <Row className="justify-content-center align-items-center">
                <Col md={6} lg={4}>
                    <Card className="text-center shadow-lg">
                        <Card.Body>
                            <Card.Title className="fw-bold">User Profile</Card.Title>
                            <hr />
                            <p><strong>User ID:</strong> {userProfile.id}</p>
                            <p><strong>Name:</strong> {userProfile.name}</p>
                            <p><strong>Email:</strong> {userProfile.email}</p>
                            <p><strong>Role:</strong> {userProfile.role}</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Statistics Section */}
            <Row className="justify-content-center ">
                <Col md={4}>
                    <Card className="shadow">
                        <Card.Body>
                            <Card.Title>Total Customers</Card.Title>
                            <h2>{stats.customers}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow">
                        <Card.Body>
                            <Card.Title>Sales Opportunities</Card.Title>
                            <h2>{stats.salesOpportunities}</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Navigation Buttons */}
            <Row className="mt-4">
                <Col md={6}>
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Manage Customers</Card.Title>
                            <Button variant="primary" className="w-100" onClick={() => navigate("/customers")}>
                                Go to Customers
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} className="mt-3">
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Sales Opportunities</Card.Title>
                            <Button variant="success" className="w-100" onClick={() => navigate("/sales")}>
                                Go to Sales
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} className="mt-3">
                    <Card className="text-center">
                        <Card.Body>
                            <Card.Title>Log Out</Card.Title>
                            <Button variant="danger" className="w-100" onClick={() => {
                                localStorage.removeItem("token");
                                navigate("/login");
                            }}>
                                Log Out
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default SalesDashboard;
