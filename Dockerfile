###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:22-alpine As development

# Create app directory
WORKDIR /usr/src/app

ARG SERVER_PORT
ARG DATABASE_URL
ARG UI_URL

ENV FRONTEND_ADDRESS $UI_URL
ENV SERVER_PORT $SERVER_PORT
ENV DATABASE_URL $DATABASE_URL
ENV NODE_ENV production


RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -
RUN corepack enable pnpm

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node pnpm-lock.yaml ./
COPY --chown=node:node package.json ./

# Install app dependencies using the `npm ci` command instead of `npm install`
RUN pnpm install

# Bundle app source
COPY --chown=node:node . .

# Use the node user from the image (instead of the root user)
USER node


###################
# BUILD FOR PRODUCTION
###################

FROM node:22-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node pnpm-lock.yaml ./

# In order to run `npm run build` we need access to the Nest CLI which is a dev dependency. In the previous development stage we ran `npm ci` which installed all dependencies, so we can copy over the node_modules directory from the development image
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

# Run the build command which creates the production bundle
RUN pnpm build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN pnpm ci --only=production && pnpm cache clean --force

USER node

###################
# PRODUCTION
###################

FROM node:22-alpine As production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
