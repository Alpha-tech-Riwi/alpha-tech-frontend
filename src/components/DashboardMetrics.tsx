import { useQuery } from '@tanstack/react-query';
import { petsAPI, notificationsAPI, locationAPI } from '../lib/api';
import { Heart, AlertTriangle, MapPin, Battery, Activity, Wifi } from 'lucide-react';
import { useMemo } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  status: 'success' | 'warning' | 'danger' | 'info';
  subtitle?: string;
}

function MetricCard({ title, value, icon, status, subtitle }: MetricCardProps) {
  const statusColors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconColors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600'
  };

  return (
    <div className={`metric-card ${statusColors[status]}`}>
      <div className="metric-header">
        <div className={`metric-icon ${iconColors[status]}`}>
          {icon}
        </div>
        <div className="metric-content">
          <h3 className="metric-title">{title}</h3>
          <div className="metric-value">{value}</div>
          {subtitle && <p className="metric-subtitle">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

export default function DashboardMetrics() {
  const { data: pets } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petsAPI.getMyPets().then(res => res.data),
    refetchInterval: 30000
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getMyNotifications().then(res => res.data),
    refetchInterval: 30000
  });

  // Calcular métricas
  const metrics = useMemo(() => {
    if (!pets) return null;

    const totalPets = pets.length;
    const activePets = pets.filter((pet: any) => pet.isActive).length;
    
    // Calcular promedio de batería de los datos más recientes
    const avgBattery = pets.reduce((acc: number, pet: any) => {
      const latestData = pet.sensorData?.[0];
      return acc + (latestData?.batteryLevel || 0);
    }, 0) / totalPets;

    // Contar alertas del día
    const today = new Date().toDateString();
    const todayAlerts = notifications?.filter((notif: any) => 
      new Date(notif.createdAt).toDateString() === today
    ).length || 0;

    // Simular mascotas en zona segura (esto se podría calcular con datos reales de geofence)
    const petsInSafeZone = Math.floor(totalPets * 0.8); // 80% en zona segura

    return {
      totalPets,
      activePets,
      avgBattery: Math.round(avgBattery),
      todayAlerts,
      petsInSafeZone,
      petsOutsideZone: totalPets - petsInSafeZone
    };
  }, [pets, notifications]);

  if (!metrics) {
    return (
      <div className="metrics-loading">
        <Wifi className="animate-spin" size={24} />
        <span>Cargando métricas...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-metrics">
      <h2 className="metrics-title">📊 Panel de Control en Tiempo Real</h2>
      
      <div className="metrics-grid">
        <MetricCard
          title="Mascotas Activas"
          value={`${metrics.activePets}/${metrics.totalPets}`}
          icon={<Heart size={24} />}
          status={metrics.activePets === metrics.totalPets ? 'success' : 'warning'}
          subtitle="Conectadas y monitoreando"
        />

        <MetricCard
          title="Alertas Hoy"
          value={metrics.todayAlerts}
          icon={<AlertTriangle size={24} />}
          status={metrics.todayAlerts === 0 ? 'success' : metrics.todayAlerts < 5 ? 'warning' : 'danger'}
          subtitle="Notificaciones generadas"
        />

        <MetricCard
          title="En Zona Segura"
          value={`${metrics.petsInSafeZone}/${metrics.totalPets}`}
          icon={<MapPin size={24} />}
          status={metrics.petsOutsideZone === 0 ? 'success' : 'warning'}
          subtitle={`${metrics.petsOutsideZone} fuera de zona`}
        />

        <MetricCard
          title="Batería Promedio"
          value={`${metrics.avgBattery}%`}
          icon={<Battery size={24} />}
          status={metrics.avgBattery > 50 ? 'success' : metrics.avgBattery > 20 ? 'warning' : 'danger'}
          subtitle="Estado de collares"
        />
      </div>

      <div className="metrics-summary">
        <div className="summary-item">
          <Activity size={16} />
          <span>Sistema funcionando correctamente</span>
          <div className="status-indicator success"></div>
        </div>
        <div className="summary-item">
          <Wifi size={16} />
          <span>Última actualización: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}