import { useQuery } from '@tanstack/react-query';
import { api, locationServiceAPI } from '../lib/api';

interface CollarAssignment {
  collarId: string;
  petId: string;
  isActive: boolean;
}

interface LocationData {
  id: string;
  collarId: string;
  latitude: string;
  longitude: string;
  accuracy: string;
  timestamp: string;
  isCurrent: boolean;
}

export function usePetLocation(petId: string) {
  // Get collar assignments to find the collar for this pet
  const { data: assignments } = useQuery({
    queryKey: ['collar-assignments'],
    queryFn: () => api.get('/collar/assignments').then(res => res.data.assignments),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Find the collar assigned to this pet
  const collarId = assignments?.find((assignment: CollarAssignment) => 
    assignment.petId === petId && assignment.isActive
  )?.collarId;

  // Query current location using collar ID
  const { data: locationData, isLoading, error, refetch } = useQuery({
    queryKey: ['pet-location', collarId],
    queryFn: () => locationServiceAPI.getCurrentLocationByCollar(collarId!).then(res => res.data),
    enabled: !!collarId, // Only execute if we have a collar ID
    refetchInterval: 10000, // Update every 10 seconds
    retry: 3,
  });

  return {
    locationData: locationData as LocationData | undefined,
    collarId,
    isLoading,
    error,
    refetch,
    hasCollar: !!collarId,
  };
}