import shutil
import sqlite3
from pathlib import Path
from datetime import datetime

from core.file_classifier import FileClassifier
from database.init_db import DB_PATH


class Organizer:
    """
    RUSH Organizer Engine (EXE SAFE VERSION)
    """

    def __init__(self):
        self.classifier = FileClassifier()

        # 🔥 SAFE DB CONNECTION
        self.conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        self.cursor = self.conn.cursor()

    # =========================
    # MAIN ENTRY
    # =========================
    def organize_folder(self, folder_path):
        folder = Path(folder_path)

        if not folder.exists():
            print("❌ Folder not found")
            return

        files = [f for f in folder.iterdir() if f.is_file()]

        if not files:
            print("⚠️ No files to organize")
            return

        moved = 0

        for file_path in files:
            if self._process(file_path):
                moved += 1

        print(f"✅ Done: {moved} files organized")

    # =========================
    # PROCESS FILE
    # =========================
    def _process(self, file_path: Path):
        try:
            if not file_path.exists():
                return False

            result = self.classifier.classify(file_path)

            category = result["category"]
            method = result["method"]

            target_dir = file_path.parent / category
            target_dir.mkdir(exist_ok=True)

            destination = self._safe_path(target_dir, file_path.name)

            shutil.move(str(file_path), str(destination))

            self._save_log(file_path, destination, category, method)

            print(f"✔ {file_path.name} → {category}")

            return True

        except Exception as e:
            print(f"❌ Error: {e}")
            return False

    # =========================
    # SAFE FILE NAME
    # =========================
    def _safe_path(self, folder: Path, filename: str) -> Path:
        dest = folder / filename

        if not dest.exists():
            return dest

        stem = dest.stem
        suffix = dest.suffix
        i = 1

        while True:
            new_path = folder / f"{stem}_{i}{suffix}"
            if not new_path.exists():
                return new_path
            i += 1

    # =========================
    # DATABASE LOG
    # =========================
    def _save_log(self, original: Path, new: Path, category: str, method: str):
        try:
            now = datetime.now()

            self.cursor.execute("""
                INSERT INTO files (
                    name, original_path, new_path,
                    extension, size, category, method, status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                new.name,
                str(original),
                str(new),
                new.suffix,
                new.stat().st_size if new.exists() else 0,
                category,
                method,
                "moved"
            ))

            self.cursor.execute("""
                INSERT INTO history (
                    file_name, from_path, to_path,
                    category, method, action, timestamp
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                new.name,
                str(original),
                str(new),
                category,
                method,
                "moved",
                now
            ))

            self.conn.commit()

        except Exception as e:
            print("DB log error:", e)

    # =========================
    # HISTORY
    # =========================
    def get_history(self, limit=50):
        try:
            self.cursor.execute("""
                SELECT file_name, category, action, timestamp
                FROM history
                ORDER BY id DESC
                LIMIT ?
            """, (limit,))

            return self.cursor.fetchall()

        except Exception as e:
            print("History error:", e)
            return []

    # =========================
    # CLOSE
    # =========================
    def close(self):
        try:
            self.conn.close()
        except:
            pass