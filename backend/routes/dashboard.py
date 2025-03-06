from flask import Blueprint, jsonify
from config import db
from models import Customer, FundingInformation, CustomerInteraction

dashboard = Blueprint("dashboard", __name__)

@dashboard.route("/dashboard-stats", methods=["GET"])
def get_dashboard_stats():
    """
    Get dashboard statistics
    ---
    tags:
      - Dashboard
    """
    total_customers = Customer.query.count()
    pending_funding = FundingInformation.query.filter_by(funding_status="Pending").count()
    recent_interactions = CustomerInteraction.query.count()
    active_deals = Customer.query.filter(Customer.sales_stage != "Lost").count()

    return jsonify({
        "totalCustomers": total_customers,
        "pendingFunding": pending_funding,
        "recentInteractions": recent_interactions,
        "activeDeals": active_deals
    })
