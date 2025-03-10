from flask import Blueprint, jsonify, request
from config import db
from models import Customer
from flasgger import swag_from

customers = Blueprint("customers", __name__)

# ✅ Get All Customers
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
                        "location": "Shanghai, China",
                        "tags": "VIP",
                        "technical_evaluator": "Mike Lee",
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
            "location": c.location,
            "tags": c.tags,
            "technical_evaluator": c.technical_evaluator,
            "created_at": c.created_at,
            "address": c.address
        }
        for c in all_customers
    ]
    return jsonify(result)


# ✅ Add New Customer
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
                    "location": "Beijing, China",
                    "tags": "Potential",
                    "technical_evaluator": "Sarah Kim",
                    "address": "456 Another St, City, Country"
                }
            }
        }
    },
    "responses": {
        201: {
            "description": "Customer added successfully"
        }
    }
})
def add_customer():
    """
    Add New Customer
    ---
    tags:
      - Customers
    """
    data = request.json

    if Customer.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    new_customer = Customer(
        name=data["name"],
        email=data.get("email"),
        phone=data.get("phone"),
        company=data.get("company"),
        industry=data.get("industry"),
        location=data.get("location"),
        tags=data.get("tags"),
        technical_evaluator=data.get("technical_evaluator"),
        address=data.get("address")
    )
    db.session.add(new_customer)
    db.session.commit()
    return jsonify({"message": "Customer added successfully!"}), 201

# ✅ Get Specific Customer by ID
@customers.route("/<int:id>", methods=["GET"])
@swag_from({
    "parameters": [
        {
            "name": "id",
            "in": "path",
            "required": True,
            "schema": {
                "type": "integer"
            }
        }
    ],
    "responses": {
        200: {
            "description": "Retrieve specific customer",
            "examples": {
                "application/json": {
                    "id": 1,
                    "name": "John Doe",
                    "email": "john@example.com",
                    "phone": "123456789",
                    "company": "ABC Corp",
                    "industry": "Technology",
                    "location": "Shanghai, China",
                    "tags": "VIP",
                    "technical_evaluator": "Mike Lee",
                    "created_at": "2025-03-02T12:00:00",
                    "address": "123 Main St, City, Country"
                }
            }
        },
        404: {
            "description": "Customer not found"
        }
    }
})
def get_customer(id):
    """
    Get Specific Customer
    ---
    tags:
      - Customers
    """
    customer = Customer.query.get(id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    result = {
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "phone": customer.phone,
        "company": customer.company,
        "industry": customer.industry,
        "location": customer.location,
        "tags": customer.tags,
        "technical_evaluator": customer.technical_evaluator,
        "created_at": customer.created_at,
        "address": customer.address
    }
    
    return jsonify(result), 200


# ✅ Update Customer by ID
@customers.route("/<int:id>", methods=["PUT"])
@swag_from({
    "parameters": [
        {
            "name": "id",
            "in": "path",
            "required": True,
            "schema": {
                "type": "integer"
            }
        }
    ]
})
def update_customer(id):
    """
    Update Customer
    ---
    tags:
      - Customers
    """
    customer = Customer.query.get(id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    data = request.json
    customer.name = data.get("name", customer.name)
    customer.email = data.get("email", customer.email)
    customer.phone = data.get("phone", customer.phone)
    customer.company = data.get("company", customer.company)
    customer.industry = data.get("industry", customer.industry)
    customer.location = data.get("location", customer.location)
    customer.tags = data.get("tags", customer.tags)
    customer.technical_evaluator = data.get("technical_evaluator", customer.technical_evaluator)
    customer.address = data.get("address", customer.address)

    db.session.commit()
    return jsonify({"message": "Customer updated successfully!"}), 200


# ✅ Delete Customer by ID
@customers.route("/<int:id>", methods=["DELETE"])
def delete_customer(id):
    """
    Delete Customer
    ---
    tags:
      - Customers
    """
    customer = Customer.query.get(id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    db.session.delete(customer)
    db.session.commit()
    return jsonify({"message": "Customer deleted successfully!"}), 200
