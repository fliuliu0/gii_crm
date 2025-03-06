from flask import Blueprint, request, jsonify
from config import db
from models import Project
from flasgger import swag_from

projects = Blueprint('projects', __name__)

# ✅ Get all projects
@projects.route('/', methods=['GET'])
@swag_from({
    "responses": {
        200: {
            "description": "Retrieve all projects",
            "examples": {
                "application/json": [
                    {
                        "id": 1,
                        "customer_id": 3,
                        "project_name": "CRM System Upgrade",
                        "budget": 50000,
                        "phase": "In Progress",
                        "manager": "John Doe"
                    }
                ]
            }
        }
    }
})
def get_all_projects():  # 🔹 Renamed function to avoid duplication
    """
    Get all projects
    ---
    tags:
      - Projects
    responses:
      200:
        description: A list of projects
    """
    project_list = Project.query.all()
    result = [
        {
            "id": p.id,
            "customer_id": p.customer_id,
            "project_name": p.project_name,
            "budget": p.budget,
            "phase": p.phase,
            "manager": p.manager
        }
        for p in project_list
    ]
    return jsonify(result)

# ✅ Get all projects for a specific customer
@projects.route("/customers/<int:customer_id>", methods=["GET"])
def get_projects_by_customer(customer_id):  # 🔹 Renamed function to avoid conflict
    projects = Project.query.filter_by(customer_id=customer_id).all()
    return jsonify([{
        "id": p.id,
        "project_name": p.project_name,
        "budget": float(p.budget) if p.budget else None,
        "phase": p.phase,
        "manager": p.manager
    } for p in projects])
    

# ✅ Get a specific project by project ID
@projects.route("/<int:project_id>", methods=["GET"])
@swag_from({
    "responses": {
        200: {
            "description": "Retrieve project details",
            "examples": {
                "application/json": {
                    "id": 1,
                    "customer_id": 3,
                    "project_name": "CRM System Upgrade",
                    "budget": 50000,
                    "phase": "In Progress",
                    "manager": "John Doe"
                }
            }
        },
        404: {"description": "Project not found"}
    }
})
def get_project_by_id(project_id):
    """
    Get details of a specific project
    ---
    tags:
      - Projects
    parameters:
      - name: project_id
        in: path
        required: true
        type: integer
    responses:
      200:
        description: Returns project details
      404:
        description: Project not found
    """
    project = Project.query.get(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    return jsonify({
        "id": project.id,
        "customer_id": project.customer_id,
        "project_name": project.project_name,
        "budget": float(project.budget) if project.budget else None,
        "phase": project.phase,
        "manager": project.manager
    })


# ✅ Add a new project
@projects.route("/customers/<int:customer_id>", methods=["POST"])
def add_project(customer_id):
    data = request.json
    new_project = Project(
        customer_id=customer_id,
        project_name=data["project_name"],
        budget=data.get("budget"),
        phase=data.get("phase"),
        manager=data.get("manager")
    )
    db.session.add(new_project)
    db.session.commit()
    return jsonify({"message": "Project added successfully!"}), 201

# ✅ Update a project
@projects.route("/<int:project_id>", methods=["PUT"])
def update_project(project_id):
    project = Project.query.get(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    data = request.json
    project.project_name = data.get("project_name", project.project_name)
    project.budget = data.get("budget", project.budget)
    project.phase = data.get("phase", project.phase)
    project.manager = data.get("manager", project.manager)

    db.session.commit()
    return jsonify({"message": "Project updated successfully!"}), 200

# ✅ Delete a project
@projects.route("/<int:project_id>", methods=["DELETE"])
def delete_project(project_id):
    project = Project.query.get(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    db.session.delete(project)
    db.session.commit()
    return jsonify({"message": "Project deleted successfully!"}), 200
