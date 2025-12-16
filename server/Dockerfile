FROM node:18-alpine
WORKDIR /app

# Install dependencies
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev || npm install --only=production

# Copy app source
COPY . .

# Cloud Run listens on $PORT
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
