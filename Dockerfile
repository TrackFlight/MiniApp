FROM node:24-alpine3.22 AS builder

WORKDIR /app
COPY . .
RUN npm install --force
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist/index.html /usr/share/nginx/html/index.html
COPY --from=builder /app/dist/assets /usr/share/nginx/html/assets