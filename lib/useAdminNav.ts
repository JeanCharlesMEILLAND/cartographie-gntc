'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useAdminNav() {
  const router = useRouter();

  const navigateToPlatform = useCallback(
    (site: string) => router.push(`/admin/plateformes?site=${encodeURIComponent(site)}`),
    [router]
  );

  const navigateToOperator = useCallback(
    (operator: string) => router.push(`/admin/operateurs/${encodeURIComponent(operator)}`),
    [router]
  );

  const navigateToOperatorFlux = useCallback(
    (operator: string) => router.push(`/admin/flux?operateur=${encodeURIComponent(operator)}`),
    [router]
  );

  const navigateToFlux = useCallback(() => router.push('/admin/flux'), [router]);

  const navigateToRoutes = useCallback(() => router.push('/admin/liaisons'), [router]);

  return {
    navigateToPlatform,
    navigateToOperator,
    navigateToOperatorFlux,
    navigateToFlux,
    navigateToRoutes,
  };
}
