const runLighthouse =
    require("./backend/scanners/lighthouseScanner");

(async () => {

    const result =
        await runLighthouse(
            "https://www.w3schools.com"
        );

    console.log(result);

})();