ARG NODE=node:22-alpine

FROM $NODE AS build

WORKDIR /app

COPY package.json /app
COPY yarn.lock /app

RUN yarn install

COPY . /app

RUN yarn run build

FROM $NODE

LABEL org.opencontainers.image.title="Mafl" \
      org.opencontainers.image.description="Minimalistic flexible homepage" \      
      org.opencontainers.image.source="https://github.com/r0gger/mafl" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app

COPY --from=build /app/.output /app
COPY --from=build /app/extra/healthcheck.mjs /app/extra/healthcheck.mjs
COPY --from=build /app/extra/entrypoint.sh /app/extra/entrypoint.sh
COPY --from=build /app/.example/config.yml /app/example/config.yml

RUN chmod +x /app/extra/entrypoint.sh

EXPOSE 3000/tcp

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s CMD ["node", "/app/extra/healthcheck.mjs"]

ENTRYPOINT ["/app/extra/entrypoint.sh"]
