import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
        const saved = localStorage.getItem("theme");
        return (saved as any) ?? "system";
    });

    useEffect(() => {
        const apply = (t: "light" | "dark" | "system") => {
            const root = document.documentElement;
            if (t === "system") {
                const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
                root.classList.toggle("dark", prefersDark);
                localStorage.removeItem("theme");
            } else {
                root.classList.toggle("dark", t === "dark");
                localStorage.setItem("theme", t);
            }
        };

        apply(theme);

        // if using "system", respond to changes
        const mql = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            if (localStorage.getItem("theme") === null) {
                // only react when no explicit preference stored
                document.documentElement.classList.toggle("dark", mql.matches);
            }
        };
        mql?.addEventListener?.("change", handler);
        return () => mql?.removeEventListener?.("change", handler);
    }, [theme]);

    const cycle = () => {
        setTheme(prev => (prev === "light" ? "dark" : prev === "dark" ? "system" : "light"));
    };

    return (
        <button
            aria-label="Toggle theme"
            title={`Theme: ${theme}`}
            onClick={cycle}
            style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #ddd",
                background: "transparent",
                cursor: "pointer",
            }}
        >
            {theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "🖥️"}
        </button>
    );
}