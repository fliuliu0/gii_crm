import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Table, Button, Navbar, Nav, Alert, Form } from "react-bootstrap";

function Projects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [customers, setCustomers] = useState({});
    const [error, setError] = useState(null);
    const [customerFilter, setCustomerFilter] = useState("");

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/projects")
            .then(response => setProjects(response.data))
            .catch(() => setError("Failed to load projects."));
        
        axios.get("http://127.0.0.1:5000/customers")
            .then(response => {
                const customerMap = {};
                response.data.forEach(customer => {
                    customerMap[customer.id] = customer.name;
                });
                setCustomers(customerMap);
            })
            .catch(() => setError("Failed to load customer data."));
    }, []);

    const filteredProjects = projects.filter(p =>
        customerFilter ? customers[p.customer_id] === customerFilter : true
    );

    return (
        <>
            <Container className="mt-4">
                <h2>All Projects</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                
                {/* Filter by Customer */}
                <Form.Group className="mb-3">
                    <Form.Label>Filter by Customer</Form.Label>
                    <Form.Select onChange={(e) => setCustomerFilter(e.target.value)}>
                        <option value="">All</option>
                        {Object.values(customers).map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
                
                {/* Projects Table */}
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>Customer</th>
                            <th>Budget</th>
                            <th>Phase</th>
                            <th>Manager</th>
                            <th>Details</th> {/* New column for details link */}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map(project => (
                            <tr key={project.id}>
                                <td>{project.project_name}</td>
                                <td>{customers[project.customer_id]}</td>
                                <td>${project.budget}</td>
                                <td>{project.phase}</td>
                                <td>{project.manager}</td>
                                <td>
                                    <Button
                                        variant="primary"
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                    >
                                        View Details
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>
        </>
    );
}

export default Projects;
