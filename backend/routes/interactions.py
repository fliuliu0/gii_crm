from flask import Blueprint, jsonify, request
from config import db
from models import CustomerInteraction
from flasgger import swag_from

interactions = Blueprint("interactions", __name__)

from flask import Blueprint, request, jsonify
from config import db
from models import CustomerInteraction
import os
from werkzeug.utils import secure_filename

interactions = Blueprint("interactions", __name__)

UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@interactions.route("/<int:customer_id>", methods=["GET"])
def get_interactions(customer_id):
    interactions = CustomerInteraction.query.filter_by(customer_id=customer_id).all()
    result = [
        {
            "id": i.id,
            "interaction_type": i.interaction_type,
            "interaction_date": i.interaction_date,
            "details": i.details,
            "file_path": i.file_path
        }
        for i in interactions
    ]
    return jsonify(result)

@interactions.route("/<int:customer_id>", methods=["POST"])
def add_interaction(customer_id):
    data = request.form
    file = request.files.get("file")
    file_path = None

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

    new_interaction = CustomerInteraction(
        customer_id=customer_id,
        interaction_type=data["interaction_type"],
        details=data.get("details"),
        file_path=file_path
    )
    db.session.add(new_interaction)
    db.session.commit()
    
    return jsonify({"message": "Interaction added successfully!"}), 201
