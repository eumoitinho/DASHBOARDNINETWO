import PluginInit from "@/helper/PluginInit";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./font.css";
import "./globals.css";

export const metadata = {
  title: "Ninetwo - Dashboard de Marketing Digital",
  description:
    "Ninetwo é o dashboard completo para acompanhar métricas de Google Ads, Facebook Ads e Google Analytics em tempo real.",
  icons: {
    icon: '/fav.png',
    shortcut: '/fav.png',
    apple: '/fav.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='pt-BR'>
      <PluginInit />
      <body suppressHydrationWarning={true}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
