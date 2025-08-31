import {type ReactNode, useEffect } from "react";

export function SlideOver({
                              side,
                              title,
                              open,
                              onClose,
                              children,
                          }: {
    side: "left" | "right";
    title: string;
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}) {
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        if (open) {
            window.addEventListener("keydown", onKey);
            document.body.style.overflow = "hidden";
        }
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    return (
        <>
            <div className={`slideover-backdrop ${open ? "open" : ""}`} onClick={onClose} />
            <aside className={`slideover slideover-${side} ${open ? "open" : ""}`}>
                <div className="slideover-header">
                    <h3>{title}</h3>
                    <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
                </div>
                <div className="slideover-content">
                    {children}
                </div>
            </aside>
        </>
    );
}