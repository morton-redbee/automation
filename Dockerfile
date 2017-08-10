FROM node:alpine

ADD desa_all.postman_environment.json /data/
ADD dtx_token.postman_collection.json /data/
ADD package.json /data/
ADD parameters.json /data/
ADD dtx_test.js /data/

WORKDIR /data/
RUN npm install

ENTRYPOINT ["node", "start_test.js"]
