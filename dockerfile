FROM node:20-alpine AS build

WORKDIR /app
COPY ./package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS server

WORKDIR /app
COPY --from=build /app /app
RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm", "start"]
