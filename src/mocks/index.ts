// Mock setup for client-side with improved initialization
let isWorkerReady = false;
let workerPromise: Promise<void> | null = null;

// 确保Worker准备就绪的函数
export async function ensureWorkerReady(): Promise<void> {
  if (isWorkerReady) {
    return;
  }
  
  if (workerPromise) {
    return workerPromise;
  }
  
  throw new Error('Worker not initialized');
}

if (typeof window !== 'undefined') {
  console.log('🔍 Mock初始化检查:');
  console.log('  - 环境变量 NEXT_PUBLIC_USE_MOCK:', process.env.NEXT_PUBLIC_USE_MOCK);
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  console.log('  - API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api');
  
  // 只有明确设置为 'true' 时才启用 Mock
  const shouldUseMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true' && process.env.NODE_ENV === 'development';
  
  console.log('🔍 是否使用Mock:', shouldUseMock);
  
  if (shouldUseMock) {
    console.log('🚀 正在启动 Mock Service Worker...');
    
    workerPromise = (async () => {
      try {
        // 动态导入handlers先检查
        const { handlers } = await import('./handlers');
        console.log('📦 Handlers已导入，数量:', handlers.length);
        
        // 然后导入并启动worker
        const { worker } = await import('./browser');
        console.log('📦 Worker已导入');
        
        await worker.start({
          onUnhandledRequest(req, print) {
            // 只对API请求发出警告
            if (req.url.includes('/api/')) {
              console.log('⚠️ 未处理的API请求:', req.method, req.url);
              print.warning();
            }
          },
          serviceWorker: {
            url: '/mockServiceWorker.js',
          },
          quiet: false, // 显示详细启动信息
        });
        
        console.log('✅ Mock Service Worker 已启动成功');
        console.log('📦 Mock数据已准备就绪');
        console.log('🌐 请求拦截已开始工作');
        
        isWorkerReady = true;
        
        // 测试MSW是否工作
        console.log('🧪 测试MSW是否工作...');
        try {
          const response = await fetch('/api/test');
          const data = await response.json();
          console.log('✅ MSW测试成功:', data);
        } catch (testError) {
          console.error('❌ MSW测试失败:', testError);
        }
        
        // 添加到全局对象，方便调试
        (window as unknown as Record<string, unknown>).mswWorker = worker;
        (window as unknown as Record<string, unknown>).mswReady = true;
        
      } catch (error) {
        console.error('❌ Mock Service Worker 启动失败:', error);
        console.error('错误详情:', error instanceof Error ? error.stack : String(error));
        isWorkerReady = false;
        workerPromise = null;
        throw error;
      }
    })();
    
  } else {
    console.log('⚠️ Mock 数据未启用，将使用真实API');
    console.log('💡 要启用Mock数据，请设置 NEXT_PUBLIC_USE_MOCK=true');
  }
}