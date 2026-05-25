# Stage 1: Build the Vite React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root dependency manifests
COPY package*.json ./
COPY client/package.json ./client/

# Install client workspace dependencies
RUN npm ci -w client

# Set Build Arguments for Vite environment variables
ARG VITE_API_URL=http://localhost:5000
ARG VITE_SOCKET_URL=http://localhost:5000

# Set environment variables for the build process
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Copy client source code
COPY client/ ./client/

# Build client using workspaces
RUN npm run build -w client

# Stage 2: Serve the production build using Nginx
FROM nginx:alpine

# Copy built static files to Nginx html folder
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Copy custom Nginx routing configuration
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (internal Nginx port)
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]

