const { app, activeDB } = require('./server.js');
const request = require('supertest');

describe("Writing in default channels", () => {
    let userSession1;

    beforeAll(async () => {
        // Register and log in user1
        await request(app)
            .post('/register')
            .send({
                username: 'user1',
                email: 'user1@example.com',
                password: 'userPassword',
                role: 'user'
            });

        userSession1 = await request(app)
            .post('/login')
            .send({ username: 'user1', password: 'userPassword' });
    });

    it("should let user1 write in 'All General' channel", async () => {
        const response = await request(app)
            .post('/sendMessage')
            .set('Cookie', userSession1.headers['set-cookie'])
            .send({
                channelName: 'All General',
                chat_content: 'Hello, this is a message in All General!',
                chat_time: new Date(),
                dm: false
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Message sent successfully!");
    });

    it("should let user1 write in 'Announcements' channel", async () => {
        const response = await request(app)
            .post('/sendMessage')
            .set('Cookie', userSession1.headers['set-cookie'])
            .send({
                channelName: 'Announcements',
                chat_content: 'Hello, this is a message in Announcements!',
                chat_time: new Date(),
                dm: false
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Message sent successfully!");
    });

    it("should let user1 write in 'Random' channel", async () => {
        const response = await request(app)
            .post('/sendMessage')
            .set('Cookie', userSession1.headers['set-cookie'])
            .send({
                channelName: 'Random',
                chat_content: 'Hello, this is a message in Random!',
                chat_time: new Date(),
                dm: false
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Message sent successfully!");
    });
});

afterAll(async () => {
    console.log("Closing database connection...");
    await activeDB.end();
    console.log("Database connection closed.");
});
