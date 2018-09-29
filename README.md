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

**Attention!** If you want to restart the microservice framework, please remove the container and create again!

***Otherwise, the hot reloading of the framework would not work properly!***

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
