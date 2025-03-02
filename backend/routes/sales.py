from flask import Blueprint, request, jsonify
from config import db
from models import SalesOpportunity
from flasgger import swag_from

sales = Blueprint('sales', __name__)

# Get all sales opportunities
@sales.route('/', methods=['GET'])
@swag_from({
    "responses": {
        200: {
            "description": "Retrieve all sales opportunities",
            "examples": {
                "application/json": [
                    {
                        "id": 1,
                        "customer_id": 2,
                        "opportunity": "New Deal",
                        "sales_stage": "Proposal Sent",
                        "revenue": 5000,
                        "owner": 1
                    }
                ]
            }
        }
    }
})
def get_sales():
    """
    Get all sales opportunities
    ---
    tags:
      - Sales
    responses:
      200:
        description: A list of sales opportunities
    """
    sales_list = SalesOpportunity.query.all()
    result = [
        {
            "id": s.id,
            "customer_id": s.customer_id,
            "opportunity": s.opportunity,  
            "sales_stage": s.sales_stage,  
            "revenue": s.revenue,  
            "owner": s.owner  
        }
        for s in sales_list
    ]
    return jsonify(result)

# Add a new sales opportunity
@sales.route('/', methods=['POST'])
@swag_from({
    "parameters": [
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "id": "SalesOpportunity",
                "required": ["customer_id", "opportunity", "sales_stage", "revenue", "owner"],
                "properties": {
                    "customer_id": {"type": "integer"},
                    "opportunity": {"type": "string"},
                    "sales_stage": {"type": "string"},
                    "revenue": {"type": "number"},
                    "owner": {"type": "integer"}
                }
            }
        }
    ],
    "responses": {
        201: {
            "description": "Sales opportunity added successfully"
        }
    }
})
def add_sales():
    """
    Add a new sales opportunity
    ---
    tags:
      - Sales
    parameters:
      - name: body
        in: body
        required: True
        schema:
          id: SalesOpportunity
          required:
            - customer_id
            - opportunity
            - sales_stage
            - revenue
            - owner
          properties:
            customer_id:
              type: integer
            opportunity:
              type: string
            sales_stage:
              type: string
            revenue:
              type: number
            owner:
              type: integer
    responses:
      201:
        description: Sales opportunity added successfully
    """
    data = request.json
    new_sales = SalesOpportunity(
        customer_id=data["customer_id"],
        opportunity=data["opportunity"],
        sales_stage=data["sales_stage"],
        revenue=data["revenue"],
        owner=data["owner"]
    )
    db.session.add(new_sales)
    db.session.commit()
    return jsonify({"message": "Sales opportunity added successfully!"}), 201

# Delete a sales opportunity
@sales.route('/<int:id>', methods=['DELETE'])
@swag_from({
    "responses": {
        200: {
            "description": "Sales opportunity deleted successfully"
        },
        404: {
            "description": "Sales opportunity not found"
        }
    }
})
def delete_sales(id):
    """
    Delete a sales opportunity
    ---
    tags:
      - Sales
    parameters:
      - name: id
        in: path
        required: True
        type: integer
    responses:
      200:
        description: Sales opportunity deleted successfully
      404:
        description: Sales opportunity not found
    """
    sales_opportunity = SalesOpportunity.query.get(id)
    if not sales_opportunity:
        return jsonify({"error": "Sales opportunity not found"}), 404

    db.session.delete(sales_opportunity)
    db.session.commit()
    return jsonify({"message": "Sales opportunity deleted successfully!"})
