export async function generateStaticParams() {
  // For BD performance pages, we'll generate common BD IDs
  // You can modify this to fetch actual BD IDs from your API
  return [
    { bdId: '1' },
    { bdId: '2' },
    { bdId: '3' },
    { bdId: '4' },
    { bdId: '5' },
  ];
}

interface PageProps {
  params: Promise<{ bdId: string }>;
}

export default async function BdDetailPage({ params }: PageProps) {
  const { bdId } = await params;
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">BD详情页</h1>
        <p className="text-gray-600">BD ID: {bdId}</p>
        <div className="bg-white rounded-lg shadow p-6 mt-4">
          <p className="text-gray-500">该页面正在开发中...</p>
        </div>
      </div>
    </div>
  );
}