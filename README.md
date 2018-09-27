# Docker nodejs development environment

## Build docker image

```shell
docker-compose build
```

## Run the image in a container

```shell
docker-compose up -d
```

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
