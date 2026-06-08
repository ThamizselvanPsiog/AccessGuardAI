const runPa11y =
    require("./backend/scanners/pa11yScanner");

(async () => {

    const result =
        await runPa11y(
            "https://www.w3schools.com"
        );

    console.log(
        JSON.stringify(result, null, 2)
    );

})();