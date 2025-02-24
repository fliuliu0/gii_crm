import mysql.connector
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Replace with your correct IP
db = mysql.connector.connect(
    host="localhost",  # Your actual local IP
    user="root",
    password="root",
    database="crm_db"
)

cursor = db.cursor()
cursor.execute("SHOW DATABASES")
for db_name in cursor:
    print(db_name)

@app.route('/')
def home():
    return {"message": "CRM Backend Running"}

# Route to Fetch All Customers
@app.route('/customers', methods=['GET'])
def get_customers():
    cursor.execute("SELECT * FROM customers")
    customers = cursor.fetchall()
    
    # Convert query result to JSON format
    result = []
    for row in customers:
        result.append({
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "phone": row[3],
            "company": row[4]
        })
    
    return jsonify(result)

# Route to Add a New Customer
@app.route('/customers', methods=['POST'])
def add_customer():
    data = request.json
    query = "INSERT INTO customers (name, email, phone, company) VALUES (%s, %s, %s, %s)"
    values = (data["name"], data["email"], data["phone"], data["company"])
    
    cursor.execute(query, values)
    db.commit()
    
    return jsonify({"message": "Customer added successfully!"})


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)

