FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
# Antideploy injects PORT; fallback 3001 locally
EXPOSE 3001
CMD ["node", "server/dist/index.js"]
