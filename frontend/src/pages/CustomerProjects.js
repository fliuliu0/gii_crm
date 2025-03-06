import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Card, Table, Button, Alert } from "react-bootstrap";

function CustomerProjects() {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/projects/customers/${customerId}`)
            .then(res => setProjects(res.data))
            .catch(() => setError("Failed to load projects for this customer."));
    }, [customerId]);

    return (
        <Container className="mt-4">
            <Button variant="secondary" onClick={() => navigate(-1)}>Back to Customer Profile</Button>

            <h2 className="mt-3">Projects for Customer #{customerId}</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            {projects.length === 0 ? (
                <Alert variant="info">No projects found for this customer.</Alert>
            ) : (
                <Table striped bordered hover className="mt-3">
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>Budget</th>
                            <th>Phase</th>
                            <th>Manager</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((project) => (
                            <tr key={project.id}>
                                <td>{project.project_name}</td>
                                <td>${project.budget}</td>
                                <td>{project.phase}</td>
                                <td>{project.manager}</td>
                                <td>
                                    <Button 
                                        variant="primary" 
                                        size="sm" 
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                    >
                                        View Details
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
}

export default CustomerProjects;
