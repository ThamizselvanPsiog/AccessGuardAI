const startAccessibilityScan =
    require("../backend/scanners/playwrightscanner");

describe("Playwright Scanner", () => {

    test("should scan a website", async () => {

        const result =
            await startAccessibilityScan(
                "https://www.w3schools.com"
            );

        console.log(result.title);

        expect(result).toBeDefined();

        expect(result.title)
            .toBe("W3Schools Online Web Tutorials");
        
        expect(result.title)
                .toBeTruthy();

        expect(result)
            .toHaveProperty("violations");

    },
    120000
);

});