import RecentSessions from "./RecentSessions.jsx";

export default function OverviewPanel({ faculty, user, sessions = [], classes = [] }) {
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const safeClasses = Array.isArray(classes) ? classes : [];

  const today = new Date().toDateString();

  const stats = {
    totalSessions: safeSessions.length,
    todaySessions: safeSessions.filter(
      (s) => new Date(s.startTime).toDateString() === today
    ).length,
    activeSessions: safeSessions.filter(
      (s) => s.state !== "CLOSED"
    ).length,
    classes: safeClasses.length,
  };

  return (
    <>
      <h1>Welcome, {user.email}</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sessions</h3>
          <p>{stats.totalSessions}</p>
        </div>

        <div className="stat-card">
          <h3>Sessions Today</h3>
          <p>{stats.todaySessions}</p>
        </div>

        <div className="stat-card">
          <h3>Active Sessions</h3>
          <p>{stats.activeSessions}</p>
        </div>

        <div className="stat-card">
          <h3>Classes</h3>
          <p>{stats.classes}</p>
        </div>
      </div>

      {/* <RecentSessions sessions={safeSessions.slice(0, 20)} /> */}
      <RecentSessions sessions={safeSessions} />
    </>
  );
}
