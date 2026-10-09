import { useQuery } from '@tanstack/react-query';
import { orgUnitsApi } from './api';

export function useScopedOrgUnits(enabled = true) {
  return useQuery({
    queryKey: ['org-units'],
    queryFn: orgUnitsApi.listScoped,
    enabled,
  });
}