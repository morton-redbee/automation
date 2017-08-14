FROM node:alpine

ADD desa_local.postman_environment.json /data/
ADD desa_remote.postman_environment.json /data/
ADD dtx_2_ok.postman_collection.json /data/
ADD dtx_2_ko.postman_collection.json /data/
ADD stx_2_ok.postman_collection.json /data/
ADD stx_2_ko.postman_collection.json /data/
ADD package.json /data/
ADD parameters.json /data/
ADD start_test.js /data/

WORKDIR /data/
RUN npm install

ENTRYPOINT ["node", "start_test.js"]
