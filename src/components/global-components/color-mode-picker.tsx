"use client";

import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ColorModePicker() {
    const { theme, systemTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const currentTheme = theme === "system" ? systemTheme : theme;

    return (<>
        <div className="absolute z-50 right-4 bottom-4">
            <Button
                asChild
                variant={"default"}
                size={"icon-lg"}
                onClick={() =>
                    setTheme(currentTheme === "dark" ? "light" : "dark")
                }
                className="rounded-full px-3 py-2"
            >
                {
                    currentTheme === "dark"
                        ? <Sun />
                        : <Moon />
                }
            </Button>
        </div>
    </>);
}