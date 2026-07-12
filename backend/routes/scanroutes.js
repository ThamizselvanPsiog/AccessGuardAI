const express = require("express");
const router = express.Router();

const scanwebsite = require("../scanners/playwrightscanner");
const runlighthouse= require("../scanners/lighthousescanner");
const runpa11y = require("../scanners/pa11yscanner");
const {
    normalizeAxeViolations,
    normalizePa11yIssues
} = require("../services/normalizer");
const {
    deduplicateviolations
} = require("../services/deduplicator");

const {
    mapWCAG
} = require("../services/wcagmapper");

const {
    saveScan,
    saveViolations
} = require("../services/databaseservice");

const {
    processViolations
} = require(
    "../services/accessibilitychain"
);

const {
    validateFixes
} = require(
    "../services/validationchain"
);

const {
    processGuidance
} = require(
    "../services/guidancechain"
);

router.post("/scan", async (req, res) => {

    try {

        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                error: "URL is required"
            });
        }
        
        console.log("Starting Axe");
        const axeresult = await scanwebsite(url);
        console.log("Starting Lighthouse");
        const lighthouseresults =
            await runlighthouse(url);
        console.log("Starting Pa11y");
        const pa11yresults= await runpa11y(url);

        const normalizedViolations = [
    ...normalizeAxeViolations(axeresult?.violations || []),
    ...normalizePa11yIssues(pa11yresults?.issues || [])
       ];

       const axeCount = normalizedViolations.filter(
            v => v.source === "axe"
        ).length;

       const pa11yCount = normalizedViolations.filter(
            v => v.source === "pa11y"
        ).length;

       const deduplicatedviolations = deduplicateviolations(normalizedViolations);

       const mappedViolations =
            mapWCAG(deduplicatedviolations);

        let aiFixes=[];

        try{
            aiFixes =
            await processViolations(
            mappedViolations
            );
        }catch(err){
            console.error(
                "AI Fix Generation Failed",
                err.message
            );

            aiFixes=[];
        }

        let validations=[];

        try{
            validations =
                await validateFixes(
                mappedViolations,
                aiFixes
            );
        } catch(err){
            console.error(
                "Validation Failed:",
                err.message
            );

            validations=[];
        }


        let guidance = [];

        try {
                guidance =
                    await processGuidance(
                        mappedViolations
                    );
                
            } catch (err) {
                console.error(
                    "Guidance generation failed:",
                    err.message
                );
            
                guidance = [];
            }

       const scanId = saveScan(url, {
            accessibility: lighthouseresults.accessibility,
            performance: lighthouseresults.performance,
            bestPractices: lighthouseresults.bestPractices,
            seo: lighthouseresults.seo
        });

        saveViolations(scanId, mappedViolations);

        console.log("All scanners completed");

        console.log("Violations:", mappedViolations.length);
        console.log("AI Fixes:", aiFixes.length);
        console.log("Validations:", validations.length);
        console.log("Guidance:", guidance.length);

        const response = {

            url,
        
            scores: {
                accessibility: lighthouseresults.accessibility,
                performance: lighthouseresults.performance,
                bestPractices: lighthouseresults.bestPractices,
                seo: lighthouseresults.seo
            },
        
            violations: mappedViolations,
        
            aiFixes,
        
            validations,
        
            guidance,
        
            summary: {
                totalViolations: mappedViolations.length,
                rawViolations: normalizedViolations.length,
                duplicatesRemoved:
                    normalizedViolations.length -
                    deduplicatedviolations.length,
                axeViolations: axeCount,
                pa11yViolations: pa11yCount
            }
        
        };
        
        console.log(
            "Response Size:",
            JSON.stringify(response).length,
            "bytes"
        );

        console.log("Sending response...");

        res.json(response);

        console.log("Response sent.");

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    }

});

module.exports = router;