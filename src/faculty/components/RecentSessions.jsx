import { useNavigate } from "react-router-dom";

function groupByDate(sessions) {
  const groups = {};

  sessions.forEach((s) => {
    const dateKey = new Date(s.startTime).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(s);
  });

  // sort sessions inside each day by hour desc
  Object.keys(groups).forEach((day) => {
    groups[day].sort(
      (a, b) => b.hourNumber - a.hourNumber
    );
  });

  return groups;
}

function formatDayLabel(dateStr) {
  const today = new Date().toDateString();
  const yesterday = new Date(
    Date.now() - 86400000
  ).toDateString();

  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return dateStr;
}

export default function RecentSessions({ sessions = [] }) {
  const navigate = useNavigate();

  if (!sessions.length) {
    return (
      <div className="card">
        <h3>Recent Sessions</h3>
        <p className="info muted">No recent sessions found</p>
      </div>
    );
  }

  const grouped = groupByDate(sessions);

  return (
    <div className="card recent-sessions">
      <h3>Recent Sessions</h3>

      {Object.entries(grouped).map(([day, daySessions]) => (
        <div key={day} className="session-day">
          <div className="session-day-label">
            {formatDayLabel(day)}
          </div>

          <ul className="session-list">
            {daySessions.map((s) => (
              <li
                key={s.sessionId}
                className="session-row"
                onClick={() =>
                  navigate(`/dashboard/session/${s.sessionId}`)
                }
              >
                <div className="session-main">
                  <span className="class-name">
                    {s.className}
                  </span>
                  <span className="hour-badge">
                    Hour {s.hourNumber}
                  </span>
                </div>

                <div className="session-meta">
                  <span
                    className={`state-pill ${s.state.toLowerCase()}`}
                  >
                    {s.state.replace("_", " ")}
                  </span>
                  <span className="time">
                    {new Date(s.startTime).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
