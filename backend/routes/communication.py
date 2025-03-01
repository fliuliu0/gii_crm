from flask import Blueprint, request, jsonify
from config import db
from models import CommunicationLog

communication = Blueprint('communication', __name__)

# Get all communication records
@communication.route('/communications', methods=['GET'])
def get_communications():
    records = CommunicationLog.query.all()
    result = [
        {
            "id": r.id,
            "customer_id": r.customer_id,
            "contact_type": r.contact_type,  # ✅ FIXED: Match database field
            "details": r.details,  # ✅ FIXED: Match database field
            "contact_date": r.contact_date  # ✅ FIXED: Match database field
        }
        for r in records
    ]
    return jsonify(result)

# Add new communication record
@communication.route('/communications', methods=['POST'])
def add_communication():
    data = request.json
    new_record = CommunicationLog(
        customer_id=data["customer_id"],
        contact_type=data["contact_type"],  # ✅ FIXED: Match database field
        details=data["details"]  # ✅ FIXED: Match database field
    )
    db.session.add(new_record)
    db.session.commit()
    return jsonify({"message": "Communication record added successfully!"})

# Delete a communication record
@communication.route('/communications/<int:id>', methods=['DELETE'])
def delete_communication(id):
    record = CommunicationLog.query.get(id)
    if not record:
        return jsonify({"error": "Record not found"}), 404

    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": "Communication record deleted successfully!"})
