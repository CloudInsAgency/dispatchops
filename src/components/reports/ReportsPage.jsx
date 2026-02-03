import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FiBarChart2, FiTrendingUp, FiClock, FiCheckCircle, FiUsers, FiCalendar, FiDownload, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ReportsPage = () => {
  const { userProfile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!userProfile?.companyId) { setLoading(false); return; }
    const jobsRef = collection(db, 'companies', userProfile.companyId, 'jobs');
    const q = query(jobsRef, orderBy('createdAt', 'desc'));
    const unsub1 = onSnapshot(q, (snap) => {
      setJobs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    const techsRef = collection(db, 'companies', userProfile.companyId, 'technicians');
    const unsub2 = onSnapshot(techsRef, (snap) => {
      setTechs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsub1(); unsub2(); };
  }, [userProfile]);

  const filteredJobs = useMemo(() => {
    if (dateRange === 'all') return jobs;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(dateRange));
    return jobs.filter(j => {
      const created = j.createdAt?.toDate ? j.createdAt.toDate() : new Date(j.createdAt);
      return created >= cutoff;
    });
  }, [jobs, dateRange]);

  const stats = useMemo(() => {
    const total = filteredJobs.length;
    const completed = filteredJobs.filter(j => j.status === 'completed').length;
    const inProgress = filteredJobs.filter(j => j.status === 'in_progress').length;
    const enRoute = filteredJobs.filter(j => j.status === 'en_route').length;
    const scheduled = filteredJobs.filter(j => j.status === 'scheduled').length;
    const unassigned = filteredJobs.filter(j => j.status === 'unassigned').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const highPriority = filteredJobs.filter(j => j.priority === 'high').length;
    return { total, completed, inProgress, enRoute, scheduled, unassigned, completionRate, highPriority };
  }, [filteredJobs]);

  const techPerformance = useMemo(() => {
    const perf = {};
    techs.forEach(t => { perf[t.name] = { name: t.name, total: 0, completed: 0, inProgress: 0, status: t.status || 'available' }; });
    filteredJobs.forEach(j => {
      const name = j.assignedToName;
      if (name && perf[name]) {
        perf[name].total++;
        if (j.status === 'completed') perf[name].completed++;
        if (j.status === 'in_progress' || j.status === 'en_route') perf[name].inProgress++;
      }
    });
    return Object.values(perf).sort((a, b) => b.total - a.total);
  }, [filteredJobs, techs]);

  const jobTypeBreakdown = useMemo(() => {
    const types = {};
    filteredJobs.forEach(j => {
      const t = j.jobType || 'Unspecified';
      types[t] = (types[t] || 0) + 1;
    });
    return Object.entries(types).sort((a, b) => b[1] - a[1]);
  }, [filteredJobs]);

  const priorityBreakdown = useMemo(() => {
    const p = { high: 0, medium: 0, low: 0 };
    filteredJobs.forEach(j => { const pr = j.priority || 'medium'; if (p[pr] !== undefined) p[pr]++; });
    return p;
  }, [filteredJobs]);

  const weeklyTrend = useMemo(() => {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date(); start.setDate(start.getDate() - (i + 1) * 7);
      const end = new Date(); end.setDate(end.getDate() - i * 7);
      const weekJobs = filteredJobs.filter(j => {
        const d = j.createdAt?.toDate ? j.createdAt.toDate() : new Date(j.createdAt);
        return d >= start && d < end;
      });
      const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      weeks.push({ label, total: weekJobs.length, completed: weekJobs.filter(j => j.status === 'completed').length });
    }
    return weeks;
  }, [filteredJobs]);

  const exportCSV = () => {
    const headers = ['Job ID', 'Customer', 'Address', 'Type', 'Priority', 'Status', 'Technician', 'Created', 'Scheduled'];
    const rows = filteredJobs.map(j => [
      j.id,
      j.customerName || '',
      j.address || '',
      j.jobType || '',
      j.priority || '',
      j.status || '',
      j.assignedToName || 'Unassigned',
      j.createdAt?.toDate ? j.createdAt.toDate().toLocaleDateString() : '',
      j.scheduledDateTime ? new Date(j.scheduledDateTime).toLocaleDateString() : ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'dispatch-report.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported!');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'technicians', label: 'Tech Performance', icon: FiUsers },
    { id: 'jobs', label: 'Job Breakdown', icon: FiCheckCircle },
  ];

  const StatCard = ({ icon: Icon, label, value, sub, color = 'text-primary-600', bgColor = 'bg-primary-50' }) => (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`h-12 w-12 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const BarSimple = ({ value, max, color = 'bg-primary-500' }) => (
    <div className="w-full bg-gray-100 rounded-full h-3">
      <div className={`${color} h-3 rounded-full transition-all`} style={{ width: max > 0 ? `${(value / max) * 100}%` : '0%' }} />
    </div>
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-600">Loading reports...</div></div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Track job performance and technician productivity</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
            <FiDownload className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === tab.id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard icon={FiBarChart2} label="Total Jobs" value={stats.total} sub={`${dateRange === 'all' ? 'All time' : 'Last ' + dateRange + ' days'}`} />
            <StatCard icon={FiCheckCircle} label="Completed" value={stats.completed} sub={`${stats.completionRate}% completion rate`} color="text-green-600" bgColor="bg-green-50" />
            <StatCard icon={FiTrendingUp} label="In Progress" value={stats.inProgress + stats.enRoute} sub={`${stats.enRoute} en route, ${stats.inProgress} active`} color="text-blue-600" bgColor="bg-blue-50" />
            <StatCard icon={FiAlertTriangle} label="Unassigned" value={stats.unassigned} sub={`${stats.highPriority} high priority total`} color="text-orange-600" bgColor="bg-orange-50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Trend</h3>
              <div className="space-y-4">
                {weeklyTrend.map((w, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Week of {w.label}</span>
                      <span className="font-medium">{w.total} jobs ({w.completed} done)</span>
                    </div>
                    <BarSimple value={w.total} max={Math.max(...weeklyTrend.map(x => x.total), 1)} />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: 'Completed', value: stats.completed, color: 'bg-green-500' },
                  { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-500' },
                  { label: 'En Route', value: stats.enRoute, color: 'bg-purple-500' },
                  { label: 'Scheduled', value: stats.scheduled, color: 'bg-yellow-500' },
                  { label: 'Unassigned', value: stats.unassigned, color: 'bg-gray-400' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{s.label}</span>
                      <span className="font-medium">{s.value}</span>
                    </div>
                    <BarSimple value={s.value} max={stats.total || 1} color={s.color} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'technicians' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Technician Performance</h3>
            <p className="text-sm text-gray-500 mt-1">Job assignments and completion rates per technician</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Jobs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {techPerformance.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No technicians found</td></tr>
                ) : techPerformance.map((t, i) => {
                  const rate = t.total > 0 ? Math.round((t.completed / t.total) * 100) : 0;
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{t.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${t.status === 'available' ? 'bg-green-100 text-green-800' : t.status === 'busy' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{t.status}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{t.total}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">{t.completed}</td>
                      <td className="px-6 py-4 text-blue-600">{t.inProgress}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24"><BarSimple value={rate} max={100} color={rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'} /></div>
                          <span className="text-sm font-medium">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">By Job Type</h3>
            {jobTypeBreakdown.length === 0 ? (
              <p className="text-gray-500 text-sm">No jobs found in this period</p>
            ) : (
              <div className="space-y-3">
                {jobTypeBreakdown.map(([type, count]) => (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{type}</span>
                      <span className="font-medium">{count} ({stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%)</span>
                    </div>
                    <BarSimple value={count} max={jobTypeBreakdown[0]?.[1] || 1} color="bg-primary-500" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">By Priority</h3>
            <div className="space-y-3">
              {[
                { label: 'High', value: priorityBreakdown.high, color: 'bg-red-500' },
                { label: 'Medium', value: priorityBreakdown.medium, color: 'bg-yellow-500' },
                { label: 'Low', value: priorityBreakdown.low, color: 'bg-green-500' },
              ].map(p => (
                <div key={p.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{p.label}</span>
                    <span className="font-medium">{p.value}</span>
                  </div>
                  <BarSimple value={p.value} max={stats.total || 1} color={p.color} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
