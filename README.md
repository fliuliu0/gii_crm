# CRM System

A **Customer Relationship Management (CRM) System** built with **React (frontend)** and **Flask (backend)** to manage **customers, sales opportunities, and projects** based on user roles.

## Features

- **Role-based access**: Admin, Sales, and Project Manager roles with different permissions.
- **Authentication**: Secure login/logout system with JWT-based authentication.
- **Customers Management**: View, filter, and manage customer profiles.
- **Sales Management**: Track sales opportunities linked to customers.
- **Projects Management**: Manage projects, funding status, and associated tasks.
- **Auto Logout**: Users are **automatically logged out after 15 minutes** due to token expiration.

##  Tech Stack

- **Frontend**: React.js, React Bootstrap, Axios
- **Backend**: Flask, Flask-JWT-Extended, SQLAlchemy
- **Database**: MySQL

---

### 1️⃣ Clone the repository

```sh
 git clone https://github.com/fliuliu0/gii_crm.git
 cd your-repo
```

### 2️⃣ Backend Setup

#### Install dependencies

```sh
cd backend
python -m venv venv
source venv/bin/activate   # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

#### Run the backend server

```sh
cd backend
python app.py
```

### 3️⃣ Frontend Setup

#### Install dependencies

```sh
cd frontend
npm install
```

#### Start the frontend

```sh
npm start
```

This will start the **React app** at `http://localhost:3000` and the **Flask API** at `http://127.0.0.1:5000`.

---

## Default Login Credentials

### **Admin**

- **Email**: [bob@example.com](mailto\:bob@example.com)
- **Password**: password123

### **Sales**

- **Email**: [david@crmcompany.com](mailto\:david@crmcompany.com)
- **Password**: password123

### **Project Manager**

- **Email**: [charlie@crmcompany.com](mailto\:charlie@crmcompany.com)
- **Password**: password123

### **Auto Logout**

- Users are automatically logged out **after 15 minutes** due to token expiration.

---

## Role-Based Access

| Role                | Customers         | Sales       | Projects    | Funding     |
| ------------------- | ----------------- | ----------- | ----------- | ----------- |
| **Admin**           | ✅ View/Edit       | ✅ View/Edit | ✅ View/Edit | ✅ View/Edit |
| **Sales**           | ✅ View/Edit (own) | ✅ View/Edit | ❌ No Access | ❌ No Access |
| **Project Manager** | ✅ View/Edit (own) | ❌ No Access | ✅ View/Edit | ✅ View/Edit |

---

## API Endpoints
http://127.0.0.1:5000/apidocs/#/
