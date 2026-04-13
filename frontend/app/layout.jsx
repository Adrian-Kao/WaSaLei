import "./globals.css";

export const metadata = {
    title: "Login Demo",
    description: "Minimal Next.js login page"
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>

                {children}

            </body>
        </html>
    );
}
