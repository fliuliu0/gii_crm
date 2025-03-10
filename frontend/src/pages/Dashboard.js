import { useEffect, useState } from "react";
import axios from "axios";
import AdminDashboard from "./AdminDashboard";
import SalesDashboard from "./SalesDashboard";
import ProjectManagerDashboard from "./ProjectManagerDashboard";

function Dashboard() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/users/profile", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then(response => setUser(response.data))
        .catch(() => console.log("Failed to load user"));
    }, []);

    return (
        <div>
            {user && (
                <div>
                    <h1>Welcome, {user.name}</h1>
                    <h3>Role: {user.role}</h3>

                    {user.role === "Admin" && <AdminDashboard />}
                    {user.role === "Sales" && <SalesDashboard />}
                    {user.role === "Project Manager" && <ProjectManagerDashboard />}
                </div>
            )}
        </div>
    );
}

export default Dashboard;
