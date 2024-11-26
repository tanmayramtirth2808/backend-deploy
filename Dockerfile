FROM node:18

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Rebuild native modules for Linux
RUN npm rebuild bcrypt --build-from-source

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
