import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


class FileWatcherHandler(FileSystemEventHandler):
    """
    Handles file system events (simple + safe)
    """

    def __init__(self, organizer):
        self.organizer = organizer

    # =========================
    # FILE CREATED
    # =========================
    def on_created(self, event):
        if event.is_directory:
            return

        file_path = event.src_path
        print(f"📥 New file detected: {file_path}")

        # Wait until file is fully written (IMPORTANT for large files)
        self._wait_until_ready(file_path)

        # Send to organizer
        self.organizer.process_file(file_path)

    # =========================
    # SAFE FILE READ CHECK
    # =========================
    def _wait_until_ready(self, path):
        """
        Prevents errors with large files still copying
        """
        for _ in range(10):
            try:
                if os.path.exists(path):
                    size1 = os.path.getsize(path)
                    time.sleep(0.5)
                    size2 = os.path.getsize(path)

                    if size1 == size2:
                        return
            except:
                pass

        time.sleep(1)


class FileWatcher:
    """
    Simple restart-safe watcher (portfolio level)
    """

    def __init__(self, organizer):
        self.organizer = organizer
        self.observer = None
        self.running = False

    # =========================
    # START WATCHER
    # =========================
    def start(self, folder_path):
        if self.running:
            print("⚠️ Watcher already running")
            return

        self.stop()  # IMPORTANT: reset old observer

        handler = FileWatcherHandler(self.organizer)

        self.observer = Observer()
        self.observer.schedule(handler, folder_path, recursive=False)

        self.observer.start()
        self.running = True

        print(f"👀 Watching: {folder_path}")

        try:
            while self.running:
                time.sleep(1)

        except Exception as e:
            print("Watcher error:", e)
            self.stop()

    # =========================
    # STOP WATCHER
    # =========================
    def stop(self):
        if self.observer:
            try:
                self.observer.stop()
                self.observer.join()
            except:
                pass

        self.running = False
        self.observer = None

        print("⛔ Watcher stopped safely")