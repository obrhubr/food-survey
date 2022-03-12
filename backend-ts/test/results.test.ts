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
    test('Test "/results/today"', async () => {
        const res = await request(app).post("/results/today")
        .send({
            token: token
        });

        expect(res.statusCode).toBe(200);
        expect(JSON.stringify(res.body.results_all)).toBe(JSON.stringify([{"name":"a","uuid":"a","total":1,"average":1}]));
        expect(JSON.stringify(res.body.results_class)).toBe(JSON.stringify({"a":[{"class_total":[1,1,1,1,1,1,1,1],"class_avg":[0,1,2,3,4,5,6,7]}]})); 
    });

    // Test results today
    test('Test "/results/current"', async () => {
        const res = await request(app).post("/results/current")
        .send({
            token: token,
            class: 1,
            menu: "a"
        });

        const dbres: {total: number | null, average: number | null, class_total: number | null, average_class: number | null} = {
			total: 1,
			average: 1,
			class_total: 1,
			average_class: 1,
		};

        expect(res.statusCode).toBe(200);
        expect(res.body.total).toBe(1);
        expect(res.body.average).toBe(1);
        expect(res.body.class_total).toBe(1);
        expect(res.body.average_class).toBe(1);
    });
});