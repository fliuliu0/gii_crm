from flask import Blueprint, jsonify, request
from config import db
from models import Customer
from flasgger import swag_from

customers = Blueprint("customers", __name__)

# Get All Customers
@customers.route("/", methods=["GET"])
@swag_from({
    "responses": {
        200: {
            "description": "Retrieve all customers",
            "examples": {
                "application/json": [
                    {
                        "id": 1,
                        "name": "John Doe",
                        "email": "john@example.com",
                        "phone": "123456789",
                        "company": "ABC Corp",
                        "industry": "Technology",
                        "sales_stage": "Negotiation",
                        "created_at": "2025-03-02T12:00:00",
                        "address": "123 Main St, City, Country"
                    }
                ]
            }
        }
    }
})
def get_customers():
    """
    Get All Customers
    ---
    tags:
      - Customers
    responses:
      200:
        description: List of all customers
    """
    all_customers = Customer.query.all()
    result = [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "company": c.company,
            "industry": c.industry,
            "sales_stage": c.sales_stage,
            "created_at": c.created_at,
            "address": c.address
        }
        for c in all_customers
    ]
    return jsonify(result)

# Add New Customer
@customers.route("/", methods=["POST"])
@swag_from({
    "requestBody": {
        "required": True,
        "content": {
            "application/json": {
                "example": {
                    "name": "Jane Doe",
                    "email": "jane@example.com",
                    "phone": "987654321",
                    "company": "XYZ Ltd",
                    "industry": "Finance",
                    "sales_stage": "New Lead",
                    "address": "456 Another St, City, Country"
                }
            }
        }
    },
    "responses": {
        201: {
            "description": "Customer added successfully",
            "examples": {
                "application/json": {
                    "message": "Customer added successfully!"
                }
            }
        }
    }
})
def add_customer():
    """
    Add New Customer
    ---
    tags:
      - Customers
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              name:
                type: string
              email:
                type: string
              phone:
                type: string
              company:
                type: string
              industry:
                type: string
              sales_stage:
                type: string
              address:
                type: string
    responses:
      201:
        description: Customer added successfully
    """
    data = request.json
    new_customer = Customer(
        name=data["name"],
        email=data.get("email"),
        phone=data.get("phone"),
        company=data.get("company"),
        industry=data.get("industry"),
        sales_stage=data.get("sales_stage"),
        address=data.get("address")
    )
    db.session.add(new_customer)
    db.session.commit()
    return jsonify({"message": "Customer added successfully!"}), 201
