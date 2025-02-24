import mysql.connector
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Replace with your correct IP
db = mysql.connector.connect(
    host="192.168.1.8",  # Your actual local IP
    user="root",
    password="root",
    database="crm_db"
)

cursor = db.cursor()
cursor.execute("SHOW DATABASES")
for db_name in cursor:
    print(db_name)

@app.route('/')
def home():
    return {"message": "CRM Backend Running"}

if __name__ == '__main__':
    app.run(debug=True)

