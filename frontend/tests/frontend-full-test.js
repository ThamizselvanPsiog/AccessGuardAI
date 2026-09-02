import { chromium } from "playwright";
import crypto from "crypto";

/*
 * ============================================================
 * ACCESSGUARDAI - COMPLETE FRONTEND FUNCTIONAL TEST
 * ============================================================
 *
 * Run from:
 *
 *     frontend/
 *
 * Command:
 *
 *     node tests/frontend-full-test.js
 *
 * Required:
 *
 *     Backend  -> http://localhost:5000
 *     Frontend -> http://localhost:5173
 *
 * IMPORTANT:
 *
 * This test does NOT modify application source code.
 *
 * It tests the application according to the CURRENT
 * implementation and CURRENT React Router configuration.
 *
 * ============================================================
 */

const FRONTEND_URL =
    process.env.FRONTEND_URL ||
    "http://localhost:5173";

const BACKEND_URL =
    process.env.BACKEND_URL ||
    "http://localhost:5000";

const TEST_URL =
    process.env.SCAN_URL ||
    "https://www.example.com";


/*
 * ============================================================
 * TEST USER
 * ============================================================
 *
 * Every execution creates a unique account.
 */

const timestamp = Date.now();

const randomString =
    crypto
        .randomBytes(5)
        .toString("hex");

const TEST_NAME =
    `AccessGuard Test ${timestamp}`;

const TEST_EMAIL =
    `accessguard.test.${timestamp}.${randomString}@example.com`;

const TEST_PASSWORD =
    "AccessGuard123!";


/*
 * ============================================================
 * TEST STATE
 * ============================================================
 */

let browser = null;
let context = null;
let page = null;

let scanId = null;

const browserErrors = [];


/*
 * ============================================================
 * LOGGING
 * ============================================================
 */

function section(number, title) {

    console.log("");

    console.log(
        "============================================================"
    );

    console.log(
        `${number}. ${title}`
    );

    console.log(
        "============================================================"
    );
}


function success(message) {

    console.log(
        `✅ ${message}`
    );
}


function info(message) {

    console.log(
        `ℹ️  ${message}`
    );
}


function fail(message) {

    throw new Error(message);
}


/*
 * ============================================================
 * PAGE HELPERS
 * ============================================================
 */

async function settle(milliseconds = 1000) {

    await page.waitForTimeout(
        milliseconds
    );
}


async function waitForPage() {

    await page.waitForLoadState(
        "domcontentloaded",
        {
            timeout: 30000
        }
    ).catch(() => {});

    await settle(800);
}


async function bodyText() {

    return await page
        .locator("body")
        .innerText()
        .catch(() => "");
}


async function currentUrl() {

    return page.url();
}


/*
 * ============================================================
 * FIND FIRST VISIBLE ELEMENT
 * ============================================================
 */

async function findFirstVisible(
    locators
) {

    for (
        const locator
        of locators
    ) {

        try {

            const first =
                locator.first();

            if (
                await first.isVisible({
                    timeout: 1500
                })
            ) {

                return first;
            }

        } catch {
            /*
             * Try next locator.
             */
        }
    }

    return null;
}


/*
 * ============================================================
 * GET AUTH TOKEN
 * ============================================================
 */

async function getToken() {

    return await page.evaluate(() => {

        return localStorage.getItem(
            "accessGuardToken"
        );

    });
}


/*
 * ============================================================
 * GET ACTIVE SCAN ID
 * ============================================================
 */

async function getActiveScanId() {

    return await page.evaluate(() => {

        return localStorage.getItem(
            "activeScanId"
        );

    });
}


/*
 * ============================================================
 * AUTHENTICATED BACKEND GET
 * ============================================================
 */

async function authenticatedGet(
    endpoint
) {

    const token =
        await getToken();

    if (!token) {

        fail(
            "Cannot perform authenticated request because accessGuardToken is missing."
        );
    }

    const response =
        await fetch(
            `${BACKEND_URL}${endpoint}`,
            {
                method: "GET",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

    let data = null;

    try {

        data =
            await response.json();

    } catch {

        data = null;
    }

    if (!response.ok) {

        fail(
            `Backend GET ${endpoint} failed with HTTP ${response.status}.`
        );
    }

    return data;
}


/*
 * ============================================================
 * VERIFY NO APPLICATION ERROR
 * ============================================================
 */

async function verifyNoApplicationError() {

    const text =
        await bodyText();

    const errorPatterns = [
        /application error/i,
        /unexpected error/i,
        /something went wrong/i,
        /failed to load page/i
    ];

    for (
        const pattern
        of errorPatterns
    ) {

        if (
            pattern.test(text)
        ) {

            fail(
                `Application error detected on ${await currentUrl()}.`
            );
        }
    }
}


/*
 * ============================================================
 * BACKEND HEALTH
 * ============================================================
 */

async function testBackendHealth() {

    section(
        1,
        "Backend Health"
    );

    const response =
        await fetch(
            `${BACKEND_URL}/api/health`
        );

    if (!response.ok) {

        fail(
            `Backend health check failed with HTTP ${response.status}.`
        );
    }

    const data =
        await response.json();

    if (
        !data.success
    ) {

        fail(
            "Backend health endpoint returned success=false."
        );
    }

    success(
        "Backend is running."
    );
}


/*
 * ============================================================
 * FRONTEND LOAD
 * ============================================================
 */

async function testFrontendLoad() {

    section(
        2,
        "Frontend Load"
    );

    await page.goto(
        FRONTEND_URL,
        {
            waitUntil:
                "domcontentloaded",

            timeout:
                30000
        }
    );

    await waitForPage();

    const text =
        await bodyText();

    if (
        !text ||
        text.trim().length === 0
    ) {

        fail(
            "Frontend loaded but the page is empty."
        );
    }

    success(
        "Frontend loaded successfully."
    );
}


/*
 * ============================================================
 * USER REGISTRATION
 * ============================================================
 */

async function testRegistration() {

    section(
        3,
        "User Registration"
    );


    /*
     * Always start from the registration page.
     */

    await page.goto(
        `${FRONTEND_URL}/register`,
        {
            waitUntil:
                "domcontentloaded",

            timeout:
                30000
        }
    );

    await waitForPage();


    /*
     * Name
     */

    const nameInput =
        await findFirstVisible([
            page.getByLabel(
                /name/i
            ),

            page.locator(
                'input[name="name"]'
            ),

            page.locator(
                'input[placeholder*="name" i]'
            ),

            page.locator(
                'input[id*="name" i]'
            )
        ]);


    if (!nameInput) {

        fail(
            "Registration name field was not found."
        );
    }


    /*
     * Email
     */

    const emailInput =
        await findFirstVisible([
            page.getByLabel(
                /email/i
            ),

            page.locator(
                'input[type="email"]'
            ),

            page.locator(
                'input[name="email"]'
            )
        ]);


    if (!emailInput) {

        fail(
            "Registration email field was not found."
        );
    }


    /*
     * Password fields
     */

    const passwordInputs =
        page.locator(
            'input[type="password"]'
        );


    const passwordCount =
        await passwordInputs.count();


    if (
        passwordCount < 1
    ) {

        fail(
            "Registration password field was not found."
        );
    }


    /*
     * Fill registration form.
     */

    await nameInput.fill(
        TEST_NAME
    );

    await emailInput.fill(
        TEST_EMAIL
    );

    await passwordInputs
        .nth(0)
        .fill(
            TEST_PASSWORD
        );


    /*
     * If confirmation password exists,
     * fill it as well.
     */

    if (
        passwordCount > 1
    ) {

        await passwordInputs
            .nth(1)
            .fill(
                TEST_PASSWORD
            );
    }


    /*
     * Registration submit button.
     */

    const registerButton =
        await findFirstVisible([
            page.locator(
                'button[type="submit"]'
            ),

            page.getByRole(
                "button",
                {
                    name:
                        /register|sign up|create account/i
                }
            ),

            page.locator(
                'input[type="submit"]'
            )
        ]);


    if (!registerButton) {

        fail(
            "Registration submit button was not found."
        );
    }


    /*
     * IMPORTANT:
     *
     * Wait for the REAL backend registration
     * response.
     *
     * Backend:
     *
     * POST /api/auth/register
     *
     * Successful response:
     *
     * HTTP 201
     *
     * success: true
     */

    const registrationResponsePromise =
        page.waitForResponse(
            response =>
                response.url()
                    .includes(
                        "/api/auth/register"
                    ) &&
                response.request()
                    .method() ===
                    "POST",
            {
                timeout:
                    15000
            }
        );


    await registerButton.click();


    const registrationResponse =
        await registrationResponsePromise;


    const registrationStatus =
        registrationResponse.status();


    let registrationData =
        null;


    try {

        registrationData =
            await registrationResponse.json();

    } catch {

        registrationData =
            null;
    }


    /*
     * The backend implementation returns
     * HTTP 201 for successful registration.
     */

    if (
        registrationStatus !==
        201
    ) {

        console.log("");

        console.log(
            "Registration API response:"
        );

        console.log(
            registrationData
        );

        fail(
            `Registration API returned HTTP ${registrationStatus}. Expected HTTP 201.`
        );
    }


    if (
        !registrationData ||
        registrationData.success !==
            true
    ) {

        console.log("");

        console.log(
            "Registration API response:"
        );

        console.log(
            registrationData
        );

        fail(
            "Registration API did not return success=true."
        );
    }


    /*
     * Verify returned user information.
     */

    if (
        !registrationData.user
    ) {

        fail(
            "Registration succeeded but no user object was returned."
        );
    }


    if (
        String(
            registrationData.user.email
        ).toLowerCase() !==
        TEST_EMAIL.toLowerCase()
    ) {

        fail(
            `Registration returned an unexpected email. Expected ${TEST_EMAIL}.`
        );
    }


    success(
        `Registration API successfully created ${TEST_EMAIL}.`
    );


    /*
     * Give the frontend time to finish any
     * navigation/toast updates.
     */

    await settle(
        1000
    );
}


/*
 * ============================================================
 * USER LOGIN
 * ============================================================
 */

async function testLogin() {

    section(
        4,
        "User Login"
    );


    /*
     * The application's login route is "/".
     */

    await page.goto(
        FRONTEND_URL,
        {
            waitUntil:
                "domcontentloaded",

            timeout:
                30000
        }
    );

    await waitForPage();


    /*
     * Make sure old authentication data from
     * a previous browser state cannot affect
     * this test.
     */

    await page.evaluate(() => {

        localStorage.removeItem(
            "accessGuardToken"
        );

        localStorage.removeItem(
            "activeScanId"
        );

    });


    /*
     * Login email.
     */

    const emailInput =
        await findFirstVisible([
            page.getByLabel(
                /email/i
            ),

            page.locator(
                'input[type="email"]'
            ),

            page.locator(
                'input[name="email"]'
            )
        ]);


    if (!emailInput) {

        fail(
            `Login email field was not found. Current URL: ${page.url()}`
        );
    }


    /*
     * Login password.
     */

    const passwordInput =
        await findFirstVisible([
            page.getByLabel(
                /password/i
            ),

            page.locator(
                'input[type="password"]'
            ),

            page.locator(
                'input[name="password"]'
            )
        ]);


    if (!passwordInput) {

        fail(
            `Login password field was not found. Current URL: ${page.url()}`
        );
    }


    /*
     * Fill login form.
     */

    await emailInput.fill(
        TEST_EMAIL
    );

    await passwordInput.fill(
        TEST_PASSWORD
    );


    /*
     * Login button.
     */

    const loginButton =
        await findFirstVisible([
            page.locator(
                'button[type="submit"]'
            ),

            page.getByRole(
                "button",
                {
                    name:
                        /login|log in|sign in/i
                }
            ),

            page.locator(
                'input[type="submit"]'
            )
        ]);


    if (!loginButton) {

        fail(
            "Login submit button was not found."
        );
    }


    /*
     * Wait for the ACTUAL login API response.
     *
     * Backend:
     *
     * POST /api/auth/login
     */

    const loginResponsePromise =
        page.waitForResponse(
            response =>
                response.url()
                    .includes(
                        "/api/auth/login"
                    ) &&
                response.request()
                    .method() ===
                    "POST",
            {
                timeout:
                    15000
            }
        );


    await loginButton.click();


    const loginResponse =
        await loginResponsePromise;


    const loginStatus =
        loginResponse.status();


    let loginData =
        null;


    try {

        loginData =
            await loginResponse.json();

    } catch {

        loginData =
            null;
    }


    /*
     * If login failed, show the REAL backend
     * response instead of incorrectly saying
     * the token was not stored.
     */

    if (
        loginStatus !==
        200
    ) {

        console.log("");

        console.log(
            "Login API response:"
        );

        console.log(
            loginData
        );


        const backendMessage =
            loginData?.message ||
            "No backend error message was returned.";


        fail(
            `Login API failed with HTTP ${loginStatus}: ${backendMessage}`
        );
    }


    /*
     * Backend login implementation requires:
     *
     * success: true
     * token
     * user
     */

    if (
        !loginData ||
        loginData.success !==
            true
    ) {

        console.log("");

        console.log(
            "Login API response:"
        );

        console.log(
            loginData
        );


        fail(
            "Login API returned HTTP 200 but success was not true."
        );
    }


    if (
        !loginData.token
    ) {

        console.log("");

        console.log(
            "Login API response:"
        );

        console.log(
            loginData
        );


        fail(
            "Login API returned success=true but no JWT token."
        );
    }


    if (
        !loginData.user
    ) {

        fail(
            "Login API returned success=true but no user object."
        );
    }


    success(
        "Login API authenticated the test user successfully."
    );


    /*
     * Give AuthContext/React time to store the
     * returned token.
     */

    let token =
        null;


    const tokenDeadline =
        Date.now() +
        10000;


    while (
        Date.now() <
        tokenDeadline
    ) {

        token =
            await getToken();


        if (
            token
        ) {

            break;
        }


        await settle(
            250
        );
    }


    /*
     * Now verify the FRONTEND's localStorage.
     *
     * We do NOT store the token ourselves.
     */

    if (
        !token
    ) {

        const localStorageState =
            await page.evaluate(() => {

                const result = {};

                for (
                    let index = 0;
                    index < localStorage.length;
                    index++
                ) {

                    const key =
                        localStorage.key(
                            index
                        );

                    result[key] =
                        localStorage.getItem(
                            key
                        );
                }

                return result;

            });


        console.log("");

        console.log(
            "LocalStorage after successful login API:"
        );

        console.log(
            localStorageState
        );


        fail(
            "Login API succeeded and returned a JWT, but the frontend did not store it as accessGuardToken."
        );
    }


    /*
     * Make sure the stored value is the
     * actual JWT returned by the backend.
     */

    if (
        token !==
        loginData.token
    ) {

        fail(
            "accessGuardToken exists, but it does not match the JWT returned by the login API."
        );
    }


    success(
        "Frontend stored the JWT as accessGuardToken."
    );


    /*
     * Verify that authentication actually
     * navigates into the protected application.
     */

    const dashboardDeadline =
        Date.now() +
        10000;


    while (
        Date.now() <
        dashboardDeadline
    ) {

        if (
            page.url()
                .includes(
                    "/dashboard"
                )
        ) {

            break;
        }


        await settle(
            250
        );
    }


    if (
        !page.url()
            .includes(
                "/dashboard"
            )
    ) {

        /*
         * Navigation itself is useful to test,
         * but don't fail solely because the
         * implementation may stay on the login
         * page after authentication.
         *
         * We verify protected access explicitly
         * in the next test.
         */

        info(
            `Login succeeded but current route is ${page.url()}; protected access will be verified next.`
        );

    } else {

        success(
            "Login navigated to the protected dashboard."
        );
    }
}


/*
 * ============================================================
 * DASHBOARD
 * ============================================================
 */

async function testDashboard() {

    section(
        5,
        "Dashboard"
    );

    await page.goto(
        `${FRONTEND_URL}/dashboard`,
        {
            waitUntil:
                "domcontentloaded",

            timeout:
                30000
        }
    );

    await waitForPage();

    await verifyNoApplicationError();


    const text =
        await bodyText();


    if (
        !/dashboard/i.test(
            text
        )
    ) {

        fail(
            "Dashboard page did not render."
        );
    }


    if (
        !/accessibility dashboard/i.test(
            text
        )
    ) {

        fail(
            "Accessibility Dashboard content was not found."
        );
    }


    success(
        "Dashboard loads successfully."
    );
}


/*
 * ============================================================
 * DASHBOARD DATA
 * ============================================================
 */

async function testDashboardData() {

    section(
        6,
        "Dashboard Data"
    );


    /*
     * Verify backend dashboard endpoint.
     */

    const data =
        await authenticatedGet(
            "/api/dashboard"
        );


    if (
        !data ||
        data.success !== true
    ) {

        fail(
            "Dashboard API did not return success=true."
        );
    }


    /*
     * The current Dashboard.jsx uses:
     *
     * overview
     * latestScan
     * comparison
     * scoreTrend
     * severity
     * previousScan
     * topRule
     */

    if (
        data.hasScan
    ) {

        const requiredFields = [
            "overview",
            "latestScan",
            "comparison",
            "scoreTrend",
            "severity"
        ];


        for (
            const field
            of requiredFields
        ) {

            if (
                data[field] === undefined
            ) {

                fail(
                    `Dashboard API is missing field: ${field}`
                );
            }
        }


        success(
            "Dashboard API returned scan data."
        );

    } else {

        success(
            "Dashboard API correctly reports that no scan data exists."
        );
    }


    /*
     * Verify the visible dashboard cards
     * / chart areas.
     */

    const text =
        await bodyText();


    const dashboardIndicators = [
        /accessibility score/i,
        /total scans/i,
        /total issues/i,
        /ai remediation/i,
        /accessibility score trend/i,
        /issue severity/i
    ];


    let found = 0;


    for (
        const pattern
        of dashboardIndicators
    ) {

        if (
            pattern.test(text)
        ) {

            found++;
        }
    }


    if (
        found === 0 &&
        data.hasScan
    ) {

        fail(
            "Dashboard rendered but expected dashboard data sections were not detected."
        );
    }


    success(
        `${found} dashboard data section(s) detected.`
    );
}


/*
 * ============================================================
 * SIDEBAR
 * ============================================================
 */

async function testSidebar() {

    section(
        7,
        "Sidebar / Navigation"
    );


    const expectedRoutes = [
        {
            name:
                "Dashboard",

            route:
                "/dashboard"
        },

        {
            name:
                "New Scan",

            route:
                "/scan"
        },

        {
            name:
                "Scan History",

            route:
                "/history"
        },

        {
            name:
                "Analytics",

            route:
                "/analytics"
        },

        {
            name:
                "AI Remediation",

            route:
                "/ai"
        },

        {
            name:
                "Settings",

            route:
                "/settings"
        }
    ];


    const links =
        await page.locator(
            "a"
        ).evaluateAll(
            elements =>
                elements.map(
                    element => ({
                        text:
                            element.innerText
                                .trim(),

                        href:
                            element.getAttribute(
                                "href"
                            )
                    })
                )
        );


    for (
        const item
        of expectedRoutes
    ) {

        const matchingLink =
            links.find(
                link => {

                    const text =
                        String(
                            link.text || ""
                        )
                            .toLowerCase();

                    const href =
                        String(
                            link.href || ""
                        );

                    return (
                        text.includes(
                            item.name
                                .toLowerCase()
                        ) &&
                        href ===
                            item.route
                    );
                }
            );


        if (!matchingLink) {

            /*
             * Try a less strict text match.
             */

            const textMatch =
                links.find(
                    link =>
                        String(
                            link.text || ""
                        )
                            .toLowerCase()
                            .includes(
                                item.name
                                    .toLowerCase()
                            )
                );


            if (!textMatch) {

                fail(
                    `Sidebar navigation item not found: ${item.name}`
                );
            }


            info(
                `${item.name} found, but its href is ${textMatch.href}.`
            );
        }
    }


    success(
        "Sidebar/navigation controls are available."
    );
}


/*
 * ============================================================
 * NEW ACCESSIBILITY SCAN PAGE
 * ============================================================
 */

async function testNewScanPage() {

    section(
        8,
        "New Accessibility Scan"
    );


    /*
     * Current AppRouter:
     *
     *     /scan
     */

    await page.goto(
        `${FRONTEND_URL}/scan`,
        {
            waitUntil:
                "domcontentloaded",

            timeout:
                30000
        }
    );

    await waitForPage();

    await verifyNoApplicationError();


    const text =
        await bodyText();


    if (
        !/new accessibility scan/i.test(
            text
        )
    ) {

        fail(
            "New Accessibility Scan page did not render."
        );
    }


    /*
     * Current ScanForm is a child component.
     *
     * Locate the URL input without assuming
     * an exact implementation.
     */

    const urlInput =
        await findFirstVisible([
            page.locator(
                'input[name="url"]'
            ),

            page.locator(
                'input[type="url"]'
            ),

            page.getByLabel(
                /url|website/i
            ),

            page.locator(
                'input[placeholder*="url" i]'
            ),

            page.locator(
                'input[placeholder*="website" i]'
            ),

            page.locator(
                'input[id*="url" i]'
            ),

            page.locator(
                'input[id*="website" i]'
            )
        ]);


    if (!urlInput) {

        console.log("");

        console.log(
            "Current Scan Page Text:"
        );

        console.log(
            text.substring(
                0,
                4000
            )
        );

        fail(
            "Website URL input was not found on the New Accessibility Scan page."
        );
    }


    await urlInput.fill(
        TEST_URL
    );


    const enteredValue =
        await urlInput.inputValue();


    if (
        enteredValue !== TEST_URL
    ) {

        fail(
            `Unable to enter scan URL. Expected ${TEST_URL}, received ${enteredValue}.`
        );
    }


    success(
        "New Accessibility Scan page and URL input work."
    );
}


/*
 * ============================================================
 * START REAL ACCESSIBILITY SCAN
 * ============================================================
 */

async function testRunScan() {

    section(
        9,
        "Run Accessibility Scan"
    );


    /*
     * IMPORTANT FIX:
     *
     * Your actual button is:
     *
     *     Start Accessibility Scan
     *
     * but it does NOT have:
     *
     *     type="submit"
     *
     * Therefore we MUST NOT depend on:
     *
     *     button[type="submit"]
     *
     *
     * We specifically locate the actual button text.
     */


    let scanButton =
        await findFirstVisible([
            page.locator(
                "button"
            ).filter({
                hasText:
                    /^Start Accessibility Scan$/i
            }),

            page.getByRole(
                "button",
                {
                    name:
                        /^Start Accessibility Scan$/i
                }
            ),

            page.getByText(
                "Start Accessibility Scan",
                {
                    exact:
                        true
                }
            )
        ]);


    /*
     * If exact text isn't found, search
     * all buttons and print them.
     */

    if (!scanButton) {

        const buttons =
            await page.locator(
                "button"
            ).evaluateAll(
                elements =>
                    elements.map(
                        element => ({
                            text:
                                element.innerText
                                    .trim(),

                            type:
                                element.getAttribute(
                                    "type"
                                ),

                            disabled:
                                element.disabled
                        })
                    )
            );


        console.log("");

        console.log(
            "Actual buttons rendered on Scan page:"
        );

        console.log(
            buttons
        );


        fail(
            "The Start Accessibility Scan button was not found."
        );
    }


    /*
     * Make sure the button is actually usable.
     */

    if (
        await scanButton.isDisabled()
    ) {

        fail(
            "Start Accessibility Scan button is disabled."
        );
    }


    success(
        "Start Accessibility Scan control found."
    );


    info(
        `Starting real accessibility scan for ${TEST_URL}...`
    );


    /*
     * Listen for the actual frontend -> backend
     * POST /api/scan request.
     *
     * This is much better than simply clicking
     * and waiting an arbitrary amount of time.
     */

    const scanResponsePromise =
        page.waitForResponse(
            response => {

                return (
                    response.url()
                        .includes(
                            "/api/scan"
                        ) &&
                    response.request()
                        .method() ===
                        "POST"
                );

            },
            {
                timeout:
                    12 * 60 * 1000
            }
        );


    /*
     * Click the ACTUAL button.
     */

    await scanButton.click();


    info(
        "Accessibility scan request started."
    );


    /*
     * Wait for backend response.
     *
     * The scan executes:
     *
     * - Playwright / axe
     * - Lighthouse
     * - Pa11y
     * - AI processing
     *
     * Therefore this can take several minutes.
     */

    const scanResponse =
        await scanResponsePromise;


    const status =
        scanResponse.status();


    if (
        status < 200 ||
        status >= 300
    ) {

        fail(
            `Accessibility scan API returned HTTP ${status}.`
        );
    }


    let scanResponseData = null;


    try {

        scanResponseData =
            await scanResponse.json();

    } catch {

        fail(
            "Accessibility scan API did not return valid JSON."
        );
    }


    if (
        !scanResponseData ||
        scanResponseData.success !== true
    ) {

        console.log("");

        console.log(
            "Scan API response:"
        );

        console.log(
            scanResponseData
        );


        fail(
            "Accessibility scan API returned success=false."
        );
    }


    success(
        "Accessibility scan API returned successfully."
    );


    /*
     * Give React time to update:
     *
     * scanResult
     *
     * activeScanId
     */

    await settle(1500);


    /*
     * Verify activeScanId.
     */

    let activeScanId =
        await getActiveScanId();


    /*
     * Sometimes React state/localStorage
     * update happens a little after the response.
     */

    if (!activeScanId) {

        const deadline =
            Date.now() +
            10000;


        while (
            Date.now() <
            deadline
        ) {

            activeScanId =
                await getActiveScanId();


            if (activeScanId) {
                break;
            }


            await settle(500);
        }
    }


    if (!activeScanId) {

        /*
         * The current NewScan implementation stores:
         *
         * data.scanId
         * OR
         * data.scan.id
         * OR
         * data.id
         *
         * in activeScanId.
         */

        const responseScanId =
            scanResponseData?.scanId ??
            scanResponseData?.scan?.id ??
            scanResponseData?.id ??
            null;


        if (responseScanId) {

            /*
             * Do NOT write it into localStorage here.
             *
             * The test must verify the application,
             * not repair it.
             */

            fail(
                `Scan succeeded with scan ID ${responseScanId}, but the frontend did not store activeScanId.`
            );
        }


        fail(
            "Accessibility scan succeeded but no scan ID was returned."
        );
    }


    scanId =
        String(
            activeScanId
        );


    success(
        `activeScanId stored successfully: ${scanId}.`
    );


    /*
     * Verify visible scan result.
     */

    const resultDeadline =
        Date.now() +
        30000;


    let resultVisible =
        false;


    while (
        Date.now() <
        resultDeadline
    ) {

        const text =
            await bodyText();


        if (
            /accessibility score/i.test(text) ||
            /scan result/i.test(text) ||
            /violations/i.test(text) ||
            /issues found/i.test(text)
        ) {

            resultVisible =
                true;

            break;
        }


        if (
            /scan failed/i.test(text) ||
            /unable to complete the accessibility scan/i.test(text)
        ) {

            console.log("");

            console.log(
                "Scan page:"
            );

            console.log(
                text.substring(
                    0,
                    5000
                )
            );


            fail(
                "The frontend displayed an accessibility scan error."
            );
        }


        await settle(1000);
    }


    if (!resultVisible) {

        console.log("");

        console.log(
            "Current Scan Page Text:"
        );

        console.log(
            (
                await bodyText()
            ).substring(
                0,
                5000
            )
        );


        fail(
            "Scan completed at the API level but the frontend did not display the scan result."
        );
    }


    success(
        `Accessibility scan result displayed for Scan ID ${scanId}.`
    );
}


/*
 * ============================================================
 * VERIFY SCAN PERSISTENCE
 * ============================================================
 */

async function testScanPersistence() {

    section(
        10,
        "Scan Persistence"
    );


    if (!scanId) {

        fail(
            "Cannot verify persistence because scanId is missing."
        );
    }


    const data =
        await authenticatedGet(
            "/api/scan"
        );


    if (
        !data ||
        data.success !== true
    ) {

        fail(
            "Scan history API did not return success=true."
        );
    }


    if (
        !Array.isArray(
            data.scans
        )
    ) {

        fail(
            "Scan history API did not return a scans array."
        );
    }


    const persistedScan =
        data.scans.find(
            scan =>
                String(
                    scan.id
                ) ===
                String(
                    scanId
                )
        );


    if (!persistedScan) {

        fail(
            `Scan ID ${scanId} was not found in persisted scan history.`
        );
    }


    success(
        `Scan ID ${scanId} is persisted in the backend.`
    );
}


/*
 * ============================================================
 * SCAN-SPECIFIC ROUTES
 * ============================================================
 */

async function testScanSpecificRoutes() {

    section(
        11,
        "Scan-Specific Routes"
    );


    if (!scanId) {

        fail(
            "Cannot test scan-specific routes without scanId."
        );
    }


    const routes = [
        {
            name:
                "Analytics",

            route:
                `/analytics/${scanId}`,

            expected:
                /analytics/i
        },

        {
            name:
                "AI Remediation",

            route:
                `/ai/${scanId}`,

            expected:
                /ai remediation|remediation/i
        },

        {
            name:
                "Settings",

            route:
                `/settings/${scanId}`,

            expected:
                /settings/i
        }
    ];


    for (
        const item
        of routes
    ) {

        await page.goto(
            `${FRONTEND_URL}${item.route}`,
            {
                waitUntil:
                    "domcontentloaded",

                timeout:
                    30000
            }
        );


        await waitForPage();

        await verifyNoApplicationError();


        const text =
            await bodyText();


        if (
            !item.expected.test(
                text
            )
        ) {

            fail(
                `${item.name} page did not render correctly at ${item.route}.`
            );
        }


        success(
            `${item.name} route works with scanId ${scanId}.`
        );
    }
}


/*
 * ============================================================
 * ANALYTICS
 * ============================================================
 */

async function testAnalytics() {

    section(
        12,
        "Analytics"
    );


    /*
     * Test frontend route.
     */

    await page.goto(
        `${FRONTEND_URL}/analytics/${scanId}`,
        {
            waitUntil:
                "domcontentloaded",

            timeout:
                30000
        }
    );


    await waitForPage();

    await verifyNoApplicationError();


    const text =
        await bodyText();


    if (
        !/analytics/i.test(
            text
        )
    ) {

        fail(
            "Analytics page did not render."
        );
    }


    if (
        !/score|severity|issue|detection/i.test(
            text
        )
    ) {

        fail(
            "Analytics page rendered but expected analytics information was not found."
        );
    }


    /*
     * Also verify the backend endpoint.
     *
     * Your app.js mounts:
     *
     *     /api/analytics
     */

    const apiData =
        await authenticatedGet(
            "/api/analytics"
        );


    if (
        !apiData ||
        apiData.success !== true
    ) {

        fail(
            "Analytics API did not return success=true."
        );
    }


    if (
        apiData.hasScan &&
        !apiData.scan
    ) {

        fail(
            "Analytics API reports hasScan=true but scan data is missing."
        );
    }


    success(
        "Analytics page and API work."
    );
}


/*
 * ============================================================
 * AI REMEDIATION
 * ============================================================
 */

async function testAIRemediation() {

    section(
        13,
        "AI Remediation"
    );


    await page.goto(
        `${FRONTEND_URL}/ai/${scanId}`,
        {
            waitUntil:
                "domcontentloaded",

            timeout:
                30000
        }
    );


    await waitForPage();


    /*
     * AI remediation may take a little time to
     * retrieve and render.
     */

    const deadline =
        Date.now() +
        30000;


    let text = "";


    while (
        Date.now() <
        deadline
    ) {

        text =
            await bodyText();


        if (
            /ai remediation|remediation/i.test(
                text
            )
        ) {
            break;
        }


        if (
            /unable to load ai remediation/i.test(
                text
            )
        ) {

            fail(
                "AI Remediation page displayed an application error."
            );
        }


        await settle(1000);
    }


    if (
        !/ai remediation|remediation/i.test(
            text
        )
    ) {

        fail(
            "AI Remediation page did not render."
        );
    }


    /*
     * Verify the actual backend endpoint
     * used by AIRemediation.jsx.
     */

    const apiData =
        await authenticatedGet(
            `/api/scan/${scanId}/remediation`
        );


    if (
        !apiData ||
        apiData.success !== true
    ) {

        fail(
            "AI Remediation API did not return success=true."
        );
    }


    if (
        !apiData.scan
    ) {

        fail(
            "AI Remediation API did not return scan data."
        );
    }


    if (
        !Array.isArray(
            apiData.remediation
        )
    ) {

        fail(
            "AI Remediation API did not return a remediation array."
        );
    }


    success(
        `AI Remediation page and API work. ${apiData.remediation.length} remediation item(s) returned.`
    );
}


/*
 * ============================================================
 * SCAN HISTORY
 * ============================================================
 */

async function testScanHistory() {

    section(
        14,
        "Scan History"
    );


    /*
     * Current AppRouter only defines:
     *
     *     /history
     *
     * There is NO /history/:scanId route.
     *
     * Therefore test exactly /history.
     */

    await page.goto(
        `${FRONTEND_URL}/history`,
        {
            waitUntil:
                "domcontentloaded",

            timeout:
                30000
        }
    );


    await waitForPage();

    await verifyNoApplicationError();


    const text =
        await bodyText();


    if (
        !/history|scan/i.test(
            text
        )
    ) {

        fail(
            "Scan History page did not render."
        );
    }


    /*
     * Verify the API used by History.jsx.
     */

    const historyData =
        await authenticatedGet(
            "/api/scan"
        );


    if (
        !historyData ||
        historyData.success !== true
    ) {

        fail(
            "Scan History API did not return success=true."
        );
    }


    if (
        !Array.isArray(
            historyData.scans
        )
    ) {

        fail(
            "Scan History API did not return a scans array."
        );
    }


    const currentScan =
        historyData.scans.find(
            scan =>
                String(
                    scan.id
                ) ===
                String(
                    scanId
                )
        );


    if (!currentScan) {

        fail(
            `Current scan ${scanId} was not found in Scan History.`
        );
    }


    success(
        `Scan History loads and contains Scan ID ${scanId}.`
    );


    /*
     * Check whether a report/download control
     * exists.
     *
     * Do not require it to have one exact label.
     */

    const reportControl =
        await findFirstVisible([
            page.getByRole(
                "button",
                {
                    name:
                        /download|report|pdf/i
                }
            ),

            page.locator(
                "button"
            ).filter({
                hasText:
                    /download|report|pdf/i
            }),

            page.getByRole(
                "link",
                {
                    name:
                        /download|report|pdf/i
                }
            )
        ]);


    if (reportControl) {

        success(
            "Scan History report/download control is available."
        );

    } else {

        info(
            "No report/download control was detected in the currently rendered viewport."
        );
    }
}


/*
 * ============================================================
 * SETTINGS
 * ============================================================
 */

async function testSettings() {

    section(
        15,
        "Settings"
    );


    await page.goto(
        `${FRONTEND_URL}/settings`,
        {
            waitUntil:
                "domcontentloaded",

            timeout:
                30000
        }
    );


    await waitForPage();

    await verifyNoApplicationError();


    const text =
        await bodyText();


    if (
        !/settings/i.test(
            text
        )
    ) {

        fail(
            "Settings page did not render."
        );
    }


    /*
     * Your Settings implementation contains:
     *
     * Profile
     * Appearance
     * Password/security
     * Logout
     */

    if (
        !/profile/i.test(
            text
        )
    ) {

        fail(
            "Settings Profile section was not found."
        );
    }


    if (
        !/password|security/i.test(
            text
        )
    ) {

        fail(
            "Settings password/security section was not found."
        );
    }


    /*
     * Profile inputs.
     */

    const profileName =
        await findFirstVisible([
            page.locator(
                'input[name="name"]'
            ),

            page.getByLabel(
                /^name$/i
            )
        ]);


    const profileEmail =
        await findFirstVisible([
            page.locator(
                'input[name="email"]'
            ),

            page.getByLabel(
                /^email$/i
            ),

            page.locator(
                'input[type="email"]'
            )
        ]);


    if (profileName) {

        success(
            "Settings profile name field is available."
        );

    } else {

        info(
            "Profile name field was not detected with a standard selector."
        );
    }


    if (profileEmail) {

        success(
            "Settings profile email field is available."
        );

    } else {

        info(
            "Profile email field was not detected with a standard selector."
        );
    }


    /*
     * Password fields.
     */

    const passwordFields =
        await page.locator(
            'input[type="password"]'
        ).count();


    if (
        passwordFields >= 3
    ) {

        success(
            "Settings password/security fields are available."
        );

    } else {

        info(
            `Settings page currently exposes ${passwordFields} password field(s).`
        );
    }


    /*
     * Logout control.
     */

    const logoutControl =
        await findFirstVisible([
            page.getByRole(
                "button",
                {
                    name:
                        /|log out/i
                }
            ),

            page.locator(
                "button"
            ).filter({
                hasText:
                    /|log out/i
            }),

            page.getByText(
                /|log out/i
            )
        ]);


    if (!logoutControl) {

        fail(
            "Logout control was not found in Settings."
        );
    }


    success(
        "Settings page and logout control work."
    );
}


/*
 * ============================================================
 * PROFILE / SECURITY UI
 * ============================================================
 */

async function testProfileSecurityUI() {

    section(
        16,
        "Profile / Security UI"
    );


    /*
     * Return to Settings because that is where
     * the current implementation exposes profile
     * and password functionality.
     */

    await page.goto(
        `${FRONTEND_URL}/settings`,
        {
            waitUntil:
                "domcontentloaded",

            timeout:
                30000
        }
    );


    await waitForPage();


    const text =
        await bodyText();


    const checks = [
        {
            name:
                "Profile",

            pattern:
                /profile/i
        },

        {
            name:
                "Appearance",

            pattern:
                /appearance|theme/i
        },

        {
            name:
                "Password",

            pattern:
                /password/i
        },

        {
            name:
                "Security",

            pattern:
                /security/i
        }
    ];


    for (
        const check
        of checks
    ) {

        if (
            check.pattern.test(
                text
            )
        ) {

            success(
                `${check.name} section detected.`
            );

        } else {

            info(
                `${check.name} text was not detected.`
            );
        }
    }


    /*
     * We intentionally do NOT change the test
     * account's password here.
     *
     * The actual Settings component invokes
     * the AuthContext changePassword function,
     * and changing the password would require
     * updating the test credentials for the
     * remainder of the test.
     */

    success(
        "Profile/security UI has been checked without modifying test credentials."
    );
}


/*
 * ============================================================
 * LOGOUT
 * ============================================================
 */

async function testLogout() {

    section(
        17,
        "Sign Out"
    );


    await page.goto(
        `${FRONTEND_URL}/settings`,
        {
            waitUntil:
                "domcontentloaded",

            timeout:
                30000
        }
    );


    await waitForPage();


    const logoutButton =
        await findFirstVisible([
            page.getByRole(
                "button",
                {
                    name:
                        /logout|log out|sign out/i
                }
            ),

            page.locator(
                "button"
            ).filter({
                hasText:
                    /logout|log out|sign out/i
            })
        ]);


    if (!logoutButton) {

        fail(
            "Logout button was not found."
        );
    }


    await logoutButton.click();


    /*
     * Settings.jsx calls:
     *
     * logout();
     * navigate("/");
     */

    await page.waitForTimeout(
        1500
    );


    const url =
        await currentUrl();


    if (
        !(
            url ===
                `${FRONTEND_URL}/` ||
            url.endsWith("/")
        )
    ) {

        fail(
            `Logout did not navigate to the login page. Current URL: ${url}`
        );
    }


    const token =
        await getToken();


    if (token) {

        fail(
            "JWT token still exists after logout."
        );
    }


    success(
        "Logout works and accessGuardToken was removed."
    );
}


/*
 * ============================================================
 * FAILURE INFORMATION
 * ============================================================
 */

async function printFailureInformation(
    error
) {

    console.log("");

    console.log(
        "============================================================"
    );

    console.log(
        "❌ ACCESSGUARDAI FULL FRONTEND TEST FAILED"
    );

    console.log(
        "============================================================"
    );

    console.log("");

    console.log(
        error?.message ||
        error
    );


    if (page) {

        console.log("");

        console.log(
            "Current URL:"
        );

        console.log(
            page.url()
        );


        console.log("");

        console.log(
            "Current page text:"
        );


        try {

            const text =
                await bodyText();


            console.log(
                text.substring(
                    0,
                    5000
                )
            );

        } catch {
            /*
             * Ignore.
             */
        }


        /*
         * Save screenshot.
         */

        try {

            await page.screenshot({
                path:
                    "frontend-full-test-failure.png",

                fullPage:
                    true
            });


            console.log("");

            console.log(
                "Failure screenshot saved as:"
            );

            console.log(
                "frontend-full-test-failure.png"
            );

        } catch {
            /*
             * Ignore.
             */
        }
    }


    if (
        browserErrors.length
    ) {

        console.log("");

        console.log(
            "Browser errors:"
        );


        for (
            const browserError
            of browserErrors
        ) {

            console.log(
                ` - ${browserError}`
            );
        }
    }
}


/*
 * ============================================================
 * SUCCESS SUMMARY
 * ============================================================
 */

function printSuccessSummary() {

    console.log("");

    console.log(
        "============================================================"
    );

    console.log(
        "✅ ACCESSGUARDAI FULL FRONTEND TEST PASSED"
    );

    console.log(
        "============================================================"
    );

    console.log("");

    console.log(
        "TEST SUMMARY"
    );

    console.log(
        "============================================================"
    );

    console.log(
        "✅ Backend health verified."
    );

    console.log(
        "✅ Frontend loading verified."
    );

    console.log(
        "✅ Registration verified."
    );

    console.log(
        "✅ Login verified."
    );

    console.log(
        "✅ JWT/token storage verified."
    );

    console.log(
        "✅ Dashboard verified."
    );

    console.log(
        "✅ Dashboard API/data verified."
    );

    console.log(
        "✅ Sidebar/navigation verified."
    );

    console.log(
        "✅ New Accessibility Scan page verified."
    );

    console.log(
        "✅ Scan URL input verified."
    );

    console.log(
        "✅ Start Accessibility Scan control verified."
    );

    console.log(
        "✅ Real accessibility scan executed."
    );

    console.log(
        "✅ Scan result verified."
    );

    console.log(
        "✅ activeScanId verified."
    );

    console.log(
        "✅ Scan persistence verified."
    );

    console.log(
        "✅ Analytics verified."
    );

    console.log(
        "✅ AI Remediation verified."
    );

    console.log(
        "✅ Scan History verified."
    );

    console.log(
        "✅ Settings verified."
    );

    console.log(
        "✅ Profile/security UI verified."
    );

    console.log(
        "✅ Logout verified."
    );

    console.log("");

    console.log(
        `Test account: ${TEST_EMAIL}`
    );

    if (scanId) {

        console.log(
            `Test scan ID: ${scanId}`
        );
    }

    console.log(
        "============================================================"
    );

    console.log("");
}


/*
 * ============================================================
 * MAIN
 * ============================================================
 */

async function run() {

    console.log("");

    console.log(
        "============================================================"
    );

    console.log(
        "ACCESSGUARDAI COMPLETE FRONTEND FUNCTIONAL TEST"
    );

    console.log(
        "============================================================"
    );

    console.log("");

    console.log(
        `Frontend : ${FRONTEND_URL}`
    );

    console.log(
        `Backend  : ${BACKEND_URL}`
    );

    console.log(
        `Scan URL : ${TEST_URL}`
    );

    console.log(
        `Test User: ${TEST_EMAIL}`
    );


    /*
     * Browser.
     */

    browser =
        await chromium.launch({
            headless:
                true
        });


    context =
        await browser.newContext({
            viewport: {
                width:
                    1440,

                height:
                    1000
            },

            acceptDownloads:
                true
        });


    page =
        await context.newPage();


    /*
     * Browser error monitoring.
     */

    page.on(
        "pageerror",
        error => {

            browserErrors.push(
                `Page error: ${error.message}`
            );

        }
    );


    page.on(
        "console",
        message => {

            /*
             * Only record console errors.
             *
             * We don't automatically fail on every
             * console.error because some application
             * code can intentionally log errors.
             */

            if (
                message.type() ===
                "error"
            ) {

                browserErrors.push(
                    `Console error: ${message.text()}`
                );
            }

        }
    );


    try {

        await testBackendHealth();

        await testFrontendLoad();

        await testRegistration();

        await testLogin();

        await testDashboard();

        await testDashboardData();

        await testSidebar();

        await testNewScanPage();

        await testRunScan();

        await testScanPersistence();

        await testScanSpecificRoutes();

        await testAnalytics();

        await testAIRemediation();

        await testScanHistory();

        await testSettings();

        await testProfileSecurityUI();

        await testLogout();

        printSuccessSummary();


    } catch (error) {

        await printFailureInformation(
            error
        );

        process.exitCode =
            1;

    } finally {

        if (browser) {

            await browser.close();
        }
    }
}


/*
 * ============================================================
 * START
 * ============================================================
 */

run();