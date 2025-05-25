# 1. Build stage
FROM node:22-alpine as builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy app source
COPY . .

# 🔧 Generate Prisma client
RUN npx prisma generate

# 🔧 Build the app
RUN yarn build

# 2. Runtime stage
FROM node:22-alpine

WORKDIR /app

# Copy built files and dependencies from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .

EXPOSE 3000

CMD ["node", "dist/src/main"]
