import os
from flask import Flask, request, jsonify, send_from_directory
import mysql.connector
from insights_engine import generate_insights

app = Flask(__name__, static_folder='.', static_url_path='')

ALLOWED_ORIGINS = {
    'http://127.0.0.1:5501',
    'http://localhost:5501',
    'http://127.0.0.1:5000',
    'http://localhost:5000',
}

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin')
    if origin in ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
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

DEFAULT_FINANCIAL_DATA = {
    'income': 75000,
    'expenses': 48500,
    'budget_total': 60000,
    'budget_spent': 48500,
    'categories': [
        {'name': 'Food & Dining', 'amount': 15520},
        {'name': 'Transportation', 'amount': 8730},
        {'name': 'Housing', 'amount': 7275},
        {'name': 'Utilities', 'amount': 4850},
        {'name': 'Entertainment', 'amount': 3880},
    ],
    'bills': [
        {'name': 'Electricity Bill', 'amount': 2500, 'type': 'utility'},
        {'name': 'Internet Bill', 'amount': 1200, 'type': 'utility'},
        {'name': 'Home Loan EMI', 'amount': 18500, 'type': 'emi'},
        {'name': 'Car Loan EMI', 'amount': 12000, 'type': 'emi'},
    ],
    'income_history': [52000, 58000, 61000, 64000, 70000, 73000, 75000],
    'expense_history': [38000, 42000, 45000, 46000, 47000, 48500, 48500],
}

@app.route('/api/insights', methods=['GET', 'POST', 'OPTIONS'])
def insights():
    if request.method == 'OPTIONS':
        return '', 204

    payload = DEFAULT_FINANCIAL_DATA.copy()
    if request.method == 'POST' and request.is_json:
        user_data = request.get_json(silent=True) or {}
        for key, value in user_data.items():
            if value is not None:
                payload[key] = value

    return jsonify(generate_insights(payload))

if __name__ == '__main__':
    app.run(debug=True)
