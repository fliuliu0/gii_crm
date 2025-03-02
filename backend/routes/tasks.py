from flask import Blueprint, request, jsonify
from config import db
from models import Task
from flasgger import swag_from

tasks = Blueprint("tasks", __name__)

# Get all tasks
@tasks.route("/tasks", methods=["GET"])
@swag_from({
    "responses": {
        200: {
            "description": "Retrieve all tasks",
            "examples": {
                "application/json": [
                    {
                        "id": 1,
                        "project_id": 10,
                        "description": "Complete UI design",
                        "due_date": "2025-03-10",
                        "assigned_to": 3,
                        "status": "Pending"
                    }
                ]
            }
        }
    }
})
def get_tasks():
    """
    Get All Tasks
    ---
    tags:
      - Tasks
    responses:
      200:
        description: List of all tasks
    """
    all_tasks = Task.query.all()
    result = [
        {
            "id": t.id,
            "project_id": t.project_id,
            "description": t.description,
            "due_date": str(t.due_date),
            "assigned_to": t.assigned_to,
            "status": t.status
        }
        for t in all_tasks
    ]
    return jsonify(result)

# Add a new task
@tasks.route("/tasks", methods=["POST"])
@swag_from({
    "requestBody": {
        "required": True,
        "content": {
            "application/json": {
                "example": {
                    "project_id": 10,
                    "description": "Create API endpoints",
                    "due_date": "2025-03-15",
                    "assigned_to": 5,
                    "status": "In Progress"
                }
            }
        }
    },
    "responses": {
        201: {
            "description": "Task added successfully",
            "examples": {
                "application/json": {
                    "message": "Task added successfully!"
                }
            }
        }
    }
})
def add_task():
    """
    Add New Task
    ---
    tags:
      - Tasks
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              project_id:
                type: integer
              description:
                type: string
              due_date:
                type: string
                format: date
              assigned_to:
                type: integer
              status:
                type: string
    responses:
      201:
        description: Task created successfully
    """
    data = request.json
    new_task = Task(
        project_id=data["project_id"],
        description=data["description"],
        due_date=data["due_date"],
        assigned_to=data.get("assigned_to"),
        status=data.get("status", "Pending"),
    )
    db.session.add(new_task)
    db.session.commit()
    return jsonify({"message": "Task added successfully!"}), 201

# Update a task
@tasks.route("/tasks/<int:id>", methods=["PUT"])
@swag_from({
    "requestBody": {
        "required": True,
        "content": {
            "application/json": {
                "example": {
                    "description": "Update backend logic",
                    "due_date": "2025-03-18",
                    "assigned_to": 4,
                    "status": "Completed"
                }
            }
        }
    },
    "responses": {
        200: {
            "description": "Task updated successfully",
            "examples": {
                "application/json": {
                    "message": "Task updated successfully!"
                }
            }
        },
        404: {
            "description": "Task not found",
            "examples": {
                "application/json": {
                    "error": "Task not found"
                }
            }
        }
    }
})
def update_task(id):
    """
    Update Task
    ---
    tags:
      - Tasks
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              description:
                type: string
              due_date:
                type: string
                format: date
              assigned_to:
                type: integer
              status:
                type: string
    responses:
      200:
        description: Task updated successfully
      404:
        description: Task not found
    """
    task = Task.query.get(id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    data = request.json
    task.description = data.get("description", task.description)
    task.due_date = data.get("due_date", task.due_date)
    task.assigned_to = data.get("assigned_to", task.assigned_to)
    task.status = data.get("status", task.status)

    db.session.commit()
    return jsonify({"message": "Task updated successfully!"})

# Delete a task
@tasks.route("/tasks/<int:id>", methods=["DELETE"])
@swag_from({
    "responses": {
        200: {
            "description": "Task deleted successfully",
            "examples": {
                "application/json": {
                    "message": "Task deleted successfully!"
                }
            }
        },
        404: {
            "description": "Task not found",
            "examples": {
                "application/json": {
                    "error": "Task not found"
                }
            }
        }
    }
})
def delete_task(id):
    """
    Delete Task
    ---
    tags:
      - Tasks
    responses:
      200:
        description: Task deleted successfully
      404:
        description: Task not found
    """
    task = Task.query.get(id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted successfully!"})
