FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "dev"]