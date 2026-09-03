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
        'Please set your MySQL credentials in environment variables or modify the defaults in app.py'
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
cursor.execute('''
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category VARCHAR(100) DEFAULT 'Other',
    description VARCHAR(255),
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
)
''')

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

    cursor.execute('SELECT password, full_name FROM users WHERE email = %s', (email,))
    result = cursor.fetchone()

    if result and result[0] == password:
        return jsonify({
            'message': 'Login successful',
            'user': {
                'fullName': result[1],
                'email': email
            }
        }), 200
    else:
        return jsonify({'message': 'Invalid email or password'}), 401

# ============================================================
# USER PROFILE API
# ============================================================

@app.route('/api/user/profile', methods=['GET', 'OPTIONS'])
def get_user_profile():
    if request.method == 'OPTIONS':
        return '', 204

    # For demo purposes, return sample profile data
    # In production, this would fetch from the database based on authenticated user
    return jsonify({
        'success': True,
        'user': {
            'fullName': 'Shital Bagal',
            'email': 'shitalbagal50@gmail.com',
            'mobile': '9876543210',
            'dob': '1995-05-15',
            'gender': 'female',
            'occupation': 'Software Engineer',
            'address': '123 Main Street',
            'city': 'Mumbai',
            'state': 'Maharashtra',
            'pincode': '400001'
        }
    })

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

# ============================================================
# ADD TRANSACTION
# ============================================================

@app.route('/api/transactions', methods=['POST', 'OPTIONS'])
def add_transaction():

    if request.method == 'OPTIONS':
        return '', 204

    data = request.get_json(silent=True) or {}

    transaction_type = data.get('type')
    amount = data.get('amount')
    category = data.get('category', 'Other')
    description = data.get('description', '')
    transaction_date = data.get('date')

    # Validate required fields
    if not transaction_type or amount is None or not transaction_date:
        return jsonify({
            'success': False,
            'message': 'Type, amount and date are required'
        }), 400

    if transaction_type not in ['income', 'expense']:
        return jsonify({
            'success': False,
            'message': 'Type must be income or expense'
        }), 400

    try:

        amount = float(amount)

        if amount <= 0:
            return jsonify({
                'success': False,
                'message': 'Amount must be greater than 0'
            }), 400

        cursor.execute('''
            INSERT INTO transactions
            (type, amount, category, description, transaction_date)
            VALUES (%s, %s, %s, %s, %s)
        ''', (
            transaction_type,
            amount,
            category,
            description,
            transaction_date
        ))

        conn.commit()

        return jsonify({
            'success': True,
            'message': 'Transaction added successfully',
            'transaction_id': cursor.lastrowid
        }), 201

    except mysql.connector.Error as e:

        conn.rollback()

        return jsonify({
            'success': False,
            'message': str(e)
        }), 500 

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
from datetime import date, datetime

@app.route('/api/reports', methods=['GET', 'OPTIONS'])
def reports():

    if request.method == 'OPTIONS':
        return '', 204

    try:
        # Number of months requested by frontend
        months = request.args.get('months', default=6, type=int)

        if months not in [3, 6, 12]:
            months = 6

        # Get all transactions
        cursor.execute("""
            SELECT
                type,
                amount,
                category,
                transaction_date
            FROM transactions
            ORDER BY transaction_date ASC
        """)

        rows = cursor.fetchall()

        # -----------------------------------------
        # CURRENT DATE
        # -----------------------------------------

        today = date.today()

        current_month = today.month
        current_year = today.year

        # -----------------------------------------
        # CREATE LAST N MONTHS
        # -----------------------------------------

        month_list = []

        year = current_year
        month = current_month

        for _ in range(months):

            month_list.append((year, month))

            month -= 1

            if month == 0:
                month = 12
                year -= 1

        month_list.reverse()

        # -----------------------------------------
        # MONTH LABELS
        # -----------------------------------------

        labels = []

        for year, month in month_list:

            month_name = datetime(
                year,
                month,
                1
            ).strftime('%b')

            labels.append(month_name)

        # -----------------------------------------
        # MONTHLY DATA
        # -----------------------------------------

        monthly_income = [0] * months
        monthly_expenses = [0] * months

        # -----------------------------------------
        # CATEGORY DATA
        # -----------------------------------------

        category_totals = {}

        total_income = 0
        total_expenses = 0

        # -----------------------------------------
        # PROCESS TRANSACTIONS
        # -----------------------------------------

        for row in rows:

            transaction_type = row[0]
            amount = float(row[1])
            category = row[2] or 'Other'
            transaction_date = row[3]

            if not transaction_date:
                continue

            # Convert datetime to date if required
            if isinstance(
                transaction_date,
                datetime
            ):
                transaction_date = transaction_date.date()

            transaction_year = transaction_date.year
            transaction_month = transaction_date.month

            # -------------------------------------
            # TOTALS
            # -------------------------------------

            if transaction_type == 'income':

                total_income += amount

            elif transaction_type == 'expense':

                total_expenses += amount

                # Category totals
                category_totals[category] = (
                    category_totals.get(category, 0)
                    + amount
                )

            # -------------------------------------
            # MONTHLY DATA
            # -------------------------------------

            for index, (y, m) in enumerate(month_list):

                if (
                    transaction_year == y
                    and transaction_month == m
                ):

                    if transaction_type == 'income':

                        monthly_income[index] += amount

                    elif transaction_type == 'expense':

                        monthly_expenses[index] += amount

                    break

        # -----------------------------------------
        # SAVINGS
        # -----------------------------------------

        total_savings = (
            total_income - total_expenses
        )

        if total_income > 0:

            savings_rate = (
                total_savings /
                total_income
            ) * 100

        else:

            savings_rate = 0

        # -----------------------------------------
        # MONTHLY SAVINGS
        # -----------------------------------------

        monthly_savings = []

        for i in range(months):

            saving = (
                monthly_income[i]
                - monthly_expenses[i]
            )

            monthly_savings.append(saving)

        # -----------------------------------------
        # CATEGORY SORTING
        # -----------------------------------------

        sorted_categories = sorted(
            category_totals.items(),
            key=lambda x: x[1],
            reverse=True
        )

        category_labels = [
            item[0]
            for item in sorted_categories
        ]

        category_values = [
            round(item[1], 2)
            for item in sorted_categories
        ]

        # -----------------------------------------
        # TOP CATEGORY
        # -----------------------------------------

        if sorted_categories:

            top_category = {
                'name': sorted_categories[0][0],
                'amount': round(
                    sorted_categories[0][1],
                    2
                )
            }

        else:

            top_category = {
                'name': 'No data',
                'amount': 0
            }

        # -----------------------------------------
        # RESPONSE
        # -----------------------------------------

        return jsonify({

            'success': True,

            'summary': {

                'total_income':
                    round(total_income, 2),

                'total_expenses':
                    round(total_expenses, 2),

                'total_savings':
                    round(total_savings, 2),

                'savings_rate':
                    round(savings_rate, 1)

            },

            'monthly': {

                'labels':
                    labels,

                'income':
                    [
                        round(x, 2)
                        for x in monthly_income
                    ],

                'expenses':
                    [
                        round(x, 2)
                        for x in monthly_expenses
                    ],

                'savings':
                    [
                        round(x, 2)
                        for x in monthly_savings
                    ]

            },

            'categories': {

                'labels':
                    category_labels,

                'values':
                    category_values

            },

            'top_category':
                top_category

        })

    except mysql.connector.Error as e:

        print(
            "Reports database error:",
            e
        )

        return jsonify({

            'success': False,

            'message':
                'Database error while loading reports',

            'error':
                str(e)

        }), 500

    except Exception as e:

        print(
            "Reports error:",
            e
        )

        return jsonify({

            'success': False,

            'message':
                'Unable to generate reports',

            'error':
                str(e)

        }), 500


if __name__ == '__main__':
    app.run(debug=True)
