import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Card, Table, Button, Form, Modal, Alert } from "react-bootstrap";

function CustomerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [funding, setFunding] = useState([]);
    const [interactions, setInteractions] = useState([]);
    
    const [showInteractionModal, setShowInteractionModal] = useState(false);
    const [showFundingModal, setShowFundingModal] = useState(false);
    const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);

    const [newInteraction, setNewInteraction] = useState({ interaction_type: "Email", details: "" });
    const [updatedFunding, setUpdatedFunding] = useState({});
    const [updatedCustomer, setUpdatedCustomer] = useState({});

    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/customers/${id}`)
            .then(res => setCustomer(res.data))
            .catch(() => setError("Failed to load customer details"));

        axios.get(`http://127.0.0.1:5000/funding/customers/${id}`)
            .then(res => setFunding(Array.isArray(res.data) ? res.data : [res.data])) // Wrap in array if needed
            .catch(() => {
                setError("Failed to load funding information");
                setFunding([]);
            });

        axios.get(`http://127.0.0.1:5000/interactions/${id}`)
            .then(res => setInteractions(res.data))
            .catch(() => setError("Failed to load interactions"));
    }, [id]);

    // ✅ Open Edit Customer Modal & Load Current Data
    const openEditCustomerModal = () => {
        setUpdatedCustomer({
            name: customer?.name,
            email: customer?.email,
            phone: customer?.phone,
            industry: customer?.industry,
            location: customer?.location,
            sales_stage: customer?.sales_stage,
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

    const handleFundingUpdate = async () => {
        console.log("Submitting funding update:", updatedFunding);
    
        try {
            const response = await axios.put(`http://127.0.0.1:5000/funding/customers/${id}`, updatedFunding, {
                headers: { "Content-Type": "application/json" },
            });
    
            console.log("Funding update successful:", response.data);
            setShowFundingModal(false);
            window.location.reload();
        } catch (error) {
            console.error("Funding update failed:", error.response ? error.response.data : error.message);
            setError("Failed to update funding information");
        }
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
                            <strong>Sales Stage:</strong> {customer.sales_stage} <br />
                            <strong>Technical Evaluator:</strong> {customer.technical_evaluator} <br />
                            <strong>Tag:</strong>
                            <Form.Select value={customer.tags} onChange={handleTagChange} className="mt-2">
                                <option value="VIP">VIP</option>
                                <option value="Potential">Potential</option>
                                <option value="Archived">Archived</option>
                            </Form.Select>

                        </Card.Text>
                        <Button variant="info" onClick={openEditCustomerModal}>Edit Customer Profile</Button>
                        <Button 
                            variant="info" 
                            className="mt-2"
                            onClick={() => navigate(`/projects/customers/${customer.id}`)}
                        >
                            View Projects
                        </Button>
                    </Card.Body>
                </Card>
            )}

            <h3>Funding Information</h3>
            <Button variant="warning" onClick={() => setShowFundingModal(true)}>Edit Funding Information</Button>
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
                    {funding.map((fund) => (
                        <tr key={fund.id}>
                            <td>{fund.funding_status}</td>
                            <td>${fund.project_budget}</td>
                            <td>{fund.approval_date}</td>
                            <td>{fund.decision_maker}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            

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
                            <Form.Label>Sales Stage</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={updatedCustomer.sales_stage || ""}
                                onChange={(e) => setUpdatedCustomer({ ...updatedCustomer, sales_stage: e.target.value })}
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

            {/* ✅ Funding Edit Modal */}
            <Modal show={showFundingModal} onHide={() => setShowFundingModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Funding Information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Funding Status</Form.Label>
                            <Form.Select 
                                value={updatedFunding.funding_status || ""}
                                onChange={(e) => setUpdatedFunding({ ...updatedFunding, funding_status: e.target.value })}
                            >
                                <option value="" disabled>Select status</option>
                                <option value="Funded">Funded</option>
                                <option value="Approved">Approved</option>
                                <option value="Pending">Pending</option>
                                <option value="Rejected">Rejected</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Project Budget</Form.Label>
                            <Form.Control 
                                type="number" 
                                value={updatedFunding.project_budget || ""}
                                onChange={(e) => setUpdatedFunding({ ...updatedFunding, project_budget: e.target.value })} 
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Decision Maker</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={updatedFunding.decision_maker || ""}
                                onChange={(e) => setUpdatedFunding({ ...updatedFunding, decision_maker: e.target.value })} 
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFundingModal(false)}>Close</Button>
                    <Button variant="success" onClick={handleFundingUpdate}>Save Changes</Button>
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
