# Node light version
FROM node:20-alpine

# Installing nodemon
RUN npm install -g nodemon ts-node

WORKDIR /usr/src/app

# Copying dependencies
COPY package*.json ./

# Dependencies installation
RUN npm install

# Copying the rest of the code (except the one added in dockerignore)
COPY . .

# Exposing the port
EXPOSE 3000

# Initialization command
CMD ["npm", "run", "dev"]