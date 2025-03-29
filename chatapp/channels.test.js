const { app, activeDB } = require('./server.js');
const request = require('supertest');

beforeAll(async () => {
    console.log("Setting up test users...");
    // Register adminUser
    await request(app)
        .post('/register')
        .send({
            username: 'adminUser',
            email: 'admin@example.com',
            password: 'adminPassword',
            role: 'admin'
        });

    // Register user1
    await request(app)
        .post('/register')
        .send({
            username: 'user1',
            email: 'user1@example.com',
            password: 'userPassword',
            role: 'user'
        });

    // Register user2
    await request(app)
        .post('/register')
        .send({
            username: 'user2',
            email: 'user2@example.com',
            password: 'userPassword',
            role: 'user'
        });

    console.log("Test users registered successfully.");
});

describe("POST /channels", () => {
    it("should let an admin create a channel with valid data", async () => {
        const adminSession = await request(app)
            .post('/login')
            .send({ username: 'adminUser', password: 'adminPassword' });

        const response = await request(app)
            .post('/addChannel')
            .set('Cookie', adminSession.headers['set-cookie'])
            .send({
                channelName: 'TestChannel',
                channelMembers: ['user1', 'user2'],
                isDefault: false
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Channel created successfully.");
        expect(response.body.channelName).toBe("TestChannel");
    });

    it("should let an admin create a DM with valid data", async () => {
        const adminSession = await request(app)
            .post('/login')
            .send({ username: 'adminUser', password: 'adminPassword' });

        const response = await request(app)
            .post('/sendMessage')
            .set('Cookie', adminSession.headers['set-cookie'])
            .send({
                dm: true,
                receiver: 'user2',
                chat_content: 'Hello in DM!',
                chat_time: new Date()
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Message sent successfully!");
    });

    it("should let a user create a DM with valid data", async () => {
        const userSession = await request(app)
            .post('/login')
            .send({ username: 'user1', password: 'userPassword' });

        const response = await request(app)
            .post('/sendMessage')
            .set('Cookie', userSession.headers['set-cookie'])
            .send({
                dm: true,
                receiver: 'user2',
                chat_content: 'Hello from user!',
                chat_time: new Date()
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Message sent successfully!");
    });
});

describe("POST /chat", () => {
    it("should return a success message if two users can message", async () => {
        const userSession1 = await request(app)
            .post('/login')
            .send({ username: 'user1', password: 'userPassword' });

        const userSession2 = await request(app)
            .post('/login')
            .send({ username: 'user2', password: 'userPassword' });

        const messageResponse = await request(app)
            .post('/sendMessage')
            .set('Cookie', userSession1.headers['set-cookie'])
            .send({
                dm: true,
                receiver: 'user2',
                chat_content: 'Hi, user2!',
                chat_time: new Date()
            });

        expect(messageResponse.status).toBe(200);
        expect(messageResponse.body.success).toBe(true);

        const fetchResponse = await request(app)
            .get(`/getDMs/user1`)
            .set('Cookie', userSession2.headers['set-cookie']);

        expect(fetchResponse.status).toBe(200);
        expect(fetchResponse.body).toBeDefined();
        expect(fetchResponse.body.some(msg => msg.text === 'Hi, user2!')).toBe(true);
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
