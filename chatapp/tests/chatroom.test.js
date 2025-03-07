const request = require("supertest");
const mysql = require('mysql2');
const app = require('../server'); // Adjust according to your setup

// Setup MySQL connection (adjust your database configuration)
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'chatapp',
});

describe("POST /create-chatroom", () => {
  // 1. Login as admin (simon123, simon123)
  it("should log in as admin", async () => {
    const response = await request(app)
      .post("/login")
      .send({
        username: "simonA3",
        password: "simonA3"
      });

    console.log(response.body);  // Log the response for debugging
    expect(response.status).toBe(200);  // Expect 200 for successful login
  });

  // 2. Create chatroom 'chatroom1' with users simon123 and simon222
  it("should create a chatroom with users simon123 and simon222", async () => {
    const loginResponse = await request(app)
      .post("/login")
      .send({
        username: "simonA3",
        password: "simonA3"
      });

    const token = loginResponse.body.token;  // Assuming token-based authentication

    const response = await request(app)
      .post("/create-chatroom")  // Adjust to the correct endpoint for creating a chatroom
      .set('Authorization', `Bearer ${token}`)
      .send({
        chatroomName: "chatroom2",
        users: "simonA3"
      });

    // Expecting 201 for successful creation, but you can also assert on response message
    expect(response.status).toBe(201);

    // Now, check if simon123 and simon222 are in the chatroom using MySQL query
    const chatroomIdQuery = `SELECT id FROM chatrooms WHERE name = 'chatroom1'`;
    
    db.query(chatroomIdQuery, (err, results) => {
      if (err) {
        console.error('Error fetching chatroom ID:', err);
        return;
      }

      const chatroomId = results[0].id;
      const membersQuery = `SELECT username 
                            FROM chatroom_members 
                            WHERE chatroom_id = ? 
                            AND username IN ('simon123', 'simon222')`;

      db.query(membersQuery, [chatroomId], (err, results) => {
        if (err) {
          console.error('Error fetching chatroom members:', err);
          return;
        }

        const memberUsernames = results.map(row => row.username);
        expect(memberUsernames).toEqual(expect.arrayContaining(['simon123', 'simon222']));
      });
    });
  });
});
