from flask import Blueprint, request, jsonify
from config import db
from models import CommunicationLog
from flasgger import swag_from

communication = Blueprint('communication', __name__)

# Get all communication records
@communication.route('/', methods=['GET'])
@swag_from({
    "responses": {
        200: {
            "description": "Retrieve all communication records",
            "examples": {
                "application/json": [
                    {
                        "id": 1,
                        "customer_id": 2,
                        "contact_type": "Email",
                        "details": "Follow-up on proposal",
                        "contact_date": "2025-03-01T12:00:00"
                    }
                ]
            }
        }
    }
})
def get_communications():
    """
    Get all communication records
    ---
    tags:
      - Communication
    responses:
      200:
        description: A list of communication records
    """
    records = CommunicationLog.query.all()
    result = [
        {
            "id": r.id,
            "customer_id": r.customer_id,
            "contact_type": r.contact_type,
            "details": r.details,
            "contact_date": r.contact_date
        }
        for r in records
    ]
    return jsonify(result)

# Add new communication record
@communication.route('/', methods=['POST'])
@swag_from({
    "parameters": [
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "id": "CommunicationLog",
                "required": ["customer_id", "contact_type", "details"],
                "properties": {
                    "customer_id": {"type": "integer"},
                    "contact_type": {"type": "string"},
                    "details": {"type": "string"}
                }
            }
        }
    ],
    "responses": {
        201: {
            "description": "Communication record added successfully"
        }
    }
})
def add_communication():
    """
    Add a new communication record
    ---
    tags:
      - Communication
    parameters:
      - name: body
        in: body
        required: True
        schema:
          id: CommunicationLog
          required:
            - customer_id
            - contact_type
            - details
          properties:
            customer_id:
              type: integer
            contact_type:
              type: string
            details:
              type: string
    responses:
      201:
        description: Communication record added successfully
    """
    data = request.json
    new_record = CommunicationLog(
        customer_id=data["customer_id"],
        contact_type=data["contact_type"],
        details=data["details"]
    )
    db.session.add(new_record)
    db.session.commit()
    return jsonify({"message": "Communication record added successfully!"}), 201

# Delete a communication record
@communication.route('/<int:id>', methods=['DELETE'])
@swag_from({
    "responses": {
        200: {
            "description": "Communication record deleted successfully"
        },
        404: {
            "description": "Communication record not found"
        }
    }
})
def delete_communication(id):
    """
    Delete a communication record
    ---
    tags:
      - Communication
    parameters:
      - name: id
        in: path
        required: True
        type: integer
    responses:
      200:
        description: Communication record deleted successfully
      404:
        description: Communication record not found
    """
    record = CommunicationLog.query.get(id)
    if not record:
        return jsonify({"error": "Record not found"}), 404

    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": "Communication record deleted successfully!"})
