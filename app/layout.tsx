import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'System Design Visualizer',
  description:
    'Drag-and-drop tool for designing backend system architectures — like Figma for infrastructure.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} overflow-hidden bg-gray-950 text-white`}
      >
        {children}
      </body>
    </html>
  );
}
