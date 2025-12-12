import { useEffect, useState } from 'react';
import { useWebSocket } from './useWebSocket';
import { useQueryClient } from '@tanstack/react-query';

interface SensorData {
  heartRate: number;
  temperature: number;
  activityLevel: number;
  batteryLevel: number;
  timestamp: string;
}

interface LocationData {
  latitude: string;
  longitude: string;
  timestamp: string;
  accuracy: number;
}

interface UseRealTimeDataReturn {
  isConnected: boolean;
  latestSensorData: SensorData | null;
  latestLocationData: LocationData | null;
}

export const useRealTimeData = (petId?: string): UseRealTimeDataReturn => {
  const { isConnected, lastMessage } = useWebSocket(petId);
  const [latestSensorData, setLatestSensorData] = useState<SensorData | null>(null);
  const [latestLocationData, setLatestLocationData] = useState<LocationData | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'sensor':
        setLatestSensorData(lastMessage.data);
        queryClient.invalidateQueries({ queryKey: ['pet-latest', petId] });
        queryClient.invalidateQueries({ queryKey: ['pet-stats', petId] });
        break;
        
      case 'location':
        setLatestLocationData(lastMessage.data);
        queryClient.invalidateQueries({ queryKey: ['pet-location', petId] });
        break;
        
      case 'notification':
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        break;
    }
  }, [lastMessage, petId, queryClient]);

  return {
    isConnected,
    latestSensorData,
    latestLocationData,
  };
};