import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap';

function Sales() {
    const [opportunities, setOpportunities] = useState([]);
    const [filteredOpportunities, setFilteredOpportunities] = useState([]); 
    const [selectedCustomer, setSelectedCustomer] = useState(""); 
    const [users, setUsers] = useState({}); 
    const [customers, setCustomers] = useState({}); 
    const [showModal, setShowModal] = useState(false);
    const [currentOpportunity, setCurrentOpportunity] = useState(null);
    const [newOpportunity, setNewOpportunity] = useState({
        customer_id: '',
        opportunity: '',
        sales_stage: '',
        revenue: '',
        owner: ''
    });
    const [error, setError] = useState(null);
    const [salesReps, setSalesReps] = useState([]);
    const [customersList, setCustomersList] = useState([]); 

    useEffect(() => {
        fetchOpportunities();
        fetchSalesReps(); 
        fetchAllCustomerNames();
    }, []);

    useEffect(() => {
        if (selectedCustomer) {
            setFilteredOpportunities(opportunities.filter(op => op.customer_id === Number(selectedCustomer)));
        } else {
            setFilteredOpportunities(opportunities);
        }
    }, [selectedCustomer, opportunities]);
    

    const fetchOpportunities = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/sales_opportunity');
            setOpportunities(response.data);
            fetchUserNames(response.data);
            fetchCustomerNames(response.data);
        } catch (err) {
            setError('Failed to fetch sales opportunities.');
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

    const fetchUserNames = async (opportunities) => {
        const userIds = [...new Set(opportunities.map(op => op.owner))]; 
        let userData = { ...users };

        await Promise.all(userIds.map(async (userId) => {
            if (!userData[userId]) {
                try {
                    const response = await axios.get(`http://127.0.0.1:5000/users/${userId}`);
                    userData[userId] = response.data.name;
                } catch {
                    userData[userId] = "Unknown"; 
                }
            }
        }));

        setUsers(userData);
    };

    const fetchCustomerNames = async (opportunities) => {
        const customerIds = [...new Set(opportunities.map(op => op.customer_id))]; 
        let customerData = { ...customers };

        await Promise.all(customerIds.map(async (customerId) => {
            if (!customerData[customerId]) {
                try {
                    const response = await axios.get(`http://127.0.0.1:5000/customers/${customerId}`);
                    customerData[customerId] = response.data.name;
                } catch {
                    customerData[customerId] = "Unknown"; 
                }
            }
        }));

        setCustomers(customerData);
    };

    const fetchAllCustomerNames = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:5000/customers");
            setCustomersList(response.data); 
        } catch (err) {
            setError("Failed to load customers.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (currentOpportunity) {
            setCurrentOpportunity((prev) => ({ ...prev, [name]: value }));
        } else {
            setNewOpportunity((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async () => {
        try {
            if (currentOpportunity) {
                await axios.put(`http://127.0.0.1:5000/sales_opportunity/${currentOpportunity.id}`, currentOpportunity);
            } else {
                await axios.post('http://127.0.0.1:5000/sales_opportunity', newOpportunity);
            }
            fetchOpportunities();
            setShowModal(false);
            setNewOpportunity({
                customer_id: '',
                opportunity: '',
                sales_stage: '',
                revenue: '',
                owner: ''
            });
            setCurrentOpportunity(null);
        } catch (err) {
            setError('Failed to save sales opportunity.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/sales_opportunity/${id}`);
            fetchOpportunities();
        } catch (err) {
            setError('Failed to delete sales opportunity.');
        }
    };

    const handleStageChange = async (id, sales_stage) => {
        try {
            await axios.put(`http://127.0.0.1:5000/sales_opportunity/${id}`, { sales_stage });
            fetchOpportunities();
        } catch (err) {
            setError('Failed to update sales stage.');
        }
    };

    return (
        <Container className="mt-4">
            <h2>Sales Opportunities</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            
            {/* Customer Filter Dropdown */}
            <Form.Group className="mb-3">
                <Form.Label>Filter by Customer</Form.Label>
                <Form.Select onChange={(e) => setSelectedCustomer(e.target.value)} value={selectedCustomer}>
                    <option value="">All Customers</option>
                    {customersList.map(customer => (
                        <option key={customer.id} value={customer.id}>
                            {customer.name} (ID: {customer.id})
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Button variant="primary" onClick={() => setShowModal(true)}>
                Add Opportunity
            </Button>

            <div className="table-responsive">
                <Table striped bordered hover className="mt-3">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Opportunity</th>
                            <th>Sales Stage</th>
                            <th>Revenue</th>
                            <th>Sales Representative</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOpportunities.map((op) => (
                            <tr key={op.id}>
                                <td>{customers[op.customer_id] || "Loading..."} (ID: {op.customer_id})</td>
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
                                <td>{op.revenue}</td>
                                <td>{users[op.owner] || "Loading..."} (ID: {op.owner})</td>
                                <td>
                                    <Button variant="danger" onClick={() => handleDelete(op.id)}>
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
    
            {/* Add Opportunity Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Sales Opportunity</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Customer</Form.Label>
                        <Form.Select
                            name="customer_id"
                            value={newOpportunity.customer_id}
                            onChange={handleChange}
                        >
                            <option value="">Select Customer</option>
                            {customersList.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name} (ID: {customer.id})
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Opportunity</Form.Label>
                            <Form.Control
                                type="text"
                                name="opportunity"
                                value={newOpportunity.opportunity}
                                onChange={handleChange}
                            />
                        </Form.Group>
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
                        <Form.Group className="mb-3">
                            <Form.Label>Revenue</Form.Label>
                            <Form.Control
                                type="number"
                                name="revenue"
                                value={newOpportunity.revenue}
                                onChange={handleChange}
                            />
                        </Form.Group>
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
                        <Button variant="primary" onClick={handleSubmit}>
                            Add Opportunity
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}    

export default Sales;
