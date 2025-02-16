# Use official Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Node.js and npm (needed for Tailwind)
RUN apt-get update && apt-get install -y nodejs npm

# Install Tailwind CSS globally
RUN npm install -g tailwindcss postcss autoprefixer

# Copy the project files
COPY . .

# Run the Django server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]