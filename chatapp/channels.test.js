const { app, activeDB } = require('./server.js');
const request = require('supertest');

describe("POST /channels", () => {
    it("should let an admin create a channel with valid data", async () => {
       
    });

    it("should let an admin create a DM with valid data", async () => {
        
    });

    it("should let a user create a DM with valid data", async () => {
    });
});

// Chat tests
describe("POST /chat", () => {
    
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
