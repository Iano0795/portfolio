import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IanOS Control Center',
  description: 'Protected IanOS CMS control center',
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
