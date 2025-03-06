from flask import Blueprint, jsonify, request
from config import db
from models import UpdateLog

update_logs = Blueprint("update_logs", __name__)

# ✅ Get logs for a project
@update_logs.route("/projects/<int:project_id>", methods=["GET"])
def get_logs(project_id):
    logs = UpdateLog.query.filter_by(project_id=project_id).all()
    return jsonify([{
        "id": log.id,
        "change_type": log.change_type,
        "responsible_person": log.responsible_person,
        "timestamp": log.timestamp,
        "comment": log.comment
    } for log in logs])

# ✅ Add a new log entry
@update_logs.route("/projects/<int:project_id>", methods=["POST"])
def add_log(project_id):
    data = request.json
    new_log = UpdateLog(
        project_id=project_id,
        change_type=data["change_type"],
        responsible_person=data["responsible_person"],
        comment=data["comment"]
    )
    db.session.add(new_log)
    db.session.commit()
    return jsonify({"message": "Log added successfully!"}), 201
