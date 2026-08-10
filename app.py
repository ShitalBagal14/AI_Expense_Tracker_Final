import os
from flask import Flask, request, jsonify, send_from_directory
import mysql.connector

app = Flask(__name__, static_folder='.', static_url_path='')

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://127.0.0.1:5501'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
MYSQL_USER = os.getenv('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', 'Shital@123')
MYSQL_DB = os.getenv('MYSQL_DB', 'ai_expense_tracker')

try:
    conn = mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB
    )
    cursor = conn.cursor(buffered=True)
except mysql.connector.Error as e:
    raise RuntimeError(
        f'MySQL connection failed: {e}\n'
        'Use the correct MySQL username/password or set them in environment variables.'
    ) from e

cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
''')

cursor.execute("SHOW COLUMNS FROM users LIKE 'phone'")
if not cursor.fetchone():
    cursor.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(20)")

conn.commit()

@app.route('/', methods=['GET'])
def home():
    return send_from_directory('.', 'index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return send_from_directory('.', 'register.html')

    full_name = request.form.get('full_name')
    email = request.form.get('email')
    phone = request.form.get('phone')
    password = request.form.get('password')
    confirm_password = request.form.get('confirm_password')

    if not full_name or not email or not password:
        return jsonify({'message': 'Please fill all required fields'}), 400

    if password != confirm_password:
        return jsonify({'message': 'Passwords do not match'}), 400

    cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
    if cursor.fetchone():
        return jsonify({'message': 'Email already exists'}), 400

    try:
        cursor.execute(
            'INSERT INTO users (full_name, email, phone, password) VALUES (%s, %s, %s, %s)',
            (full_name, email, phone, password)
        )
        conn.commit()
        return jsonify({'message': 'Registration successful'}), 201
    except mysql.connector.Error as e:
        return jsonify({'message': f'Registration failed: {str(e)}'}), 400

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return send_from_directory('.', 'login.html')

    email = request.form.get('email')
    password = request.form.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    cursor.execute('SELECT password FROM users WHERE email = %s', (email,))
    result = cursor.fetchone()

    if result and result[0] == password:
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'message': 'Invalid email or password'}), 401

if __name__ == '__main__':
    app.run(debug=True)
