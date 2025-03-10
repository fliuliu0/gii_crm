from flask import Blueprint, jsonify, request
from models import Customer, Project, SalesOpportunity, db
from utils import role_required

admin = Blueprint("admin", __name__)

@admin.route("/admin/dashboard", methods=["GET"])
@role_required(["Admin"])
def get_admin_dashboard():
    customers = Customer.query.count()
    projects = Project.query.count()
    sales = SalesOpportunity.query.count()
    
    return jsonify({"customers": customers, "projects": projects, "sales": sales})
