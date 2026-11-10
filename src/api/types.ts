export type ServerRole = 'GUARDIAN' | 'RECIPIENT';
export type Tokens = { accessToken: string; refreshToken: string };
export type User = { id: string; email: string; name: string; role: ServerRole | null; createdAt: string };
export type Link = {
  id: string;
  status: 'ACTIVE' | 'ENDED';
  guardian: { id: string; name: string };
  recipient: { id: string; name: string };
  linkedAt: string;
  connection: { state: 'CONFIRMED' | 'UNCONFIRMED' | 'UNKNOWN'; lastConfirmedAt: string | null };
};
export type PendingLinkRequest = {
  id: string; status: 'PENDING';
  guardian: { id: string; name: string };
  recipient: { id: string; name: string; role: 'RECIPIENT' };
  code: string; requestedAt: string; expiresAt: string; decidedAt: null; link: null;
};
export type Me = { user: User; links: Link[]; pendingLinkRequest: PendingLinkRequest | null };
export type AuthResult = Tokens & { user: User; links: Link[] };
export type LinkRequest = Omit<PendingLinkRequest, 'status' | 'decidedAt' | 'link'> & {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED' | 'EXPIRED';
  decidedAt: string | null;
  link: Link | null;
};
