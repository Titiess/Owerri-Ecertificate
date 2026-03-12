import type { Metadata } from 'next';
import AuthProvider from '@/components/providers/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Owerri Municipal Council — E-Certificate Portal',
  description:
    'Official digital platform for applying, processing, and verifying Certificates of Origin issued by Owerri Municipal Council, Imo State, Nigeria.',
  keywords: [
    'Owerri Municipal Council',
    'Certificate of Origin',
    'Imo State',
    'E-Certificate',
    'State of Origin',
    'Nigeria',
  ],
  authors: [{ name: 'Owerri Municipal Council' }],
  openGraph: {
    title: 'Owerri Municipal Council — E-Certificate Portal',
    description:
      'Apply for and verify Certificates of Origin online. Secure, fast, and officially recognized.',
    type: 'website',
    locale: 'en_NG',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                try {
                  Object.defineProperty(window, 'ethereum', {
                    get() { return this._eth; },
                    set(val) { this._eth = val; },
                    configurable: true,
                    enumerable: true
                  });
                } catch (e) {}
              }
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

