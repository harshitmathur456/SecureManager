import './globals.css';

export const metadata = {
  title: 'Secure Manager — Ticket Classification & Triage System',
  description: 'AI-assisted ticket classification and prioritisation console for Secure Manager.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0f131d] text-[#dfe2f1] antialiased">
        {children}
      </body>
    </html>
  );
}
