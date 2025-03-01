from flask import Blueprint, jsonify
from config import db
from models import Customer, SalesOpportunity, Project

reports = Blueprint('reports', __name__)

# Get Sales Summary Report
@reports.route('/reports/sales_summary', methods=['GET'])
def sales_summary():
    sales = SalesOpportunity.query.all()
    total_revenue = sum([s.expected_revenue for s in sales])
    return jsonify({"total_sales_opportunities": len(sales), "total_revenue": total_revenue})

# Get Customer Distribution by Industry
@reports.route('/reports/customer_distribution', methods=['GET'])
def customer_distribution():
    industries = db.session.query(Customer.industry, db.func.count(Customer.id)).group_by(Customer.industry).all()
    result = [{"industry": industry, "count": count} for industry, count in industries]
    return jsonify(result)

# Get Project Budget Summary
@reports.route('/reports/project_budget', methods=['GET'])
def project_budget():
    projects = Project.query.all()
    total_budget = sum([p.budget for p in projects])
    return jsonify({"total_projects": len(projects), "total_budget": total_budget})
