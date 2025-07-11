FROM node:20.10.0-alpine
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 444
ENTRYPOINT [ "npm","run","start:prod"]