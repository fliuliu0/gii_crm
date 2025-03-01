from flask import Blueprint, jsonify, request
from config import db
from models import Customer  # Ensure the model name matches

customers = Blueprint("customers", __name__)

# Get All Customers
@customers.route("/", methods=["GET"])
def get_customers():
    all_customers = Customer.query.all()
    result = [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "company": c.company,  # ✅ FIXED: Include company
            "industry": c.industry,
            "sales_stage": c.sales_stage,
            "created_at": c.created_at,
            "address": c.address  # ✅ FIXED: Include address
        }
        for c in all_customers
    ]
    return jsonify(result)

# Add New Customer
@customers.route("/", methods=["POST"])
def add_customer():
    data = request.json
    new_customer = Customer(
        name=data["name"],
        email=data.get("email"),
        phone=data.get("phone"),
        company=data.get("company"),  # ✅ FIXED: Added company
        industry=data.get("industry"),
        sales_stage=data.get("sales_stage"),
        address=data.get("address")  # ✅ FIXED: Added address
    )
    db.session.add(new_customer)
    db.session.commit()
    return jsonify({"message": "Customer added successfully!"})
