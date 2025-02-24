import React, { useEffect, useState } from "react";
import { getCustomers } from "../api";

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        getCustomers().then(data => setCustomers(data));
    }, []);

    return (
        <div>
            <h2>Customer List</h2>
            <ul>
                {customers.map(customer => (
                    <li key={customer.id}>{customer.name} - {customer.email}</li>
                ))}
            </ul>
        </div>
    );
};

export default CustomerList;
