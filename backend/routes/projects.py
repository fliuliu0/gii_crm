from flask import Blueprint, request, jsonify
from config import db
from models import Project
from flasgger import swag_from

projects = Blueprint('projects', __name__)

# Get all projects
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
def get_projects():
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

# Add a new project
@projects.route('/', methods=['POST'])
@swag_from({
    "parameters": [
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "id": "Project",
                "required": ["customer_id", "project_name", "budget", "phase", "manager"],
                "properties": {
                    "customer_id": {"type": "integer"},
                    "project_name": {"type": "string"},
                    "budget": {"type": "number"},
                    "phase": {"type": "string"},
                    "manager": {"type": "string"}
                }
            }
        }
    ],
    "responses": {
        201: {
            "description": "Project added successfully"
        }
    }
})
def add_project():
    """
    Add a new project
    ---
    tags:
      - Projects
    parameters:
      - name: body
        in: body
        required: True
        schema:
          id: Project
          required:
            - customer_id
            - project_name
            - budget
            - phase
            - manager
          properties:
            customer_id:
              type: integer
            project_name:
              type: string
            budget:
              type: number
            phase:
              type: string
            manager:
              type: string
    responses:
      201:
        description: Project added successfully
    """
    data = request.json
    new_project = Project(
        project_name=data["project_name"],
        customer_id=data["customer_id"],
        phase=data["phase"],
        budget=data["budget"],
        manager=data["manager"]
    )
    db.session.add(new_project)
    db.session.commit()
    return jsonify({"message": "Project added successfully!"}), 201

# Delete a project
@projects.route('/<int:id>', methods=['DELETE'])
@swag_from({
    "responses": {
        200: {
            "description": "Project deleted successfully"
        },
        404: {
            "description": "Project not found"
        }
    }
})
def delete_project(id):
    """
    Delete a project
    ---
    tags:
      - Projects
    parameters:
      - name: id
        in: path
        required: True
        type: integer
    responses:
      200:
        description: Project deleted successfully
      404:
        description: Project not found
    """
    project = Project.query.get(id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    db.session.delete(project)
    db.session.commit()
    return jsonify({"message": "Project deleted successfully!"})
