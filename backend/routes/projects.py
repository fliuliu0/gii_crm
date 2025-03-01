from flask import Blueprint, request, jsonify
from config import db
from models import Project

projects = Blueprint('projects', __name__)

# Get all projects
@projects.route('/projects', methods=['GET'])
def get_projects():
    project_list = Project.query.all()
    result = [
        {
            "id": p.id,
            "customer_id": p.customer_id,
            "project_name": p.project_name,  # ✅ FIXED: Match database field
            "budget": p.budget,
            "phase": p.phase,  # ✅ FIXED: Match database field
            "manager": p.manager  # ✅ FIXED: Added missing field
        }
        for p in project_list
    ]
    return jsonify(result)

# Add a new project
@projects.route('/projects', methods=['POST'])
def add_project():
    data = request.json
    new_project = Project(
        project_name=data["project_name"],  # ✅ FIXED: Match database field
        customer_id=data["customer_id"],
        phase=data["phase"],  # ✅ FIXED: Match database field
        budget=data["budget"],
        manager=data["manager"]  # ✅ FIXED: Added missing field
    )
    db.session.add(new_project)
    db.session.commit()
    return jsonify({"message": "Project added successfully!"})

# Delete a project
@projects.route('/projects/<int:id>', methods=['DELETE'])
def delete_project(id):
    project = Project.query.get(id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    db.session.delete(project)
    db.session.commit()
    return jsonify({"message": "Project deleted successfully!"})
