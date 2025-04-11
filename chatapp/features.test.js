describe("Private channel creation and member actions", () => {
    let userSession1, userSession2;

    beforeAll(async () => {
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

        // Log in user1
        userSession1 = await request(app)
            .post('/login')
            .send({ username: 'user1', password: 'userPassword' });

        // Log in user2
        userSession2 = await request(app)
            .post('/login')
            .send({ username: 'user2', password: 'userPassword' });
    });

    it("should let a user create a private channel and invite another user", async () => {
        const createChannelResponse = await request(app)
            .post('/addChannel')
            .set('Cookie', userSession1.headers['set-cookie'])
            .send({
                channelName: 'PrivateChannel',
                channelMembers: ['user2'], // Invite user2
                isDefault: false
            });

        expect(createChannelResponse.status).toBe(200);
        expect(createChannelResponse.body.message).toBe("Channel created successfully.");
        expect(createChannelResponse.body.channelName).toBe("PrivateChannel");
        expect(createChannelResponse.body.channelMembers).toContain("user2");
    });

    it("should allow the invited user to leave the private channel", async () => {
        const leaveChannelResponse = await request(app)
            .post('/leaveChannel')
            .set('Cookie', userSession2.headers['set-cookie'])
            .send({
                channelName: 'PrivateChannel'
            });

        expect(leaveChannelResponse.status).toBe(200);
        expect(leaveChannelResponse.body.message).toBe("You have left the channel successfully.");

        // Verify that user2 is no longer a member of the channel
        const fetchChannelsResponse = await request(app)
            .get('/getChannels')
            .set('Cookie', userSession2.headers['set-cookie']);

        expect(fetchChannelsResponse.status).toBe(200);
        const privateChannel = fetchChannelsResponse.body.find(channel => channel.channelName === 'PrivateChannel');
        expect(privateChannel).toBeUndefined();
    });
});
