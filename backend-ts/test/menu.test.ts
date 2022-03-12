import { app } from "../main";
import request from 'supertest';

let token: string;

describe('Test Menu route', () => {
    beforeAll(async () => {
        const res = await request(app).post("/login")
        .send({
            username: process.env.ADMIN_USERNAME,
            password: process.env.ADMIN_PASSWORD
        });

        token = res.body.token;
    })

    // Test add with working values
    test('Test "/menu/add" method: correct', async () => {
        const res = await request(app).post("/menu/add")
        .send({
            token: token,
            menus: {menus: []}
        });

        // Check for statuscode
        expect(res.statusCode).toBe(200);
        expect(typeof res.body.day).toBe('string');
        expect(res.body.open).toBe(false);
        expect(typeof res.body.createdAt).toBe('string');
    });

    // Test adding empty object as menus
    test('Test "/menu/add" method: empty object should be rejected', async () => {
        const res = await request(app).post("/menu/add")
        .send({
            token: token,
            menus: {}
        });

        // Check for statuscode
        expect(res.statusCode).toBe(500);
    });

    // Test add with working values
    test('Test "/menu/edit" method: correct', async () => {
        const res = await request(app).post("/menu/edit")
        .send({
            token: token,
            menus: {menus: [{}]}
        });

        // Check for statuscode
        expect(res.statusCode).toBe(200);
        expect(res.body.open).toBe(true);
    });
});