# Docker nodejs development environment

## Get all images

```shell
docker pull node:8
docker pull mongo
```

## Build docker image

```shell
docker-compose build
```

## Using specific network in docker for all services

Create network with specific name "docker_node_default". This network is used in both MongoDB and the MoleculerJS framework project.

```shell
docker network create docker_node_default
```

## Run MongoDB service

As MongoDB service is the dependency of this project, please run MongoDB before the microservice framework

```shell
docker-compose -f mongo.yml up -d
```

## Run the image in a container

Run microservice framework

```shell
docker-compose up -d
```

**Attention 1!** If you want to restart the microservice framework, please remove the container and create again!

***Otherwise, the hot reloading of the framework would not work properly!***

**Attention 2!** If you are the first time to run this project, you have to modify the ***docker-compose.yml*** file to run app.js and then get into the container to run:

```shell
npm install
```

to install all dependency for this project. Then change back to "npm run dev" and run the project again.

## Install dependency

1. Enter the container

```shell
docker exec -it node_web bash
```

2. Install all the dependencies (inside container)

```shell
npm install
```

## If you want to inspect the logs of the container (outside container)

```shell
docker logs -f node_web
```
