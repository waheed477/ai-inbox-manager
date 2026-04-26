import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Mail, AlertCircle, Star, Brain, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false); // ✅ Changed to false for instant render

  useEffect(() => {
    // Background data fetch - doesn't block rendering
    apiRequest('/api/dashboard/stats')
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const iconMap: Record<string, any> = { Brain, AlertCircle, Mail };

  // ✅ No loading spinner - page renders instantly with placeholder data

  return (
    <div className="bg-white h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Overview of your inbox activity</p>
        </div>

        {/* Stats Cards - Shows 0 while loading, then updates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Emails</p>
            </div>
            <p className="text-2xl font-bold text-zinc-900">{stats?.totalEmails || 0}</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-amber-50 p-2 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Unread</p>
            </div>
            <p className="text-2xl font-bold text-zinc-900">{stats?.unreadCount || 0}</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-yellow-50 p-2 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Starred</p>
            </div>
            <p className="text-2xl font-bold text-zinc-900">{stats?.starredCount || 0}</p>
          </div>
        </div>

        {/* Recent Activity - Shows skeleton while loading */}
        {!stats ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-400" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-zinc-200 rounded-lg animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-3/4 bg-zinc-200 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-12 bg-zinc-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : stats?.activities?.length > 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-400" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {stats.activities.map((activity: any, i: number) => {
                const Icon = iconMap[activity.icon] || Mail;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-1.5 rounded-lg">
                      <Icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-900">{activity.text}</p>
                    </div>
                    <span className="text-xs text-zinc-400">{activity.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Categories & AI Usage - Shows placeholders while loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!stats ? (
            <>
              {/* Categories placeholder */}
              <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-zinc-900 mb-3">Email Categories</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-4 w-20 bg-zinc-200 rounded animate-pulse" />
                      <div className="h-4 w-8 bg-zinc-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
              {/* AI Usage placeholder */}
              <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-zinc-900 mb-3">AI Usage</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse" />
                      <div className="h-4 w-12 bg-zinc-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {stats?.categories?.length > 0 && (
                <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-zinc-900 mb-3">Email Categories</h3>
                  <div className="space-y-2">
                    {stats.categories.map((cat: any) => (
                      <div key={cat.category} className="flex items-center justify-between">
                        <span className="text-sm text-zinc-700">{cat.category}</span>
                        <span className="text-sm font-medium text-zinc-900">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {stats?.aiUsage?.length > 0 && (
                <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-zinc-900 mb-3">AI Usage</h3>
                  <div className="space-y-2">
                    {stats.aiUsage.map((item: any) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-sm text-zinc-700">{item.label}</span>
                        <span className="text-sm font-semibold text-zinc-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}