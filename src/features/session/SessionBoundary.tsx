import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useSession } from './store';

export function SessionBoundary() {
  const { status, role } = useSession();
  const previous = useRef(status);
  useEffect(() => {
    if (previous.current === 'authenticated' && status === 'anonymous') router.replace('/auth/login');
    if (status === 'authenticated' && role === null) router.replace('/auth/role');
    previous.current = status;
  }, [status, role]);
  return null;
}
