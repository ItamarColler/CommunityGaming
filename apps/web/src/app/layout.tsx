import type { Metadata } from 'next';
import '@/styles/globals.css';
import { StoreProvider } from '@/lib/redux/StoreProvider';
import { ThemeRegistry } from '@/lib/mui/ThemeRegistry';

export const metadata: Metadata = {
  title: 'CommunityGaming',
  description: 'Realtime, event-driven social platform for gamers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <StoreProvider>{children}</StoreProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
