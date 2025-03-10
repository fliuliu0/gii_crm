from flask import Blueprint, jsonify, request
from config import db
from models import Task
from flasgger import swag_from

tasks = Blueprint("tasks", __name__)

# Get all tasks for a project
@tasks.route("/projects/<int:project_id>", methods=["GET"])
@swag_from({
    "tags": ["Tasks"],
    "summary": "Retrieve all tasks for a project",
    "description": "Fetches a list of all tasks associated with a given project ID.",
    "parameters": [
        {
            "name": "project_id",
            "in": "path",
            "required": True,
            "type": "integer",
            "description": "The ID of the project whose tasks should be retrieved."
        }
    ],
    "responses": {
        200: {
            "description": "A list of tasks for the project.",
            "examples": {
                "application/json": [
                    {
                        "id": 1,
                        "description": "Develop backend API",
                        "due_date": "2025-03-15",
                        "assigned_to": 3,
                        "status": "In Progress"
                    },
                    {
                        "id": 2,
                        "description": "Create frontend UI",
                        "due_date": "2025-03-20",
                        "assigned_to": 5,
                        "status": "Pending"
                    }
                ]
            }
        },
        404: {"description": "Project not found"}
    }
})
def get_tasks(project_id):
    tasks = Task.query.filter_by(project_id=project_id).all()
    return jsonify([{
        "id": t.id,
        "description": t.description,
        "due_date": t.due_date.strftime("%Y-%m-%d"),
        "assigned_to": t.assigned_to,
        "status": t.status
    } for t in tasks])

# Add a new task
@tasks.route("/projects/<int:project_id>", methods=["POST"])
@swag_from({
    "tags": ["Tasks"],
    "summary": "Add a new task to a project",
    "description": "Allows users to create a new task under a project.",
    "parameters": [
        {
            "name": "project_id",
            "in": "path",
            "required": True,
            "type": "integer",
            "description": "The ID of the project to which the task belongs."
        },
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "id": "Task",
                "required": ["description", "due_date"],
                "properties": {
                    "description": {"type": "string", "example": "Fix database issue"},
                    "due_date": {"type": "string", "format": "date", "example": "2025-03-18"},
                    "assigned_to": {"type": "integer", "example": 4},
                    "status": {"type": "string", "example": "Pending"}
                }
            }
        }
    ],
    "responses": {
        201: {"description": "Task added successfully"},
        400: {"description": "Invalid input data"}
    }
})
def add_task(project_id):
    data = request.json
    new_task = Task(
        project_id=project_id,
        description=data["description"],
        due_date=data["due_date"],
        assigned_to=data.get("assigned_to"),
        status=data.get("status", "Pending")
    )
    db.session.add(new_task)
    db.session.commit()
    return jsonify({"message": "Task added successfully!"}), 201

# Update a task
@tasks.route("/<int:task_id>", methods=["PUT"])
@swag_from({
    "tags": ["Tasks"],
    "summary": "Update a task",
    "description": "Allows users to update the details of an existing task.",
    "parameters": [
        {
            "name": "task_id",
            "in": "path",
            "required": True,
            "type": "integer",
            "description": "The ID of the task to update."
        },
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "id": "UpdateTask",
                "properties": {
                    "description": {"type": "string", "example": "Fix login issue"},
                    "due_date": {"type": "string", "format": "date", "example": "2025-03-22"},
                    "assigned_to": {"type": "integer", "example": 2},
                    "status": {"type": "string", "example": "In Progress"}
                }
            }
        }
    ],
    "responses": {
        200: {"description": "Task updated successfully"},
        404: {"description": "Task not found"}
    }
})
def update_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    data = request.json
    task.description = data.get("description", task.description)
    task.due_date = data.get("due_date", task.due_date)
    task.assigned_to = data.get("assigned_to", task.assigned_to)
    task.status = data.get("status", task.status)

    db.session.commit()
    return jsonify({"message": "Task updated successfully!"}), 200

                                     