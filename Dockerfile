###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:16-slim As development

RUN apt-get update && apt-get install -y openssl

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

RUN yarn install

COPY --chown=node:node . .

RUN yarn prisma:generate

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:16-slim As build

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN yarn build

ENV NODE_ENV production

RUN yarn install --production=true --frozen-lockfile && npm cache clean --force

USER node

###################
# PRODUCTION
###################

FROM node:16-slim As production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "node", "dist/main.js" ]