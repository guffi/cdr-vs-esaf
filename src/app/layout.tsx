import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'E-fuels vs fossil jet + permanent CDR',
  description: 'A transparent calculator comparing e-SAF with fossil jet fuel plus permanent carbon removal.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
