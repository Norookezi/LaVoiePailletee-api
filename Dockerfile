FROM node:22.14.0

WORKDIR /app

# Copy package files FIRST
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm install

# Set production environment AFTER installing dependencies
ENV NODE_ENV=production

# Copy source code and build
COPY . .
RUN npm run build

EXPOSE 8080
CMD ["npm", "run", "start"]