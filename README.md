# Trello Clone API 🚀

A **Trello-inspired task management REST API** built with **Django REST Framework (DRF)**.

This project demonstrates real-world REST API development concepts including JWT authentication, CRUD operations, ownership-based authorization, custom permissions, search, filtering, ordering, pagination, and nested resources.

---

## ✨ Features

- 🔐 JWT Authentication
  - Obtain access and refresh tokens
  - Refresh access tokens
- 👤 User-based data ownership
- 📋 Board management
  - Create, read, update and delete boards
- 📝 List management
  - Create, read, update and delete lists
  - Board → Lists relationship
- ✅ Task management
  - Create, read, update and delete tasks
  - List → Tasks relationship
- 🔎 Search tasks by title and description
- 🎯 Filter tasks by status
- ↕️ Order tasks by fields such as due date and creation date
- 📄 Pagination
- 🛡️ Custom permissions
- 🔒 Ownership protection for Boards, Lists and Tasks
- 🐍 Dependency management with `uv`

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Python | Backend programming language |
| Django | Web framework |
| Django REST Framework | REST API development |
| Simple JWT | JWT authentication |
| django-filter | API filtering |
| SQLite | Development database |
| uv | Python package and dependency management |
| Postman | API testing and documentation |

---

## 🏗️ Project Structure

```text
mytrello/
│
├── board/
│   ├── migrations/
│   ├── models.py
│   ├── serializers.py
│   ├── permissions.py
│   ├── views.py
│   └── urls.py
│
├── list/
│   ├── migrations/
│   ├── models.py
│   ├── serializers.py
│   ├── permissions.py
│   ├── views.py
│   └── urls.py
│
├── task/
│   ├── migrations/
│   ├── models.py
│   ├── serializers.py
│   ├── permissions.py
│   ├── views.py
│   └── urls.py
│
├── my_trello/
│   ├── settings.py
│   ├── urls.py
│   └── ...
│
├── manage.py
├── pyproject.toml
├── uv.lock
├── .python-version
└── README.md
```

---

## 🔗 Data Relationship

The project follows a simple hierarchy:

```text
User
 │
 └── Board
      │
      └── List
           │
           └── Task
```

A user can own multiple boards.

Each board can contain multiple lists.

Each list can contain multiple tasks.

---

## 🔐 Authentication

The API uses **JWT authentication**.

### Obtain Token

```http
POST /api/token/
```

Example request:

```json
{
    "username": "your_username",
    "password": "your_password"
}
```

Response:

```json
{
    "refresh": "your_refresh_token",
    "access": "your_access_token"
}
```

### Refresh Token

```http
POST /api/token/refresh/
```

Example:

```json
{
    "refresh": "your_refresh_token"
}
```

Use the access token in protected API requests:

```http
Authorization: Bearer <access_token>
```

---

## 📋 Main API Resources

> Replace the endpoint paths below if your project's URL configuration uses different paths.

### Boards

```http
GET    /api/boards/
POST   /api/boards/
GET    /api/boards/<id>/
PUT    /api/boards/<id>/
PATCH  /api/boards/<id>/
DELETE /api/boards/<id>/
```

### Lists

```http
GET    /api/lists/
POST   /api/lists/
GET    /api/lists/<id>/
PUT    /api/lists/<id>/
PATCH  /api/lists/<id>/
DELETE /api/lists/<id>/
```

### Board → Lists

```http
GET  /api/boards/<board_id>/lists/
POST /api/boards/<board_id>/lists/
```

### Tasks

```http
GET    /api/tasks/
POST   /api/tasks/
GET    /api/tasks/<id>/
PUT    /api/tasks/<id>/
PATCH  /api/tasks/<id>/
DELETE /api/tasks/<id>/
```

### List → Tasks

```http
GET  /api/lists/<list_id>/tasks/
POST /api/lists/<list_id>/tasks/
```

---

## 🔎 Search, Filtering & Ordering

### Search

Tasks can be searched using their title and description.

```http
GET /api/tasks/?search=meeting
```

### Filter by Status

Available task statuses:

```text
todo
in_progress
done
```

Example:

```http
GET /api/tasks/?status=done
```

### Ordering

Tasks can be ordered using:

```http
GET /api/tasks/?ordering=created_at
```

Descending order:

```http
GET /api/tasks/?ordering=-created_at
```

Other supported ordering fields include:

```text
due_date
created_at
```

---

## 📄 Pagination

The API uses page-number pagination.

Example:

```http
GET /api/tasks/?page=2
```

The default page size is configured in Django REST Framework settings.

---

## 🛡️ Permissions & Ownership

The API protects user data using ownership-based authorization.

For example:

```text
User A
 └── Board A
      └── List A
           └── Task A

User B
 └── Board B
      └── List B
           └── Task B
```

User A should only be able to access and modify resources belonging to User A.

Ownership is enforced through queryset restrictions and custom permission classes.

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone <your-github-repository-url>
cd mytrello
```

### 2. Install dependencies with uv

Make sure `uv` is installed.

```bash
uv sync
```

This creates/synchronizes the project's virtual environment using:

```text
pyproject.toml
uv.lock
```

### 3. Apply migrations

```bash
uv run python manage.py migrate
```

### 4. Create a superuser (optional)

```bash
uv run python manage.py createsuperuser
```

### 5. Start the development server

```bash
uv run python manage.py runserver
```

The API will be available at:

```text
http://127.0.0.1:8000/
```

---

## 🧪 API Testing

The APIs can be tested using **Postman**.

Recommended testing flow:

```text
1. Register/Login
       ↓
2. Obtain JWT Access Token
       ↓
3. Add Bearer Token in Postman
       ↓
4. Create Board
       ↓
5. Create List inside Board
       ↓
6. Create Task inside List
       ↓
7. Test Search
       ↓
8. Test Filtering
       ↓
9. Test Ordering
       ↓
10. Test Pagination
       ↓
11. Test Ownership & Permissions
```

## 📦 Postman Collection

A Postman collection is included in the repository for testing all available API endpoints.

The collection covers:

- 🔐 JWT authentication
- 📋 Board APIs
- 📝 List APIs
- ✅ Task APIs
- 🔎 Search
- 🎯 Filtering
- ↕️ Ordering
- 📄 Pagination
- 🛡️ Permissions and ownership

### Import Collection

1. Open Postman
2. Click **Import**
3. Select the Postman collection file from the repository
4. Obtain a JWT access token using the login/token endpoint
5. Add the token as a **Bearer Token**
6. Start testing the APIs

### Recommended Testing Flow

```text
Authentication
      ↓
Create Board
      ↓
Create List
      ↓
Create Task
      ↓
Search Tasks
      ↓
Filter Tasks
      ↓
Order Tasks
      ↓
Pagination
      ↓
Test Permissions
      ↓
Test Ownership

---

## 🔒 Security Notes

Do not commit sensitive information to GitHub.

Make sure files such as these are ignored:

```text
.env
.venv/
db.sqlite3
__pycache__/
```

---

## 📌 Learning Goals

This project was built to practice and demonstrate practical Django REST Framework concepts:

- RESTful API design
- ViewSets and generic API views
- Serializers
- JWT authentication
- Permissions
- Object ownership
- Nested resources
- Queryset filtering
- Search
- Ordering
- Pagination
- API testing with Postman
- Python dependency management with `uv`

---

## 🚧 Future Improvements

Possible next improvements:

- Serializer validation
- Custom DRF actions
- Swagger / OpenAPI documentation
- Automated API tests
- Docker support
- PostgreSQL configuration
- CI/CD pipeline
- React frontend
- Production deployment

---

## 👨‍💻 Author

**Hitendra Marathe**

Python / Django Developer

---

⭐ If you find this project useful, consider giving the repository a star.
