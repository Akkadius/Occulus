#####################################
# eqemu-admin-build
#####################################

FROM ubuntu:bionic
LABEL maintainer="Akkadius <akkadius1@gmail.com>"
ENV DEBIAN_FRONTEND noninteractive

ARG PUID=1000
ENV PUID ${PUID}
ARG PGID=1000
ENV PGID ${PGID}

RUN apt-get update -yqq && \
    groupadd -g ${PGID} eqemu && \
    useradd -u ${PUID} -g eqemu -m eqemu -G eqemu && \
    usermod -p "*" eqemu

RUN apt-get update && apt-get install -y \
	bash \
	git \
	sudo \
	qemu-user-static \
	binfmt-support


#######################################################################
# node
#######################################################################
RUN apt-get update && apt-get install -y curl sudo gnupg && \
	curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash - && apt-get install -y nodejs \
	&& npm install -g gh-release \
	&& npm install -g nodemon \
	&& npm install -g pkg \
	&& npm install -g mocha

#######################################################################
# add eqemu to sudoers
#######################################################################
RUN echo "eqemu ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/user && \
    chmod 0440 /etc/sudoers.d/user

USER eqemu
WORKDIR /home/eqemu/build/
