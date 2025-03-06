import { useEffect, useState } from "react";
import axios from "axios";
import { Form, Button, Container, Spinner, Alert } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

function ProjectForm({ isEditing = false }) {
    const navigate = useNavigate();
    const { id } = useParams();  // Get project ID when editing
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({
        customer_id: "",
        project_name: "",
        budget: "",
        phase: "",
        manager: ""
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Fetch customers from backend for dropdown
    useEffect(() => {
        axios.get("http://127.0.0.1:5000/customers")
            .then(response => {
                setCustomers(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching customers:", error);
                setError("Failed to load customers");
                setLoading(false);
            });

        // ✅ If editing, fetch project data
        if (isEditing && id) {
            axios.get(`http://127.0.0.1:5000/projects/${id}`)
                .then(response => {
                    setFormData(response.data);
                })
                .catch(() => setError("Failed to load project details"));
        }
    }, [id, isEditing]);

    // ✅ Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ✅ Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const apiUrl = isEditing
            ? `http://127.0.0.1:5000/projects/${id}`
            : "http://127.0.0.1:5000/projects";
        const method = isEditing ? "put" : "post";

        axios({
            method: method,
            url: apiUrl,
            data: formData,
            headers: { "Content-Type": "application/json" }
        })
            .then(() => navigate("/projects"))
            .catch(() => setError("Failed to submit project"));
    };

    return (
        <Container className="mt-4">
            <h2>{isEditing ? "Edit Project" : "Add New Project"}</h2>

            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && (
                <Form onSubmit={handleSubmit}>
                    {/* ✅ Dropdown for selecting Customer */}
                    <Form.Group className="mb-3">
                        <Form.Label>Customer</Form.Label>
                        <Form.Select name="customer_id" value={formData.customer_id} onChange={handleChange} required>
                            <option value="">Select Customer</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.email} ({customer.name})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Project Name</Form.Label>
                        <Form.Control type="text" name="project_name" value={formData.project_name} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Budget</Form.Label>
                        <Form.Control type="number" name="budget" value={formData.budget} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Phase</Form.Label>
                        <Form.Control type="text" name="phase" value={formData.phase} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Manager</Form.Label>
                        <Form.Control type="text" name="manager" value={formData.manager} onChange={handleChange} required />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        {isEditing ? "Update Project" : "Create Project"}
                    </Button>
                </Form>
            )}
        </Container>
    );
}

export default ProjectForm;
