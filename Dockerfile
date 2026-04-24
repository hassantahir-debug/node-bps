FROM node:20-slim

# Install system dependencies for Playwright/Chromium
RUN apt-get update && apt-get install -y \
  libglib2.0-0 \
  libx11-6 \
  libxrandr2 \
  libxinerama1 \
  libxi6 \
  libxext6 \
  libxcursor1 \
  libxss1 \
  libxtst6 \
  libnss3 \
  libgconf-2-4 \
  libappindicator1 \
  libindicator7 \
  libgbm1 \
  libpangocairo-1.0-0 \
  libpango-1.0-0 \
  libatk1.0-0 \
  libcairo2 \
  libdbus-1-3 \
  libfontconfig1 \
  libfreetype6 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
