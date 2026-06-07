const request = require("supertest");

const app = require("../backend/app");

describe("Scan API", () => {

    test("POST /api/scan", async () => {

        const response =
            await request(app)
                .post("/api/scan")
                .send({
                    url:
                    "https://www.w3schools.com"
                });

        expect(response.statusCode)
            .toBe(200);

        expect(response.body)
            .toHaveProperty("title");

    },

    30000
);

});