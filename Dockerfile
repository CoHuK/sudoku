FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN cp frontend/index.optimized.html frontend/index.html && \
    cp frontend/script.min.js frontend/script.js && \
    cp frontend/style.min.css frontend/style.css

RUN rm -f frontend/index.optimized.html frontend/script.min.js frontend/style.min.css frontend/critical.css build.js && \
    npm prune --production

EXPOSE 80

ENV PORT=80

CMD ["npm", "start"]
