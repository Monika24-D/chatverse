FROM node:20-alpine

WORKDIR /app

# Copy package first (better caching)
COPY package*.json ./

RUN npm install

# Copy rest of code
COPY . .

# Build Next.js app
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]