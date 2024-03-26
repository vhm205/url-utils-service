FROM node:18-alpine AS build-stage

WORKDIR /app

# Install Yarn globally (*Optional: See note below*)
RUN npm install -g yarn

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

# --- Production Image --- #
FROM node:18-alpine AS production

WORKDIR /app

COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/node_modules ./node_modules

EXPOSE 1515
CMD ["node", "dist/main"]

