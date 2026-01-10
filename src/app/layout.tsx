import AppBackground from "../components/global-components/app-background";
import Footer from "../components/global-components/footer";
import Header from "../components/global-components/header";
import "./globals.css";
import { TeamThemeProvider } from "./providers/team-theme-provider";
// import { RegisterServiceWorker } from "@/components/global-components/register-service-worker";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next PWA",
  description: "Minimal Next.js v15 PWA (next-pwa)",
  manifest: "/manifest.webmanifest",
  applicationName: "Next PWA",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Next PWA",
  },
  formatDetection: {
    telephone: false,
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

          <AppBackground />

          <Header />

          {/* Scroll Region: MAIN + FOOTER */}
          <div className="flex h-[calc(100vh-6rem)] flex-col overflow-y-auto">
            <main className="flex-1">
              <div className="mx-auto w-full lg:max-w-7xl py-8 text-center">

                {children}

              </div>
            </main>
            <Footer />
          </div>
          {/* <RegisterServiceWorker /> */}
        </TeamThemeProvider>
      </body>
    </html>
  );
}
