import { Routes, Route, useLocation } from "react-router-dom";
import NavigationBar from "./components/NavigationBar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Projects from "./pages/Projects";
import ProjectForm from "./pages/ProjectForm";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerProjects from "./pages/CustomerProjects";
import ProjectDetails from "./pages/ProjectDetails";
import Sales from "./pages/Sales";
import CustomerSales from "./pages/CustomerSales";

import { Container } from "react-bootstrap"; 

function App() {
  const location = useLocation();

  // Exclude NavigationBar on Login and Dashboard pages
  const hideNavbarOnPages = ["/", "/login", "/dashboard"];
  const shouldShowNavbar = !hideNavbarOnPages.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <NavigationBar />}
      <Container> 
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projectform" element={<ProjectForm />} />
          <Route path="/customers/:id" element={<CustomerProfile />} />
          <Route path="/projects/customers/:customerId" element={<CustomerProjects />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/customer/:customerId" element={<CustomerSales />} />

        </Routes>
      </Container>
    </>
  );
}

export default App;
