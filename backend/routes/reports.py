from flask import Blueprint, jsonify
from config import db
from models import Customer, SalesOpportunity, Project
from flasgger import swag_from

reports = Blueprint('reports', __name__)

# Get Sales Summary Report
@reports.route('/sales_summary', methods=['GET'])
@swag_from({
    "responses": {
        200: {
            "description": "Retrieve total sales opportunities and total revenue",
            "examples": {
                "application/json": {
                    "total_sales_opportunities": 10,
                    "total_revenue": 500000
                }
            }
        }
    }
})
def sales_summary():
    """
    Get Sales Summary Report
    ---
    tags:
      - Reports
    responses:
      200:
        description: Total sales opportunities and total revenue
    """
    sales = SalesOpportunity.query.all()
    total_revenue = sum([s.revenue for s in sales])
    return jsonify({"total_sales_opportunities": len(sales), "total_revenue": total_revenue})

# Get Customer Distribution by Industry
@reports.route('/customer_distribution', methods=['GET'])
@swag_from({
    "responses": {
        200: {
            "description": "Retrieve customer distribution by industry",
            "examples": {
                "application/json": [
                    {"industry": "Technology", "count": 5},
                    {"industry": "Healthcare", "count": 8}
                ]
            }
        }
    }
})
def customer_distribution():
    """
    Get Customer Distribution by Industry
    ---
    tags:
      - Reports
    responses:
      200:
        description: List of industries with customer count
    """
    industries = db.session.query(Customer.industry, db.func.count(Customer.id)).group_by(Customer.industry).all()
    result = [{"industry": industry, "count": count} for industry, count in industries]
    return jsonify(result)

# Get Project Budget Summary
@reports.route('/project_budget', methods=['GET'])
@swag_from({
    "responses": {
        200: {
            "description": "Retrieve total projects and total budget",
            "examples": {
                "application/json": {
                    "total_projects": 15,
                    "total_budget": 1200000
                }
            }
        }
    }
})
def project_budget():
    """
    Get Project Budget Summary
    ---
    tags:
      - Reports
    responses:
      200:
        description: Total projects and total budget
    """
    projects = Project.query.all()
    total_budget = sum([p.budget for p in projects])
    return jsonify({"total_projects": len(projects), "total_budget": total_budget})
