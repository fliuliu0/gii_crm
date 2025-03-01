from flask import Blueprint, request, jsonify
from config import db
from models import Task

tasks = Blueprint("tasks", __name__)

# Get all tasks
@tasks.route("/tasks", methods=["GET"])
def get_tasks():
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
def add_task():
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
    return jsonify({"message": "Task added successfully!"})

# Update a task
@tasks.route("/tasks/<int:id>", methods=["PUT"])
def update_task(id):
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
def delete_task(id):
    task = Task.query.get(id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted successfully!"})
