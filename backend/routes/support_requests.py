from flask import Blueprint, jsonify, request
from config import db
from models import SupportRequest

support_requests = Blueprint("support_requests", __name__)

# ✅ Get all support requests for a project
@support_requests.route("/projects/<int:project_id>", methods=["GET"])
def get_support_requests(project_id):
    requests = SupportRequest.query.filter_by(project_id=project_id).all()
    return jsonify([{
        "id": r.id,
        "request_type": r.request_type,
        "description": r.description,
        "status": r.status,
        "requested_by": r.requested_by
    } for r in requests])

# ✅ Add a new support request
@support_requests.route("/projects/<int:project_id>", methods=["POST"])
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

# ✅ Update request status
@support_requests.route("/<int:request_id>", methods=["PUT"])
def update_request(request_id):
    request_entry = SupportRequest.query.get(request_id)
    if not request_entry:
        return jsonify({"error": "Request not found"}), 404

    data = request.json
    request_entry.status = data.get("status", request_entry.status)

    db.session.commit()
    return jsonify({"message": "Support request updated successfully!"}), 200
