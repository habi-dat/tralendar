FROM node:20-alpine as base
RUN apk add --no-cache g++ make py3-pip libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY package*.json ./
EXPOSE 3000

FROM base as production
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch --ignore-scripts
RUN pnpm install --frozen-lockfile --offline

COPY . .

ENV NODE_ENV=production

RUN pnpm build

CMD pnpm start

FROM base as dev
ENV NODE_ENV=development
RUN npm install 
COPY . .
CMD npm run dev