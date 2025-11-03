import type { Metadata } from 'next';
import '@/styles/globals.css';
import { StoreProvider } from '@/lib/redux/StoreProvider';

export const metadata: Metadata = {
  title: 'CommunityGaming',
  description: 'Realtime, event-driven social platform for gamers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
