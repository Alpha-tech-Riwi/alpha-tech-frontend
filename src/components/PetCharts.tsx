import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { sensorAPI } from '../lib/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PetChartsProps {
  readonly petId: string;
}

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
} as const;

export default function PetCharts({ petId }: PetChartsProps) {
  const { data: sensorHistory } = useQuery({
    queryKey: ['sensor-history', petId],
    queryFn: () => sensorAPI.getPetData(petId, 50).then(res => res.data),
    refetchInterval: 30000,
  });

  if (!sensorHistory?.length) {
    return (
      <div className="charts-container">
        <div className="no-data">
          <p>No historical data available</p>
        </div>
      </div>
    );
  }

  const labels = sensorHistory.map((_, index) => `${index + 1}`);
  
  const heartRateData = {
    labels,
    datasets: [
      {
        label: 'Heart Rate (bpm)',
        data: sensorHistory.map(d => d.heartRate),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const temperatureData = {
    labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: sensorHistory.map(d => d.temperature),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const activityData = {
    labels,
    datasets: [
      {
        label: 'Activity Level',
        data: sensorHistory.map(d => d.activityLevel),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };

  const batteryData = {
    labels,
    datasets: [
      {
        label: 'Battery (%)',
        data: sensorHistory.map(d => d.batteryLevel),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="charts-container">
      <h2>Analytics Dashboard</h2>
      
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Heart Rate Trend</h3>
          <div className="chart-wrapper">
            <Line data={heartRateData} options={CHART_OPTIONS} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Temperature Monitoring</h3>
          <div className="chart-wrapper">
            <Line data={temperatureData} options={CHART_OPTIONS} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Activity Levels</h3>
          <div className="chart-wrapper">
            <Bar data={activityData} options={CHART_OPTIONS} />
          </div>
        </div>

        <div className="chart-card">
          <h3>Battery Status</h3>
          <div className="chart-wrapper">
            <Line data={batteryData} options={CHART_OPTIONS} />
          </div>
        </div>
      </div>
    </div>
  );
}