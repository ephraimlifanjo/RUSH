import shutil
from pathlib import Path
from datetime import datetime


# =========================
# FILE HELPERS
# =========================

def get_extension(file_path: str) -> str:
    return Path(file_path).suffix.lower()


def exists(path: str) -> bool:
    return Path(path).exists()


def list_files(folder: str):
    """Return only files in folder"""
    folder = Path(folder)

    if not folder.exists():
        return []

    return [f for f in folder.iterdir() if f.is_file()]


# =========================
# SAFE FILE MOVE
# =========================

def safe_move(src: str, dst_folder: str) -> str:
    """
    Move file safely (no overwrite)
    """
    src = Path(src)
    dst_folder = Path(dst_folder)

    dst_folder.mkdir(parents=True, exist_ok=True)

    destination = dst_folder / src.name

    # avoid overwrite
    if destination.exists():
        destination = _generate_unique_name(dst_folder, src)

    shutil.move(str(src), str(destination))
    return str(destination)


def _generate_unique_name(folder: Path, file: Path) -> Path:
    """Generate unique filename"""
    counter = 1
    while True:
        new_name = f"{file.stem}_{counter}{file.suffix}"
        new_path = folder / new_name

        if not new_path.exists():
            return new_path

        counter += 1


# =========================
# TIME HELPERS
# =========================

def timestamp() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def date_only() -> str:
    return datetime.now().strftime("%Y-%m-%d")


# =========================
# SIZE FORMATTER
# =========================

def format_size(size_bytes: int) -> str:
    units = ["B", "KB", "MB", "GB", "TB"]

    size = float(size_bytes)

    for unit in units:
        if size < 1024:
            return f"{size:.2f} {unit}"
        size /= 1024

    return f"{size:.2f} PB"


# =========================
# LOGGING (SIMPLE)
# =========================

def log(msg: str, level: str = "INFO"):
    print(f"[{level}] {timestamp()} - {msg}")


# =========================
# FILE NAME CLEANER
# =========================

def clean_name(name: str) -> str:
    """
    Remove unsafe characters (Windows safe)
    """
    bad_chars = '<>:"/\\|?*'

    for c in bad_chars:
        name = name.replace(c, "_")

    return name.strip()


# =========================
# FOLDER HELPERS
# =========================

def ensure_folder(path: str):
    Path(path).mkdir(parents=True, exist_ok=True)