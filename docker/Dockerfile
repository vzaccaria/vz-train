FROM node:5.10
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update
RUN apt-get install -y octave
RUN npm i vz-dockerino -g
CMD ["vz-dockerino"]