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
    saveScan,
    saveViolations
} = require("../services/databaseService");

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

       const scanId = saveScan(url, {
            accessibility: lighthouseresults.accessibility,
            performance: lighthouseresults.performance,
            bestPractices: lighthouseresults.bestPractices,
            seo: lighthouseresults.seo
        });

        saveViolations(scanId, deduplicatedviolations);

        console.log("All scanners completed");

        res.json({
        url,
    
        scores: {
            accessibility: lighthouseresults.accessibility,
            performance: lighthouseresults.performance,
            bestPractices: lighthouseresults.bestPractices,
            seo: lighthouseresults.seo
        },
    
        violations: deduplicatedviolations,

        raw: {
        axe: axeresult,
        pa11y: pa11yresults,
        lighthouse: lighthouseresults
       },
    
        summary: {
            totalViolations: deduplicatedviolations.length,
            rawViolations: normalizedViolations.length,
            duplicatesRemoved:
                    normalizedViolations.length -
                    deduplicatedviolations.length,
            axeViolations: axeCount,
            pa11yViolations: pa11yCount
        }
    });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message
        });

    }

});

module.exports = router;