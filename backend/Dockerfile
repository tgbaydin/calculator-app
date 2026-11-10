FROM golang:1.22-alpine AS build
WORKDIR /app
COPY go.mod ./
COPY . .
RUN CGO_ENABLED=0 go build -o calculator .
FROM alpine:3.20
WORKDIR /app
COPY --from=build /app/calculator .
EXPOSE 8080
CMD ["./calculator"]
