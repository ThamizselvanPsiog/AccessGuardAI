const express = require("express");
const router = express.Router();

const scanwebsite = require("../scanners/playwrightscanner");

router.post("/scan", async (req, res) => {

    try {

        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                error: "URL is required"
            });
        }
        
        const result = await scanwebsite(url);

        res.json(result);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});

module.exports = router;