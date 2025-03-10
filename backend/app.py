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
app.config['JWT_ALGORITHM'] = 'HS256'
app.config['JWT_DECODE_ALGORITHMS'] = ['HS256']
app.config["JWT_VERIFY_SUB"] = False


# Allow requests from frontend
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# ✅ Initialize JWT after setting config
jwt = JWTManager(app)

# Initialize Extensions
db.init_app(app)

swagger = Swagger(app)

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({"message": "CORS preflight passed"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response

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
from routes.customers import customers  
from routes.users import users
from routes.tasks import tasks
# from routes.funding import funding
from routes.interactions import interactions
from routes.update_logs import update_logs
from routes.support_requests import support_requests
from routes.sales_opportunity import sales_opportunity

# Register blueprints
app.register_blueprint(users, url_prefix="/users")
app.register_blueprint(tasks, url_prefix="/tasks")
app.register_blueprint(communication, url_prefix="/communication")
app.register_blueprint(projects, url_prefix="/projects")
app.register_blueprint(reports, url_prefix="/reports")
app.register_blueprint(sales_opportunity, url_prefix="/sales_opportunity")
app.register_blueprint(customers, url_prefix="/customers")  
# app.register_blueprint(funding, url_prefix="/funding")
app.register_blueprint(interactions, url_prefix="/interactions")
app.register_blueprint(update_logs, url_prefix="/update_logs")
app.register_blueprint(support_requests, url_prefix="/support_requests")


@app.route('/')
def home():
    return {"message": "CRM Backend Running"}

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
