import InfluencerDetail from './InfluencerDetail';

export async function generateStaticParams() {
  // For static export, we return a limited set of common IDs
  // In production, you might want to pre-generate these from your database
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
  ];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InfluencerDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  return <InfluencerDetail influencerId={id} />;
}