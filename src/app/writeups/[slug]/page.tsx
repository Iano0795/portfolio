import { notFound } from 'next/navigation';
import { WriteupDetailPage } from '@/components/writeups/WriteupDetailPage';
import { getPublicWriteupData } from '@/lib/cms/adapter';

export const dynamic = 'force-dynamic';

type WriteupPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function WriteupPage({ params }: WriteupPageProps) {
  const { slug } = await params;
  const writeup = await getPublicWriteupData(slug);

  if (!writeup) {
    notFound();
  }

  return <WriteupDetailPage writeup={writeup} />;
}
