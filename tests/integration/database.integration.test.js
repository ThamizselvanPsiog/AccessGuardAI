jest.mock("../../backend/scanners/playwrightscanner", () =>
    jest.fn(async () => ({
        title: "Mock Site",
        violations: []
    }))
);

jest.mock("../../backend/scanners/pa11yscanner", () =>
    jest.fn(async () => ({
        issues: []
    }))
);

jest.mock("../../backend/scanners/lighthousescanner", () =>
    jest.fn(async () => ({
        accessibility: 90,
        performance: 80,
        bestPractices: 85,
        seo: 100
    }))
);

const request = require("supertest");
const app = require("../../backend/app");

const db =
    require("../../backend/database/db");

describe("Database Integration", () => {

    test(
        "should store scan results in sqlite",
        async () => {

            await request(app)
                .post("/api/scan")
                .send({
                    url: "https://w3schools.com"
                });

            const scan =
                db.prepare(`
                    SELECT *
                    FROM scans
                    ORDER BY id DESC
                    LIMIT 1
                `).get();

            expect(scan).toBeDefined();

            expect(scan.url)
                .toContain("w3schools.com");

        },
        120000
    );

});