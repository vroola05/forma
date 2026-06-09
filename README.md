# Formtool


# Project startup
This project is still in development.

# Prerequisites
- Docker
- Java
- Mvn

# Setup
This setup is for people who want to run the project locally.

1. copy the file .env.sample and rename it to .env
2. open the .env file and set the properties

3. copy the file s3.json.sample and rename it to s3.json
4. open the s3.json file and set change the accessKey and secretKey to match the properties in the .env

# Run the formtool
1. start the docker application (on windows)
3. Run the command in a terminal:
   docker-compose up
4. Run the command in a terminal:
   mvn spring-boot:run
5. Open the browser and go to:
    http://localhost:8080/system/admin

    The path system is reserved for te global_admin. Within this page you can create new tenants and setup global settings.

    For login you can use the ADMIN_USER and ADMIN_PASS defined in .env

    There is already one sample tenant availible:

    Admin
    http://localhost:8080/kip/admin
    User: admin
    Password: Welkom123456

    Form:
    http://localhost:8080/kip/page/form/formulier
    For now the page is only visible when logged in.



# Recreate the enviroment (clean start)
- docker-compose down -v
- docker-compose up -d --force-recreate
- mvn spring-boot:run

# Database dump
docker exec -i formbuilder-database pg_dump -U forma --column-inserts --data-only --disable-triggers FormaDB > data.sql

