// 达人管理相关类型
export interface InfluencerSaveRequest {
  id?: number;
  platform_id: number;
  platform_user_id: string;
  nickname?: string;
  avatar?: string;
  introduction?: string;
  display_name: string;
  sex?: number; // 0:未知 1:男 2:女
  age?: string;
  type: number;
  phone?: string;
  email?: string;
  whatsapp?: string;
  weixin?: string;
  telegram?: string;
  country?: string;
  province?: string;
  city?: string;
  fans_count: number;
  follow_count?: number;
  video_count?: number;
  average_play_count?: number;
  interaction_rate?: number;
  quality_score?: number;
  risk_level?: number;
  remark?: string;
  tags?: string; // 逗号分隔的标签ID
}

export interface InfluencerInfo {
  id: number;
  platform_id: number;
  platform_user_id: string;
  nickname: string;
  avatar: string;
  introduction: string;
  display_name: string;
  sex: number;
  age: string;
  type: number;
  phone: string;
  email: string;
  whatsapp: string;
  weixin: string;
  telegram: string;
  country: string;
  province: string;
  city: string;
  fans_count: number;
  follow_count: number;
  video_count: number;
  average_play_count: number;
  interaction_rate: number;
  quality_score: number;
  risk_level: number;
  remark: string;
  tags: string;
}

export interface InfluencerListRequest {
  page: number;
  page_size: number;
  search: string;
  platform_id: number;
  is_deleted: number; // 0-否；1-是，默认是0（未删除）
  source: number;
  register_start_at: number;
  register_end_at: number;
  tag: string; // 修改为 string 类型以匹配后端
}

export interface InfluencerListItem {
  id: number;
  display_name: string;
  source: number;
  tags: Array<{
    id: number;
    name: string;
  }>;
  created_at: number;
  active_time: number;
}

export interface InfluencerListResponse {
  total: number;
  list: InfluencerListItem[];
}

export interface InfluencerIndexResponse {
  influencer_total: number;
  active_influencer_total: number;
  week_influencer_total: number;
  tag_total: number;
  influencer_platform_list: Array<{
    id: number;
    name: string;
  }>;
  influencer_status_list: Array<{
    id: number;
    name: string;
  }>;
  influencer_source_list: Array<{
    id: number;
    name: string;
  }>;
  influencer_tag_list: Array<{
    id: number;
    name: string;
  }>;
  type_list: Array<{
    id: number;
    name: string;
  }>;
}

export interface InfluencerTagUpdateRequest {
  id: number;
  tag_ids: string;
}

export interface InfluencerSignedRequest {
  id?: number; // 达人id，>0编辑
  influencer_id?: number;
  contract_no?: string;
  contract_type?: number; // 1:基础合约 2:高级合约 3:独家合约
  contract_start_at?: number;
  contract_end_at?: number;
  contract_amount?: number;
  currency_type?: string; // USD，CNY，EUR
  contract_remark?: string;
}

// 产品管理相关类型
export interface ProductListRequest {
  page: number;
  page_size: number;
  search: string;
  category: string;
}

export interface ProductInfo {
  id: number;
  name: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  priority: string;
  country: string;
  sku_series: string;
}

export interface ProductEditRequest {
  id?: number; // 必选，ID编号>0修改
  name?: string;
  description?: string;
  brand?: string;
  category?: string;
  price?: number;
  currency?: string;
  budget?: number;
  target_audience?: string;
  content_requirements?: string;
  deliverables?: string;
  kpis?: string;
  start_date?: number;
  end_date?: number;
  priority?: string;
  country?: string;
  sku_series?: string;
}

export interface ProductDeleteRequest {
  id: number;
}

export interface ProductListResponse {
  total: number;
  list: ProductInfo[];
}

export interface ProductOperationResponse {
  id: number;
}

// 履约管理相关类型
export interface CooperationPlan {
  id: number;
  title: string;
  description: string;
  tags: string;
}

export interface FulfillmentIndexResponse {
  cooperation_plan_list: CooperationPlan[];
  priority_list: { id: number; name: string; }[];
  status_list: { id: string; name: string; }[];
  handler_user_list: { id: number; name: string; }[];
}

export interface FulfillmentSaveRequest {
  influencer_id: number;
  cooperation_plan_id: number;
  priority: number; // 1:高 2:中 3:低
  remark: string;
  product_id: number;
}

export interface FulfillmentUpdateRequest {
  id: number;
  remark: string;
  status: string; // pending:待寄样 sent:已寄样 received:已签收 content_created:内容制作 published:已发布 sales_conversion:销售转化 completed:已完成 canceled:取消
  status_remark: string;
  tags: string;
  shipping_no: string;
  received_at: number;
  video_url: string;
  video_id: string;
  ad_code: string;
  ads_roi: number;
}

export interface FulfillmentListRequest {
  page: number;
  page_size: number;
  search: string;
  status: string;
  priority: number;
  start_time: number;
  end_time: number;
  handler_user_id: number;
  id?: number;
}

export interface FulfillmentListItem {
  id: number;
  influencer_id: number;
  influencer_name: string;
  product_name: string;
  status: string;
  status_text: string;
  priority: number;
  priority_text: string;
  created_at: number;
  remark: string;
  cooperation_plan: string;
  end_time: number;
}

export interface FulfillmentListResponse {
  total: number;
  list: FulfillmentListItem[];
}

export interface FulfillmentReportRequest {
  user_id?: number;
  start_time?: number;
  end_time?: number;
  report_type: number; // 1-8 不同报表类型
}

export interface FulfillmentReportData {
  product_id?: number;
  product_name?: string;
  count?: number;
  // 根据不同的报表类型，数据结构可能不同
  [key: string]: unknown;
}

export interface FulfillmentReportResponse {
  report_data_1?: FulfillmentReportData[] | null;
  report_data_2?: FulfillmentReportData[] | null;
  report_data_3?: FulfillmentReportData[] | null;
  report_data_4?: FulfillmentReportData[] | null;
  report_data_5?: FulfillmentReportData[] | null;
  report_data_6?: FulfillmentReportData[] | null;
  report_data_7?: FulfillmentReportData[] | null;
  report_data_8?: FulfillmentReportData[] | null;
}

export interface FulfillmentDetailsRequest {
  user_id: number;
  search: string;
  status: string;
  product_id: number;
  page: number;
  page_size: number;
}

export interface FulfillmentDetailsItem {
  id: number;
  product_name: string;
  influencer_name: string;
  status: string;
  status_timeout_at: number;
  timeout_at: number;
  nickname: string;
  start_time: number;
}

export interface FulfillmentDetailsResponse {
  total: number;
  list: FulfillmentDetailsItem[];
}

export interface FulfillmentDeleteRequest {
  id: number;
}

export interface FulfillmentOperationResponse {
  id?: number;
}

// 绩效管理相关类型
export interface PerformanceImportRequest {
  file: File;
  file_type: string; // video:视频模板 live:直播模板
}

// 认证相关类型
export interface LoginRequest {
  account: string;
  password: string;
  company_id?: number;
  is_sub_user?: boolean;
  main_user_account?: string;
}

export interface LoginResponse {
  token: string;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  username?: string;
  displayName?: string;
  role: string;
  department?: string;
  is_deleted: number; // 0-否；1-是，默认是0（未删除）
  timezone?: string;
  language: string;
  lastLogin?: number;
  loginCount: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface Influencer {
  id: string;
  creatorId: string;
  platformUserId?: string;
  name: string;
  nickname?: string;
  gender?: string;
  platform: string;
  email?: string;
  followersCount?: number;
  category?: string;
  location?: string;
  rating?: number;
  tags: Tag[];
  contract?: {
    id: string;
    type: string;
    signedAt?: number;
    status: string;
  };
  isSigned: boolean;
  is_deleted: number; // 0-否；1-是，默认是0（未删除）
  createdAt?: number;
  updatedAt?: number;
}

// 标签相关类型
export interface Tag {
  id: number;
  display_name: string;
  name: string;
  category: number;
  category_name?: string;
  color: string;
  icon?: string;
  remark?: string;
  created_at?: number;
  influencer_count?: number;
}

export interface TagCategory {
  id: number;
  name: string;
}

export interface TagEditRequest {
  id?: number; // ID 编号>0修改，0：新增
  display_name?: string;
  name: string; // 必选
  category?: number;
  color?: string;
  icon?: string;
  remark?: string;
}

export interface TagListRequest {
  search?: string;
  category?: number;
  page: number;
  page_size: number;
}

export interface TagListResponse {
  total: number;
  list: Tag[];
}

export interface TagIndexResponse {
  tag_total: number;
  influencer_total: number;
  tag_category_total: number;
  tag_category_list: Array<{
    id: number;
    name: string;
  }>;
}

// 内容管理相关类型
export interface ContentIndexResponse {
  total: number;
  order_num: number;
  play_num: number;
}

export interface ContentListRequest {
  page: number;
  page_size: number;
  search?: string;
  status?: string;
  data?: number; // 0:全部 1：有数据 2：无数据
  order_by: number; // 1：创建时间 DESC 2：创建时间 ASC 3：播放量 DESC 4：播放量 ASC 5：出单数 DESC 6：出单数 ASC
}

export interface ContentListItem {
  id: number;
  influencer_name: string;
  product_name: string;
  status: string;
  video_url: string;
  ad_code: string;
  published_at: string;
  play_num: number;
  order_num: number;
  content_remark: string;
  ads_status: number; // 0：否 1：是
}

export interface ContentListResponse {
  total: number;
  list: ContentListItem[];
}

export interface ContentEditRequest {
  id: number;
  content_remark?: string;
  ads_status?: number;
}

export interface FulfillmentRecord {
  id: string;
  planId: string;
  influencerId: string;
  creatorId: string;
  status: string;
  priority?: number;
  requirements?: {
    content?: string;
    duration?: number;
    format?: string;
  };
  progress?: {
    sampleSubmitted?: boolean;
    sampleApproved?: boolean;
    contentSubmitted?: boolean;
    contentApproved?: boolean;
  };
  timestamps?: {
    createdAt?: number;
    updatedAt?: number;
    sampleReceivedTime?: number;
    deadlineTime?: number;
  };
  tags: Tag[];
  influencer?: Influencer;
  plan?: FulfillmentPlan;
}

export interface FulfillmentPlan {
  id: string;
  name: string;
  description?: string;
  budget?: number;
  startDate?: number;
  endDate?: number;
  is_deleted: number; // 0-否；1-是，默认是0（未删除）
  createdAt?: number;
  updatedAt?: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  is_deleted: number; // 0-否；1-是，默认是0（未删除）
  createdAt?: number;
  updatedAt?: number;
}

export interface Platform {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_deleted: number; // 0-否；1-是，默认是0（未删除）
  createdAt?: number;
  updatedAt?: number;
}

export interface BdPerformance {
  id: string;
  bdId: string;
  period: string;
  metrics: {
    totalOrders: number;
    completedOrders: number;
    revenue: number;
    roi: number;
  };
  ranking?: number;
  is_deleted: number; // 0-否；1-是，默认是0（未删除）
  createdAt?: number;
  updatedAt?: number;
}

// API 请求/响应类型
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: number;
  message: string;
  details?: unknown;
}

// 查询参数类型
export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string | number;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: unknown;
}