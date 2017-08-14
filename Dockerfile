FROM node:alpine

ADD desa_local.postman_environment.json /data/
ADD desa_remote.postman_environment.json /data/
ADD dtx_2_ok.postman_collection.json /data/
ADD dtx_2_ko.postman_collection.json /data/
ADD stx_ok.postman_collection.json /data/
ADD stx_ko.postman_collection.json /data/
ADD package.json /data/
ADD parameters.json /data/
ADD start_test.js /data/

ENV LC_ALL=en_US.UTF-8 \
    LANG=en_US.UTF-8 \
    LANGUAGE=en_US.UTF-8

WORKDIR /data/
RUN npm install

ENTRYPOINT ["node", "start_test.js"]
