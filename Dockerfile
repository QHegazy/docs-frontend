FROM node:20 AS build

WORKDIR /app


COPY package*.json ./

RUN npm install


COPY . .


RUN npm run build --prod


FROM nginx:alpine


COPY --from=build /app/dist/<your-angular-app-name> /usr/share/nginx/html


COPY nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
