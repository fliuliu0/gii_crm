from flask import Blueprint, jsonify, request
from models import Customer, SalesOpportunity, db
from utils import role_required

sales = Blueprint("sales", __name__)

@sales.route("/sales", methods=["GET"])
@role_required(["Admin", "Sales"])
def get_sales_opportunities():
    sales = SalesOpportunity.query.all()
    return jsonify([s.to_dict() for s in sales])

@sales.route("/customers", methods=["GET"])
@role_required(["Admin", "Sales"])
def get_customers():
    customers = Customer.query.all()
    return jsonify([c.to_dict() for c in customers])
