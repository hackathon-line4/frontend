import { useSyncExternalStore } from 'react';
import { ApiError } from '@/api/errors';
import { getSession } from '@/features/session/store';
import { getGuardianScope, guardianStore } from '@/features/guardian/client';
import { toSignal } from '@/features/guardian/models';
import { saveSignal } from './client';
import { signalCreation } from './creation';

import type { IconName } from '@/components/Icon';
import { mockSignals, type Signal, type SignalCategory } from '@/features/signals';
import { beatsToPulses, type Beat, type Pulses } from '@/theme';

import type { BasicSignalEntry } from './mock';

// 신호 추가(10) 단계 사이에서 함께 쓰는 작성 중 신호.
// 화면 밖(API 클라이언트 등)에서도 읽을 수 있게 작은 외부 스토어로 둔다 (features/session/store.ts와 같은 방식).

/** 신호 추가를 시작한 곳. 닫기·완료 후 이곳으로 돌아간다 */
export type AddSignalOrigin = 'home' | 'signals';

export type AddSignalDraft = {
  /** basic: 촉신호 목록에서 고름 (리듬 고정) · custom: 직접 만들기 */
  source: Signal['source'];
  /** 목록에서 고른 기본 신호 id */
  basicId?: string;
  presetId?: string;
  name: string;
  description: string;
  icon: IconName;
  category: SignalCategory;
  /** 진동 배열. basic은 목록 값 그대로, custom은 박자에서 만든다 (setDraftBeats) */
  pulses: Pulses;
  beats: readonly Beat[];
};

type AddSignalState = {
  owner: string | null;
  origin: AddSignalOrigin;
  draft: AddSignalDraft;
  /** 이번 세션에 저장한 신호 (서버 연결 전 임시) */
  saved: readonly Signal[];
  /** 방금 저장한 신호 id (10-7) */
  lastSavedId: string | null;
};

// TODO: 신호 아이콘 고르기는 디자인에 없어 직접 만든 신호는 기본 아이콘을 쓴다
export const customSignalIcon: IconName = 'pencil';

const emptyDraft: AddSignalDraft = {
  source: 'custom',
  name: '',
  description: '',
  icon: customSignalIcon,
  category: 'daily',
  pulses: [],
  beats: [],
};

// 화면을 바로 열어 볼 때(개발용 화면 목록 등) 보이는 예시. 흐름은 1단계에서 비우고 시작한다.
const previewDraft: AddSignalDraft = {
  ...emptyDraft,
  name: '약 먹을 시간',
  description: '아침·저녁 약 먹을 시간이라고 알려요',
  pulses: beatsToPulses(['L', 'S', 'M']),
  beats: ['L', 'S', 'M'],
};

let state: AddSignalState = {
  owner: null,
  origin: 'home',
  draft: previewDraft,
  saved: [],
  lastSavedId: null,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAddSignalState(): AddSignalState {
  return state;
}

export function useAddSignal(): AddSignalState {
  return useSyncExternalStore(subscribe, getAddSignalState, getAddSignalState);
}

/** 1단계 진입: 작성 중 신호를 비운다 */
export function startAddSignal(origin: AddSignalOrigin) {
  state = { ...state, owner: getGuardianScope()?.key ?? null, origin, draft: emptyDraft, saved: [], lastSavedId: null };
  emit();
}

export function updateDraft(patch: Partial<AddSignalDraft>) {
  state = { ...state, draft: { ...state.draft, ...patch } };
  emit();
}

/** 직접 조합한 박자 저장. 진동 배열도 같이 만든다 */
export function setDraftBeats(beats: readonly Beat[]) {
  updateDraft({ beats, pulses: beatsToPulses(beats) });
}

/** 목록에서 기본 신호 고르기: 리듬이 정해져 있어 2단계를 건너뛴다 */
export function pickBasicSignal(entry: BasicSignalEntry) {
  state = {
    ...state,
    draft: {
      source: 'basic',
      basicId: entry.id,
      name: entry.name,
      description: entry.meaning,
      icon: entry.icon,
      category: entry.category,
      pulses: entry.pulses,
      beats: entry.beats,
    },
  };
  emit();
}

/** 직접 만들기 시작: 목록에서 고른 값이 남아 있으면 비운다 */
export function startCustomDraft() {
  if (state.draft.source === 'custom') return;
  state = { ...state, draft: emptyDraft };
  emit();
}

/** 4단계 저장. 저장한 신호는 '연습 전' */
export async function saveDraft(abort?: AbortSignal): Promise<Signal> {
  const { draft } = state;
  const scope = getGuardianScope();
  if (getSession().tokens) {
    if (!scope || state.owner !== scope.key) throw new ApiError('SESSION_CHANGED');
    const server = await saveSignal(signalCreation(draft), abort);
    if (state.draft !== draft || state.owner !== scope.key || getGuardianScope()?.key !== scope.key || abort?.aborted) throw new ApiError('SESSION_CHANGED');
    const confirmed = toSignal(server);
    guardianStore.rememberSignal(server, scope.key);
    state = { ...state, saved: [confirmed], lastSavedId: confirmed.id }; emit();
    void guardianStore.loadSignals(true); void guardianStore.loadHome(true);
    return confirmed;
  }
  const signal: Signal = {
    id: draft.basicId ?? `custom-${Date.now()}`,
    name: draft.name,
    icon: draft.icon,
    source: draft.source,
    category: draft.category,
    pulses: draft.pulses,
    beats: draft.beats,
    untrained: true,
  };
  state = {
    ...state,
    saved: [...state.saved.filter((s) => s.id !== signal.id), signal],
    lastSavedId: signal.id,
  };
  emit();
  return signal;
}

/** 이미 있는 신호 (중복 리듬·이미 추가됨 확인용) */
export function knownSignals(saved: readonly Signal[]): readonly Signal[] {
  // TODO: 서버의 내 신호 목록으로 바꾸기
  return [...mockSignals, ...saved.filter((s) => !mockSignals.some((m) => m.id === s.id))];
}

/** 작성 중 신호를 화면 표시용 Signal 모양으로 */
export function draftAsSignal(draft: AddSignalDraft): Signal {
  return {
    id: draft.basicId ?? 'draft',
    name: draft.name,
    icon: draft.icon,
    source: draft.source,
    category: draft.category,
    pulses: draft.pulses,
    beats: draft.beats,
    untrained: true,
  };
}
