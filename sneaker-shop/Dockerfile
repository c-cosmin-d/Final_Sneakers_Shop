# sneaker-shop/Dockerfile

# 1) Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY sneaker-shop/package*.json ./
RUN npm install

COPY sneaker-shop ./
RUN npm run build

# 2) Run stage - use a tiny web server
FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
