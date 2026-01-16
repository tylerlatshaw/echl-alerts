"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Subscription } from "../../app/lib/types";

type FormStates = "idle" | "loading" | "error" | "success";

export default function SubscribeForm() {

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Subscription>();

    const [formState, setFormState] = useState<FormStates>("idle");
    const [vapidKey, setVapidKey] = useState<string | null>(null);
    const [response, setResponse] = useState<string>();

    useEffect(() => {
        async function loadConfig() {
            const res = await fetch("/api/subscription/config", { cache: "no-store" });
            if (!res.ok) {
                throw new Error("Failed to load config");
            }

            const { vapidPublicKey } = await res.json();
            setVapidKey(vapidPublicKey);
        }

        loadConfig().catch(console.error);
    }, []);

    if (!vapidKey) {
        return <>
            <div className="mt-8 bg-gray-800 p-8 rounded-lg max-w-xl mx-auto w-full">
                <p>Loading…</p>
            </div>
        </>;
    }

    const onSubmit: SubmitHandler<Subscription> = async (formData) => {
        setFormState("loading");

        try {
            const firstName = String(formData.firstName || "").trim();
            const lastName = String(formData.lastName || "").trim();
            const email = String(formData.email || "").trim();

            if (!firstName || !lastName || !email) {
                throw new Error("Missing required fields");
            }

            if (!("serviceWorker" in navigator)) {
                throw new Error("Service workers not supported in this browser");
            }

            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                throw new Error("Notifications permission denied");
            }

            // Register (or reuse) service worker
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const reg =
                (await navigator.serviceWorker.getRegistration()) ??
                (await navigator.serviceWorker.register("/sw.js"));

            // Ensure it's active
            const ready = await navigator.serviceWorker.ready;

            // Reuse subscription if already exists (prevents duplicates)
            let subscription = await ready.pushManager.getSubscription();

            if (!subscription) {
                subscription = await ready.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidKey),
                });
            }

            const res = await fetch("/api/subscription/push-subscribe", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    subscription,
                    firstName,
                    lastName,
                    email,
                }),
            });

            if (!res.ok) {
                setResponse("Something went wrong. Please try again later.");
                setFormState("error");
                throw new Error(await res.text());
            }

            const data = await res.json();

            if (!data.added) {
                setResponse("You already subscribed to notifications.");
            } else if (data.added) {
                setResponse("You have subscribed to transaction alerts!");
            }

            setFormState("success");
        } catch (e) {
            console.error("subscribe error:", e);
            setFormState("error");
        }
    };

    function urlBase64ToUint8Array(base64String: string) {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

        const rawData = atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    }

    return <>
        <div className="mt-8 bg-gray-800 p-8 rounded-lg max-w-xl mx-auto w-full">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-left">

                <div className="flex flex-col gap-4">
                    <label htmlFor="firstName" className="text-lg font-semibold text-left">
                        First Name
                    </label>
                    <div className="flex flex-col gap-1">
                        <Input
                            {...register("firstName", { required: true })}
                            type="text"
                            className="bg-gray-700"
                            disabled={formState === "loading"}
                            placeholder="Wayne"
                            style={errors.firstName ? {
                                backgroundColor: "#FF000033",
                                borderColor: "#FF0000",
                                boxShadow: "none",
                            } : undefined}
                        />
                        {errors.firstName && <span className="text-sm font-medium text-red-600">This field is required</span>}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <label htmlFor="firstName" className="text-lg font-semibold text-left">
                        Last Name
                    </label>
                    <div className="flex flex-col gap-1">
                        <Input
                            {...register("lastName", { required: true })}
                            type="text"
                            className="bg-gray-700"
                            disabled={formState === "loading"}
                            placeholder="Gretzky"
                            style={errors.lastName ? {
                                backgroundColor: "#FF000033",
                                borderColor: "#FF0000",
                                boxShadow: "none",
                            } : undefined}
                        />
                        {errors.lastName && <span className="text-sm font-medium text-red-600">This field is required</span>}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <label htmlFor="firstName" className="text-lg font-semibold text-left">
                        Email
                    </label>
                    <div className="flex flex-col gap-1">
                        <Input
                            {...register("email", { required: true })}
                            type="email"
                            className="bg-gray-700"
                            disabled={formState === "loading"}
                            placeholder="gretz@oilers.com"
                            style={errors.email ? {
                                backgroundColor: "#FF000033",
                                borderColor: "#FF0000",
                                boxShadow: "none",
                            } : undefined}
                        />
                        {errors.email && <span className="text-sm font-medium text-red-600">This field is required</span>}
                    </div>
                </div>

                <div className="flex gap-2 items-center mt-4">

                    <div className="grow">
                        {
                            formState === "error" &&
                            <span className="text-red-600">{response}</span>
                        }
                        {
                            formState === "success" &&
                            <span className="text-green-600">{response}</span>
                        }
                    </div>

                    <Button
                        type="submit"
                        variant={"default"}
                        size={"default"}
                        className="bg-green-600 text-black hover:bg-green-700"
                        disabled={formState === "loading"}
                    >
                        Subscribe
                    </Button>
                </div>

                <hr className="mt-2" />

                <div className="flex itemse-center p-2 text-center text-gray-500 text-sm italic">
                    <span>
                        By submitting this form, you consent to receive push notifications from this site. You may unsubscribe at any time by uninstalling the application. View our&nbsp;
                        <Link
                            href={"https://www.tylerlatshaw.com/privacy-policy"}
                            className="underline hover:text-gray-400"
                        >
                            Privacy Policy
                        </Link>.
                        This site is not affiliated with the ECHL or any professional hockey league.
                    </span>
                </div>
            </form>
        </div>
        <button
            onClick={async () => {
                const p = await Notification.requestPermission();
                console.log("permission:", p);
                if (p === "granted") {
                    new Notification("Test Notification", { body: "If you see this, display works." });
                }
            }}
        >
            Enable notifications
        </button>
    </>;
}