FROM node:24-alpine AS base
RUN apk add --no-cache g++ make py3-pip libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm
WORKDIR /app
COPY package*.json ./
EXPOSE 3000

FROM base AS production
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch --ignore-scripts
RUN pnpm install 

COPY . .

ENV NODE_ENV=production

RUN pnpm build

CMD ["pnpm", "start"]

FROM base AS dev
ENV NODE_ENV=development
RUN npm install 
COPY . .
CMD ["npm", "run", "dev"]