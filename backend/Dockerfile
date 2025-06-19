# Stage 1: Development
FROM node:18 AS development

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install
RUN yarn add ts-node-dev

# Copy the source code
COPY . .

# Install TypeScript globally
# RUN yarn global add ts-node

# Command for development
CMD ["yarn", "dev"]

# Stage 2: Production
FROM node:18 AS production

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --production

# Copy the compiled code from the previous build
COPY . .

# Build the application
RUN yarn build

# Start the application
CMD ["node", "dist/index.js"]
