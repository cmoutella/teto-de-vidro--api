FROM node:18-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY src ./src
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY tsconfig.build.json tsconfig.build.json

ENV OPENCEP_API=https://opencep.com/v1

RUN echo "\
  OPENCEP_API=${OPENCEP_API}\n\
  " > .env

RUN npm run build

EXPOSE 8080

CMD ["node", "./dist/src/main"]