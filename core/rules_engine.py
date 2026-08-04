import sqlite3
from pathlib import Path


DB_PATH = (
    Path(__file__)
    .resolve()
    .parent
    .parent
    / "database"
    / "sqlite.db"
)


class RulesEngine:
    """
    RUSH Rules Engine (PRO FAST CORE)

    - O(1) extension matching
    - In-memory keyword cache (no DB loop spam)
    - SQLite override system
    - Safe + stable for real apps
    """

    def __init__(self):
        self.conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        self.cursor = self.conn.cursor()

        self._create_table()

        # =========================
        # DEFAULT EXTENSION MAP (FAST O(1))
        # =========================
        self.extension_map = {
            ".pdf": "Documents", ".doc": "Documents", ".docx": "Documents",
            ".txt": "Documents", ".pptx": "Documents", ".xlsx": "Documents",

            ".jpg": "Images", ".jpeg": "Images", ".png": "Images",
            ".gif": "Images", ".webp": "Images",

            ".mp4": "Videos", ".mkv": "Videos", ".avi": "Videos", ".mov": "Videos",

            ".mp3": "Audio", ".wav": "Audio",

            ".zip": "Archives", ".rar": "Archives", ".7z": "Archives",

            ".exe": "Software", ".msi": "Software",

            ".html": "Web", ".css": "Web", ".js": "Web",
            ".py": "Development"
        }

        # =========================
        # KEYWORDS (LOADED ONCE → FAST)
        # =========================
        self.keyword_rules = [
            ("Documents", ["invoice", "receipt", "cv", "resume", "report"]),
            ("School", ["assignment", "homework", "exam", "lecture", "notes"]),
            ("Books", ["book", "ebook"]),
            ("Images", ["photo", "picture", "camera", "screenshot"]),
            ("Videos", ["movie", "series", "anime", "clip", "video"]),
            ("Audio", ["song", "music", "podcast", "beat"]),
            ("Development", ["project", "code", "api", "react", "node"]),
            ("Design", ["ui", "ux", "figma", "logo"]),
            ("Software", ["setup", "installer", "install"]),
        ]

    # =========================
    # DB TABLE
    # =========================
    def _create_table(self):
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                extension TEXT,
                keyword TEXT,
                category TEXT NOT NULL,
                priority INTEGER DEFAULT 1,
                active INTEGER DEFAULT 1
            )
        """)
        self.conn.commit()

    # =========================
    # CLASSIFY FILE (MAIN ENGINE)
    # =========================
    def classify_file(self, filename):
        try:
            path = Path(filename)
            ext = path.suffix.lower()
            name = path.name.lower()

            # 1. EXTENSION (FASTEST PATH)
            category = self._match_extension(ext)
            if category:
                return self._result(category, "EXTENSION")

            # 2. KEYWORDS (IN-MEMORY FAST SCAN)
            category = self._match_keywords(name)
            if category:
                return self._result(category, "KEYWORD")

            # 3. FALLBACK
            return self._result("Others", "DEFAULT")

        except Exception:
            return self._result("Others", "ERROR")

    # =========================
    # EXTENSION MATCH (O(1))
    # =========================
    def _match_extension(self, ext):
        if not ext:
            return None

        ext = ext.lower()

        # DB override
        self.cursor.execute("""
            SELECT category
            FROM rules
            WHERE extension = ? AND active = 1
            ORDER BY priority DESC
            LIMIT 1
        """, (ext,))

        row = self.cursor.fetchone()
        if row:
            return row[0]

        return self.extension_map.get(ext)

    # =========================
    # KEYWORD MATCH (FAST LOOP)
    # =========================
    def _match_keywords(self, filename):
        for category, keywords in self.keyword_rules:
            for kw in keywords:
                if kw in filename:
                    return category
        return None

    # =========================
    # RESULT FORMAT
    # =========================
    def _result(self, category, method):
        return {
            "category": category,
            "method": method
        }

    # =========================
    # RULES CRUD
    # =========================
    def add_rule(self, extension=None, keyword=None, category="Others", priority=1):
        self.cursor.execute("""
            INSERT INTO rules (extension, keyword, category, priority, active)
            VALUES (?, ?, ?, ?, 1)
        """, (extension, keyword, category, priority))
        self.conn.commit()

    def get_rules(self):
        self.cursor.execute("""
            SELECT id, extension, keyword, category, priority, active
            FROM rules
            ORDER BY priority DESC
        """)
        return self.cursor.fetchall()

    def delete_rule(self, rule_id):
        self.cursor.execute("""
            UPDATE rules SET active = 0 WHERE id = ?
        """, (rule_id,))
        self.conn.commit()

    # =========================
    # CLOSE
    # =========================
    def close(self):
        self.conn.close()