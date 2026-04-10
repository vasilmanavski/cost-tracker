# ── Stage 1: Build ──
FROM node:22-alpine AS build
WORKDIR /app

# Copy package files first (layer caching for dependencies)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .

# Build args become env vars at build time (Vite embeds VITE_* into the bundle)
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_API_URL=

RUN npm run build

# ── Stage 2: Serve with nginx ──
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
