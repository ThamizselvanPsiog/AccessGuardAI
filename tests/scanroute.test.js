jest.mock("../backend/scanners/playwrightscanner", () =>
    jest.fn(async () => ({
        title: "Mock Site",
        violations: []
    }))
);

jest.mock("../backend/scanners/pa11yscanner", () =>
    jest.fn(async () => ({
        issues: []
    }))
);


jest.mock("../backend/scanners/lighthousescanner", () =>
    jest.fn(async () => ({
        accessibility: 90,
        performance: 80,
        bestPractices: 85,
        seo: 100
    }))
);

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
            .toHaveProperty("url");

        expect(response.body)
            .toHaveProperty("scores");

        expect(response.body)
            .toHaveProperty("violations");

        expect(response.body)
            .toHaveProperty("summary");

    },

    120000
);

});