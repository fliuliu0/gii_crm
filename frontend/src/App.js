import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Projects from "./pages/Projects";
import ProjectForm from "./pages/ProjectForm";
import FundingInfo from "./pages/FundingInfo";
import Interactions from "./pages/Interactions";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerProjects from "./pages/CustomerProjects";
import ProjectDetails from "./pages/ProjectDetails";

import { Container } from "react-bootstrap"; 

function App() {
  return (
    <Container> 
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projectform" element={<ProjectForm />} />
        <Route path="/customers/:id/funding" element={<FundingInfo />} />
        <Route path="/customers/:id/interactions" element={<Interactions />} />
        <Route path="/customers/:id" element={<CustomerProfile />} />
        <Route path="/projects/customers/:customerId" element={<CustomerProjects />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />

      </Routes>
    </Container>
  );
}

export default App;
