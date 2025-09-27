FROM node:18-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY src ./src
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY tsconfig.build.json tsconfig.build.json

ARG MONGO_URI
ENV MONGO_URI=$MONGO_URI
ARG JWT_SECRET
ENV JWT_SECRET=$JWT_SECRET

ENV OPENCEP_API=https://opencep.com/v1

RUN echo "\
  MONGO_URI=${MONGO_URI}\n\
  OPENCEP_API=${OPENCEP_API}\n\
  JWT_SECRET=${JWT_SECRET}\n\
  " > .env

RUN npm run build

EXPOSE 8080

CMD ["node", "./dist/src/main"]