import { useCallback } from 'react';
import { ApiError } from '@/api/errors';
import { useGuardianState } from '@/features/guardian/hooks';
import { toSignal } from '@/features/guardian/models';
import { useLinkResource } from '@/features/link/useLinkResource';
import { useSession } from '@/features/session';
import { signalApi } from './client';
import { basicSignalCatalog, rhythmPresets } from './mock';

export function useCatalog() {
  const { data, scope } = useGuardianState();
  const session = useSession();
  const linkId = scope?.linkId, key = scope?.key;
  const resource = useLinkResource(useCallback(async (signal: AbortSignal) => {
    if (!linkId || !key) throw new ApiError('ROLE_REQUIRED');
    // 프리셋 API가 없거나 실패해도 기본 신호 목록 · 직접 만들기는 쓸 수 있게 프리셋만 빈 목록으로 둔다
    const [templates, presets] = await Promise.all([signalApi.templates(linkId, signal), signalApi.presets(linkId, signal).catch(() => [])]);
    return { owner: key, templates, presets };
  }, [linkId, key]));
  const preview = __DEV__ && !session.tokens;
  const catalog = resource.data?.owner === key ? resource.data : undefined;
  return { ...resource, data: catalog, preview, scope,
    entries: preview ? basicSignalCatalog : (catalog?.templates ?? []).map(template => {
      const signal = toSignal({ ...template, source: 'TEMPLATE', practiced: false });
      return { ...signal, meaning: template.description ?? '' };
    }),
    addedIds: preview ? [] : (catalog?.templates ?? []).filter(t => t.alreadyAdded).map(t => t.id),
    presets: preview ? rhythmPresets : (catalog?.presets ?? []).map(p => p.rhythm.map(b => ({ SHORT: 'S', MEDIUM: 'M', LONG: 'L' } as const)[b])),
    signals: data?.signals?.map(toSignal) ?? [],
  };
}
