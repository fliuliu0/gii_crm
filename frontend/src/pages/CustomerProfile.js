import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Card, Table, Button, Form, Modal, Alert } from "react-bootstrap";

function CustomerProfile() {
    const { id } = useParams();
    const [opportunities, setOpportunities] = useState([]);

    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [interactions, setInteractions] = useState([]);
    
    const [showInteractionModal, setShowInteractionModal] = useState(false);
    const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);

    const [newInteraction, setNewInteraction] = useState({ interaction_type: "Email", details: "" });
    const [updatedCustomer, setUpdatedCustomer] = useState({});

    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/customers/${id}`)
            .then(res => setCustomer(res.data))
            .catch(() => setError("Failed to load customer details"));

        axios.get(`http://127.0.0.1:5000/interactions/${id}`)
            .then(res => setInteractions(res.data))
            .catch(() => setError("Failed to load interactions"));

        if (id) {
            axios.get(`http://127.0.0.1:5000/sales_opportunity/customer/${id}`)
                .then((res) => setOpportunities(res.data))
                .catch(() => setError("Failed to fetch sales opportunities."));
        } else {
            axios.get("http://127.0.0.1:5000/sales_opportunity")
                .then((res) => setOpportunities(res.data))
                .catch(() => setError("Failed to fetch sales opportunities."));
        }
    }, [id]);

    // ✅ Open Edit Customer Modal & Load Current Data
    const openEditCustomerModal = () => {
        setUpdatedCustomer({
            name: customer?.name,
            email: customer?.email,
            phone: customer?.phone,
            industry: customer?.industry,
            location: customer?.location,
            technical_evaluator: customer?.technical_evaluator,
        });
        setShowEditCustomerModal(true);
    };
    
    // ✅ Handle Customer Update
    const handleCustomerUpdate = async () => {
        try {
            await axios.put(`http://127.0.0.1:5000/customers/${id}`, updatedCustomer, {
                headers: { "Content-Type": "application/json" },
            });
            setShowEditCustomerModal(false);
            window.location.reload();
        } catch {
            setError("Failed to update customer profile");
        }
    };
    

    // ✅ Update customer tag via API
    const handleTagChange = (e) => {
        const newTag = e.target.value;
        axios.put(`http://127.0.0.1:5000/customers/${id}`, { tags: newTag }, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then(() => {
            setCustomer(prev => ({ ...prev, tags: newTag }));
        })
        .catch(() => alert("Failed to update tag"));
    };


    const handleFileUpload = (event) => {
        setFile(event.target.files[0]);
    };

    const handleInteractionSubmit = async () => {
        const formData = new FormData();
        formData.append("interaction_type", newInteraction.interaction_type);
        formData.append("details", newInteraction.details);
        if (file) formData.append("file", file);

        try {
            await axios.post(`http://127.0.0.1:5000/interactions/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setShowInteractionModal(false);
            window.location.reload();
        } catch {
            setError("Failed to add interaction");
        }
    };

    return (
        <Container className="mt-4">
            {error && <Alert variant="danger">{error}</Alert>}
            <Button variant="secondary" onClick={() => navigate(-1)}>Back to Customers</Button>
            {customer && (
            <Card className="mb-4">
                <Card.Body>
                <Card.Title>{customer.name} ({customer.company})</Card.Title>
                <Card.Text>
                    <strong>Email:</strong> {customer.email} <br />
                    <strong>Phone:</strong> {customer.phone} <br />
                    <strong>Industry:</strong> {customer.industry} <br />
                    <strong>Location:</strong> {customer.location} <br />
                    <strong>Technical Evaluator:</strong> {customer.technical_evaluator} <br />
                    <strong>Tag:</strong>
                    <Form.Select value={customer.tags} onChange={handleTagChange} className="mt-2">
                        <option value="VIP">VIP</option>
                        <option value="Potential">Potential</option>
                        <option value="Archived">Archived</option>
                    </Form.Select>
                </Card.Text>

                {/* ✅ Buttons spaced out */}
                <div className="d-flex justify-content-between mt-3">
                    <Button variant="info" onClick={openEditCustomerModal}>
                        Edit Customer Profile
                    </Button>
                    <Button 
                        variant="info"
                        onClick={() => navigate(`/projects/customers/${customer.id}`)}
                    >
                        View Projects
                    </Button>
                    <Button 
                        variant="info"
                        onClick={() => navigate(`/sales/customer/${customer.id}`)}
                    >
                        View Sales Opportunity
                    </Button>
                </div>
            </Card.Body>
            </Card>
        )}

            <h3>Interaction History</h3>
            <Button variant="primary" onClick={() => setShowInteractionModal(true)}>Add Interaction</Button>
            <Table striped bordered hover className="mt-3">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Details</th>
                        <th>File</th>
                    </tr>
                </thead>
                <tbody>
                    {interactions.map((interaction) => (
                        <tr key={interaction.id}>
                            <td>{interaction.interaction_type}</td>
                            <td>{interaction.interaction_date}</td>
                            <td>{interaction.details}</td>
                            <td>{interaction.file_path ? <a href={`http://127.0.0.1:5000/${interaction.file_path}`} target="_blank">View File</a> : "N/A"}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* ✅ Customer Edit Modal */}
            <Modal show={showEditCustomerModal} onHide={() => setShowEditCustomerModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Customer Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={updatedCustomer.name || ""}
                                onChange={(e) => setUpdatedCustomer({ ...updatedCustomer, name: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control 
                                type="email" 
                                value={updatedCustomer.email || ""}
                                onChange={(e) => setUpdatedCustomer({ ...updatedCustomer, email: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={updatedCustomer.phone || ""}
                                onChange={(e) => setUpdatedCustomer({ ...updatedCustomer, phone: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Industry</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={updatedCustomer.industry || ""}
                                onChange={(e) => setUpdatedCustomer({ ...updatedCustomer, industry: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Location</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={updatedCustomer.location || ""}
                                onChange={(e) => setUpdatedCustomer({ ...updatedCustomer, location: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Technical Evaluator</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={updatedCustomer.technical_evaluator || ""}
                                onChange={(e) => setUpdatedCustomer({ ...updatedCustomer, technical_evaluator: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditCustomerModal(false)}>Close</Button>
                    <Button variant="success" onClick={handleCustomerUpdate}>Save Changes</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showInteractionModal} onHide={() => setShowInteractionModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Interaction</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {/* Interaction Type Dropdown */}
                        <Form.Group className="mb-3">
                            <Form.Label>Interaction Type</Form.Label>
                            <Form.Select 
                                name="interaction_type" 
                                onChange={(e) => setNewInteraction({ ...newInteraction, interaction_type: e.target.value })}
                            >
                                <option>Email</option>
                                <option>Call</option>
                                <option>Meeting</option>
                                <option>File Upload</option>
                            </Form.Select>
                        </Form.Group>

                        {/* Details Input Field */}
                        <Form.Group className="mb-3">
                            <Form.Label>Details</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="details" 
                                placeholder="Enter interaction details..." 
                                onChange={(e) => setNewInteraction({ ...newInteraction, details: e.target.value })} 
                            />
                        </Form.Group>

                        {/* File Upload (Only enabled if "File Upload" is selected) */}
                        {newInteraction.interaction_type === "File Upload" && (
                            <Form.Group className="mb-3">
                                <Form.Label>Upload File (Optional)</Form.Label>
                                <Form.Control type="file" onChange={handleFileUpload} />
                            </Form.Group>
                        )}
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowInteractionModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleInteractionSubmit}>Save Interaction</Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
}

export default CustomerProfile;
