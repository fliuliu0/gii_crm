from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from config import db
from models import User

users = Blueprint("users", __name__)

# Get all users
@users.route("/users", methods=["GET"])
def get_users():
    user_list = User.query.all()
    result = [
        {"id": u.id, "name": u.name, "email": u.email, "role": u.role}
        for u in user_list
    ]
    return jsonify(result)

# Add a new user
@users.route("/users", methods=["POST"])
def add_user():
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
    return jsonify({"message": "User added successfully!"})

# Login user & return JWT token
@users.route("/users/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()
    if user and user.check_password(data["password"]):
        token = create_access_token(identity=user.id)
        return jsonify({"message": "Login successful", "token": token})

    return jsonify({"error": "Invalid credentials"}), 401

# Delete a user
@users.route("/users/<int:id>", methods=["DELETE"])
def delete_user(id):
    user = User.query.get(id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully!"})
