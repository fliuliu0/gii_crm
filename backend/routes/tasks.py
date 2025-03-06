from flask import Blueprint, jsonify, request
from config import db
from models import Task

tasks = Blueprint("tasks", __name__)

# ✅ Get all tasks for a project
@tasks.route("/projects/<int:project_id>", methods=["GET"])
def get_tasks(project_id):
    tasks = Task.query.filter_by(project_id=project_id).all()
    return jsonify([{
        "id": t.id,
        "description": t.description,
        "due_date": t.due_date.strftime("%Y-%m-%d"),
        "assigned_to": t.assigned_to,
        "status": t.status
    } for t in tasks])

# ✅ Add a new task
@tasks.route("/projects/<int:project_id>", methods=["POST"])
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

# ✅ Update a task
@tasks.route("/<int:task_id>", methods=["PUT"])
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

# ✅ Delete a task
@tasks.route("/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted successfully!"}), 200
