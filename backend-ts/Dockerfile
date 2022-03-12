# STAGE 1: Compile typescript
FROM node:16-alpine as ts-compiler
WORKDIR /usr/src/app
# copy configuration files
COPY package*.json ./
COPY tsconfig*.json ./
# install packages
RUN npm install
# Bundle app source
COPY . .
# Compile typscript
RUN npm run build

# STAGE 2: Remove typescript packages
FROM node:16-alpine as ts-remover
WORKDIR /usr/src/app
# copy only needed configuration files
COPY --from=ts-compiler /usr/src/app/package*.json ./
COPY --from=ts-compiler /usr/src/app/build ./
# Install only production packages
RUN npm ci --only=production

# STAGE 3: Run
FROM node:16-alpine
WORKDIR /usr/src/app
# Copy only needed files to run app
COPY --from=ts-remover /usr/src/app ./
RUN chmod -R 777 /usr/src/app
USER 1000
EXPOSE 4000
CMD ["node", "start.js"]