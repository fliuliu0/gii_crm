import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Table, Button, Modal, Form, Alert } from "react-bootstrap";

function CustomerSales() {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [salesOpportunities, setSalesOpportunities] = useState([]);
    const [salesReps, setSalesReps] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newOpportunity, setNewOpportunity] = useState({
        customer_id: customerId,
        opportunity: "",
        sales_stage: "",
        revenue: "",
        owner: ""
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSalesOpportunities();
        fetchSalesReps();
    }, [customerId]);

    const fetchSalesOpportunities = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/sales_opportunity/customer/${customerId}`);
            setSalesOpportunities(response.data);
        } catch (err) {
            setError("Failed to fetch sales opportunities.");
        }
    };

    const fetchSalesReps = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:5000/users");
            const filteredUsers = response.data.filter(user => user.role === "Sales");
            setSalesReps(filteredUsers);
        } catch (err) {
            setError("Failed to load sales representatives.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewOpportunity(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            await axios.post("http://127.0.0.1:5000/sales_opportunity", newOpportunity);
            fetchSalesOpportunities();
            setShowModal(false);
            setNewOpportunity({ customer_id: customerId, opportunity: "", sales_stage: "", revenue: "", owner: "" });
        } catch (err) {
            setError("Failed to add sales opportunity.");
        }
    };

    const handleStageChange = async (id, sales_stage) => {
        try {
            await axios.put(`http://127.0.0.1:5000/sales_opportunity/${id}`, { sales_stage });
            fetchSalesOpportunities();
        } catch (err) {
            setError("Failed to update sales stage.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/sales_opportunity/${id}`);
            fetchSalesOpportunities();
        } catch (err) {
            setError("Failed to delete sales opportunity.");
        }
    };

    return (
        <Container className="mt-4">
            <h2>Sales Opportunities</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            {/* ✅ Back and Add Opportunity Buttons */}
            <div className="d-flex justify-content-between mb-3">
                <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
                <Button variant="primary" onClick={() => setShowModal(true)}>Add Sales Opportunity</Button>
            </div>

            {/* ✅ Sales Opportunities Table */}
            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>Opportunity</th>
                        <th>Sales Stage</th>
                        <th>Revenue</th>
                        <th>Sales Representative</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {salesOpportunities.map((op) => (
                        <tr key={op.id}>
                            <td>{op.opportunity}</td>
                            <td>
                                <Form.Select
                                    value={op.sales_stage}
                                    onChange={(e) => handleStageChange(op.id, e.target.value)}
                                >
                                    <option value="Proposal Sent">Proposal Sent</option>
                                    <option value="Negotiation">Negotiation</option>
                                    <option value="Qualified">Qualified</option>
                                </Form.Select>
                            </td>
                            <td>${op.revenue}</td>
                            <td>
                                {salesReps.find(rep => rep.id === op.owner)?.name || "Unknown"} (ID: {op.owner})
                            </td>
                            <td>
                                <Button variant="danger" onClick={() => handleDelete(op.id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* ✅ Add Opportunity Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Sales Opportunity</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {/* ✅ Customer ID (Auto-filled) */}
                        <Form.Group className="mb-3">
                            <Form.Label>Customer</Form.Label>
                            <Form.Control
                                type="text"
                                value={`Customer ID: ${customerId}`}
                                disabled
                            />
                        </Form.Group>

                        {/* ✅ Opportunity Name */}
                        <Form.Group className="mb-3">
                            <Form.Label>Opportunity</Form.Label>
                            <Form.Control
                                type="text"
                                name="opportunity"
                                value={newOpportunity.opportunity}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        {/* ✅ Sales Stage Dropdown */}
                        <Form.Group className="mb-3">
                            <Form.Label>Sales Stage</Form.Label>
                            <Form.Select
                                name="sales_stage"
                                value={newOpportunity.sales_stage}
                                onChange={handleChange}
                            >
                                <option value="">Select Sales Stage</option>
                                <option value="Proposal Sent">Proposal Sent</option>
                                <option value="Negotiation">Negotiation</option>
                                <option value="Qualified">Qualified</option>
                            </Form.Select>
                        </Form.Group>

                        {/* ✅ Revenue Input */}
                        <Form.Group className="mb-3">
                            <Form.Label>Revenue</Form.Label>
                            <Form.Control
                                type="number"
                                name="revenue"
                                value={newOpportunity.revenue}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        {/* ✅ Sales Representative Dropdown */}
                        <Form.Group className="mb-3">
                            <Form.Label>Sales Representative</Form.Label>
                            <Form.Select
                                name="owner"
                                value={newOpportunity.owner}
                                onChange={handleChange}
                            >
                                <option value="">Select Sales Representative</option>
                                {salesReps.map(rep => (
                                    <option key={rep.id} value={rep.id}>
                                        {rep.name} (ID: {rep.id})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Button variant="primary" onClick={handleSubmit}>Add Opportunity</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default CustomerSales;
