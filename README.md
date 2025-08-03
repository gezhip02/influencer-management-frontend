# 履约管理系统 (前端重构版)

基于 Next.js 15 + TypeScript 的达人履约管理系统前端，支持 Mock 数据和真实 API 切换。

## 🚀 项目特色

- ✅ **前后端分离**：API 客户端支持环境变量切换 Mock/真实后端
- ✅ **智能端口检测**：开发服务器自动从 3000 开始寻找可用端口
- ✅ **响应式设计**：完美支持桌面和移动端访问
- ✅ **TypeScript 全覆盖**：完整的类型安全和 IntelliSense 支持
- ✅ **模块化架构**：按业务功能划分的清晰目录结构
- ✅ **Mock 系统**：基于 MSW 的完整 Mock 数据支持

## 📋 环境要求

- Node.js >= 18.17.0
- npm >= 9.0.0

## 🛠️ 安装依赖

```bash
npm install
```

## 🚀 开发模式

### 启动开发服务器（使用 Mock 数据）
```bash
npm run dev
```
> 默认使用 Mock 数据，端口从 3000 开始自动检测

### 启动开发服务器（连接真实后端）
```bash
npm run dev:real
```
> 需要先配置 `.env.local` 中的 `NEXT_PUBLIC_API_BASE_URL`

### 强制使用 Mock 数据
```bash
npm run dev:mock
```

## 🔧 环境配置

### 环境变量设置

创建 `.env.local` 文件：

```bash
# 后端 API 地址
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# 是否使用 Mock 数据 (true/false)
NEXT_PUBLIC_USE_MOCK=true
```

### Mock/真实 API 切换

1. **使用 Mock 数据**（开发阶段推荐）：
   ```bash
   NEXT_PUBLIC_USE_MOCK=true
   ```

2. **连接真实后端**：
   ```bash
   NEXT_PUBLIC_USE_MOCK=false
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com/api
   ```

## 🏗️ 构建和部署

### 开发环境构建
```bash
npm run build
```

### 启动生产服务器
```bash
npm run start
```

### 代码质量检查
```bash
# ESLint 检查
npm run lint

# TypeScript 类型检查
npm run type-check

# 代码格式化
npm run format
```

### 测试
```bash
# 运行单元测试
npm run test

# 监听模式运行测试
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

## 📁 项目结构

```
influencer-management-frontend-next/
├── public/                 # 静态资源
├── src/
│   ├── app/               # Next.js App Router 页面
│   │   ├── layout.tsx     # 根布局
│   │   ├── page.tsx       # 首页仪表板
│   │   ├── fulfillment/   # 履约管理页面
│   │   ├── influencers/   # 达人管理页面
│   │   ├── bd-performance/# BD绩效页面
│   │   └── tags/          # 标签管理页面
│   ├── components/        # 可复用组件
│   │   ├── ui/           # 通用UI组件
│   │   ├── navigation-provider.tsx
│   │   └── sidebar.tsx
│   ├── features/         # 按业务模块划分
│   ├── services/         # API 服务层
│   │   ├── api-client.ts  # 统一的 API 客户端
│   │   ├── user-service.ts
│   │   ├── influencer-service.ts
│   │   ├── fulfillment-service.ts
│   │   └── index.ts
│   ├── mocks/            # Mock 数据和处理器
│   │   ├── handlers.ts   # MSW 请求处理器
│   │   ├── data.ts       # Mock 数据定义
│   │   └── browser.ts    # 浏览器端 MSW 设置
│   ├── lib/              # 工具函数
│   │   └── utils.ts
│   └── types/            # TypeScript 类型定义
│       └── index.ts
├── scripts/
│   └── start-dev.js      # 智能端口检测脚本
├── .env.local            # 环境变量配置
├── package.json          # 项目依赖和脚本
├── next.config.ts        # Next.js 配置
├── tailwind.config.js    # Tailwind CSS 配置
└── tsconfig.json         # TypeScript 配置
```

## 🎯 核心功能模块

### 1. 仪表板 (Dashboard)
- 📊 实时数据统计展示
- 🔗 快速操作入口
- 📈 履约状态概览
- 🔍 达人快速搜索

### 2. 达人管理 (Influencers)
- 👥 达人列表管理
- 🏷️ 标签分类和筛选
- 📄 合同状态管理
- 📊 达人数据分析

### 3. 履约管理 (Fulfillment)
- 📋 履约单创建和管理
- ⏱️ 状态流程跟踪
- 📝 任务进度监控
- 💰 ROI 分析统计

### 4. BD绩效 (BD Performance)
- 📈 绩效数据计算
- 📊 排名统计分析
- 📄 数据导入导出
- 📋 历史记录查询

### 5. 标签管理 (Tags)
- 🏷️ 标签创建和编辑
- 🎨 标签颜色和分类
- 🔗 标签关联管理
- 📊 使用统计分析

## 🔧 开发指南

### API 客户端使用

```typescript
import { ApiClient } from '@/services/api-client';

// GET 请求
const users = await ApiClient.get<User[]>('/users');

// POST 请求
const newUser = await ApiClient.post<User>('/users', userData);

// PUT 请求
const updatedUser = await ApiClient.put<User>(`/users/${id}`, updateData);

// DELETE 请求
await ApiClient.delete(`/users/${id}`);
```

### 服务层使用

```typescript
import { influencerService } from '@/services';

// 获取达人列表
const { data: influencers, total } = await influencerService.getInfluencers({
  page: 1,
  pageSize: 10,
  search: 'keyword'
});

// 创建达人
const newInfluencer = await influencerService.createInfluencer(influencerData);
```

### 添加新的 Mock 数据

1. 在 `src/mocks/data.ts` 中添加数据：
```typescript
export const mockNewFeature = [
  // 你的 Mock 数据
];
```

2. 在 `src/mocks/handlers.ts` 中添加处理器：
```typescript
http.get('/api/new-feature', () => {
  return HttpResponse.json({
    code: 200,
    success: true,
    data: mockNewFeature,
  });
}),
```

## 🚨 常见问题

### Q: 端口被占用怎么办？
A: 项目自动从 3000 开始检测可用端口，会自动尝试 3001, 3002... 直到找到可用端口。

### Q: Mock 数据不生效？
A: 检查 `.env.local` 文件中的 `NEXT_PUBLIC_USE_MOCK=true` 设置。

### Q: API 请求失败？
A: 
1. 确认 `NEXT_PUBLIC_API_BASE_URL` 设置正确
2. 检查后端服务是否启动
3. 查看浏览器网络面板的错误信息

### Q: 样式不显示？
A: 确保 Tailwind CSS 正确配置，运行 `npm run dev` 重新启动开发服务器。

### Q: 类型错误？
A: 运行 `npm run type-check` 检查类型错误，确保 TypeScript 配置正确。

## 🤝 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 配置的代码风格
- 组件使用函数式组件 + Hooks
- API 调用统一使用 services 层
- 样式使用 Tailwind CSS

## 📈 性能优化

- 使用 Next.js 15 的最新优化特性
- 组件懒加载和代码分割
- 图片优化 (next/image)
- 静态资源缓存策略
- API 响应缓存

## 🔄 部署说明

### Vercel 部署（推荐）
1. 连接 GitHub 仓库
2. 设置环境变量
3. 自动部署

### Docker 部署
```bash
# 构建镜像
docker build -t influencer-frontend .

# 运行容器
docker run -p 3000:3000 influencer-frontend
```

### 静态导出
```bash
npm run build
npm run export
```

## 📄 更新日志

### v1.0.0 (2024-07-22)
- ✅ 完成项目初始化和基础架构
- ✅ 实现 API 客户端和服务层
- ✅ 添加 Mock 数据系统支持
- ✅ 完成响应式导航和首页仪表板
- ✅ 集成 TypeScript 和代码质量工具
- ✅ 添加端口自动检测功能

## 📞 技术支持

如有技术问题，请：
1. 查看本 README 的常见问题部分
2. 检查项目的 Issues 页面
3. 联系项目维护团队

---

**注意**: 本项目是原 Next.js 全栈项目的前端重构版本，移除了所有数据库操作代码，改为通过 API 调用获取数据。可以与现有项目并存，便于平滑迁移。