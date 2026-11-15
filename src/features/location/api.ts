import { api, ApiError } from '@/api';
import type { createApiClient } from '@/api/client';

import type { CapturedPoint, CaptureFailure } from './device';

export type LocationRequestStatus = 'PENDING' | 'FULFILLED' | 'FAILED' | 'TIMED_OUT';
export type LocationRequestInfo = {
  id: string;
  status: LocationRequestStatus;
  requestedAt: string;
  timeoutAt: string;
  failureReason: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'SHARING_OFF' | null;
};
export type LastLocation = {
  latitude: number;
  longitude: number;
  accuracyM: number | null;
  /** 서버가 주소로 바꾸기 전이면 null */
  address: string | null;
  capturedAt: string;
};
/** 보호자 위치 탭 (마지막 위치 조회) */
export type LocationView = { sharingEnabled: boolean; last: LastLocation | null; pendingRequest: LocationRequestInfo | null };

export function createLocationApi(client: Pick<ReturnType<typeof createApiClient>, 'request'>) {
  const link = (id: string) => `/links/${encodeURIComponent(id)}`;
  return {
    // 당사자
    async sharing(signal?: AbortSignal) {
      const data = await client.request<{ enabled: boolean }>('/me/location-sharing', { signal });
      if (typeof data?.enabled !== 'boolean') throw new ApiError('INVALID_RESPONSE');
      return data.enabled;
    },
    async setSharing(enabled: boolean, signal?: AbortSignal) {
      const data = await client.request<{ enabled: boolean }>('/me/location-sharing', { method: 'PUT', body: { enabled }, signal });
      return data?.enabled ?? enabled;
    },
    /** 보호자의 위치 요청에 답한다. 못 쟀으면 사유만 보낸다 */
    async fulfill(requestId: string, result: CapturedPoint | CaptureFailure, signal?: AbortSignal) {
      const body = typeof result === 'string' ? { error: result } : result;
      await client.request(`/location-requests/${encodeURIComponent(requestId)}/fulfill`, { method: 'POST', body, signal });
    },
    /** 먼저 보낸 도움 요청(PENDING)에 위치를 붙인다 */
    async attachToHelp(helpRequestId: string, result: CapturedPoint | CaptureFailure, signal?: AbortSignal) {
      const body = typeof result === 'string'
        ? { locationStatus: 'UNAVAILABLE', location: null }
        : { locationStatus: 'ATTACHED', location: result };
      await client.request(`/help-requests/${encodeURIComponent(helpRequestId)}/location`, { method: 'PUT', body, signal });
    },

    // 보호자
    async view(linkId: string, signal?: AbortSignal) {
      const data = await client.request<LocationView>(`${link(linkId)}/location`, { signal });
      if (typeof data?.sharingEnabled !== 'boolean') throw new ApiError('INVALID_RESPONSE');
      return data;
    },
    async refresh(linkId: string, signal?: AbortSignal) {
      const data = await client.request<LocationRequestInfo>(`${link(linkId)}/location-requests`, { method: 'POST', body: {}, signal });
      if (!data?.id) throw new ApiError('INVALID_RESPONSE');
      return data;
    },
  };
}

export const locationApi = createLocationApi(api);
