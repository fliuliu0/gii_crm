import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Card, Table, Button, Form, Modal, Alert } from "react-bootstrap";

function ProjectDetails() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [logs, setLogs] = useState([]);
    const [resourceRequests, setResourceRequests] = useState([]);
    
    const [showLogModal, setShowLogModal] = useState(false);
    const [newLog, setNewLog] = useState({ change_type: "", comment: "", responsible_person: ""});

    const [showResourceModal, setShowResourceModal] = useState(false);
    const [newResource, setNewResource] = useState({ request_type: "", description: "Medium", requested_by: ""});

    const [error, setError] = useState(null);

    
    useEffect(() => {
        // Fetch Project Details
        axios.get(`http://127.0.0.1:5000/projects/${projectId}`)
            .then(res => setProject(res.data))
            .catch(() => setError("Failed to load project details"));

        // Fetch Tasks
        axios.get(`http://127.0.0.1:5000/tasks/projects/${projectId}`)
            .then(res => setTasks(res.data))
            .catch(() => setError("Failed to load tasks"));

        // Fetch Logs
        axios.get(`http://127.0.0.1:5000/update_logs/projects/${projectId}`)
            .then(res => setLogs(res.data))
            .catch(() => setError("Failed to load update logs"));

        // Fetch Resource Requests
        axios.get(`http://127.0.0.1:5000/support_requests/projects/${projectId}`)
            .then(res => setResourceRequests(res.data))
            .catch(() => setError("Failed to load resource requests"));

    }, [projectId]);

    const handleAddLog = async () => {
        try {
            const logData = {
                project_id: projectId,
                change_type: newLog.change_type || '', // Ensure this field is provided
                responsible_person: newLog.responsible_person || 'Anonymous', // Fallback if userProfile is undefined
                timestamp: new Date().toISOString(),
                comment: newLog.comment || '' // Ensure this field is provided
            };
    
            const headers = {
                'Content-Type': 'application/json',
                // Include other necessary headers, such as authorization tokens
            };
    
            await axios.post(`http://127.0.0.1:5000/update_logs/projects/${projectId}`, logData, { headers });
            console.log(logData)
            setShowLogModal(false);
            window.location.reload();
        } catch (error) {
            setError("Failed to add update log.");
            console.error('Error details:', error.response || error.message || error);
        }
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewLog(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleClose = () => {
        setShowLogModal(false);
        setShowResourceModal(false);
    };

    const onSave = () => {
        if (newLog.change_type === "") {
            alert("Please select a change type.");
            return;
        }
        handleAddLog(newLog);
        handleClose();
    };
    
    const handleAddResourceRequest = async () => {
        try {
            const resourceData = {
                project_id: projectId, // Ensure projectId is available in your component
                request_type: newResource.request_type,
                description: newResource.description,
                requested_by: newResource.requested_by,
                status: 'Pending' // Default status
            };
            await axios.post(`http://127.0.0.1:5000/support_requests/projects/${projectId}`, resourceData);
            setShowResourceModal(false);
            window.location.reload();
        } catch {
            setError("Failed to add resource request.");
        }
    };    


    return (
        <Container className="mt-4">
            <Button variant="secondary" onClick={() => navigate(-1)}>Back to Projects</Button>

            {error && <Alert variant="danger">{error}</Alert>}

            {project && (
                <Card className="mb-4 mt-3">
                    <Card.Body>
                        <Card.Title>{project.project_name}</Card.Title>
                        <Card.Text>
                            <strong>Budget:</strong> ${project.budget} <br />
                            <strong>Phase:</strong> {project.phase} <br />
                            <strong>Manager:</strong> {project.manager}
                        </Card.Text>
                    </Card.Body>
                </Card>
            )}

            <h3>Tasks</h3>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Due Date</th>
                        <th>Assigned To</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map(task => (
                        <tr key={task.id}>
                            <td>{task.description}</td>
                            <td>{task.due_date}</td>
                            <td>{task.assigned_to}</td>
                            <td>{task.status}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <h3>Update Logs</h3>
            <Button variant="info" onClick={() => setShowLogModal(true)}>Add Log</Button>
            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Change Type</th>
                        <th>Comment</th>
                        <th>Responsible Person</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map(log => (
                        <tr key={log.id}>
                            <td>{log.timestamp}</td>
                            <td>{log.change_type}</td>
                            <td>{log.comment}</td>
                            <td>{log.responsible_person}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <h3>Resource Requests</h3>
            <Button variant="warning" onClick={() => setShowResourceModal(true)}>Request Resource</Button>
            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>Request Type</th>
                        <th>Description</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {resourceRequests.map(resource => (
                        <tr key={resource.id}>
                            <td>{resource.request_type}</td>
                            <td>{resource.description}</td>
                            <td>{resource.status}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Log Modal */}
            <Modal show={showLogModal} onHide={handleClose}>
            ` <Modal.Header closeButton>
                    <Modal.Title>Add Update Log</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Change Type</Form.Label>
                            <Form.Select
                                name="change_type"
                                value={newLog.change_type}
                                onChange={handleChange}
                            >
                                <option value="" disabled>Select change type</option>
                                <option value="Addition">Addition</option>
                                <option value="Modification">Modification</option>
                            </Form.Select>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Comment</Form.Label>
                            <Form.Control
                                type="text"
                                name="comment"
                                value={newLog.comment}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Responsible Person</Form.Label>
                            <Form.Control
                                type="text"
                                name="responsible_person"
                                value={newLog.responsible_person}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                    <Button variant="primary" onClick={onSave}>Save Log</Button>
                </Modal.Footer>
            </Modal>`

            {/* Resource Request Modal */}
            <Modal show={showResourceModal} onHide={() => setShowResourceModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Request Resource</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Request Type</Form.Label>
                            <Form.Select
                                value={newResource.request_type || ""}
                                onChange={(e) => setNewResource({ ...newResource, request_type: e.target.value })}
                            >
                                <option value="" disabled hidden>
                                    Select request type
                                </option>
                                <option value="Technical">Technical</option>
                                <option value="Financial">Financial</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Request Description</Form.Label>
                            <Form.Control type="text" onChange={(e) => setNewResource({ ...newResource, description: e.target.value })} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Requested By</Form.Label>
                            <Form.Control type="text" onChange={(e) => setNewResource({ ...newResource, requested_by: e.target.value })} />
                        </Form.Group>
                        
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowResourceModal(false)}>Close</Button>
                    <Button variant="warning" onClick={handleAddResourceRequest}>Submit Request</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default ProjectDetails;
