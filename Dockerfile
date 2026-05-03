# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package management files
COPY package.json package-lock.json ./

# Install dependencies using clean install
RUN npm ci

# Copy the rest of the application files
COPY . .

# Define build arguments that will be mapped to environment variables
# These are embedded by Vite during the build process
ARG VITE_EXTENSION_DOWNLOAD_URL
ARG VITE_API_PROXY_TARGET
ARG VITE_R2_PUBLIC_DOMAIN

ENV VITE_EXTENSION_DOWNLOAD_URL=$VITE_EXTENSION_DOWNLOAD_URL
ENV VITE_API_PROXY_TARGET=$VITE_API_PROXY_TARGET
ENV VITE_R2_PUBLIC_DOMAIN=$VITE_R2_PUBLIC_DOMAIN

# Build the Vite/React app for production
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy the Nginx config template to the Nginx templates directory.
# The official Nginx image will automatically run `envsubst` on this file
# and output it to /etc/nginx/conf.d/default.conf at startup.
COPY default.conf.template /etc/nginx/templates/

# Copy the compiled production build from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]