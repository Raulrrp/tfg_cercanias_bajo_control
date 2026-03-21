# Node light version
FROM node:20-alpine

# Installing nodemon
RUN npm install -g nodemon

WORKDIR /usr/src/app

# Copying dependencies
COPY package*.json ./
COPY common/package*.json ./common/
COPY server/package*.json ./server/

# Dependencies installation w/o client dependencies
RUN npm install --workspace=server --workspace=common --include-workspace-root


# Copying the relevant code (except the one added in dockerignore)
COPY common/ ./common/
COPY server/ ./server/

# Exposing the port
EXPOSE 3000

# Changing workspace to find dev script in server/package.json
WORKDIR /usr/src/app/server

# Initialization command
CMD ["npm", "run", "dev"]