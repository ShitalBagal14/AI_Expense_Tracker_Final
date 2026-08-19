"""Rule-based financial insights engine for the AI Insights module."""


def _format_inr(amount):
    return round(amount)


def _health_label(score):
    if score >= 80:
        return 'Excellent — You are in great financial shape.'
    if score >= 65:
        return 'Good — You are managing your finances well.'
    if score >= 50:
        return 'Fair — There is room to improve your spending habits.'
    return 'Needs Attention — Review your budget and reduce unnecessary expenses.'


def _predict_next_month(values):
    if not values:
        return 0
    if len(values) == 1:
        return values[0]
    recent = values[-3:]
    if len(recent) >= 2:
        avg_change = sum(recent[i] - recent[i - 1] for i in range(1, len(recent))) / (len(recent) - 1)
        return max(0, recent[-1] + avg_change)
    return recent[-1]


def _category_change_note(categories, category_name, threshold_pct=15):
    total = sum(c['amount'] for c in categories) or 1
    target = next((c for c in categories if c['name'] == category_name), None)
    if not target:
        return None
    share = (target['amount'] / total) * 100
    if share >= 25:
        return f'You spent {threshold_pct}% more on {category_name.lower()} this month.'
    return None


def generate_insights(data):
    income = float(data.get('income', 0))
    expenses = float(data.get('expenses', 0))
    budget_total = float(data.get('budget_total', 0))
    budget_spent = float(data.get('budget_spent', expenses))
    categories = data.get('categories', [])
    bills = data.get('bills', [])
    income_history = [float(v) for v in data.get('income_history', [])]
    expense_history = [float(v) for v in data.get('expense_history', [])]

    savings = max(0, income - expenses)
    savings_rate = (savings / income * 100) if income > 0 else 0

    total_expenses = sum(c['amount'] for c in categories) or expenses or 1
    top_category = max(categories, key=lambda c: c['amount']) if categories else {
        'name': 'Uncategorized',
        'amount': expenses,
    }
    top_pct = round((top_category['amount'] / total_expenses) * 100)

    emi_total = sum(b['amount'] for b in bills if b.get('type') == 'emi')
    upcoming_total = sum(b['amount'] for b in bills)
    emi_ratio = (emi_total / income * 100) if income > 0 else 0

    budget_usage = (budget_spent / budget_total * 100) if budget_total > 0 else 0

    expense_trend_penalty = 0
    if len(expense_history) >= 2 and len(income_history) >= 2:
        expense_growth = expense_history[-1] - expense_history[-2]
        income_growth = income_history[-1] - income_history[-2]
        if expense_growth > income_growth and expense_growth > 0:
            expense_trend_penalty = 10

    score = 100
    score -= max(0, (20 - savings_rate) * 1.5) if savings_rate < 20 else 0
    score -= max(0, budget_usage - 90) * 0.5 if budget_total > 0 else 0
    score -= expense_trend_penalty
    score -= max(0, emi_ratio - 30) * 0.8
    score -= max(0, top_pct - 35) * 0.4
    score = max(0, min(100, round(score)))

    recommendations = []

    if top_category['name'] == 'Food & Dining' and top_pct >= 25:
        cap = _format_inr(top_category['amount'] * 0.9)
        recommendations.append(
            f'Try to keep dining out expenses below ₹{cap:,} per month.'
        )

    if savings_rate < 20:
        recommendations.append(
            'Aim to save at least 20% of your income each month by trimming discretionary spending.'
        )

    if emi_ratio >= 30:
        recommendations.append(
            'EMI payments are high relative to income — consider prepaying smaller loans first.'
        )

    entertainment = next((c for c in categories if c['name'] == 'Entertainment'), None)
    if entertainment and entertainment['amount'] >= 3000:
        save_amount = _format_inr(entertainment['amount'] * 0.3)
        recommendations.append(
            f'You can save ₹{save_amount:,} by reducing entertainment expenses.'
        )

    if budget_total > 0 and budget_spent > budget_total:
        over = _format_inr(budget_spent - budget_total)
        recommendations.append(
            f'You are ₹{over:,} over budget — review non-essential purchases this month.'
        )

    if not recommendations:
        recommendations.append('Consider investing in a mutual fund SIP for better long-term returns.')
        recommendations.append('You can save more by setting a monthly budget for each category.')
        recommendations.append('Keep tracking expenses daily to maintain your financial health.')

    predicted_income = _format_inr(_predict_next_month(income_history) or income)
    predicted_expenses = _format_inr(_predict_next_month(expense_history) or expenses)
    predicted_savings = max(0, predicted_income - predicted_expenses)

    advisor_notes = []

    dining_note = _category_change_note(categories, 'Food & Dining')
    if dining_note:
        advisor_notes.append({'text': dining_note, 'color': 'blue'})
    elif top_pct >= 30:
        advisor_notes.append({
            'text': f'{top_category["name"]} is your largest expense at {top_pct}% of spending.',
            'color': 'blue',
        })

    if entertainment:
        save_amt = _format_inr(entertainment['amount'] * 0.3)
        advisor_notes.append({
            'text': f'You can save ₹{save_amt:,} by reducing entertainment expenses.',
            'color': 'green',
        })

    advisor_notes.append({
        'text': f'Your predicted month-end savings are ₹{predicted_savings:,}.',
        'color': 'orange',
    })

    if score >= 65:
        advisor_notes.append({
            'text': 'Keep going! You are on track to achieve your goals.',
            'color': 'purple',
        })
    else:
        advisor_notes.append({
            'text': 'Focus on reducing discretionary spending to improve your health score.',
            'color': 'purple',
        })

    expected_income = income if income > 0 else (_predict_next_month(income_history) or 45000)
    after_payments = max(0, expected_income - upcoming_total)
    emi_income_pct = round((emi_total / expected_income) * 100) if expected_income > 0 else 0
    reserve = _format_inr(max(10000, expected_income * 0.15))

    payment_note = (
        f'EMI payments will consume {emi_income_pct}% of your expected income this month. '
        f'Maintain a reserve of at least ₹{reserve:,} for financial safety.'
    )
    if emi_income_pct < 20:
        payment_note = (
            f'Your upcoming payments are manageable at {round((upcoming_total / expected_income) * 100)}% '
            f'of expected income. Maintain a reserve of at least ₹{reserve:,} for financial safety.'
        )

    return {
        'health_score': score,
        'health_label': _health_label(score),
        'recommendations': recommendations[:5],
        'predictions': {
            'income': predicted_income,
            'expenses': predicted_expenses,
            'savings': predicted_savings,
        },
        'top_category': {
            'name': top_category['name'],
            'percent': top_pct,
            'amount': _format_inr(top_category['amount']),
        },
        'advisor_notes': advisor_notes[:4],
        'payment_insights': {
            'upcoming_payments': _format_inr(upcoming_total),
            'expected_income': _format_inr(expected_income),
            'after_payments_balance': _format_inr(after_payments),
            'note': payment_note,
        },
        'summary': {
            'savings_rate': round(savings_rate),
            'budget_usage': round(budget_usage),
            'emi_ratio': round(emi_ratio),
        },
    }
