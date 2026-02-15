import { useMemo } from "react";
import { useNavigate ,useLocation} from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppColors, AppSpacing, AppRadius } from "../../shared/constants";

export default function SemesterAttendance() {
  const navigate = useNavigate();
  const location = useLocation();
  const attendanceMap = location.state?.attendanceMap || {};

  /* ===================== DATE HELPERS ===================== */

  const formatDate = (date) =>
    `${date.getDate().toString().padStart(2, "0")}/${
      (date.getMonth() + 1).toString().padStart(2, "0")
    }/${date.getFullYear()}`;

  const normalize = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const semesterDatesTillToday = useMemo(() => {
    const today = normalize(new Date());
    const year = today.getFullYear();

    const start =
      today.getMonth() + 1 <= 5
        ? new Date(year, 0, 1) // Jan 1
        : new Date(year, 6, 1); // Jul 1

    const dates = [];
    for (
      let d = today;
      d >= start;
      d = new Date(d.getTime() - 86400000)
    ) {
      dates.push(new Date(d));
    }
    return dates;
  }, []);

  /* ===================== UI ===================== */

  return (
    <div style={styles.page}>
      <header style={styles.appBar}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft/>
        </button>
        <h2 style={styles.title}>Semester Attendance</h2>
      </header>

      <div style={styles.list}>
        {semesterDatesTillToday.map((date) => {
          const key = formatDate(date);
          const dayData = attendanceMap[key] || {};

          return (
            <div key={key} style={styles.card}>
              <div style={styles.date}>{key}</div>

              <div style={styles.hours}>
                {Array.from({ length: 8 }).map((_, i) => {
                  const status = dayData[i + 1];
                  const color = statusColor(status);

                  return (
                    <div
                      key={i}
                      style={{
                        ...styles.hour,
                        background: color,
                        color:
                          color === "#e5e7eb"
                            ? "#555"
                            : "#fff",
                      }}
                    >
                      H{i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===================== STATUS COLOR ===================== */

function statusColor(status) {
  switch (status) {
    case "PRESENT":
      return "green";
    case "ABSENT":
      return "red";
    default:
      return "#e5e7eb"; // grey
  }
}


const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg,#7E9DD7,#A3CDD9,#BBC9E4,#7AA4C2,#6595E7)",
    padding: AppSpacing.md,
  },
  appBar: {
    display: "flex",
    alignItems: "center",
    marginBottom: AppSpacing.lg,
  },
  backBtn: {
    background: "none",
    border: "none",
    fontSize: 20,
    marginRight: 8,
    cursor: "pointer",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: AppSpacing.sm,
  },
  card: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: AppRadius.lg,
    padding: AppSpacing.md,
  },
  date: {
    fontSize: 15,
    fontWeight: 600,
    color: AppColors.darkText,
  },
  hours: {
    marginTop: AppSpacing.sm,
    display: "flex",
    justifyContent: "space-between",
  },
  hour: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    fontSize: 9,
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
