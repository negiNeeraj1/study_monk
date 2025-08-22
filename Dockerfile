FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (leverages Docker layer caching)
COPY Backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY Backend/. ./

ENV NODE_ENV=production

# Railway provides PORT env var; server.js already uses it
CMD ["npm", "start"]


