from flask import Blueprint, jsonify, request
from config import db
from models import UpdateLog
from flasgger import swag_from

update_logs = Blueprint("update_logs", __name__)

# Get logs for a project
@update_logs.route("/projects/<int:project_id>", methods=["GET"])
@swag_from({
    "tags": ["Update Logs"],
    "summary": "Retrieve all update logs for a project",
    "description": "Fetches a list of all update logs associated with a given project ID.",
    "parameters": [
        {
            "name": "project_id",
            "in": "path",
            "required": True,
            "type": "integer",
            "description": "The ID of the project whose logs should be retrieved."
        }
    ],
    "responses": {
        200: {
            "description": "A list of update logs for the project.",
            "examples": {
                "application/json": [
                    {
                        "id": 1,
                        "change_type": "Modification",
                        "responsible_person": "Alice Johnson",
                        "timestamp": "2025-03-10T14:32:00",
                        "comment": "Updated project budget details."
                    },
                    {
                        "id": 2,
                        "change_type": "Addition",
                        "responsible_person": "Bob Smith",
                        "timestamp": "2025-03-11T10:45:00",
                        "comment": "Added new project phase."
                    }
                ]
            }
        },
        404: {"description": "Project not found"}
    }
})
def get_logs(project_id):
    logs = UpdateLog.query.filter_by(project_id=project_id).all()
    return jsonify([{
        "id": log.id,
        "change_type": log.change_type,
        "responsible_person": log.responsible_person,
        "timestamp": log.timestamp,
        "comment": log.comment
    } for log in logs])

# Add a new log entry
@update_logs.route("/projects/<int:project_id>", methods=["POST"])
@swag_from({
    "tags": ["Update Logs"],
    "summary": "Add a new update log entry for a project",
    "description": "Creates a new log entry under a project for tracking changes.",
    "parameters": [
        {
            "name": "project_id",
            "in": "path",
            "required": True,
            "type": "integer",
            "description": "The ID of the project where the log entry will be added."
        },
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "id": "LogEntry",
                "required": ["change_type", "responsible_person", "comment"],
                "properties": {
                    "change_type": {
                        "type": "string",
                        "example": "Modification"
                    },
                    "responsible_person": {
                        "type": "string",
                        "example": "Charlie Davis"
                    },
                    "comment": {
                        "type": "string",
                        "example": "Fixed an issue with project timeline"
                    }
                }
            }
        }
    ],
    "responses": {
        201: {"description": "Log added successfully"},
        400: {"description": "Invalid input data"}
    }
})
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
