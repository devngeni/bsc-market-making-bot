FROM node:14
WORKDIR /app
COPY package.json .
RUN yarn install
COPY . .
CMD ["yarn", "run", "dev"]
