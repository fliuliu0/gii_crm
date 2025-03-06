import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Table, Button, Form, Modal, Alert } from "react-bootstrap";

function Tasks() {
    const { projectId } = useParams();
    const [tasks, setTasks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newTask, setNewTask] = useState({ description: "", due_date: "", assigned_to: "", status: "Pending" });
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/tasks/projects/${projectId}`)
            .then(res => setTasks(res.data))
            .catch(() => setError("Failed to load tasks."));
    }, [projectId]);

    const handleAddTask = () => {
        axios.post(`http://127.0.0.1:5000/tasks/projects/${projectId}`, newTask)
            .then(() => {
                setShowModal(false);
                window.location.reload();
            })
            .catch(() => setError("Failed to add task."));
    };

    return (
        <Container className="mt-4">
            {error && <Alert variant="danger">{error}</Alert>}

            <h2>Project Tasks</h2>
            <Button variant="primary" onClick={() => setShowModal(true)}>Add Task</Button>

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
                    {tasks.map((t) => (
                        <tr key={t.id}>
                            <td>{t.description}</td>
                            <td>{t.due_date}</td>
                            <td>{t.assigned_to}</td>
                            <td>{t.status}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control type="text" onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Due Date</Form.Label>
                            <Form.Control type="date" onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Assigned To</Form.Label>
                            <Form.Control type="text" onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Status</Form.Label>
                            <Form.Select onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                    <Button variant="success" onClick={handleAddTask}>Save</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default Tasks;
