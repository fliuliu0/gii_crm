import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Button, Navbar, Nav, Table } from "react-bootstrap";

function Dashboard() {
    const navigate = useNavigate(); // ✅ Must be inside a function component
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }

        axios.get("http://127.0.0.1:5000/customers", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((response) => {
            setCustomers(response.data);
        })
        .catch(() => {
            navigate("/login");
        });
    }, [navigate]);

    return (
        <>
            <Navbar bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand>CRM Dashboard</Navbar.Brand>
                    <Nav className="ms-auto">
                        <Button variant="outline-light" onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/login");
                        }}>
                            Logout
                        </Button>
                    </Nav>
                </Container>
            </Navbar>

            <Container className="mt-4">
                <h2>Customer List</h2>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.id}>
                                <td>{customer.id}</td>
                                <td>{customer.name}</td>
                                <td>{customer.email}</td>
                                <td>{customer.phone}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>
        </>
    );
}

export default Dashboard;
