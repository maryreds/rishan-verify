"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type SessionRow = {
  id: string;
  session_token: string;
  visitor_id: string | null;
  ip: string | null;
  user_agent: string | null;
  country: string | null;
  city: string | null;
  referrer: string | null;
  started_at: string;
  last_seen_at: string;
};

export type PageViewRow = {
  id: string;
  session_id: string;
  path: string;
  entered_at: string;
  last_heartbeat_at: string;
  duration_seconds: number;
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h}h ${rm}m` : `${h}h`;
}

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

function formatBrowser(ua: string | null): string {
  if (!ua) return "Unknown";
  if (/iPhone|iPad/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua)) return "Safari";
  return "Browser";
}

export default function VisitorsClient({
  sessions,
  views,
}: {
  sessions: SessionRow[];
  views: PageViewRow[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const viewsBySession = useMemo(() => {
    const m = new Map<string, PageViewRow[]>();
    for (const v of views) {
      const list = m.get(v.session_id) ?? [];
      list.push(v);
      m.set(v.session_id, list);
    }
    return m;
  }, [views]);

  const visitorIds = useMemo(() => {
    const set = new Set<string>();
    for (const s of sessions) if (s.visitor_id) set.add(s.visitor_id);
    return Array.from(set).sort();
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    if (filter === "all") return sessions;
    if (filter === "tagged") return sessions.filter((s) => s.visitor_id);
    if (filter === "anonymous") return sessions.filter((s) => !s.visitor_id);
    return sessions.filter((s) => s.visitor_id === filter);
  }, [sessions, filter]);

  // Per-visitor stats (only for tagged visitors)
  const visitorStats = useMemo(() => {
    const stats = new Map<
      string,
      {
        sessions: number;
        totalSeconds: number;
        firstSeen: string;
        lastSeen: string;
        topPaths: Map<string, number>;
      }
    >();
    for (const s of sessions) {
      if (!s.visitor_id) continue;
      const sessionViews = viewsBySession.get(s.id) ?? [];
      const totalForSession = sessionViews.reduce(
        (a, v) => a + (v.duration_seconds || 0),
        0
      );
      const cur = stats.get(s.visitor_id) ?? {
        sessions: 0,
        totalSeconds: 0,
        firstSeen: s.started_at,
        lastSeen: s.last_seen_at,
        topPaths: new Map<string, number>(),
      };
      cur.sessions += 1;
      cur.totalSeconds += totalForSession;
      if (s.started_at < cur.firstSeen) cur.firstSeen = s.started_at;
      if (s.last_seen_at > cur.lastSeen) cur.lastSeen = s.last_seen_at;
      for (const v of sessionViews) {
        cur.topPaths.set(
          v.path,
          (cur.topPaths.get(v.path) ?? 0) + (v.duration_seconds || 0)
        );
      }
      stats.set(s.visitor_id, cur);
    }
    return stats;
  }, [sessions, viewsBySession]);

  const selectedSession = selected
    ? sessions.find((s) => s.id === selected)
    : null;
  const selectedViews = selected ? viewsBySession.get(selected) ?? [] : [];

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/visitors/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Visitors</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {sessions.length} sessions tracked
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.refresh()}
              className="text-sm rounded-lg border border-neutral-300 px-3 py-1.5 hover:bg-neutral-50"
            >
              Refresh
            </button>
            <button
              onClick={logout}
              className="text-sm rounded-lg border border-neutral-300 px-3 py-1.5 hover:bg-neutral-50"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {visitorIds.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Tagged visitors
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visitorIds.map((vid) => {
                const stats = visitorStats.get(vid);
                if (!stats) return null;
                const topPaths = Array.from(stats.topPaths.entries())
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3);
                return (
                  <div
                    key={vid}
                    className="rounded-2xl bg-white border border-neutral-200 p-5 shadow-sm"
                  >
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-bold text-lg capitalize">{vid}</h3>
                      <span className="text-xs text-neutral-500">
                        {relativeTime(stats.lastSeen)}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <div className="text-neutral-500 text-xs">Visits</div>
                        <div className="font-semibold">{stats.sessions}</div>
                      </div>
                      <div>
                        <div className="text-neutral-500 text-xs">Total time</div>
                        <div className="font-semibold">
                          {formatDuration(stats.totalSeconds)}
                        </div>
                      </div>
                    </div>
                    {topPaths.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-neutral-100">
                        <div className="text-neutral-500 text-xs uppercase tracking-wider mb-2">
                          Most viewed
                        </div>
                        <ul className="space-y-1">
                          {topPaths.map(([path, secs]) => (
                            <li
                              key={path}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="font-mono text-xs truncate">
                                {path}
                              </span>
                              <span className="text-neutral-500 text-xs">
                                {formatDuration(secs)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
              All sessions
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`text-xs rounded-full px-3 py-1 border ${
                  filter === "all"
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("tagged")}
                className={`text-xs rounded-full px-3 py-1 border ${
                  filter === "tagged"
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                Tagged
              </button>
              <button
                onClick={() => setFilter("anonymous")}
                className={`text-xs rounded-full px-3 py-1 border ${
                  filter === "anonymous"
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                Anonymous
              </button>
              {visitorIds.map((vid) => (
                <button
                  key={vid}
                  onClick={() => setFilter(vid)}
                  className={`text-xs rounded-full px-3 py-1 border capitalize ${
                    filter === vid
                      ? "bg-emerald-800 text-white border-emerald-800"
                      : "bg-white border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {vid}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Visitor</th>
                  <th className="text-left px-4 py-3 font-semibold">Started</th>
                  <th className="text-left px-4 py-3 font-semibold">Last seen</th>
                  <th className="text-left px-4 py-3 font-semibold">Pages</th>
                  <th className="text-left px-4 py-3 font-semibold">Time</th>
                  <th className="text-left px-4 py-3 font-semibold">Where</th>
                  <th className="text-left px-4 py-3 font-semibold">Browser</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((s) => {
                  const sViews = viewsBySession.get(s.id) ?? [];
                  const total = sViews.reduce(
                    (a, v) => a + (v.duration_seconds || 0),
                    0
                  );
                  const isOpen = selected === s.id;
                  return (
                    <Fragment key={s.id}>
                      <tr
                        onClick={() => setSelected(isOpen ? null : s.id)}
                        className={`border-t border-neutral-100 cursor-pointer hover:bg-neutral-50 ${
                          isOpen ? "bg-emerald-50/40" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          {s.visitor_id ? (
                            <span className="inline-block bg-emerald-100 text-emerald-900 text-xs font-semibold rounded-full px-2.5 py-0.5 capitalize">
                              {s.visitor_id}
                            </span>
                          ) : (
                            <span className="text-neutral-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {relativeTime(s.started_at)}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {relativeTime(s.last_seen_at)}
                        </td>
                        <td className="px-4 py-3 font-semibold">{sViews.length}</td>
                        <td className="px-4 py-3 font-semibold">
                          {formatDuration(total)}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {[s.city, s.country].filter(Boolean).join(", ") || "—"}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {formatBrowser(s.user_agent)}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-emerald-50/30">
                          <td colSpan={7} className="px-6 py-5">
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-600">
                                {s.referrer && (
                                  <div>
                                    <span className="text-neutral-400">From: </span>
                                    <span className="font-mono">{s.referrer}</span>
                                  </div>
                                )}
                                {s.ip && (
                                  <div>
                                    <span className="text-neutral-400">IP: </span>
                                    <span className="font-mono">{s.ip}</span>
                                  </div>
                                )}
                                {s.user_agent && (
                                  <div className="truncate max-w-2xl">
                                    <span className="text-neutral-400">UA: </span>
                                    <span className="font-mono">
                                      {s.user_agent}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <ol className="space-y-1.5">
                                {(viewsBySession.get(s.id) ?? []).map((v, i) => (
                                  <li
                                    key={v.id}
                                    className="flex items-center gap-3 text-sm"
                                  >
                                    <span className="text-neutral-400 text-xs w-5 text-right">
                                      {i + 1}.
                                    </span>
                                    <span className="font-mono">{v.path}</span>
                                    <span className="text-neutral-400 text-xs">
                                      {formatDuration(v.duration_seconds || 0)}
                                    </span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                {filteredSessions.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-neutral-400 text-sm"
                    >
                      No sessions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
