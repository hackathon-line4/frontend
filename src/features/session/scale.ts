import { touch, type SpaceToken } from '@/theme';

import { useRole, type Role } from './store';

// 보호자 / 당사자 화면 스케일. 두 역할이 함께 쓰는 화면(진동 설정 등)은 이 값으로 크기를 고른다.
// 당사자: 주요 버튼 72 이상, 본문 18 이상, 행 높이 80 이상, 버튼 사이 14 이상.

export type RoleScale = {
  role: Role;
  isRecipient: boolean;
  buttonSize: 'md' | 'lg';
  headerSize: 'md' | 'lg';
  /** ScreenTitle size */
  titleSize: 28 | 30;
  /** ScreenTitle descriptionSize */
  descriptionSize: 16 | 18;
  bodyVariant: 'body' | 'rBody';
  minTouch: number;
  rowMinHeight: number;
  buttonGap: SpaceToken;
  sectionGap: SpaceToken;
};

const guardianScale: RoleScale = {
  role: 'guardian',
  isRecipient: false,
  buttonSize: 'md',
  headerSize: 'md',
  titleSize: 28,
  descriptionSize: 16,
  bodyVariant: 'body',
  minTouch: touch.guardianMin,
  rowMinHeight: 64,
  buttonGap: 3,
  sectionGap: 7,
};

const recipientScale: RoleScale = {
  role: 'recipient',
  isRecipient: true,
  buttonSize: 'lg',
  headerSize: 'lg',
  titleSize: 30,
  descriptionSize: 18,
  bodyVariant: 'rBody',
  minTouch: touch.recipientMin,
  rowMinHeight: 80,
  buttonGap: 4,
  sectionGap: 8,
};

export function scaleFor(role: Role | null): RoleScale {
  return role === 'recipient' ? recipientScale : guardianScale;
}

/** 현재 역할의 화면 스케일. 역할이 아직 없으면 보호자 스케일 */
export function useRoleScale(): RoleScale {
  return scaleFor(useRole());
}

