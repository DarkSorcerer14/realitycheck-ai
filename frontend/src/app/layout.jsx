import "./globals.css";

export const metadata = {
  title: "RealityCheck AI",
  description: "Stress-test your startup idea",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}