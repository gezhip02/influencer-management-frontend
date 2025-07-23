export interface User {
  id: string;
  name?: string;
  email: string;
  username?: string;
  displayName?: string;
  role: string;
  department?: string;
  status: number;
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
  status: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  category?: string;
  status: number;
  createdAt?: number;
  updatedAt?: number;
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
  status: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  price?: number;
  status: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface Platform {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: number;
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
  status: number;
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
  details?: any;
}

// 查询参数类型
export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string | number;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: any;
}