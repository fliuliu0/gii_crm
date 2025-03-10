from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User
from flasgger import swag_from
from config import db
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()


users = Blueprint("users", __name__)

# Get all users
@users.route("/", methods=["GET"])
@swag_from({
    "responses": {
        200: {
            "description": "Retrieve all users",
            "examples": {
                "application/json": [
                    {
                        "id": 1,
                        "name": "Alice Johnson",
                        "email": "alice@example.com",
                        "role": "Admin"
                    }
                ]
            }
        }
    }
})
def get_users():
    """
    Get All Users
    ---
    tags:
      - Users
    responses:
      200:
        description: List of all users
    """
    user_list = User.query.all()
    result = [
        {"id": u.id, "name": u.name, "email": u.email, "role": u.role}
        for u in user_list
    ]
    return jsonify(result)

#GET a specific user
@users.route("/<int:user_id>", methods=["GET"])
@swag_from({
    "parameters": [
        {
            "name": "user_id",
            "in": "path",
            "required": True,
            "schema": {
                "type": "integer"
            }
        }
    ],
    "responses": {
        200: {
            "description": "Retrieve user by ID",
            "examples": {
                "application/json": {
                    "id": 1,
                    "name": "Alice Johnson",
                    "email": "alice@example.com",
                    "role": "Admin"
                }
            }
        },
        404: {
            "description": "User not found",
            "examples": {
                "application/json": {
                    "error": "User not found"
                }
            }
        }
    }
})
def get_user(user_id):
    """
    Get Specific User by ID
    ---
    tags:
      - Users
    parameters:
      - name: user_id
        in: path
        required: True
        schema:
          type: integer
    responses:
      200:
        description: User found
      404:
        description: User not found
    """
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user_data = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }
    return jsonify(user_data), 200


# Add a new user
@users.route("/", methods=["POST"])
@swag_from({
    "requestBody": {
        "required": True,
        "content": {
            "application/json": {
                "example": {
                    "name": "John Doe",
                    "email": "john@example.com",
                    "role": "Manager",
                    "password": "securepassword"
                }
            }
        }
    },
    "responses": {
        201: {
            "description": "User added successfully",
            "examples": {
                "application/json": {
                    "message": "User added successfully!"
                }
            }
        },
        400: {
            "description": "Email already exists",
            "examples": {
                "application/json": {
                    "error": "Email already exists"
                }
            }
        }
    }
})
def add_user():
    """
    Add New User
    ---
    tags:
      - Users
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              name:
                type: string
              email:
                type: string
              role:
                type: string
              password:
                type: string
    responses:
      201:
        description: User created successfully
      400:
        description: Email already exists
    """
    data = request.json
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    new_user = User(
        name=data["name"],
        email=data["email"],
        role=data["role"],
    )
    new_user.set_password(data["password"])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User added successfully!"}), 201

# Login user & return JWT token
@users.route("/login", methods=["POST"])
@swag_from({
    "tags": ["Authentication"],
    "summary": "Login user & return JWT token",
    "description": "Authenticates a user based on email and password, and returns a JWT token with user role.",
    "parameters": [
        {
            "name": "body",
            "in": "body",
            "required": True,
            "schema": {
                "id": "LoginRequest",
                "required": ["email", "password"],
                "properties": {
                    "email": {
                        "type": "string",
                        "example": "bob@example.com"
                    },
                    "password": {
                        "type": "string",
                        "example": "password123"
                    }
                }
            }
        }
    ],
    "responses": {
        200: {
            "description": "Successful login",
            "examples": {
                "application/json": {
                    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...",
                    "role": "Admin"
                }
            }
        },
        401: {
            "description": "Invalid email or password"
        }
    }
})
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    # ✅ Use Flask-Bcrypt for password verification
    if not user or not bcrypt.check_password_hash(user.password, data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=user.id, additional_claims={"role": user.role})

    return jsonify({"token": token, "role": user.role}), 200


# Delete a user
@users.route("/<int:id>", methods=["DELETE"])
@swag_from({
    "responses": {
        200: {
            "description": "User deleted successfully",
            "examples": {
                "application/json": {
                    "message": "User deleted successfully!"
                }
            }
        },
        404: {
            "description": "User not found",
            "examples": {
                "application/json": {
                    "error": "User not found"
                }
            }
        }
    }
})
def delete_user(id):
    """
    Delete User
    ---
    tags:
      - Users
    responses:
      200:
        description: User deleted successfully
      404:
        description: User not found
    """
    user = User.query.get(id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully!"})

@users.route("/profile", methods=["GET"])
@swag_from({
    "tags": ["Authentication"],
    "summary": "Get authenticated user's profile",
    "description": "Fetches the profile details of the logged-in user using their JWT token.",
    "parameters": [
        {
            "name": "Authorization",
            "in": "header",
            "required": True,
            "type": "string",
            "description": "Bearer JWT token required for authentication"
        }
    ],
    "responses": {
        200: {
            "description": "User profile retrieved successfully",
            "examples": {
                "application/json": {
                    "id": 1,
                    "name": "Bob Example",
                    "email": "bob@example.com",
                    "role": "Admin"
                }
            }
        },
        401: {
            "description": "Invalid or expired token"
        },
        404: {
            "description": "User not found"
        }
    }
})
@jwt_required()
def profile():
    try:
        current_user_id = get_jwt_identity()  
        print("Decoded User ID:", current_user_id) 

        user = User.query.get(current_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }), 200
    except Exception as e:
        print("JWT Error:", str(e))  # 🔍 Log JWT error
        return jsonify({"error": "Invalid token"}), 401
