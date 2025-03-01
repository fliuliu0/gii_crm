from flask_bcrypt import Bcrypt
from config import db

bcrypt = Bcrypt()

# Authentication (users table is missing in your RDS, we will create it)
class User(db.Model):
    __tablename__ = "users"  # Explicitly define the table name

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # Admin, Sales, Manager

    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

class Customer(db.Model):  
    __tablename__ = "customers"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True)
    phone = db.Column(db.String(20))
    company = db.Column(db.String(100))  
    industry = db.Column(db.String(100))
    sales_stage = db.Column(db.String(50))  # e.g., New Lead, Negotiation, Closed-Won
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    address = db.Column(db.String(255))  

class SalesOpportunity(db.Model):
    __tablename__ = "sales"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"), nullable=False)  # ✅ Ensures FK to customers
    opportunity = db.Column(db.String(100), nullable=False)  # ✅ FIXED: Match DB column name
    sales_stage = db.Column(db.String(50))  # ✅ FIXED: Match DB column name
    revenue = db.Column(db.Float)  # ✅ FIXED: Match DB column name
    owner = db.Column(db.Integer, db.ForeignKey("users.id"))  # ✅ FIXED: Match DB column name
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"), nullable=False)  # ✅ Ensures FK to customers
    project_name = db.Column(db.String(100), nullable=False)  # ✅ FIXED: Match DB column name
    budget = db.Column(db.Float)
    phase = db.Column(db.String(50))  # ✅ FIXED: Match DB column name
    manager = db.Column(db.String(100))  # ✅ FIXED: Add missing manager field


class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)  # Links to projects
    description = db.Column(db.String(255), nullable=False)  # Task description
    due_date = db.Column(db.Date, nullable=False)  # Task deadline
    assigned_to = db.Column(db.Integer, db.ForeignKey("users.id"))  # Who is responsible
    status = db.Column(db.String(50), default="Pending")  # Task status: Pending, Done, In Progress

    project = db.relationship("Project", backref="tasks")
    assigned_user = db.relationship("User", backref="tasks")

class CommunicationLog(db.Model):
    __tablename__ = "communication_records"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"), nullable=False)  # ✅ Ensures FK to customers
    contact_type = db.Column(db.String(50))  # ✅ FIXED: Match DB column name
    details = db.Column(db.Text)  # ✅ FIXED: Match DB column name
    contact_date = db.Column(db.DateTime, default=db.func.current_timestamp())  # ✅ FIXED: Match DB column name
