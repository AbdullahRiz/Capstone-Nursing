# Capstone-Nursing

This project will help nurses find jobs and hospitals fill their operational gaps.

## How to run
After cloning this repository go into `/nursing-system` and run the following:

```angular2html
.\mvnw clean install
.\mvnw spring-boot:run
```

First time setting up the frontend:
```angular2html
cd src/main/frontend
npm install
npm start
```

Preferable to run this project in IntelliJ, they have Spring Boot support.
Navigate to the `NursingSystemApplication.kt` file and select the green triangle to run.
This is already ported so that both ports forward to the frontend:
```angular2html
http://localhost:3000 --> Frontend
http://localhost:8080 --> Backend
```

## Building
Run this to package our frontend and backend code
```
.\mvnw package
```

For local live development, instead of packaging just use port 3000.

## Tests
These commands help with running tests
```
.\mvnw test --> run all tests
.\mvnw jacoco:report --> test coverage
```