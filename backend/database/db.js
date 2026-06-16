const Database = require("better-sqlite3");

const db = new Database("./backend/database/accessguard.db");

db.exec(`
CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    accessibility_score INTEGER,
    performance_score INTEGER,
    best_practices_score INTEGER,
    seo_score INTEGER,
    scan_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

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

    FOREIGN KEY(scan_id) REFERENCES scans(id)
);
`);

module.exports = db;