FROM node:8-alpine

WORKDIR /data

ADD package.json /data
RUN npm update

ADD . /data


CMD ["sh", "run.sh"]
