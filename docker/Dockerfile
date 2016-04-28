FROM node:5.10
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update
RUN npm i vz-train@0.0.4 -g
CMD ["vz-train", "bot"]