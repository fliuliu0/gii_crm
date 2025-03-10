from flask import Blueprint, jsonify, request
from models import Project, Customer, db
from utils import role_required

project_manager = Blueprint("project_manager", __name__)

@project_manager.route("/projects", methods=["GET"])
@role_required(["Admin", "Project Manager"])
def get_projects():
    projects = Project.query.all()
    return jsonify([p.to_dict() for p in projects])

@project_manager.route("/customers/<int:customer_id>", methods=["GET"])
@role_required(["Admin", "Project Manager"])
def get_customer(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404
    return jsonify(customer.to_dict())
