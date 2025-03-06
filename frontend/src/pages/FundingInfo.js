import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Form, Button, Alert } from "react-bootstrap";

function FundingInfo() {
    const { id } = useParams(); // Get customer ID from URL
    const [funding, setFunding] = useState({
        funding_status: "",
        project_budget: "",
        decision_maker: ""
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/funding/customers/${id}`)
            .then(response => {
                setFunding(response.data);
                setLoading(false);
            })
            .catch(() => {
                setError("No funding information found.");
                setLoading(false);
            });
    }, [id]);

    const handleChange = (e) => {
        setFunding({ ...funding, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        axios.put(`http://127.0.0.1:5000/funding/customers/${id}`, funding)
            .then(() => setSuccess(true))
            .catch(() => setError("Failed to update funding details"));
    };

    return (
        <Container className="mt-4">
            <h2>Funding Information</h2>
            {loading && <p>Loading...</p>}
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">Funding updated successfully!</Alert>}
            {!loading && !error && (
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Funding Status</Form.Label>
                        <Form.Select name="funding_status" value={funding.funding_status} onChange={handleChange}>
                            <option>Pending</option>
                            <option>Approved</option>
                            <option>Funded</option>
                            <option>Rejected</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Project Budget</Form.Label>
                        <Form.Control type="number" name="project_budget" value={funding.project_budget} onChange={handleChange} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Decision Maker</Form.Label>
                        <Form.Control type="text" name="decision_maker" value={funding.decision_maker} onChange={handleChange} />
                    </Form.Group>

                    <Button variant="primary" onClick={handleSubmit}>Update Funding</Button>
                </Form>
            )}
        </Container>
    );
}

export default FundingInfo;
