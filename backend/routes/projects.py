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
def get_all_projects(): 
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

# Get all projects for a specific customer
@projects.route("/customers/<int:customer_id>", methods=["GET"])
@swag_from({
    "tags": ["Projects"],
    "summary": "Retrieve all projects for a specific customer",
    "description": "Fetches a list of all projects associated with a given customer ID.",
    "parameters": [
        {
            "name": "customer_id",
            "in": "path",
            "required": True,
            "type": "integer",
            "description": "The ID of the customer whose projects should be retrieved."
        }
    ],
    "responses": {
        200: {
            "description": "A list of projects for the customer.",
            "examples": {
                "application/json": [
                    {
                        "id": 1,
                        "project_name": "CRM System Upgrade",
                        "budget": 50000,
                        "phase": "In Progress",
                        "manager": "John Doe"
                    },
                    {
                        "id": 2,
                        "project_name": "New Marketing Platform",
                        "budget": 75000,
                        "phase": "Planning",
                        "manager": "Alice Smith"
                    }
                ]
            }
        },
        404: {"description": "Customer not found"}
    }
})
def get_projects_by_customer(customer_id): 
    projects = Project.query.filter_by(customer_id=customer_id).all()
    return jsonify([{
        "id": p.id,
        "project_name": p.project_name,
        "budget": float(p.budget) if p.budget else None,
        "phase": p.phase,
        "manager": p.manager
    } for p in projects])
    

# Get a specific project by project ID
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


# Add a new project for a specific customer
@projects.route("/customers/<int:customer_id>", methods=["POST"])
@swag_from({
    "tags": ["Projects"],
    "summary": "Add a new project",
    "parameters": [
        {
            "name": "customer_id",
            "in": "path",
            "required": True,
            "type": "integer",
            "description": "Customer ID to associate the project with"
        },
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "properties": {
                    "project_name": {"type": "string"},
                    "budget": {"type": "number"},
                    "phase": {"type": "string"},
                    "manager": {"type": "string"}
                }
            }
        }
    ],
    "responses": {
        201: {"description": "Project added successfully"},
        400: {"description": "Invalid request data"}
    }
})
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

# Update a project using project ID
@projects.route("/<int:project_id>", methods=["PUT"])
@swag_from({
    "tags": ["Projects"],
    "summary": "Update an existing project",
    "parameters": [
        {
            "name": "project_id",
            "in": "path",
            "required": True,
            "type": "integer",
            "description": "ID of the project to update"
        },
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "properties": {
                    "project_name": {"type": "string"},
                    "budget": {"type": "number"},
                    "phase": {"type": "string"},
                    "manager": {"type": "string"}
                }
            }
        }
    ],
    "responses": {
        200: {"description": "Project updated successfully"},
        404: {"description": "Project not found"}
    }
})
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

# Delete a project
@projects.route("/<int:project_id>", methods=["DELETE"])
@swag_from({
    "tags": ["Projects"],
    "summary": "Delete a project",
    "parameters": [
        {
            "name": "project_id",
            "in": "path",
            "required": True,
            "type": "integer",
            "description": "ID of the project to delete"
        }
    ],
    "responses": {
        200: {"description": "Project deleted successfully"},
        404: {"description": "Project not found"}
    }
})
def delete_project(project_id):
    project = Project.query.get(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    db.session.delete(project)
    db.session.commit()
    return jsonify({"message": "Project deleted successfully!"}), 200

# Get funding info for a project
@projects.route("/<int:project_id>/funding", methods=["GET"])
@swag_from({
    "tags": ["Projects"],
    "summary": "Retrieve funding information for a project",
    "parameters": [
        {
            "name": "project_id",
            "in": "path",
            "required": True,
            "type": "integer",
            "description": "ID of the project to fetch funding info"
        }
    ],
    "responses": {
        200: {"description": "Funding information retrieved"},
        404: {"description": "Project not found"}
    }
})
def get_project_funding(project_id):
    """
    Get funding info for a specific project.
    """
    project = Project.query.get(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    return jsonify({
        "id": project.id,
        "budget": project.budget,
        "funding_status": project.funding_status,
        "approval_date": project.approval_date,
        "decision_maker": project.manager 
    }), 200

# Update funding
@projects.route("/<int:project_id>/funding", methods=["PUT"])
@swag_from({
    "tags": ["Projects"],
    "summary": "Update funding details for a project",
    "parameters": [
        {
            "name": "project_id",
            "in": "path",
            "required": True,
            "type": "integer",
            "description": "ID of the project to update funding"
        },
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "properties": {
                    "funding_status": {
                        "type": "string",
                        "enum": ["Funded", "Approved", "Pending", "Rejected"],
                        "description": "New funding status"
                    }
                }
            }
        }
    ],
    "responses": {
        200: {"description": "Funding information updated"},
        400: {"description": "Invalid funding status"},
        404: {"description": "Project not found"}
    }
})
def update_project_funding(project_id):
    """
    Update funding details for a project.
    """
    project = Project.query.get(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    data = request.json

    print("Received request payload:", data)

    new_status = data.get("funding_status", project.funding_status)

    # Check if new_status is valid
    valid_statuses = ["Funded", "Approved", "Pending", "Rejected"]
    if new_status not in valid_statuses:
        return jsonify({"error": f"Invalid funding status. Must be one of {valid_statuses}"}), 400

    # If status changes to "Approved" or "Funded", set approval_date
    if new_status in ["Approved", "Funded"] and project.funding_status not in ["Approved", "Funded"]:
        project.approval_date = db.func.current_timestamp()
    elif new_status not in ["Approved", "Funded"]:
        project.approval_date = None  

    project.funding_status = new_status 

    db.session.commit()
    return jsonify({"message": "Funding information updated successfully!", "funding_status": new_status}), 200
