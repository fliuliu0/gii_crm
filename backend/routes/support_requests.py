from flask import Blueprint, jsonify, request
from config import db
from models import SupportRequest
from flasgger import swag_from

support_requests = Blueprint("support_requests", __name__)

# Get all support requests for a project
@support_requests.route("/projects/<int:project_id>", methods=["GET"])
@swag_from({
    "tags": ["Support Requests"],
    "summary": "Retrieve all support requests for a project",
    "description": "Fetches a list of all support requests associated with a given project ID.",
    "parameters": [
        {
            "name": "project_id",
            "in": "path",
            "required": True,
            "type": "integer",
            "description": "The ID of the project whose support requests should be retrieved."
        }
    ],
    "responses": {
        200: {
            "description": "A list of support requests for the project.",
            "examples": {
                "application/json": [
                    {
                        "id": 1,
                        "request_type": "Technical",
                        "description": "Server crash issue",
                        "status": "Pending",
                        "requested_by": "Alice Johnson"
                    },
                    {
                        "id": 2,
                        "request_type": "Financial",
                        "description": "Request for additional budget",
                        "status": "Approved",
                        "requested_by": "Bob Smith"
                    }
                ]
            }
        },
        404: {"description": "Project not found"}
    }
})
def get_support_requests(project_id):
    requests = SupportRequest.query.filter_by(project_id=project_id).all()
    return jsonify([{
        "id": r.id,
        "request_type": r.request_type,
        "description": r.description,
        "status": r.status,
        "requested_by": r.requested_by
    } for r in requests])

# Add a new support request
@support_requests.route("/projects/<int:project_id>", methods=["POST"])
@swag_from({
    "tags": ["Support Requests"],
    "summary": "Add a new support request",
    "description": "Allows users to submit a new support request for a project.",
    "parameters": [
        {
            "name": "project_id",
            "in": "path",
            "required": True,
            "type": "integer",
            "description": "The ID of the project to which the support request belongs."
        },
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "id": "SupportRequest",
                "required": ["request_type", "description", "requested_by"],
                "properties": {
                    "request_type": {"type": "string", "example": "Technical"},
                    "description": {"type": "string", "example": "Server down, needs urgent fix"},
                    "requested_by": {"type": "string", "example": "Alice Johnson"}
                }
            }
        }
    ],
    "responses": {
        201: {"description": "Support request added successfully"},
        400: {"description": "Invalid input data"}
    }
})
def add_support_request(project_id):
    data = request.json
    new_request = SupportRequest(
        project_id=project_id,
        request_type=data["request_type"],
        description=data["description"],
        status="Pending",
        requested_by=data["requested_by"]
    )
    db.session.add(new_request)
    db.session.commit()
    return jsonify({"message": "Support request added successfully!"}), 201

# Update request status
@support_requests.route("/<int:request_id>", methods=["PUT"])
@swag_from({
    "tags": ["Support Requests"],
    "summary": "Update a support request status",
    "description": "Allows users to update the status of a support request.",
    "parameters": [
        {
            "name": "request_id",
            "in": "path",
            "required": True,
            "type": "integer",
            "description": "The ID of the support request to update."
        },
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "id": "UpdateRequest",
                "required": ["status"],
                "properties": {
                    "status": {"type": "string", "example": "In Progress"}
                }
            }
        }
    ],
    "responses": {
        200: {"description": "Support request updated successfully"},
        404: {"description": "Request not found"}
    }
})
def update_request(request_id):
    request_entry = SupportRequest.query.get(request_id)
    if not request_entry:
        return jsonify({"error": "Request not found"}), 404

    data = request.json
    request_entry.status = data.get("status", request_entry.status)

    db.session.commit()
    return jsonify({"message": "Support request updated successfully!"}), 200
