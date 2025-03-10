import React, { useEffect, useState } from "react";
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
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [newTask, setNewTask] = useState({ description: "", due_date: "", assigned_to: "", status: "Pending" });
    const [users, setUsers] = useState({}); // Store user ID to Name mapping
    const [showLogModal, setShowLogModal] = useState(false);
    const [newLog, setNewLog] = useState({ change_type: "", comment: "", responsible_person: "" });
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [newResource, setNewResource] = useState({ request_type: "", description: "", requested_by: "" });
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null); // Store current logged-in user
    const [funding, setFunding] = useState(null);
    const [projectManagers, setProjectManagers] = useState([]);

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/users")  // ✅ Adjust this API endpoint if needed
            .then(res => {
                const managers = res.data.filter(user => user.role === "Project Manager");
                setProjectManagers(managers);
            })
            .catch(err => console.error("Failed to fetch project managers", err));
    }, []);


    useEffect(() => {
        // Fetch Project Details
        axios.get(`http://127.0.0.1:5000/projects/${projectId}`)
            .then(res => setProject(res.data))
            .catch(() => setError("Failed to load project details"));

        // Fetch Tasks
        axios.get(`http://127.0.0.1:5000/tasks/projects/${projectId}`)
            .then(res => {
                setTasks(res.data);
                fetchUserNames(res.data);
            })
            .catch(() => setError("Failed to load tasks"));

        // Fetch Logs
        axios.get(`http://127.0.0.1:5000/update_logs/projects/${projectId}`)
            .then(res => setLogs(res.data))
            .catch(() => setError("Failed to load update logs"));

        // Fetch Resource Requests
        axios.get(`http://127.0.0.1:5000/support_requests/projects/${projectId}`)
            .then(res => setResourceRequests(res.data))
            .catch(() => setError("Failed to load resource requests"));
            
        axios.get(`http://127.0.0.1:5000/projects/${projectId}/funding`)
        .then(res => setFunding(res.data))
        .catch(() => setError("Failed to load funding information"));
        
        
    }, [projectId]);

    // Fetch Current Logged-In User
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        axios.get("http://127.0.0.1:5000/users/profile", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((response) => setCurrentUser(response.data))
        .catch((err) => {
            console.error("Failed to load user profile", err);
            setError("Failed to load user profile. Please try again.");
        });
    }, [navigate]);


    const fetchUserNames = async (tasks) => {
        const userIds = [...new Set(tasks.map(task => task.assigned_to))]; // Get unique user IDs
        let userData = { ...users };

        await Promise.all(userIds.map(async (userId) => {
            if (!userData[userId]) {
                try {
                    const response = await axios.get(`http://127.0.0.1:5000/users/${userId}`);
                    userData[userId] = response.data.name;
                } catch {
                    userData[userId] = "Unknown"; // Fallback if user not found
                }
            }
        }));

        setUsers(userData);
    };

    const handleInputChange = (e, setState) => {
        const { name, value } = e.target;
        setState(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handlePhaseChange = async (newPhase) => {
        try {
            // Update the phase locally
            const updatedProject = { ...project, phase: newPhase };
            setProject(updatedProject);

            // Update the phase on the server
            await axios.put(`http://127.0.0.1:5000/projects/${project.id}`, { phase: newPhase });
        } catch (err) {
            setError('Failed to update project phase.');
        }
    };

    const handleAddTask = async () => {
        try {
            const taskData = {
                project_id: projectId,
                description: newTask.description,
                due_date: newTask.due_date,
                assigned_to: newTask.assigned_to,
                status: newTask.status
            };
            const res = await axios.post(`http://127.0.0.1:5000/tasks/projects/${projectId}`, taskData);
            setTasks([...tasks, res.data]);
            setShowTaskModal(false);
            setNewTask({ description: "", due_date: "", assigned_to: "", status: "Pending" });
        } catch {
            setError("Failed to add new task.");
        }
    };

    const handleTaskStatusChange = async (taskId, newStatus) => {
        try {
            // Update the status locally
            const updatedTasks = tasks.map(task =>
                task.id === taskId ? { ...task, status: newStatus } : task
            );
            setTasks(updatedTasks);

            // Update the status on the server
            await axios.put(`http://127.0.0.1:5000/tasks/${taskId}`, { status: newStatus });
        } catch (err) {
            setError('Failed to update task status.');
        }
    };

    const handleResourceStatusChange = async (resourceId, newStatus) => {
        try {
            // Update the status locally
            const updatedResources = resourceRequests.map(resource =>
                resource.id === resourceId ? { ...resource, status: newStatus } : resource
            );
            setResourceRequests(updatedResources);

            // Update the status on the server
            await axios.put(`http://127.0.0.1:5000/support_requests/${resourceId}`, { status: newStatus });
        } catch (err) {
            setError('Failed to update resource request status.');
        }
    };


    const handleAddLog = async () => {
        try {
            const logData = {
                project_id: projectId,
                change_type: newLog.change_type,
                comment: newLog.comment,
                responsible_person: currentUser.name, 
                user_id: currentUser.id,
                timestamp: new Date().toISOString()
            };
            const res = await axios.post(`http://127.0.0.1:5000/update_logs/projects/${projectId}`, logData);
            setLogs([...logs, res.data]);
            setShowLogModal(false);
            setNewLog({ change_type: "", comment: "", responsible_person: "" });
        } catch {
            setError("Failed to add update log.");
        }
    };

    const handleAddResourceRequest = async () => {
        try {
            const resourceData = {
                project_id: projectId,
                request_type: newResource.request_type,
                description: newResource.description,
                requested_by: currentUser.name, 
                status: 'Pending'
            };
            const res = await axios.post(`http://127.0.0.1:5000/support_requests/projects/${projectId}`, resourceData);
            setResourceRequests([...resourceRequests, res.data]);
            setShowResourceModal(false);
            setNewResource({ request_type: "", description: "", requested_by: "" });
        } catch {
            setError("Failed to add resource request.");
        }
    };

    const handleFundingStatusChange = async (newStatus) => {
        // ✅ Map numbers to valid status strings
        const statusMapping = {
            1: "Funded",
            2: "Approved",
            3: "Pending",
            4: "Rejected"
        };
    
        const mappedStatus = statusMapping[newStatus] || newStatus;  // Ensure it's a string
    
        console.log("Updating funding status to:", mappedStatus); // ✅ DEBUG LOG
    
        try {
            const response = await axios.put(
                `http://127.0.0.1:5000/projects/${projectId}/funding`, 
                { funding_status: mappedStatus }  // ✅ Now always sends a string
            );
    
            console.log("Funding status update response:", response.data); // ✅ DEBUG LOG
    
            setFunding(prevFunding => ({
                ...prevFunding,
                funding_status: mappedStatus,
                approval_date: mappedStatus === "Approved" || mappedStatus === "Funded" ? new Date().toISOString() : null
            }));
        } catch (err) {
            console.error("Failed to update funding status", err.response ? err.response.data : err);
        }
    };

    return (
        <Container className="mt-4">
            <Button variant="secondary" onClick={() => navigate(-1)}>Back to Projects</Button>
    
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
    
            {project && (
                <Card className="mb-4 mt-3">
                    <Card.Body>
                        <Card.Title>{project.project_name}</Card.Title>
                        <Card.Text>
                            <strong>Budget:</strong> ${project.budget || "N/A"}<br />
                            <strong>Phase:</strong>
                            <Form.Control
                                as="select"
                                value={project.phase}
                                onChange={(e) => handlePhaseChange(e.target.value)}
                                className="d-inline-block w-auto ml-2"
                            >
                                <option value="Planning">Planning</option>
                                <option value="Development">Development</option>
                                <option value="Testing">Testing</option>
                            </Form.Control>
                            <br />
                            <strong>Manager:</strong> {project.manager}<br />
                        </Card.Text>
                    </Card.Body>
                </Card>
            )}
    
    <h3>Funding Information</h3>
    {funding ? (
        <Table striped bordered hover className="mt-3">
            <thead>
                <tr>
                    <th>Status</th>
                    <th>Budget</th>
                    <th>Approval Date</th>
                    <th>Decision Maker</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <Form.Select
                            value={funding.funding_status || "Pending"} 
                            onChange={(e) => handleFundingStatusChange(e.target.value)}
                        >
                            <option value="Funded">Funded</option>
                            <option value="Approved">Approved</option>
                            <option value="Pending">Pending</option>
                            <option value="Rejected">Rejected</option>
                        </Form.Select>
                    </td>
                    <td>${funding.budget}</td>
                    <td>{funding.approval_date || "N/A"}</td>
                    <td>{funding.decision_maker}</td>
                </tr>
            </tbody>
        </Table>
    ) : <p>Loading funding information...</p>}

    <h3>Tasks</h3>
            <Button variant="success" onClick={() => setShowTaskModal(true)}>Add Task</Button>
            <Table striped bordered hover className="mt-3">
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
                            <td>{users[task.assigned_to] || "Loading..."} (User ID: {task.assigned_to}) </td>
                            <td>
                                <Form.Control
                                    as="select"
                                    value={task.status}
                                    onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </Form.Control>
                            </td>
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
                        <th>Logged By</th>
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
                        <th>Requested By</th>
                    </tr>
                </thead>
                <tbody>
                    {resourceRequests.map(resource => (
                        <tr key={resource.id}>
                            <td>{resource.request_type}</td>
                            <td>{resource.description}</td>
                            <td>
                                <Form.Control
                                    as="select"
                                    value={resource.status}
                                    onChange={(e) => handleResourceStatusChange(resource.id, e.target.value)}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </Form.Control>
                            </td>
                            <td>{resource.requested_by}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
    
            {/* Add Task Modal */}
            <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                name="description"
                                value={newTask.description}
                                onChange={(e) => handleInputChange(e, setNewTask)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Due Date</Form.Label>
                            <Form.Control
                                type="date"
                                name="due_date"
                                value={newTask.due_date}
                                onChange={(e) => handleInputChange(e, setNewTask)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Assigned To (Select Project Manager)</Form.Label>
                            <Form.Select
                                name="assigned_to"
                                value={newTask.assigned_to}
                                onChange={(e) => handleInputChange(e, setNewTask)}
                            >
                                <option value="" disabled>Select a Project Manager</option>
                                {projectManagers.map(manager => (
                                    <option key={manager.id} value={manager.id}>
                                        {manager.name} (ID: {manager.id})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                name="status"
                                value={newTask.status}
                                onChange={(e) => handleInputChange(e, setNewTask)}
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowTaskModal(false)}>Close</Button>
                    <Button variant="success" onClick={handleAddTask}>Add Task</Button>
                </Modal.Footer>
            </Modal>
    
            {/* Add Log Modal */}
            <Modal show={showLogModal} onHide={() => setShowLogModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Update Log</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Change Type</Form.Label>
                            <Form.Select
                                name="change_type"
                                value={newLog.change_type}
                                onChange={(e) => handleInputChange(e, setNewLog)}
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
                                onChange={(e) => handleInputChange(e, setNewLog)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Responsible Person</Form.Label>
                            <Form.Control
                                type="text"
                                name="responsible_person"
                                value={currentUser ? `${currentUser.name} (User ID: ${currentUser.id})` : "Loading..."}
                                disabled 
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLogModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleAddLog}>Save Log</Button>
                </Modal.Footer>
            </Modal>

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
                            <Form.Control 
                                type="text" 
                                value={currentUser ? `${currentUser.name} (User ID: ${currentUser.id})` : "Loading..."}
                                disabled 
                                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                            />
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
