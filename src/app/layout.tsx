import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-screen w-screen overflow-hidden bg-white text-black dark:bg-black dark:text-white">
        {children}
      </body>
    </html>
  );
}
