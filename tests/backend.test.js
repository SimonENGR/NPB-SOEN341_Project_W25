const bcrypt = require('bcrypt');
const request = require('supertest');
const app = require('../app'); // Your Express app

describe('POST /register', () => {
    it('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123',
                role: 'user'
            });

        expect(res.status).toBe(201);
        expect(res.text).toBe('User registered');
    });

    it('should return error when username is missing', async () => {
        const res = await request(app)
            .post('/register')
            .send({
                email: 'testuser@example.com',
                password: 'password123',
                role: 'user'
            });

        expect(res.status).toBe(400);
        expect(res.text).toBe('Username and password are required');
    });
});

describe('Password Hashing', () => {
    it('password should be hashed', async () => {
        const password = 'password123';

        const hashedPassword = await bcrypt.hash(password, 10);

        expect(hashedPassword).not.toBe(password);  // Hashed password should be different
        expect(await bcrypt.compare(password, hashedPassword)).toBe(true);  // Should match
    });

    it('should return false for incorrect password', async () => {
        const password = 'password123';

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Compare with a wrong password
        expect(await bcrypt.compare('wrongpassword', hashedPassword)).toBe(false);
    });
});

describe('Database Error Handling', () => {
    it('should return 500 if the database connection fails', async () => {
        db.connect.mockImplementationOnce((cb) => cb(new Error('Database connection error')));

        const res = await request(app).get('/getChannels');

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Database connection error');
    });
});