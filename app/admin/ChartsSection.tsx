import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const reportsOverTime = [
  { month: 'Jan', reports: 85 },
  { month: 'Feb', reports: 92 },
  { month: 'Mar', reports: 78 },
  { month: 'Apr', reports: 105 },
  { month: 'May', reports: 118 },
  { month: 'Jun', reports: 142 },
  { month: 'Jul', reports: 156 },
  { month: 'Aug', reports: 134 },
  { month: 'Sep', reports: 128 },
  { month: 'Oct', reports: 145 },
  { month: 'Nov', reports: 132 },
  { month: 'Dec', reports: 122 },
];

// Updated with Pune Regions
const affectedAreas = [
  { area: 'Kothrud', count: 245 },
  { area: 'Hinjewadi', count: 189 },
  { area: 'Hadapsar', count: 167 },
  { area: 'Baner', count: 143 },
  { area: 'Viman Nagar', count: 128 },
  { area: 'Shivajinagar', count: 115 },
];

export function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Chart 1: Reports Over Time */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Reports Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={reportsOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              stroke="#e5e7eb"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              stroke="#e5e7eb"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="reports" 
              stroke="#0F7A20" 
              strokeWidth={3}
              dot={{ fill: '#0F7A20', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: Most Affected Areas (Pune) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Most Affected Areas (Pune)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={affectedAreas} 
            layout="vertical" // Changed to vertical for better readability of region names
            margin={{ left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis 
              type="number"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              stroke="#e5e7eb"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="category"
              dataKey="area" 
              tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
              stroke="#e5e7eb"
              width={100}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#f9fafb' }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            <Bar 
              dataKey="count" 
              fill="#0F7A20"
              radius={[0, 8, 8, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}