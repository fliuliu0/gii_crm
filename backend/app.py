import mysql.connector
from flask import Flask, jsonify, request
from config import db, DATABASE_URL, SECRET_KEY
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flasgger import Swagger

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SECRET_KEY"] = SECRET_KEY
app.config["JWT_SECRET_KEY"] = SECRET_KEY  # Used for JWT Authentication

# Initialize Extensions
db.init_app(app)
CORS(app)
jwt = JWTManager(app)
swagger = Swagger(app)

# AWS RDS MySQL Connection (using mysql-connector)
def get_db_connection():
    return mysql.connector.connect(
        host="crm-db.cjqkqqq0a1xc.ap-southeast-1.rds.amazonaws.com",
        user="admin",
        password="crmdatabase",
        database="crm_db"
    )

# Import & Register Blueprints
from routes.communication import communication
from routes.projects import projects
from routes.reports import reports
from routes.sales import sales
from routes.customers import customers  
from routes.users import users
from routes.tasks import tasks

app.register_blueprint(users, url_prefix="/users")
app.register_blueprint(tasks, url_prefix="/tasks")
app.register_blueprint(communication, url_prefix="/communication")
app.register_blueprint(projects, url_prefix="/projects")
app.register_blueprint(reports, url_prefix="/reports")
app.register_blueprint(sales, url_prefix="/sales")
app.register_blueprint(customers, url_prefix="/customers")  


@app.route('/')
def home():
    return {"message": "CRM Backend Running"}

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
