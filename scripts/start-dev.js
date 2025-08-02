const { spawn } = require('child_process');
const net = require('net');

// 检查端口是否被占用
function isPortTaken(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
}

// 寻找可用端口
async function findAvailablePort(startPort = 3000) {
  let port = startPort;
  
  while (await isPortTaken(port)) {
    console.log(`\u001b[33m端口 ${port} 已被占用，尝试 ${port + 1}...\u001b[0m`);
    port++;
    
    if (port > startPort + 10) {
      throw new Error('无法找到可用端口 (已尝试 3000-3010)');
    }
  }
  
  return port;
}

async function startDev() {
  try {
    const port = await findAvailablePort();
    
    console.log(`\u001b[32m✓ 找到可用端口: ${port}\u001b[0m`);
    console.log(`\u001b[36m🚀 启动开发服务器...\u001b[0m`);
    console.log(`\u001b[36m📱 访问地址: http://localhost:${port}\u001b[0m`);
    
    // 显示 Mock 数据模式状态
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK || 'false';
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    
    if (useMock === 'true') {
      console.log(`\u001b[33m📦 已启用 Mock 数据模式\u001b[0m`);
    } else {
      console.log(`\u001b[32m🌐 使用真实 API 接口: ${apiBaseUrl}\u001b[0m`);
      console.log(`\u001b[36m📡 完整API地址: ${apiBaseUrl}/api\u001b[0m`);
    }
    console.log('');
    
    // 启动 Next.js 开发服务器
    const child = spawn(
      'next', 
      ['dev', '--port', port.toString()], 
      {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd(),
        env: {
          ...process.env
          // 使用 .env.local 中的环境变量配置，不强制覆盖
        }
      }
    );
    
    // 处理进程退出
    child.on('close', (code) => {
      console.log(`\u001b[33m开发服务器已停止 (退出码: ${code})\u001b[0m`);
    });
    
    // 处理 Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n\u001b[33m正在停止开发服务器...\u001b[0m');
      child.kill('SIGINT');
    });
    
  } catch (error) {
    console.error('\u001b[31m启动失败:\u001b[0m', error.message);
    process.exit(1);
  }
}

startDev();