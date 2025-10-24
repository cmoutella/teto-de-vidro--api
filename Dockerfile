FROM node:18-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY src ./src
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY tsconfig.build.json tsconfig.build.json

RUN npm run build

WORKDIR /app/dist

EXPOSE 8080

CMD ["node", ".src/main.js"]