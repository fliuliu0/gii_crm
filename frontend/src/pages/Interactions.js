import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Table, Button, Form, Alert } from "react-bootstrap";

function Interactions() {
    const { id } = useParams(); // Get customer ID from URL
    const [interactions, setInteractions] = useState([]);
    const [newInteraction, setNewInteraction] = useState({ interaction_type: "", details: "", file: null });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/interactions/${id}`)
            .then(response => setInteractions(response.data))
            .catch(() => setError("No interactions found."));
    }, [id]);

    const handleChange = (e) => {
        setNewInteraction({ ...newInteraction, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setNewInteraction({ ...newInteraction, file: e.target.files[0] });
    };

    const handleSubmit = () => {
        const formData = new FormData();
        formData.append("interaction_type", newInteraction.interaction_type);
        formData.append("details", newInteraction.details);
        if (newInteraction.file) {
            formData.append("file", newInteraction.file);
        }

        axios.post(`http://127.0.0.1:5000/interactions/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })
        .then(() => {
            setSuccess(true);
            window.location.reload();
        })
        .catch(() => setError("Failed to add interaction"));
    };

    return (
        <Container className="mt-4">
            <h2>Customer Interactions</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">Interaction added successfully!</Alert>}
            
            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Details</th>
                        <th>File</th>
                    </tr>
                </thead>
                <tbody>
                    {interactions.map((interaction) => (
                        <tr key={interaction.id}>
                            <td>{interaction.id}</td>
                            <td>{interaction.interaction_type}</td>
                            <td>{interaction.interaction_date}</td>
                            <td>{interaction.details}</td>
                            <td>{interaction.file_path ? <a href={`http://127.0.0.1:5000${interaction.file_path}`} target="_blank" rel="noopener noreferrer">View File</a> : "No File"}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <h3 className="mt-4">Add Interaction</h3>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Interaction Type</Form.Label>
                    <Form.Select name="interaction_type" onChange={handleChange}>
                        <option>Email</option>
                        <option>Call</option>
                        <option>Meeting</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Details</Form.Label>
                    <Form.Control type="text" name="details" onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>File Upload (Optional)</Form.Label>
                    <Form.Control type="file" onChange={handleFileChange} />
                </Form.Group>

                <Button variant="primary" onClick={handleSubmit}>Save Interaction</Button>
            </Form>
        </Container>
    );
}

export default Interactions;
