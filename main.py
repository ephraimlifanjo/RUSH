import threading
import sys

from database.init_db import create_database
from services.organizer import Organizer
from services.watcher import FileWatcher
from ui.main_window import MainWindow


class RUSHApp:
    def __init__(self):
        print("🚀 Starting RUSH...")

        # =========================
        # SAFE INIT (IMPORTANT FOR EXE)
        # =========================
        try:
            create_database()
        except Exception as e:
            print("DB ERROR:", e)

        # =========================
        # CORE SYSTEM
        # =========================
        self.organizer = Organizer()
        self.watcher = FileWatcher(self.organizer)

        # =========================
        # UI (MUST BE LAST BEFORE RUN)
        # =========================
        self.ui = MainWindow(app=self)

        print("✅ RUSH ready")

    # =========================
    # START WATCHER (NON-BLOCKING)
    # =========================
    def start_monitoring(self, folder_path):
        if not folder_path:
            print("⚠️ No folder selected")
            return

        print("👀 Starting watcher...")

        thread = threading.Thread(
            target=self.watcher.start,
            args=(folder_path,),
            daemon=True
        )
        thread.start()

    # =========================
    # STOP WATCHER
    # =========================
    def stop_monitoring(self):
        print("⛔ Stopping watcher...")
        try:
            self.watcher.stop()
        except Exception as e:
            print("Watcher stop error:", e)

    # =========================
    # MANUAL ORGANIZE
    # =========================
    def organize_now(self, folder_path):
        if not folder_path:
            print("⚠️ No folder selected")
            return

        try:
            self.organizer.organize_folder(folder_path)
        except Exception as e:
            print("Organize error:", e)


# =========================
# START APP (SAFE ENTRY POINT)
# =========================
if __name__ == "__main__":
    try:
        app = RUSHApp()
        app.ui.run()
    except Exception as e:
        print("FATAL ERROR:", e)
        input("Press Enter to exit...")