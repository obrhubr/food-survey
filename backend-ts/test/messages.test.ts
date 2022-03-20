import { app } from "../main";
import request from 'supertest';

let token: string;

describe('Test Vote route', () => {
    beforeAll(async () => {
        const res = await request(app).post("/login")
        .send({
            username: process.env.ADMIN_USERNAME,
            password: process.env.ADMIN_PASSWORD
        });

        token = res.body.token;
    });

    // Test results today
    test('Test "/message/add": correct', async () => {
        const res = await request(app).post("/menu/message/add")
        .send({
            token: token,
            message: "Test message2"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.uuid).toBe("0290677e-7ed9-45fc-a80d-ee8800b2fd54");
        expect(res.body.message).toBe("Test message2");
    });

    // Test results today
    test('Test "/message/add": invalid message', async () => {
        const res = await request(app).post("/menu/message/add")
        .send({
            token: token
        });

        expect(res.statusCode).toBe(500);
    });
});