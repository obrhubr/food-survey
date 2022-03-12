import { app } from "../main";
import request from 'supertest';

describe('Test Vote route', () => {
    // Test vote
    test('Test "/votes/vote" method: correct', async () => {
        const res = await request(app).post("/votes/vote")
        .send({
            vote: 1, 
            class: 2, 
            menu: 'cbea39cc-a8e9-4fc1-9a30-3825b14aa922',
            fp: '12j1lk23123j21lj3'
        });

        // Check for statuscode
        expect(res.statusCode).toBe(200);
        expect(res.body.vote).toBe(1);
        expect(res.body.class).toBe(2);
        expect(res.body.menu).toBe('cbea39cc-a8e9-4fc1-9a30-3825b14aa922');
    });

    test('Test "/votes/vote" method: invalid body: missing fp', async () => {
        const res = await request(app).post("/votes/vote")
        .set({body: {
            vote: 1,
            class: 2,
            menu: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
        }});

        // Check for statuscode
        expect(res.statusCode).toBe(500);
    });

    test('Test "/votes/vote" method: invalid body: missing menu', async () => {
        const res = await request(app).post("/votes/vote")
        .set({body: {
            vote: 1, 
            class: 2,
            fp: "123ajdlfjalskdjflkasjdf"
        }});

        // Check for statuscode
        expect(res.statusCode).toBe(500);
    });

    test('Test "/votes/vote" method: invalid body: missing class', async () => {
        const res = await request(app).post("/votes/vote")
        .set({body: {
            vote: 1,
            menu: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
            fp: "123ajdlfjalskdjflkasjdf"
        }});

        // Check for statuscode
        expect(res.statusCode).toBe(500);
    });

    test('Test "/votes/vote" method: invalid body: missing vote', async () => {
        const res = await request(app).post("/votes/vote")
        .set({body: {
            class: 2,
            menu: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
            fp: "123ajdlfjalskdjflkasjdf"
        }});

        // Check for statuscode
        expect(res.statusCode).toBe(500);
    });

    test('Test "/votes/vote" method: invalid class = -1', async () => {
        const res = await request(app).post("/votes/vote")
        .set({body: {
            vote: 1, 
            class: -1, 
            menu: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
            fp: "123ajdlfjalskdjflkasjdf"
        }});

        // Check for statuscode
        expect(res.statusCode).toBe(500);
    });

    test('Test "/votes/vote" method: invalid class = 9', async () => {
        const res = await request(app).post("/votes/vote")
        .set({body: {
            vote: 1, 
            class: 9, 
            menu: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
            fp: "123ajdlfjalskdjflkasjdf"
        }});

        // Check for statuscode
        expect(res.statusCode).toBe(500);
    });

    test('Test "/votes/vote" method: invalid score = -1', async () => {
        const res = await request(app).post("/votes/vote")
        .set({body: {
            vote: -1, 
            class: 9, 
            menu: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
            fp: "123ajdlfjalskdjflkasjdf"
        }});

        // Check for statuscode
        expect(res.statusCode).toBe(500);
    });

    test('Test "/votes/vote" method: invalid score = 6', async () => {
        const res = await request(app).post("/votes/vote")
        .set({body: {
            vote: 6, 
            class: 9, 
            menu: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
            fp: "123ajdlfjalskdjflkasjdf"
        }});

        // Check for statuscode
        expect(res.statusCode).toBe(500);
    });

    // Test status
    test('Test "/votes/status" method: should work', async () => {
        const res = await request(app).get("/votes/status");

        // Check for statuscode and error text
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe(`{"status":true,"success":"Le vote est ouvert."}`);
    });
});