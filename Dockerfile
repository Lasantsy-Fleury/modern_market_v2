########## BUILD STAGE ##########
FROM node:22-slim AS builder

WORKDIR /app

# Install all dependencies including devDependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the project
COPY . .

# Build the NestJS project
RUN npm run build


########## RUNTIME STAGE ##########
FROM node:22-slim

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy compiled dist folder from builder
COPY --from=builder /app/dist ./dist

# Copy any additional config files needed at runtime
COPY --from=builder /app/node_modules ./node_modules

# Environment variables
ARG POSTGRES_HOST=""
ARG POSTGRES_PORT=""
ARG POSTGRES_DATABASE=""
ARG POSTGRES_USER=""
ARG POSTGRES_PASSWORD=""

ENV POSTGRES_HOST=${POSTGRES_HOST}
ENV POSTGRES_PORT=${POSTGRES_PORT}
ENV POSTGRES_DATABASE=${POSTGRES_DATABASE}
ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV PORT=5033

EXPOSE 5033

CMD ["node", "dist/main.js"]
