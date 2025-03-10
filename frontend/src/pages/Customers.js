import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Button, Navbar, Nav, Table, Alert, Form } from "react-bootstrap";

function Customers() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [error, setError] = useState(null);

    const [industryFilter, setIndustryFilter] = useState("");
    const [salesStageFilter, setSalesStageFilter] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [tagFilter, setTagFilter] = useState("");

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/customers", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then((response) => {
            setCustomers(response.data);
            setFilteredCustomers(response.data);
        })
        .catch(() => setError("Failed to load customers."));
    }, []);

    useEffect(() => {
        let filtered = customers;

        if (industryFilter) {
            filtered = filtered.filter(c => c.industry === industryFilter);
        }
        if (salesStageFilter) {
            filtered = filtered.filter(c => c.sales_stage === salesStageFilter);
        }
        if (locationFilter) {
            filtered = filtered.filter(c => c.location === locationFilter);
        }
        if (tagFilter) {
            filtered = filtered.filter(c => c.tags === tagFilter);
        }

        setFilteredCustomers(filtered);
    }, [industryFilter, salesStageFilter, locationFilter, tagFilter, customers]);

    const getUniqueValues = (key) => [...new Set(customers.map(c => c[key]))];

    return (
        <>
            <Container className="mt-4">
                <h2>Customer List</h2>
                {error && <Alert variant="danger">{error}</Alert>}

                {/* ✅ Filter Section */}
                <Form className="d-flex gap-3 my-3">
                    <Form.Group>
                        <Form.Label>Industry</Form.Label>
                        <Form.Select onChange={(e) => setIndustryFilter(e.target.value)}>
                            <option value="">All</option>
                            {getUniqueValues("industry").map((ind) => (
                                <option key={ind} value={ind}>{ind}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Location</Form.Label>
                        <Form.Select onChange={(e) => setLocationFilter(e.target.value)}>
                            <option value="">All</option>
                            {getUniqueValues("location").map((loc) => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Tags</Form.Label>
                        <Form.Select onChange={(e) => setTagFilter(e.target.value)}>
                            <option value="">All</option>
                            <option value="VIP">VIP</option>
                            <option value="Potential">Potential</option>
                            <option value="Archived">Archived</option>
                        </Form.Select>
                    </Form.Group>
                </Form>

                {/* ✅ Table with Tag Column */}
                <div className="table-responsive">
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Company</th>
                                <th>Industry</th>
                                <th>Location</th>
                                <th>Tags</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id}>
                                    <td>{customer.id}</td>
                                    <td>{customer.name}</td>
                                    <td>{customer.email}</td>
                                    <td>{customer.company}</td>
                                    <td>{customer.industry}</td>
                                    <td>{customer.location}</td>
                                    <td>{customer.tags}</td>
                                    <td>
                                        <Button variant="info" size="sm" onClick={() => navigate(`/customers/${customer.id}`)}>
                                            View Profile
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Container>
        </>
    );
}

export default Customers;
