# Multi-stage Dockerfile for FinRisk Operations Hub (Angular 19)

# Build Stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline

COPY . .
RUN npm run build -- --configuration production

# Production Serve Stage with NGINX
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/finrisk-operations-hub /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
