ARG NODE=node:22-alpine

FROM $NODE AS build

WORKDIR /app

COPY package.json /app
COPY yarn.lock /app

RUN yarn install

COPY . /app

RUN yarn run build

# Sharp ships its native binaries as platform-specific optional deps
# (@img/sharp-linuxmusl-x64, @img/sharp-libvips-linuxmusl-x64, ...). Nitro's
# tree-shaker does not follow them into .output/, so copy them across for the
# current build platform so the runtime image has the matching native binary.
RUN mkdir -p /app/.output/server/node_modules/@img && \
    cp -r /app/node_modules/@img/sharp-* /app/.output/server/node_modules/@img/ 2>/dev/null || true

# 1. Snapshot the bundled favicon defaults to a parallel folder so our
#    /favicons/* middleware can use them as fallback when no custom favicon
#    has been uploaded via /admin.
# 2. Strip the bundled /favicons/* entries from Nitro's public-assets manifest
#    inside nitro.mjs. Nitro's static asset handler is registered as the very
#    first middleware in the handler chain (before our /favicons middleware),
#    so without this patch it would always answer manifest-matched URLs (like
#    /favicons/favicon.ico) and 500 once we remove the underlying files. By
#    removing those manifest keys we let the request fall through to our
#    middleware, which then serves either the runtime upload or the snapshot.
RUN if [ -d /app/.output/public/favicons ]; then \
      mkdir -p /app/.output/server/favicons-defaults && \
      cp -r /app/.output/public/favicons/. /app/.output/server/favicons-defaults/ && \
      rm -rf /app/.output/public/favicons; \
    fi && \
    node -e "const fs=require('node:fs');const f='/app/.output/server/chunks/nitro/nitro.mjs';if(fs.existsSync(f)){let c=fs.readFileSync(f,'utf-8');const before=c.length;c=c.replace(/\s+\"\/favicons\/[^\"]+\":\s*\{[^{}]*\},?/g,'');fs.writeFileSync(f,c);console.log('nitro.mjs: stripped',before-c.length,'bytes of /favicons/* manifest entries')}"

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

RUN sed -i 's/\r$//' /app/extra/entrypoint.sh && chmod +x /app/extra/entrypoint.sh

EXPOSE 3000/tcp

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s CMD ["node", "/app/extra/healthcheck.mjs"]

ENTRYPOINT ["/app/extra/entrypoint.sh"]
