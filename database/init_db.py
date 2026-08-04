import sqlite3
from pathlib import Path

# =========================
# SAFE DATABASE PATH (EXE + DEV)
# =========================
APP_DIR = Path.home() / "RUSH"
APP_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = APP_DIR / "sqlite.db"


# =========================
# DATABASE CREATOR
# =========================
def create_database():
    """
    Initialize RUSH SQLite database (EXE SAFE VERSION)
    """

    # 🔥 ensure folder exists
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # =========================
        # FILES TABLE
        # =========================
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                original_path TEXT NOT NULL,
                new_path TEXT,
                extension TEXT,
                size INTEGER,
                category TEXT,
                method TEXT,
                status TEXT DEFAULT 'moved',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # =========================
        # HISTORY TABLE
        # =========================
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_name TEXT NOT NULL,
                from_path TEXT NOT NULL,
                to_path TEXT NOT NULL,
                category TEXT,
                method TEXT,
                action TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # =========================
        # RULES TABLE
        # =========================
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                extension TEXT,
                keyword TEXT,
                category TEXT NOT NULL,
                priority INTEGER DEFAULT 1,
                active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # =========================
        # USER STATS TABLE
        # =========================
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                files_organized INTEGER DEFAULT 0,
                streak INTEGER DEFAULT 0,
                last_active DATE
            )
        """)

        # =========================
        # ACHIEVEMENTS TABLE
        # =========================
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                unlocked INTEGER DEFAULT 0,
                unlocked_at TIMESTAMP
            )
        """)

        # =========================
        # SETTINGS TABLE
        # =========================
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE,
                value TEXT
            )
        """)

        # =========================
        # NOTIFICATIONS TABLE
        # =========================
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT,
                message TEXT,
                read INTEGER DEFAULT 0,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # =========================
        # DEFAULT SETTINGS
        # =========================
        default_settings = [
            ("auto_monitor", "1"),
            ("dark_mode", "1"),
            ("gamification", "1"),
            ("notifications", "1")
        ]

        for key, value in default_settings:
            cursor.execute("""
                INSERT OR IGNORE INTO settings (key, value)
                VALUES (?, ?)
            """, (key, value))

        # =========================
        # DEFAULT USER STATS
        # =========================
        cursor.execute("SELECT COUNT(*) FROM user_stats")
        stats_exist = cursor.fetchone()[0]

        if stats_exist == 0:
            cursor.execute("""
                INSERT INTO user_stats (
                    xp,
                    level,
                    files_organized,
                    streak,
                    last_active
                )
                VALUES (0, 1, 0, 0, DATE('now'))
            """)

        # =========================
        # DEFAULT ACHIEVEMENTS
        # =========================
        achievements = [
            ("First Cleanup", "Organize your first files"),
            ("100 Files Organized", "Organize 100 files"),
            ("Master Organizer", "Organize 1000 files"),
            ("Daily Streak", "Use RUSH multiple days in a row")
        ]

        for name, description in achievements:
            cursor.execute("""
                INSERT OR IGNORE INTO achievements (name, description)
                VALUES (?, ?)
            """, (name, description))

        conn.commit()
        conn.close()

        print("✅ RUSH Database initialized successfully")

    except Exception as e:
        print("❌ Database error:", e)