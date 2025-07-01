import "./styles/globals.css";
import Shell from "./components/shell";

export const metadata = {
  title: "Jendral Le Veteran",
  description: "Cafe & Restaurant Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen">
        <Shell>{children}</Shell> {/* Shell berisi Header/Navbar */}
      </body>
    </html>
  );
}
