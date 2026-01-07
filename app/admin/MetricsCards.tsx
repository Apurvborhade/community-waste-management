import { FileText, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const metrics = [
  {
    id: 1,
    title: 'Total Reports Logged',
    value: '1,247',
    trend: '+12%',
    trendUp: true,
    icon: FileText,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 2,
    title: 'Unresolved Reports',
    value: '87',
    trend: '-8%',
    trendUp: false,
    icon: AlertCircle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  {
    id: 3,
    title: 'Reports Resolved',
    value: '1,160',
    trend: '+15%',
    trendUp: true,
    icon: CheckCircle2,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 4,
    title: 'Avg Resolution Time',
    value: '4.2 hrs',
    trend: '-3%',
    trendUp: false,
    icon: Clock,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
];

export function MetricsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.id}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${metric.iconBg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${metric.iconColor}`} />
              </div>
              <span
                className={`text-sm font-medium ${
                  metric.trendUp ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {metric.trend}
              </span>
            </div>
            
            <div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {metric.value}
              </p>
              <p className="text-sm text-gray-600">{metric.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
