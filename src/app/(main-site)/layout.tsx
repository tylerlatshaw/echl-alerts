import AppBackground from "./../../components/global-components/app-background";
import Footer from "./../../components/global-components/footer";
import Header from "./../../components/global-components/header";
import "./globals.css";
import { TeamThemeProvider } from "./.././providers/team-theme-provider";
import { Metadata } from "next";
import { RegisterServiceWorker } from "@/components/global-components/register-service-worker";

export const metadata: Metadata = {
  metadataBase: new URL("https://echl.tylerlatshaw.com"),
  title: {
    default: "ECHL Alerts",
    template: "%s | ECHL Alerts",
  },
  description:
    "Real-time ECHL transactions, rosters, and team updates. Never miss a move.",
  applicationName: "ECHL Alerts",
  openGraph: {
    type: "website",
    siteName: "ECHL Alerts",
    title: "ECHL Alerts",
    description:
      "Real-time ECHL transactions, rosters, and team updates. Never miss a move.",
    url: "https://echl.tylerlatshaw.com",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "ECHL Alerts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ECHL Alerts",
    description:
      "Real-time ECHL transactions, rosters, and team updates.",
    images: ["/og-default.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen w-screen overflow-hidden bg-black text-white">

        <TeamThemeProvider defaultColor="#8349ff">

          <RegisterServiceWorker />

          <AppBackground />

          <Header />

          {/* Scroll Region: MAIN + FOOTER */}
          <div className="flex h-[calc(100vh-6rem)] flex-col overflow-y-auto">
            <main className="flex-1">
              <div className="mx-auto w-full lg:max-w-7xl px-4 lg:px-0 py-8 text-center">

                {children}

              </div>
            </main>
            <Footer />
          </div>
        </TeamThemeProvider>
      </body>
    </html>
  );
}
