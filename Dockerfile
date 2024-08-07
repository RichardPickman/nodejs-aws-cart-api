###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:20-alpine As development

WORKDIR /usr/src/app

COPY ./package.json ./

RUN npm install

COPY . .


###################
# BUILD FOR PRODUCTION
###################

FROM node:20-alpine As build

WORKDIR /usr/src/app

ENV NODE_ENV production

COPY  --from=development /usr/src/app/node_modules ./node_modules
COPY  --from=development /usr/src/app/package-lock.json ./package-lock.json
COPY  . .

RUN npm run build

RUN npm ci --only=production && npm cache clean --force


###################
# PRODUCTION
###################

FROM node:20-alpine As production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

USER node

EXPOSE 4000

CMD [ "node", "dist/main" ]
