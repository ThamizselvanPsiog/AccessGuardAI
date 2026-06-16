const {
    mapWCAG
} = require("../../backend/services/wcagmapper");

describe("WCAG Mapper", () => {

    test(
        "should map image-alt to WCAG 1.1.1",
        () => {

            const result = mapWCAG([
                {
                    ruleId: "image-alt"
                }
            ]);

            expect(result[0]).toMatchObject({
                wcagCategory: "Perceivable",
                wcagCriterion: "1.1.1 Non-text Content",
                wcagLevel: "A"
            });
        }
    );

    test(
        "should map color-contrast to WCAG 1.4.3",
        () => {

            const result = mapWCAG([
                {
                    ruleId: "color-contrast"
                }
            ]);

            expect(result[0]).toMatchObject({
                wcagCategory: "Perceivable",
                wcagCriterion: "1.4.3 Contrast (Minimum)",
                wcagLevel: "AA"
            });
        }
    );

    test(
        "should map bypass to WCAG 2.4.1",
        () => {

            const result = mapWCAG([
                {
                    ruleId: "bypass"
                }
            ]);

            expect(result[0]).toMatchObject({
                wcagCategory: "Operable",
                wcagCriterion: "2.4.1 Bypass Blocks",
                wcagLevel: "A"
            });
        }
    );

    test(
        "should map label to WCAG 3.3.2",
        () => {

            const result = mapWCAG([
                {
                    ruleId: "label"
                }
            ]);

            expect(result[0]).toMatchObject({
                wcagCategory: "Understandable",
                wcagCriterion: "3.3.2 Labels or Instructions",
                wcagLevel: "A"
            });
        }
    );

    test(
        "should map aria-valid-attr to WCAG 4.1.2",
        () => {

            const result = mapWCAG([
                {
                    ruleId: "aria-valid-attr"
                }
            ]);

            expect(result[0]).toMatchObject({
                wcagCategory: "Robust",
                wcagCriterion: "4.1.2 Name, Role, Value",
                wcagLevel: "A"
            });
        }
    );

    test(
        "should preserve existing violation fields",
        () => {

            const result = mapWCAG([
                {
                    ruleId: "image-alt",
                    severity: "critical",
                    description: "Image missing alt text"
                }
            ]);

            expect(result[0].severity)
                .toBe("critical");

            expect(result[0].description)
                .toBe("Image missing alt text");

            expect(result[0].wcagCategory)
                .toBe("Perceivable");
        }
    );

    test(
        "should handle unknown rules",
        () => {

            const result = mapWCAG([
                {
                    ruleId: "unknown-rule"
                }
            ]);

            expect(result[0]).toMatchObject({
                wcagCategory: "Unknown",
                wcagCriterion: "Unknown",
                wcagLevel: "Unknown"
            });
        }
    );

    test(
        "should map multiple violations",
        () => {

            const result = mapWCAG([
                {
                    ruleId: "image-alt"
                },
                {
                    ruleId: "color-contrast"
                },
                {
                    ruleId: "label"
                }
            ]);

            expect(result)
                .toHaveLength(3);

            expect(result[0].wcagCategory)
                .toBe("Perceivable");

            expect(result[1].wcagCategory)
                .toBe("Perceivable");

            expect(result[2].wcagCategory)
                .toBe("Understandable");
        }
    );

});