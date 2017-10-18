FROM node:alpine

ADD tests /data/tests/
ADD environments /data/environments/
ADD package.json /data/
ADD start_test.js /data/

ENV LC_ALL=en_US.UTF-8 \
    LANG=en_US.UTF-8 \
    LANGUAGE=en_US.UTF-8

WORKDIR /data/
RUN npm install

ENTRYPOINT ["node", "start_test.js"]
