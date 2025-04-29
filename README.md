# Productivity Widgets

A **full-stack web application** that provides a suite of modular **productivity tools** to help users manage their tasks and time efficiently. The project is built with a **Django backend** and a **React frontend**, emphasizing scalability, security, and user-centric customization.

---

## Features

### Widgets
The application offers a range of widgets that users can add to their dashboard:
- **Clock**: Displays the current time.
- **To-Do List**: A task manager for organizing daily activities.
- **Calculator**: A simple calculator for quick calculations.
- **Notes**: A widget for storing short notes or ideas.
- **Pomodoro Timer**: A time management tool based on the Pomodoro Technique.
- **Bookmarks**: Save and access your favorite links.
- **Weather Forecast**: Displays weather information using an external API (OpenWeatherMap) based on the user’s location.

### User Authentication
- **Magic Link Authentication**: Users can log in using a one-time link sent to their email, eliminating the need for passwords.
- **Token-Based Authentication**: Uses Django REST Framework’s token system to manage secure user sessions for accessing and modifying personal data.

### Database Management
- **PostgreSQL**: Stores user data, widget configurations, and preferences.
- **CRUD Operations**: Full support for creating, reading, updating, and deleting user preferences related to widgets.
- **Data Validation**: Ensures user inputs are sanitized and correctly formatted before being saved to the database.

### Customization
- Users can configure widget settings (e.g., weather location, to-do list items) with changes stored in the database and reloaded on login.
- Partial updates are made via **PATCH requests** to improve performance by modifying only the necessary fields.

---

## Architecture

### Backend
- **Framework**: Django with Django REST Framework (DRF) for creating RESTful APIs.
- **Database**: PostgreSQL (SQLite used for local development).
- **Authentication**: Token-based authentication for securing API endpoints.

### Frontend
- **Framework**: React with functional components and hooks.
- **State Management**: Local state and API calls to dynamically manage widget data.
- **UI**: Modular, reusable widget components designed for easy customization and extension.

---

## Technology Stack

- **Backend**: Django, Django REST Framework
- **Frontend**: React, HTML, CSS, JavaScript
- **Database**: PostgreSQL (SQLite for local development)
- **Authentication**: Token-based Authentication (DRF)
- **Weather API**: OpenWeatherMap (for weather forecast widget)

---

## Setup Instructions

### Prerequisites
1. Python 3.x
2. Node.js and npm
3. PostgreSQL (or SQLite for local development)

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/ericji1326/widgets.git
   cd widgets/backend
2. Create a virtual environment and install dependencies:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
3. Apply database migrations:
   ```bash
   python manage.py migrate
4. Run:
   python manage.py runserver

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
2. Install dependencies:
   ```bash
   npm install
3. Run:
   ```bash
   npm start
