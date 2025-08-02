import { use } from 'react';

export default function BdDetailPage({ params }: { params: Promise<{ bdId: string }> }) {
  const { bdId } = use(params);
  
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