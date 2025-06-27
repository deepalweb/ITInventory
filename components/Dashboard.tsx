import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Sector, ResponsiveContainer } from 'recharts';
import { Device, Repair, DeviceStatus } from '../types';

interface DashboardProps {
  devices: Device[];
  repairs: Repair[];
}

// By casting Pie to `any`, we can bypass the incorrect TypeScript definitions from @types/recharts
// which are missing the `activeIndex` prop for creating interactive charts.
const InteractivePie = Pie as any;

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-400">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
    <div className="bg-blue-600/20 text-blue-400 p-3 rounded-full">
      {icon}
    </div>
  </div>
);

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#9ca3af">{`${value} Devices`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#6b7280">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


const Dashboard: React.FC<DashboardProps> = ({ devices, repairs }) => {
  const totalCapex = useMemo(() => devices.reduce((acc, dev) => acc + dev.cost, 0), [devices]);
  const totalOpex = useMemo(() => repairs.reduce((acc, rep) => acc + rep.cost, 0), [repairs]);

  const devicesByStatus = useMemo(() => {
    const statusCounts = devices.reduce((acc, device) => {
      acc[device.status] = (acc[device.status] || 0) + 1;
      return acc;
    }, {} as Record<DeviceStatus, number>);
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [devices]);
  
  const [activeIndex, setActiveIndex] = React.useState(0);
  const onPieEnter = (_: any, index: number) => setActiveIndex(index);
  const PIE_COLORS = {
    [DeviceStatus.InUse]: '#22c55e', // green
    [DeviceStatus.InRepair]: '#facc15', // yellow
    [DeviceStatus.InStorage]: '#3b82f6', // blue
    [DeviceStatus.Retired]: '#ef4444', // red
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-white">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Devices" value={devices.length} icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
        <StatCard title="In Repair" value={devices.filter(d => d.status === 'In Repair').length} icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>} />
        <StatCard title="Total CapEx" value={`$${totalCapex.toLocaleString()}`} icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>} />
        <StatCard title="Total OpEx" value={`$${totalOpex.toLocaleString()}`} icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4v1h-4zm-2 10v-1h4v1h-4z" /></svg>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Devices by Status</h3>
           <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <InteractivePie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={devicesByStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
                onMouseEnter={onPieEnter}
              >
                 {devicesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as DeviceStatus] || '#8884d8'} />
                ))}
              </InteractivePie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Warranty Expirations</h3>
           <p className="text-gray-400">Devices with warranty ending in the next 6 months:</p>
            <ul className="mt-4 space-y-2">
                {devices.filter(d => {
                    const warrantyDate = new Date(d.warrantyEndDate);
                    const sixMonthsFromNow = new Date();
                    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
                    return warrantyDate < sixMonthsFromNow && warrantyDate > new Date();
                }).map(d => (
                    <li key={d.id} className="flex justify-between items-center text-sm p-2 bg-gray-700/50 rounded">
                        <span>{d.name} ({d.serialNumber})</span>
                        <span className="font-mono text-red-400">{new Date(d.warrantyEndDate).toLocaleDateString()}</span>
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;