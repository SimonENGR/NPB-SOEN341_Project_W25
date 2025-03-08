const mysql = require('mysql2');
const app = require('./server.js');
const request = require('supertest');

describe("POST /register", () => {

    it("should create a new account with valid data", async () => {
        const response = await request(app)
            .post('/register')
            .send({
                username: 'simon13',
                email: 'simon13@hotmail.com',
                password: 'simon13',
                role: 'Admin'
            })
        console.log(response.body);
        expect(response.status).toBe(201);  // Expecting 201 for successful creation
    });

    it("should return an error if the username is missing", async () => {
        const response = await request(app)
            .post("/register")
            .send({
                username: "",
                email: "simon444@hotmail.com",
                password: "simon444"
            });

        expect(response.status).toBe(500);  // Bad Request

    });

    it("should return an error if the email is missing", async () => {
        const response = await request(app)
            .post("/register")
            .send({
                username: "simon444",
                email: "",
                password: "simon444"
            });

        expect(response.status).toBe(500);
    });

    it("should return an error if the password is missing", async () => {
        const response = await request(app)
            .post("/register")
            .send({
                username: "simon555",
                email: "simon555@hotmail.com",
                password: ""
            });

        expect(response.status).toBe(500);

    });
});

// Login tests
describe("POST /login", () => {

    it("should return an error if the username is missing", async () => {
        const response = await request(app)
            .post("/login")
            .send({
                username: "",
                password: "simon3"
            });

        expect(response.status).toBe(400);
    });

    it("should return an error if the password is incorrect for a valid username", async () => {
        const response = await request(app)
            .post("/login")
            .send({
                username: "a",  // Assuming this username exists in the database
                password: "simon4"   // Wrong password
            });

        expect(response.status).toBe(400); // Unauthorized
    });

    it("should return a success message if the username and password are correct", async () => {
        const response = await request(app)
            .post("/login")
            .send({
                username: "a",  // Assuming this username exists in the database
                password: "a"   // Correct password
            });

        expect(response.status).toBe(200);  // OK
    });
});