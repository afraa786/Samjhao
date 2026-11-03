import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Samjhao · cricket, explained at your level',
  description:
    'A private sidekick beside a live cricket watch-along that explains what is happening, and what the creator just said, at your level.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // lets the bottom bar sit above the iPhone home indicator via safe-area insets
  themeColor: '#0a0f1d',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
