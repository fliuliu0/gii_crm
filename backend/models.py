from datetime import datetime, timezone
from flask_bcrypt import Bcrypt
from config import db
from werkzeug.security import generate_password_hash, check_password_hash

bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.Enum('Admin', 'Sales', 'Project Manager'), nullable=False)

    def set_password(self, password):
        """Hashes the password before storing it."""
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Verifies hashed password."""
        return bcrypt.check_password_hash(self.password, password)

    def __repr__(self):
        return f"<User {self.name} - {self.role}>"


class Customer(db.Model):
    __tablename__ = "customers"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone = db.Column(db.String(50))
    company = db.Column(db.String(255))
    industry = db.Column(db.String(255))
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    address = db.Column(db.String(255))
    location = db.Column(db.String(255))  # ✅ Ensure this is added
    tags = db.Column(db.String(255))
    technical_evaluator = db.Column(db.String(100))
    
    # ✅ Relationships
    interactions = db.relationship("CustomerInteraction", backref="customer", lazy=True, cascade="all, delete")

# class FundingInformation(db.Model):
#     __tablename__ = "funding_information"

#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)  # ✅ Link to projects, not customers
#     funding_status = db.Column(db.Enum("Funded", "Approved", "Pending", "Rejected"), nullable=False)
#     project_budget = db.Column(db.Numeric(15,2))
#     approval_date = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
#     decision_maker = db.Column(db.String(100))

#     project = db.relationship("Project", back_populates="funding_info")  # ✅ Create relationship


class CustomerInteraction(db.Model):
    __tablename__ = "customer_interactions"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"), nullable=False)
    interaction_type = db.Column(db.Enum("Email", "Call", "Meeting", "File Upload"), nullable=False)
    interaction_date = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    details = db.Column(db.Text)
    file_path = db.Column(db.String(255))  # Store file path if it's an upload

class SalesOpportunity(db.Model):
    __tablename__ = "sales_opportunity"

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
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"), nullable=False)
    project_name = db.Column(db.String(200), nullable=False)
    budget = db.Column(db.Float)
    phase = db.Column(db.String(100))
    manager = db.Column(db.String(100))
    funding_status = db.Column(db.Enum("Funded", "Approved", "Pending", "Rejected"), nullable=False, default="Pending")
    approval_date = db.Column(db.TIMESTAMP, nullable=True)

    update_logs = db.relationship("UpdateLog", back_populates="project", cascade="all, delete-orphan")
    support_requests = db.relationship("SupportRequest", back_populates="project", cascade="all, delete-orphan")
    tasks = db.relationship("Task", back_populates="project", cascade="all, delete-orphan")

class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(
        db.Integer,
        db.ForeignKey('projects.id', ondelete='CASCADE'),
        nullable=False
    )
    description = db.Column(db.String(255), nullable=False)  # Task description
    due_date = db.Column(db.Date, nullable=False)  # Task deadline
    assigned_to = db.Column(db.String, db.ForeignKey("users.email"))  # Who is responsible
    status = db.Column(db.String(50), default="Pending")  # Task status: Pending, Done, In Progress

    project = db.relationship(
        'Project',
        back_populates='tasks',
        passive_deletes=True
    )
    assigned_user = db.relationship("User", backref="tasks")

class CommunicationLog(db.Model):
    __tablename__ = "communication_records"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"), nullable=False)  # ✅ Ensures FK to customers
    contact_type = db.Column(db.String(50))  # ✅ FIXED: Match DB column name
    details = db.Column(db.Text)  # ✅ FIXED: Match DB column name
    contact_date = db.Column(db.DateTime, default=db.func.current_timestamp())  # ✅ FIXED: Match DB column name


class SupportRequest(db.Model):
    __tablename__ = 'support_requests'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    request_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default='Pending', nullable=False)
    requested_by = db.Column(db.String(100), nullable=False)

    project = db.relationship('Project', back_populates='support_requests')
    
class UpdateLog(db.Model):
    __tablename__ = 'update_logs'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    change_type = db.Column(db.String(100), nullable=False)
    responsible_person = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    comment = db.Column(db.Text)

    project = db.relationship('Project', back_populates='update_logs')
