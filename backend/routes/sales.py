from flask import Blueprint, request, jsonify
from config import db
from models import SalesOpportunity

sales = Blueprint('sales', __name__)

# Get all sales opportunities
@sales.route('/sales', methods=['GET'])
def get_sales():
    sales_list = SalesOpportunity.query.all()
    result = [
        {
            "id": s.id,
            "customer_id": s.customer_id,
            "opportunity": s.opportunity,  # ✅ FIXED: Match database field
            "sales_stage": s.sales_stage,  # ✅ FIXED: Match database field
            "revenue": s.revenue,  # ✅ FIXED: Match database field
            "owner": s.owner  # ✅ FIXED: Match database field
        }
        for s in sales_list
    ]
    return jsonify(result)

# Add a new sales opportunity
@sales.route('/sales', methods=['POST'])
def add_sales():
    data = request.json
    new_sales = SalesOpportunity(
        customer_id=data["customer_id"],
        opportunity=data["opportunity"],  # ✅ FIXED: Match database field
        sales_stage=data["sales_stage"],  # ✅ FIXED: Match database field
        revenue=data["revenue"],  # ✅ FIXED: Match database field
        owner=data["owner"]  # ✅ FIXED: Match database field
    )
    db.session.add(new_sales)
    db.session.commit()
    return jsonify({"message": "Sales opportunity added successfully!"})

# Delete a sales opportunity
@sales.route('/sales/<int:id>', methods=['DELETE'])
def delete_sales(id):
    sales_opportunity = SalesOpportunity.query.get(id)
    if not sales_opportunity:
        return jsonify({"error": "Sales opportunity not found"}), 404

    db.session.delete(sales_opportunity)
    db.session.commit()
    return jsonify({"message": "Sales opportunity deleted successfully!"})
