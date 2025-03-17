const app = require('./server.js');
const request = require('supertest');

let userCounter = 124; // Start with 123 as the base number

const getNextTestUser = () => {
    const username = `abc${userCounter}`;
    const email = `abc${userCounter}@hotmail.com`;
    const password = `abc${userCounter}`;
    userCounter++; // Increment the counter for the next test
    return { username, email, password };
};

describe("POST /register", () => {

    it("should create a new account with valid data", async () => {
        const { username, email, password } = getNextTestUser();
    
        console.log("Test running with data:", { username, email, password });
    
        const response = await request(app)
            .post('/register')
            .send({
                username,
                email,
                password,
                role: 'Admin'
            });
    
        console.log("Test response:", response.body);
        expect(response.status).toBe(201);
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
                username: "abc124",  // Assuming this username exists in the database
                password: "abc124"   // Correct password
            });

        expect(response.status).toBe(200);  // OK
    });
});