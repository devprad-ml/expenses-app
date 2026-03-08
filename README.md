# AI Finance Tracker

A full-stack expense tracking application that uses AI to log expenses from natural language or receipt photos.

Built by [Pradyumnn](https://github.com/devprad-ml)

---

## Features

- **AI Text Parsing** — type something like *"Spent $45 on dinner"* and the app extracts the amount, description, and category automatically
- **Receipt Scanning** — upload or photograph a receipt and GPT-4o vision reads it for you
- **Budget Tracking** — set a monthly budget limit and track your progress with a live progress bar
- **Spending Chart** — visual breakdown of spending by category
- **Expense History** — filter expenses by month and category
- **Delete Expenses** — remove any logged expense
- **User Authentication** — JWT-based register/login, each user sees only their own data

---

## Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

**Backend**
- FastAPI (Python)
- SQLAlchemy (async) + SQLite
- JWT authentication via python-jose
- OpenAI API (GPT-4o, GPT-4o-mini)

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- An OpenAI API key

### 1. Clone the repository

```bash
git clone https://github.com/devprad-ml/expenses-app.git
cd expenses-app
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder (use `.env.example` as a template):

```bash
cp .env.example .env
```

Fill in your `.env`:

```
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

To generate a secure `SECRET_KEY` on Windows:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Start the backend:
```bash
python -m uvicorn main:app --reload
```

The API will be running at `http://localhost:8000`

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app will be running at `http://localhost:3000`

---

## Running Tests

From inside the `backend/` folder:

```bash
python -m pytest tests/ -v
```

Tests use a separate `test.db` database and never touch your real data.

---

## Project Structure

```
expenses-app/
├── backend/
│   ├── app/
│   │   ├── api/endpoints/    # auth.py, expenses.py
│   │   ├── core/             # config.py, security.py
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # ai_parser.py (OpenAI integration)
│   │   └── db/               # database session
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   └── test_expenses.py
│   ├── main.py
│   └── requirements.txt
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx          # Login/Register
        │   └── dashboard/        # Main dashboard
        ├── components/
        │   └── SpendingChart.tsx
        ├── context/
        │   └── AuthContext.tsx
        └── lib/api/
            └── api.ts            # Axios API client
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login and get JWT token |
| GET | `/api/v1/auth/me` | Get current user profile |
| PUT | `/api/v1/auth/me` | Update budget limit |
| GET | `/api/v1/expenses/` | Get expenses (with filters) |
| POST | `/api/v1/expenses/` | Save a new expense |
| POST | `/api/v1/expenses/parse` | Parse expense from text (AI) |
| POST | `/api/v1/expenses/scan-receipt` | Parse expense from image (AI) |
| DELETE | `/api/v1/expenses/{id}` | Delete an expense |