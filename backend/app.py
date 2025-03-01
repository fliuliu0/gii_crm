import mysql.connector
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# AWS RDS 
db = mysql.connector.connect(
    host="crm-db.cjqkqqq0a1xc.ap-southeast-1.rds.amazonaws.com",
    user="admin",
    password="crmdatabase",
    database="crm_db"
)

cursor = db.cursor()
cursor.execute("SHOW DATABASES")
for db_name in cursor:
    print(db_name)

@app.route('/')
def home():
    return {"message": "CRM Backend Running"}

# Get All Customers
@app.route('/customers', methods=['GET'])
def get_customers():
    cursor.execute("SELECT * FROM customers")
    customers = cursor.fetchall()
    result = [{"id": c[0], "name": c[1], "email": c[2], "phone": c[3], "company": c[4], "industry": c[5], "sales_stage": c[6]} for c in customers]
    return jsonify(result)

# Add New Customer
@app.route('/customers', methods=['POST'])
def add_customer():
    data = request.json
    query = "INSERT INTO customers (name, email, phone, company, industry, sales_stage) VALUES (%s, %s, %s, %s, %s, %s)"
    values = (data["name"], data["email"], data["phone"], data["company"], data["industry"], data["sales_stage"])
    cursor.execute(query, values)
    db.commit()
    return jsonify({"message": "Customer added successfully!"})

# Get All Projects
@app.route('/projects', methods=['GET'])
def get_projects():
    cursor.execute("SELECT * FROM projects")
    projects = cursor.fetchall()
    result = [{"id": p[0], "customer_id": p[1], "project_name": p[2], "budget": p[3], "phase": p[4], "manager": p[5]} for p in projects]
    return jsonify(result)

# Add New Project
@app.route('/projects', methods=['POST'])
def add_project():
    data = request.json
    query = "INSERT INTO projects (customer_id, project_name, budget, phase, manager) VALUES (%s, %s, %s, %s, %s)"
    values = (data["customer_id"], data["project_name"], data["budget"], data["phase"], data["manager"])
    cursor.execute(query, values)
    db.commit()
    return jsonify({"message": "Project created successfully!"})

# Get All Sales Opportunities
@app.route('/sales', methods=['GET'])
def get_sales():
    cursor.execute("SELECT * FROM sales")
    sales = cursor.fetchall()
    result = [{"id": s[0], "customer_id": s[1], "opportunity": s[2], "sales_stage": s[3], "revenue": s[4], "owner": s[5]} for s in sales]
    return jsonify(result)

# Add New Sales Opportunity
@app.route('/sales', methods=['POST'])
def add_sales():
    data = request.json
    query = "INSERT INTO sales (customer_id, opportunity, sales_stage, revenue, owner) VALUES (%s, %s, %s, %s, %s)"
    values = (data["customer_id"], data["opportunity"], data["sales_stage"], data["revenue"], data["owner"])
    cursor.execute(query, values)
    db.commit()
    return jsonify({"message": "Sales opportunity added successfully!"})

# Get Communication Records
@app.route('/communications', methods=['GET'])
def get_communications():
    cursor.execute("SELECT * FROM communication_records")
    records = cursor.fetchall()
    result = [{"id": r[0], "customer_id": r[1], "contact_type": r[2], "details": r[3], "contact_date": r[4]} for r in records]
    return jsonify(result)

# Add Communication Record
@app.route('/communications', methods=['POST'])
def add_communication():
    data = request.json
    query = "INSERT INTO communication_records (customer_id, contact_type, details) VALUES (%s, %s, %s)"
    values = (data["customer_id"], data["contact_type"], data["details"])
    cursor.execute(query, values)
    db.commit()
    return jsonify({"message": "Communication logged successfully!"})


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)


