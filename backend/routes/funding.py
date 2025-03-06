from flask import Blueprint, jsonify, request
from config import db
from models import Customer, FundingInformation
from flasgger import swag_from
import logging

funding = Blueprint("funding", __name__)

# ✅ GET Funding Information for a Customer
@funding.route("/customers/<int:customer_id>", methods=["GET"])
@swag_from({
    "responses": {
        200: {
            "description": "Retrieve funding details",
            "examples": {
                "application/json": {
                    "customer_id": 1,
                    "funding_status": "Approved",
                    "project_budget": 50000,
                    "approval_date": "2025-03-04T12:00:00",
                    "decision_maker": "Alice Johnson"
                }
            }
        },
        404: {"description": "No funding info found"}
    }
})
def get_funding_info(customer_id):
    """
    Get funding details for a customer
    ---
    tags:
      - Funding Information
    """
    funding_info = FundingInformation.query.filter_by(customer_id=customer_id).first()
    if not funding_info:
        return jsonify({"error": "No funding information found"}), 404

    return jsonify({
        "id": funding_info.id,
        "customer_id": funding_info.customer_id,
        "funding_status": funding_info.funding_status,
        "project_budget": float(funding_info.project_budget) if funding_info.project_budget else None,
        "approval_date": funding_info.approval_date,
        "decision_maker": funding_info.decision_maker
    })

# ✅ POST Add Funding Information
@funding.route("/customers/<int:customer_id>", methods=["POST"])
@swag_from({
    "requestBody": {
        "required": True,
        "content": {
            "application/json": {
                "example": {
                    "funding_status": "Pending",
                    "project_budget": 100000,
                    "decision_maker": "John Doe"
                }
            }
        }
    },
    "responses": {201: {"description": "Funding information added successfully"}}
})
def add_funding_info(customer_id):
    """
    Add funding details for a customer
    ---
    tags:
      - Funding Information
    """
    data = request.json
    new_funding = FundingInformation(
        customer_id=customer_id,
        funding_status=data["funding_status"],
        project_budget=data.get("project_budget"),
        decision_maker=data.get("decision_maker")
    )
    db.session.add(new_funding)
    db.session.commit()
    return jsonify({"message": "Funding information added successfully!"}), 201

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# # ✅ PUT Update Funding Information (with Logs)
# @funding.route("/customers/<int:customer_id>", methods=["PUT"])
# def update_funding_info(customer_id):
#     """
#     Update funding details for a customer
#     ---
#     tags:
#       - Funding Information
#     """
#     funding_info = FundingInformation.query.filter_by(customer_id=customer_id).first()
#     if not funding_info:
#         logger.warning(f"No funding information found for customer ID: {customer_id}")
#         return jsonify({"error": "No funding information found"}), 404

#     data = request.json
#     logger.info(f"Received PUT request for customer {customer_id} with data: {data}")

#     # Update funding information
#     funding_info.funding_status = data.get("funding_status", funding_info.funding_status)
#     funding_info.project_budget = data.get("project_budget", funding_info.project_budget)
#     funding_info.decision_maker = data.get("decision_maker", funding_info.decision_maker)

#     # ✅ Update Customer's funding_status to keep it in sync
#     customer = Customer.query.get(customer_id)
#     if customer:
#         customer.funding_status = funding_info.funding_status
#         logger.info(f"Updated customer {customer_id} funding_status to {customer.funding_status}")

#     db.session.commit()
#     logger.info(f"Successfully updated funding information for customer {customer_id}")
    
#     return jsonify({"message": "Funding information updated successfully!"}), 200

@funding.route("/customers/<int:customer_id>", methods=["PUT"])
def update_funding_info(customer_id):
    """
    Update funding details for a customer
    ---
    tags:
      - Funding Information
    """
    # ✅ Fetch the funding record for the customer
    funding_info = FundingInformation.query.filter_by(customer_id=customer_id).first()
    if not funding_info:
        return jsonify({"error": "No funding information found"}), 404

    # ✅ Fetch the corresponding customer
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"error": "Customer not found"}), 404

    # ✅ Get the updated data from request
    data = request.json
    print("Received Funding Update:", data)  # ✅ Debugging log

    # ✅ Update funding_information
    funding_info.funding_status = data.get("funding_status", funding_info.funding_status)
    funding_info.project_budget = data.get("project_budget", funding_info.project_budget)
    funding_info.decision_maker = data.get("decision_maker", funding_info.decision_maker)

    # ✅ Also update the customers table so the funding_status is consistent
    print("Updating Customer Funding Status:", data.get("funding_status"))  # ✅ Debugging log
    print("Updating Customer Project Budget:", data.get("project_budget"))  # ✅ Debugging log
    print("Updating Customer decision_maker:", data.get("decision_maker"))  # ✅ Debugging log
    customer.funding_status = data.get("funding_status", customer.funding_status)
    customer.project_budget = data.get("project_budget", customer.project_budget)
    customer.decision_maker = data.get("decision_maker", customer.decision_maker)

    # ✅ Commit both updates in the same transaction
    db.session.commit()

    return jsonify({"message": "Funding information updated successfully, customer funding status synced!"}), 200

# ✅ DELETE Funding Information
@funding.route("/customers/<int:customer_id>", methods=["DELETE"])
def delete_funding_info(customer_id):
    """
    Delete funding information for a customer
    ---
    tags:
      - Funding Information
    """
    funding_info = FundingInformation.query.filter_by(customer_id=customer_id).first()
    if not funding_info:
        return jsonify({"error": "No funding information found"}), 404

    db.session.delete(funding_info)
    db.session.commit()
    return jsonify({"message": "Funding information deleted successfully!"}), 200
