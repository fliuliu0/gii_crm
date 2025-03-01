import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
    const [customers, setCustomers] = useState([]);
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

    useEffect(() => {
        
        axios.get(`${API_URL}/customers`)
            .then(response => {
                setCustomers(response.data);
            })
            .catch(error => {
                console.error("Error fetching customers:", error);
            });

    }, []);

    return (
        <div>
            <h1>CRM System</h1>
            <ul>
                {customers.map((customer) => (
                    <li key={customer.id}>
                        {customer.name} - {customer.email}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
