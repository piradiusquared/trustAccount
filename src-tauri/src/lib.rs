// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }

// #[cfg_attr(mobile, tauri::mobile_entry_point)]
// pub fn run() {
//     tauri::Builder::default()
//         .plugin(tauri_plugin_sql::Builder::new().build())
//         .plugin(tauri_plugin_opener::init())
//         .invoke_handler(tauri::generate_handler![greet])
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");
// }

use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_schema",
            sql: "
                    -- 1. Owners Table
                    CREATE TABLE IF NOT EXISTS owners (
                        id TEXT PRIMARY KEY, -- uuid
                        reference TEXT,
                        title TEXT,
                        firstName TEXT NOT NULL,
                        surname TEXT,
                        email TEXT,
                        mobile TEXT,
                        postalAddress TEXT,
                        bankName TEXT,
                        accountName TEXT,
                        bsb TEXT,            -- Changed to TEXT to preserve leading zeros and dashes
                        accountNumber TEXT,  -- Changed to TEXT to preserve leading zeros
                        paymentRef TEXT,
                        notes TEXT,           -- Removed trailing comma to prevent SQLite syntax error
                        status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
                        createdAt STRING,
                        updatedAt STRING
                    );

                    -- 2. Properties Table
                    CREATE TABLE IF NOT EXISTS properties (
                        id TEXT PRIMARY KEY,
                        reference TEXT NOT NULL,
                        ownerId TEXT NOT NULL,
                        propertyType TEXT NOT NULL,
                        address TEXT NOT NULL,
                        rentFrequency TEXT NOT NULL CHECK (rentFrequency IN ('weekly', 'fortnightly', 'monthly')),
                        rentCents INTEGER NOT NULL,
                        isFurnished INTEGER,
                        commissionRatePercent REAL NOT NULL,
                        adminFeeCents INTEGER NOT NULL,
                        backyardMaintenanceFeeCents INTEGER,
                        advertisementFeeCents INTEGER,
                        agreedSpendingLimitCents INTEGER,
                        notes TEXT,
                        status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
                        createdAt STRING,
                        updatedAt STRING,
                        FOREIGN KEY (ownerId) REFERENCES owners(id) ON DELETE CASCADE
                    );

                    -- 3. Leases Table
                    CREATE TABLE IF NOT EXISTS leases (
                        id TEXT PRIMARY KEY,
                        propertyId INTEGER NOT NULL,
                        tenantName TEXT NOT NULL,
                        startDate TEXT NOT NULL,
                        endDate TEXT NOT NULL,
                        rentFrequency TEXT NOT NULL CHECK (rentFrequency IN ('weekly', 'fortnightly', 'monthly')),
                        rentCents INTEGER NOT NULL,
                        bondCents INTEGER,
                        existingTenantCreditCents INTEGER,
                        tenantCount INTEGER,
                        petsAllowed INTEGER CHECK (petsAllowed IN (0, 1)), -- SQLite Boolean Representation
                        petCount INTEGER,
                        specialConditionNotes TEXT,
                        actualMoveOutDate TEXT,
                        lettingFeeSelection TEXT,
                        status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
                        createdAt STRING,
                        updatedAt STRING,
                        FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE
                    );
            ",
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:property.db", migrations)
                .build()
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}