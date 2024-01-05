FROM node:18-alpine as build

WORKDIR /app

ENV PORT 8080
ENV HOST 0.0.0.0

COPY package*.json .
RUN npm install
COPY . .
RUN npm run build


FROM nginx:1.19
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html