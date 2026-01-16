# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Install Node.js
RUN apt-get update && apt-get install -y nodejs npm

# Set working directory
WORKDIR /app

# Copy backend files
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Node.js dependencies
RUN npm install

# Expose the standard port (Render will set PORT, but we default to 3000)
ENV PORT=3000
EXPOSE $PORT

# Start both services
CMD ["npm", "start"]
