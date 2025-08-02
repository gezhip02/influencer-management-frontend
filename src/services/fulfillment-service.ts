import { ApiClient } from './api-client';
import { 
  FulfillmentIndexResponse,
  FulfillmentSaveRequest,
  FulfillmentUpdateRequest,
  FulfillmentListRequest,
  FulfillmentListResponse,
  FulfillmentReportRequest,
  FulfillmentReportResponse,
  FulfillmentDetailsRequest,
  FulfillmentDetailsResponse,
  FulfillmentListItem,
  FulfillmentDeleteRequest,
  FulfillmentOperationResponse
} from '@/types';

export const fulfillmentService = {
  // 获取履约首页数据
  async getFulfillmentIndex(): Promise<FulfillmentIndexResponse> {
    return ApiClient.post('/fulfillment_index', {});
  },

  // 获取履约列表
  async getFulfillmentList(params: FulfillmentListRequest): Promise<FulfillmentListResponse> {
    const cleanParams = {
      page: Number(params.page) || 1,
      page_size: Number(params.page_size) || 10,
      search: params.search?.trim() || '',
      status: params.status?.trim() || '',
      priority: Number(params.priority) || 0,
      start_time: Number(params.start_time) || 0,
      end_time: Number(params.end_time) || 0,
      handler_user_id: Number(params.handler_user_id) || 0,
      ...(params.id && { id: Number(params.id) })
    };
    return ApiClient.post('/fulfillment_list', cleanParams);
  },

  // 获取单个履约单详情
  async getFulfillmentById(id: number): Promise<FulfillmentListItem> {
    return ApiClient.post('/fulfillment_list', { 
      page: 1, 
      page_size: 1, 
      search: '', 
      status: '', 
      priority: 0, 
      start_time: 0, 
      end_time: 0, 
      handler_user_id: 0,
      id: Number(id) 
    });
  },

  // 创建履约单
  async saveFulfillment(data: FulfillmentSaveRequest): Promise<FulfillmentOperationResponse> {
    const cleanData = {
      influencer_id: Number(data.influencer_id),
      cooperation_plan_id: Number(data.cooperation_plan_id),
      priority: Number(data.priority),
      remark: data.remark?.trim() || '',
      product_id: Number(data.product_id)
    };
    return ApiClient.post('/fulfillment_save', cleanData);
  },

  // 更新履约单状态
  async updateFulfillment(data: FulfillmentUpdateRequest): Promise<FulfillmentOperationResponse> {
    const cleanData = {
      id: Number(data.id),
      remark: data.remark?.trim() || '',
      status: data.status?.trim() || '',
      status_remark: data.status_remark?.trim() || '',
      tags: data.tags?.trim() || '',
      shipping_no: data.shipping_no?.trim() || '',
      received_at: Number(data.received_at) || 0,
      video_url: data.video_url?.trim() || '',
      video_id: data.video_id?.trim() || '',
      ad_code: data.ad_code?.trim() || '',
      ads_roi: Number(data.ads_roi) || 0
    };
    return ApiClient.post('/fulfillment_update', cleanData);
  },

  // 删除履约单
  async deleteFulfillment(id: number): Promise<FulfillmentOperationResponse> {
    const deleteData = { id: Number(id) };
    return ApiClient.post('/fulfillment_delete', deleteData);
  },

  // 获取履约单报表
  async getFulfillmentReport(params: FulfillmentReportRequest): Promise<FulfillmentReportResponse> {
    const cleanParams = {
      report_type: Number(params.report_type),
      ...(params.user_id && { user_id: Number(params.user_id) }),
      ...(params.start_time && { start_time: Number(params.start_time) }),
      ...(params.end_time && { end_time: Number(params.end_time) })
    };
    return ApiClient.post('/fulfillment_report', cleanParams);
  },

  // 获取履约单明细列表
  async getFulfillmentDetails(params: FulfillmentDetailsRequest): Promise<FulfillmentDetailsResponse> {
    const cleanParams = {
      user_id: Number(params.user_id),
      search: params.search?.trim() || '',
      status: params.status?.trim() || '',
      product_id: Number(params.product_id) || 0,
      page: Number(params.page) || 1,
      page_size: Number(params.page_size) || 10
    };
    return ApiClient.post('/fulfillment_details', cleanParams);
  },
};