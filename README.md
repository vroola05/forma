# Formtool


# Project startup
This project is still in development.

# Prerequisites
- Docker
- Java
- Mvn


# Run the formtool
- docker-compose up -d
- mvn spring-boot:run "-Dspring-boot.run.arguments=--app.admin.username=admin --app.admin.email=EMAIL --app.admin.password=PASSWORD"
- mvn spring-boot:run


docker exec -i formbuilder-database pg_dump -U forma --column-inserts --data-only --disable-triggers FormaDB > data.sql

