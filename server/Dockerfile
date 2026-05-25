FROM node:20-alpine

# Set production environment
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy root dependency manifests
COPY package*.json ./
COPY server/package.json ./server/

# Install only server workspace production dependencies
RUN npm ci -w server --only=production

# Copy server code
COPY server/ ./server/

# Expose backend and PeerJS ports
EXPOSE 5000 5001

# Start backend using npm workspaces script
CMD ["npm", "start", "-w", "server"]

