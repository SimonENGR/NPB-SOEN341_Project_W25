// channels.test.js
const { app, activeDB } = require('./server.js');
const request = require('supertest');


describe("POST /channels", () => {
    it("should let an admin create a channel with valid data", async () => {
     //placeholder 
    });
    
    it("should let an admin create a dm with valid data", async () => {
       //placeholder  
    });

    it("should let an user create a dm with valid data", async () => {
       //placeholder 
    });

   
});

// Chat tests
describe("POST /chat", () => {

    

    it("should return a success message if two users can message", async () => {
       
    });

    
});

afterAll(async () => {
    console.log("Closing database connection...");
    await activeDB.end();
    console.log("Database connection closed.");

    console.log("Active handles:");
    console.log(process._getActiveHandles());
    console.log("Active requests:");
    console.log(process._getActiveRequests());
});


