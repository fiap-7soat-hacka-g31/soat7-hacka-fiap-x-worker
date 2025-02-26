FROM node:22-alpine AS Builder
ARG target
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build ${target}

FROM node:22-alpine AS Runtime
ARG target
ENV PORT=3000
WORKDIR /app
COPY package*.json .
RUN npm ci --omit=dev
COPY --from=builder /app/dist/apps/${target} ./dist
RUN mkdir processing
EXPOSE ${PORT}
CMD ["npm", "run", "start:prod"]