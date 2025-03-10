from flask import request, jsonify
from functools import wraps
import jwt
from config import SECRET_KEY
from models import User, db

def role_required(allowed_roles):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            token = request.headers.get("Authorization")
            if not token:
                return jsonify({"error": "Unauthorized"}), 401
            
            try:
                decoded_token = jwt.decode(token.split(" ")[1], SECRET_KEY, algorithms=["HS256"])
                user = User.query.get(decoded_token["user_id"])

                if not user or user.role not in allowed_roles:
                    return jsonify({"error": "Access Denied"}), 403
                
                return func(*args, **kwargs)
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expired"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"error": "Invalid token"}), 401
        return wrapper
    return decorator
