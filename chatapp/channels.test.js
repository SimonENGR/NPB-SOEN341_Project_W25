const { app, activeDB } = require('./server.js');
const request = require('supertest');

beforeAll(async () => {
    console.log("Setting up test data...");

    // Register admin user
    await request(app)
        .post('/register')
        .send({
            username: 'adminUser',
            email: 'admin@example.com',
            password: 'adminPassword',
            role: 'admin'
        });
    console.log("Admin user registered.");

    // Register regular user
    await request(app)
        .post('/register')
        .send({
            username: 'memberUser',
            email: 'member@example.com',
            password: 'memberPassword',
            role: 'user'
        });
    console.log("Regular user registered.");

    // Register another user for testing DMs
    await request(app)
        .post('/register')
        .send({
            username: 'userC',
            email: 'userC@example.com',
            password: 'userCPassword',
            role: 'user'
        });
    console.log("Additional user registered.");
});

describe("POST /channels", () => {
    it("should let an admin create a channel with valid data", async () => {
        const response = await request(app)
            .post('/addChannel')
            .send({
                channelName: 'NewChannel',
                channelMembers: ['adminUser', 'memberUser'],
                isDefault: false,
            })
            .set('Cookie', 'userId=1; username=adminUser'); // Simulate admin session cookie
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Channel created successfully.");
        expect(response.body.channelName).toBe('NewChannel');
        expect(response.body.channelMembers).toContain('adminUser');
    });

    it("should let an admin create a DM with valid data", async () => {
        const response = await request(app)
            .post('/sendMessage')
            .send({
                dm: true,
                chat_content: 'Hello there!',
                receiver: 'userB'
            })
            .set('Cookie', 'userId=1; username=adminUser'); // Simulate admin session cookie
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Message sent successfully!");
    });

    it("should let a user create a DM with valid data", async () => {
        const response = await request(app)
            .post('/sendMessage')
            .send({
                dm: true,
                chat_content: 'Hi!',
                receiver: 'userA'
            })
            .set('Cookie', 'userId=2; username=memberUser'); // Simulate user session cookie
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Message sent successfully!");
    });
});

// Chat tests
describe("POST /chat", () => {
    it("should return a success message if two users can message", async () => {
        const response = await request(app)
            .post('/sendMessage')
            .send({
                dm: true,
                chat_content: 'How are you?',
                receiver: 'userC'
            })
            .set('Cookie', 'userId=3; username=userD'); // Simulate user session cookie
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Message sent successfully!");
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
