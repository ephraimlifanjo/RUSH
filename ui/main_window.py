import customtkinter as ctk
from tkinter import filedialog, messagebox
from pathlib import Path
from datetime import datetime
import threading
import time


class MainWindow:
    """
    RUSH — Smart File Organizer
    Modern Productivity Desktop UI
    Built by Ephraim Lifanjo
    """

    BASE_DIR = Path(__file__).resolve().parent.parent
    DB_PATH = BASE_DIR / "database" / "sqlite.db"

    def __init__(self, app):

        self.app = app
        self.app.selected_folder = None

        # =========================
        # APP THEME
        # =========================
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")

        self.root = ctk.CTk()
        self.root.title("RUSH • Smart File Organizer")
        self.root.geometry("1180x720")
        self.root.minsize(1000, 650)

        self.root.configure(fg_color="#090B10")

        # =========================
        # GRID
        # =========================
        self.root.grid_columnconfigure(1, weight=1)
        self.root.grid_rowconfigure(0, weight=1)

        # =========================
        # SIDEBAR
        # =========================
        self.sidebar = ctk.CTkFrame(
            self.root,
            width=220,
            fg_color="#0F172A",
            corner_radius=0
        )
        self.sidebar.grid(row=0, column=0, sticky="ns")

        self.logo = ctk.CTkLabel(
            self.sidebar,
            text="⚡ RUSH",
            font=("Arial", 28, "bold"),
            text_color="#F8FAFC"
        )
        self.logo.pack(pady=(30, 5))

        self.subtitle = ctk.CTkLabel(
            self.sidebar,
            text="Smart Productivity",
            text_color="#94A3B8",
            font=("Arial", 12)
        )
        self.subtitle.pack(pady=(0, 30))

        # =========================
        # NAVIGATION BUTTONS
        # =========================
        def nav_button(text, command):

            return ctk.CTkButton(
                self.sidebar,
                text=text,
                width=180,
                height=42,
                corner_radius=12,
                fg_color="#111827",
                hover_color="#1E293B",
                anchor="w",
                command=command,
                font=("Arial", 13, "bold")
            )

        self.home_btn = nav_button(
            "🏠 Dashboard",
            self.show_dashboard
        )
        self.home_btn.pack(pady=8)

        self.pomodoro_btn = nav_button(
            "🍅 Focus Mode",
            self.show_pomodoro
        )
        self.pomodoro_btn.pack(pady=8)

        self.help_btn = nav_button(
            "ℹ About RUSH",
            self.show_info
        )
        self.help_btn.pack(pady=8)

        # spacer
        ctk.CTkLabel(
            self.sidebar,
            text=""
        ).pack(expand=True)

        # creator card
        self.creator_card = ctk.CTkFrame(
            self.sidebar,
            fg_color="#111827",
            corner_radius=14
        )
        self.creator_card.pack(
            padx=15,
            pady=20,
            fill="x"
        )

        ctk.CTkLabel(
            self.creator_card,
            text="Built by",
            text_color="#94A3B8"
        ).pack(pady=(10, 0))

        ctk.CTkLabel(
            self.creator_card,
            text="Ephraim Lifanjo 🇨🇲",
            font=("Arial", 14, "bold"),
            text_color="#F8FAFC"
        ).pack()

        ctk.CTkLabel(
            self.creator_card,
            text="2025",
            text_color="#64748B"
        ).pack(pady=(0, 10))

        # =========================
        # MAIN CONTENT
        # =========================
        self.content = ctk.CTkFrame(
            self.root,
            fg_color="#090B10"
        )
        self.content.grid(
            row=0,
            column=1,
            sticky="nsew"
        )

        self.content.grid_rowconfigure(0, weight=1)
        self.content.grid_columnconfigure(0, weight=1)

        # =========================
        # DASHBOARD PAGE
        # =========================
        self.dashboard_page = ctk.CTkFrame(
            self.content,
            fg_color="#090B10"
        )

        self.build_dashboard()

        # =========================
        # POMODORO PAGE
        # =========================
        self.pomodoro_page = ctk.CTkFrame(
            self.content,
            fg_color="#090B10"
        )

        self.build_pomodoro()

        # show default page
        self.show_dashboard()

        self.root.protocol(
            "WM_DELETE_WINDOW",
            self.on_close
        )

    # ==================================================
    # DASHBOARD PAGE
    # ==================================================
    def build_dashboard(self):

        self.dashboard_page.grid_columnconfigure(
            0,
            weight=1
        )

        # header
        self.header = ctk.CTkLabel(
            self.dashboard_page,
            text="Smart File Dashboard",
            font=("Arial", 30, "bold"),
            text_color="#F8FAFC"
        )
        self.header.pack(
            anchor="w",
            padx=30,
            pady=(25, 5)
        )

        self.subheader = ctk.CTkLabel(
            self.dashboard_page,
            text="Organize your workflow beautifully.",
            text_color="#94A3B8",
            font=("Arial", 13)
        )
        self.subheader.pack(
            anchor="w",
            padx=30,
            pady=(0, 20)
        )

        # folder card
        self.folder_card = ctk.CTkFrame(
            self.dashboard_page,
            fg_color="#111827",
            corner_radius=18
        )
        self.folder_card.pack(
            fill="x",
            padx=30,
            pady=10
        )

        self.folder_label = ctk.CTkLabel(
            self.folder_card,
            text="📁 No folder selected",
            text_color="#CBD5E1",
            font=("Arial", 14)
        )
        self.folder_label.pack(
            anchor="w",
            padx=20,
            pady=(20, 8)
        )

        self.select_btn = ctk.CTkButton(
            self.folder_card,
            text="📂 Select Folder",
            width=180,
            height=36,
            corner_radius=10,
            fg_color="#2563EB",
            hover_color="#1D4ED8",
            command=self.select_folder
        )
        self.select_btn.pack(
            anchor="w",
            padx=20,
            pady=(0, 20)
        )

        # action row
        self.action_frame = ctk.CTkFrame(
            self.dashboard_page,
            fg_color="transparent"
        )
        self.action_frame.pack(
            fill="x",
            padx=30,
            pady=10
        )

        def action_btn(text, command, color):

            return ctk.CTkButton(
                self.action_frame,
                text=text,
                width=170,
                height=38,
                corner_radius=12,
                fg_color=color,
                hover_color="#334155",
                command=command,
                font=("Arial", 13, "bold")
            )

        action_btn(
            "🧠 Organize Files",
            self.organize_now,
            "#1E293B"
        ).grid(row=0, column=0, padx=5)

        action_btn(
            "👁 Start Monitor",
            self.start_monitor,
            "#2563EB"
        ).grid(row=0, column=1, padx=5)

        action_btn(
            "⛔ Stop Monitor",
            self.stop_monitor,
            "#DC2626"
        ).grid(row=0, column=2, padx=5)

        action_btn(
            "🍅 Focus Mode",
            self.show_pomodoro,
            "#7C3AED"
        ).grid(row=0, column=3, padx=5)

        # status card
        self.status_card = ctk.CTkFrame(
            self.dashboard_page,
            fg_color="#111827",
            corner_radius=18
        )
        self.status_card.pack(
            fill="x",
            padx=30,
            pady=10
        )

        self.status = ctk.CTkLabel(
            self.status_card,
            text="● IDLE",
            text_color="#22C55E",
            font=("Arial", 14, "bold")
        )
        self.status.pack(
            anchor="w",
            padx=20,
            pady=15
        )

        # logs
        self.logs_title = ctk.CTkLabel(
            self.dashboard_page,
            text="Live Activity",
            font=("Arial", 18, "bold"),
            text_color="#F8FAFC"
        )
        self.logs_title.pack(
            anchor="w",
            padx=30,
            pady=(20, 10)
        )

        self.log_box = ctk.CTkTextbox(
            self.dashboard_page,
            fg_color="#0F172A",
            text_color="#E2E8F0",
            corner_radius=15,
            height=260,
            font=("Consolas", 12)
        )

        self.log_box.pack(
            fill="both",
            expand=True,
            padx=30,
            pady=(0, 25)
        )

    # ==================================================
    # POMODORO PAGE
    # ==================================================
    def build_pomodoro(self):

        self.pomodoro_page.grid_columnconfigure(
            0,
            weight=1
        )

        self.pomo_title = ctk.CTkLabel(
            self.pomodoro_page,
            text="🍅 Focus Mode",
            font=("Arial", 34, "bold"),
            text_color="#F8FAFC"
        )

        self.pomo_title.pack(
            pady=(40, 10)
        )

        self.pomo_sub = ctk.CTkLabel(
            self.pomodoro_page,
            text="Deep work starts here.",
            text_color="#94A3B8",
            font=("Arial", 13)
        )

        self.pomo_sub.pack(
            pady=(0, 25)
        )

        # task
        self.task_entry = ctk.CTkEntry(
            self.pomodoro_page,
            width=320,
            height=42,
            corner_radius=12,
            placeholder_text="What are you working on?"
        )

        self.task_entry.pack(
            pady=10
        )

        # custom minutes
        self.minute_entry = ctk.CTkEntry(
            self.pomodoro_page,
            width=120,
            height=38,
            justify="center",
            placeholder_text="25"
        )

        self.minute_entry.pack(
            pady=10
        )

        # timer
        self.time_display = ctk.CTkLabel(
            self.pomodoro_page,
            text="25:00",
            font=("Arial", 68, "bold"),
            text_color="#60A5FA"
        )

        self.time_display.pack(
            pady=30
        )

        # focus status
        self.focus_status = ctk.CTkLabel(
            self.pomodoro_page,
            text="Ready to focus 🚀",
            text_color="#94A3B8",
            font=("Arial", 13)
        )

        self.focus_status.pack()

        # buttons
        self.timer_btns = ctk.CTkFrame(
            self.pomodoro_page,
            fg_color="transparent"
        )

        self.timer_btns.pack(
            pady=30
        )

        def timer_btn(text, cmd, color):

            return ctk.CTkButton(
                self.timer_btns,
                text=text,
                width=180,
                height=42,
                corner_radius=12,
                fg_color=color,
                hover_color="#334155",
                command=cmd,
                font=("Arial", 13, "bold")
            )

        timer_btn(
            "▶ Start",
            self.start_timer,
            "#2563EB"
        ).grid(row=0, column=0, padx=8)

        timer_btn(
            "⏸ Pause",
            self.pause_timer,
            "#F59E0B"
        ).grid(row=0, column=1, padx=8)

        timer_btn(
            "🔄 Reset",
            self.reset_timer,
            "#64748B"
        ).grid(row=0, column=2, padx=8)

        # motivation
        self.quote = ctk.CTkLabel(
            self.pomodoro_page,
            text="Small focused sessions create massive success.",
            text_color="#64748B",
            font=("Arial", 12)
        )

        self.quote.pack(
            pady=20
        )

        self.running = False
        self.seconds = 25 * 60

    # ==================================================
    # PAGE SWITCHING
    # ==================================================
    def hide_pages(self):

        self.dashboard_page.grid_forget()
        self.pomodoro_page.grid_forget()

    def show_dashboard(self):

        self.hide_pages()

        self.dashboard_page.grid(
            row=0,
            column=0,
            sticky="nsew"
        )

    def show_pomodoro(self):

        self.hide_pages()

        self.pomodoro_page.grid(
            row=0,
            column=0,
            sticky="nsew"
        )

    # ==================================================
    # LOGGING
    # ==================================================
    def log(self, msg):

        current = datetime.now().strftime("%H:%M:%S")

        self.log_box.insert(
            "end",
            f"[{current}] {msg}\n"
        )

        self.log_box.see("end")

    # ==================================================
    # FILE SYSTEM
    # ==================================================
    def select_folder(self):

        folder = filedialog.askdirectory()

        if folder:

            self.app.selected_folder = folder

            self.folder_label.configure(
                text=f"📁 {folder}"
            )

            self.status.configure(
                text="● READY",
                text_color="#3B82F6"
            )

            self.log("Folder selected")

    def organize_now(self):

        if not self.app.selected_folder:

            self.log("❌ Select folder first")
            return

        self.log("⚡ Organizing started")

        results = self.app.organizer.organize_folder(
            self.app.selected_folder
        )

        if not results:

            self.log("ℹ No files to organize")
            return

        for file, category in results:

            self.log(f"📦 {file} → {category}")

        self.log("✅ Organization completed")

    def start_monitor(self):

        if not self.app.selected_folder:

            self.log("❌ Select folder first")
            return

        self.app.start_monitoring(
            self.app.selected_folder
        )

        self.status.configure(
            text="● MONITORING",
            text_color="#F59E0B"
        )

        self.log("👁 Monitoring started")

    def stop_monitor(self):

        self.app.stop_monitoring()

        self.status.configure(
            text="● IDLE",
            text_color="#22C55E"
        )

        self.log("⛔ Monitoring stopped")

    # ==================================================
    # POMODORO
    # ==================================================
    def update_timer(self):

        while self.running and self.seconds > 0:

            mins = self.seconds // 60
            secs = self.seconds % 60

            self.time_display.configure(
                text=f"{mins:02d}:{secs:02d}"
            )

            time.sleep(1)

            self.seconds -= 1

        if self.seconds <= 0:

            self.running = False

            task = self.task_entry.get()

            if task.strip() == "":
                task = "Focus Session"

            self.focus_status.configure(
                text="Session Completed ✅",
                text_color="#22C55E"
            )

            self.log(f"🍅 Completed: {task}")

            messagebox.showinfo(
                "Pomodoro Finished",
                f"Great work 🚀\n\nCompleted:\n{task}"
            )

    def start_timer(self):

        if self.running:
            return

        mins = self.minute_entry.get()

        try:

            mins = int(mins)

            if mins <= 0:
                mins = 25

        except:
            mins = 25

        self.seconds = mins * 60

        self.running = True

        task = self.task_entry.get()

        if task.strip() == "":
            task = "Unnamed Task"

        self.focus_status.configure(
            text=f"Working on: {task}",
            text_color="#60A5FA"
        )

        self.log(f"🚀 Focus started: {task}")

        threading.Thread(
            target=self.update_timer,
            daemon=True
        ).start()

    def pause_timer(self):

        self.running = False

        self.focus_status.configure(
            text="Paused ⏸",
            text_color="#F59E0B"
        )

        self.log("⏸ Focus paused")

    def reset_timer(self):

        self.running = False

        self.seconds = 25 * 60

        self.time_display.configure(
            text="25:00"
        )

        self.focus_status.configure(
            text="Ready to focus 🚀",
            text_color="#94A3B8"
        )

        self.log("🔄 Timer reset")

    # ==================================================
    # ABOUT
    # ==================================================
    def show_info(self):

        messagebox.showinfo(
            "About RUSH",

            "⚡ RUSH — Smart File Organizer\n\n"

            "RUSH helps organize messy folders automatically\n"
            "while helping users stay focused using Focus Mode.\n\n"

            "━━━━━━━━━━━━━━━━━━━━━━\n"
            "HOW TO USE\n"
            "━━━━━━━━━━━━━━━━━━━━━━\n"

            "1. Select a folder\n"
            "2. Click Organize Files\n"
            "3. Start Monitoring for auto sorting\n"
            "4. Use Focus Mode while working\n\n"

            "━━━━━━━━━━━━━━━━━━━━━━\n"
            "FEATURES\n"
            "━━━━━━━━━━━━━━━━━━━━━━\n"

            "📁 Smart Organization\n"
            "👁 Live Folder Monitoring\n"
            "🍅 Focus Sessions\n"
            "⚡ Clean Modern UI\n"
            "🧠 Productivity Workflow\n\n"

            "━━━━━━━━━━━━━━━━━━━━━━\n"
            "CREATOR\n"
            "━━━━━━━━━━━━━━━━━━━━━━\n"

            "Built by: Ephraim Lifanjo 🇨🇲\n"
            "Email: ephraimlifanjos@gmail.com\n"
            "Country: Cameroon\n"
            "Year: 2025\n\n"

            "Thank you for using RUSH 🚀"
        )

    # ==================================================
    # RUN
    # ==================================================
    def run(self):

        self.root.mainloop()

    # ==================================================
    # CLOSE
    # ==================================================
    def on_close(self):

        self.running = False

        self.root.destroy()