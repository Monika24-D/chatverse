# Use the latest Node.js image as the base
FROM node:20-alpine

WORKDIR /app

# copy only package files first (better caching)
COPY package*.json ./

RUN npm install

# now copy rest of the code
COPY . .

EXPOSE 8000

CMD ["npm", "run", "start"]