ARG NODE_VERSION="24"
ARG WORKDIR_SRC="/usr/src/wikmark"
ARG WORKDIR_APP="/opt/wikmark"
ARG WORKDIR_DATA="/opt/wikmark/data"

FROM node:${NODE_VERSION}-trixie AS builder-base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# ensure running latest corepack: https://github.com/nodejs/corepack/issues/612
RUN npm install --global corepack@latest
RUN corepack enable

FROM builder-base AS builder
ARG WORKDIR_SRC
WORKDIR ${WORKDIR_SRC}
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm i
COPY . .
ENV ENABLE_SKIP_VALIDATION="UNSAFE_ENABLE"
RUN pnpm run build

FROM gcr.io/distroless/nodejs${NODE_VERSION}-debian13 AS runner
ARG WORKDIR_SRC
ARG WORKDIR_APP
ARG WORKDIR_DATA
WORKDIR ${WORKDIR_APP}
COPY --from=builder --link ${WORKDIR_SRC}/.next/standalone ./
COPY --from=builder --link ${WORKDIR_SRC}/.next/static ./.next/static
#COPY --from=builder --link ${WORKDIR_SRC}/public ./public

ENV NODE_ENV="production"
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
ENV WIKI_PATH=${WORKDIR_DATA}/wiki
ENV DB_PATH=${WORKDIR_DATA}/db.sqlite
ENV SEARCH_DB_PATH=${WORKDIR_DATA}/search.db.sqlite

EXPOSE 8080
VOLUME ${WORKDIR_DATA}

CMD [ "server.js" ]
