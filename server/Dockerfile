# Node light version
FROM node:20-alpine

# Installing nodemon and ts-node
RUN npm install -g nodemon ts-node

WORKDIR /usr/src/app

# Copying dependencies
COPY package*.json ./
COPY common/package*.json ./common/
COPY server/package*.json ./server/

# Dependencies installation w/o client dependencies
RUN npm install
RUN npm install --workspace=server --workspace=common --include-workspace-root

# Copying the rest of the code (except the one added in dockerignore)
COPY common/ ./common/
COPY server/ ./server/

# Exposing the port
EXPOSE 3000

# Initialization command
CMD ["npm", "run", "dev"]