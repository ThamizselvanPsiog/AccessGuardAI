const Database = require("better-sqlite3");

const db = new Database("./backend/database/accessguard.db");

/*
 * ============================================
 * USERS
 * ============================================
 */

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);


/*
 * ============================================
 * SCANS
 * ============================================
 */

db.exec(`
CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    url TEXT NOT NULL,

    accessibility_score INTEGER,
    performance_score INTEGER,
    best_practices_score INTEGER,
    seo_score INTEGER,

    scan_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
        REFERENCES users(id)
);
`);


/*
 * ============================================
 * MIGRATION
 *
 * If the scans table already existed before
 * user authentication was implemented, add
 * user_id to the existing table.
 * ============================================
 */

const scanColumns = db
    .prepare(`PRAGMA table_info(scans)`)
    .all();

const hasUserId = scanColumns.some(
    column => column.name === "user_id"
);

if (!hasUserId) {

    console.log(
        "Migrating scans table: adding user_id..."
    );

    /*
     * Existing scans were created before
     * user ownership was introduced.
     *
     * Allow NULL temporarily so existing
     * historical scans are not destroyed.
     */
    db.exec(`
        ALTER TABLE scans
        ADD COLUMN user_id INTEGER
    `);

    console.log(
        "scans.user_id added successfully."
    );
}


/*
 * ============================================
 * VIOLATIONS
 * ============================================
 */

db.exec(`
CREATE TABLE IF NOT EXISTS violations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    scan_id INTEGER,

    source TEXT,
    rule_id TEXT,
    severity TEXT,
    selector TEXT,
    description TEXT,
    detected_by TEXT,

    wcag_category TEXT,
    wcag_criterion TEXT,
    wcag_level TEXT,

    FOREIGN KEY(scan_id)
        REFERENCES scans(id)
);
`);

const violationColumns = db
    .prepare(`PRAGMA table_info(violations)`)
    .all();

const addColumnIfMissing = (columnName, columnType) => {

    const exists = violationColumns.some(
        column => column.name === columnName
    );

    if (!exists) {

        console.log(
            `Migrating violations table: adding ${columnName}...`
        );

        db.exec(`
            ALTER TABLE violations
            ADD COLUMN ${columnName} ${columnType}
        `);

        console.log(
            `${columnName} added successfully.`
        );
    }
};

addColumnIfMissing("ai_fix", "TEXT");
addColumnIfMissing("validation", "TEXT");
addColumnIfMissing("guidance", "TEXT");


module.exports = db;