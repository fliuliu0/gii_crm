import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Table, Button, Alert, Modal, Form } from "react-bootstrap";

function CustomerProjects() {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newProject, setNewProject] = useState({
        project_name: "",
        budget: "",
        phase: "",
        manager: ""
    });
    const [managers, setManagers] = useState([]);


    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/projects/customers/${customerId}`)
            .then(res => setProjects(res.data))
            .catch(() => setError("Failed to load projects for this customer."));
    
        }, [customerId]);

        axios.get("http://127.0.0.1:5000/users")
            .then(response => {
                const projectManagers = response.data.filter(user => user.role === "Project Manager");
                setManagers(projectManagers);
            })
            .catch(error => console.error("Failed to load users:", error));
   

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProject(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        axios.post(`http://127.0.0.1:5000/projects/customers/${customerId}`, newProject)
            .then(res => {
                setProjects([...projects, res.data]);
                setShowModal(false);
                setNewProject({
                    project_name: "",
                    budget: "",
                    phase: "",
                    manager: ""
                });
            })
            .catch(() => setError("Failed to add new project."));
    };

    const handleDelete = (projectId) => {
        axios.delete(`http://127.0.0.1:5000/projects/${projectId}`)
            .then(() => {
                setProjects(projects.filter(project => project.id !== projectId));
            })
            .catch(() => setError("Failed to delete project."));
    };

    return (
        <Container className="mt-4">
            <Button variant="secondary" onClick={() => navigate(-1)}>Back to Customer Profile</Button>
            <Button variant="primary" className="ms-2" onClick={() => setShowModal(true)}>Add Project</Button>

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
                                    <Button 
                                        variant="danger" 
                                        size="sm" 
                                        className="ms-2"
                                        onClick={() => handleDelete(project.id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Add Project Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Project</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Project Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="project_name"
                                value={newProject.project_name}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Budget</Form.Label>
                            <Form.Control
                                type="number"
                                name="budget"
                                value={newProject.budget}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phase</Form.Label>
                            <Form.Select
                                name="phase"
                                value={newProject.phase}
                                onChange={handleInputChange}
                            >
                                <option value="" disabled>Select Project Phase</option>
                                <option value="Planning">Planning</option>
                                <option value="Development">Development</option>
                                <option value="Testing">Testing</option>
                                <option value="Deployment">Deployment</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Manager</Form.Label>
                            <Form.Select
                            name="manager"
                            value={newProject.manager}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Project Manager</option>
                            {managers.map(manager => (
                                <option key={manager.id} value={manager.name}>
                                    {manager.name} (ID: {manager.id})
                                </option>
                            ))}
                        </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleSubmit}>Add Project</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default CustomerProjects;
