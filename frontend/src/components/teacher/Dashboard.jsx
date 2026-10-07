import { useEffect, useMemo, useState } from "react";
import { deleteFeedback, listFeedback, signOut } from "../../firebase";
import StaffAdmin from "./StaffAdmin";

const gradeWords = {
  1: "nõrk",
  2: "puudulik",
  3: "rahuldav",
  4: "hea",
  5: "väga hea",
};

const dateFormat = new Intl.DateTimeFormat("et", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function Summary({ entries }) {
  const counts = [5, 4, 3, 2, 1].map((grade) => ({
    grade,
    count: entries.filter((entry) => entry.grade === grade).length,
  }));
  const max = Math.max(1, ...counts.map(({ count }) => count));
  const average =
    entries.reduce((sum, entry) => sum + entry.grade, 0) / (entries.length || 1);

  return (
    <section className="sheet summary" aria-label="Kokkuvõte">
      <div className="summary-stats">
        <p className="stat">
          <span className="stat-value">
            {entries.length
              ? average.toLocaleString("et", { maximumFractionDigits: 1 })
              : "–"}
          </span>
          <span className="stat-label">keskmine hinne</span>
        </p>
        <p className="stat">
          <span className="stat-value">{entries.length}</span>
          <span className="stat-label">
            {entries.length === 1 ? "vastus" : "vastust"}
          </span>
        </p>
      </div>
      <ul className="bars">
        {counts.map(({ grade, count }) => (
          <li className="bar" key={grade}>
            <span className="bar-grade">{grade}</span>
            <span className="bar-track">
              <span
                className="bar-fill"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </span>
            <span className="bar-count">{count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FeedbackCard({ entry, showTeacher, onDelete }) {
  const name = [entry.firstName, entry.lastName].filter(Boolean).join(" ");
  return (
    <li className="sheet entry">
      <p className="entry-grade" aria-label={`Hinne ${entry.grade}`}>
        <span className="grade-num is-circled">{entry.grade}</span>
      </p>
      <div className="entry-body">
        <p className="entry-meta">
          <span className="entry-subject">{entry.subject}</span>
          {showTeacher && <span>{entry.teacher}</span>}
          <span>{gradeWords[entry.grade]}</span>
          {entry.createdAt && (
            <time dateTime={entry.createdAt.toISOString()}>
              {dateFormat.format(entry.createdAt)}
            </time>
          )}
        </p>
        {entry.comment ? (
          <p className="entry-comment">{entry.comment}</p>
        ) : (
          <p className="entry-comment is-empty">Kommentaari ei lisatud.</p>
        )}
        <p className="entry-author">{name || "Anonüümne"}</p>
      </div>
      {onDelete && (
        <button
          type="button"
          className="link-button entry-delete"
          onClick={() => onDelete(entry)}
        >
          Kustuta
        </button>
      )}
    </li>
  );
}

function Dashboard({ user, staff }) {
  const isAdmin = staff.role === "admin";
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(null);
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");

  useEffect(() => {
    listFeedback(staff)
      .then(setEntries)
      .catch((loadError) => {
        console.error(loadError);
        setError("Tagasiside laadimine ebaõnnestus. Proovi lehte värskendada.");
      });
  }, [staff]);

  const teachers = useMemo(
    () => [...new Set((entries ?? []).map((entry) => entry.teacher))].sort(),
    [entries],
  );
  const byTeacher = (entries ?? []).filter(
    (entry) => !teacher || entry.teacher === teacher,
  );
  const subjects = [...new Set(byTeacher.map((entry) => entry.subject))].sort();
  const visible = byTeacher.filter(
    (entry) => !subject || entry.subject === subject,
  );

  async function handleDelete(entry) {
    if (!window.confirm("Kas kustutada see tagasiside jäädavalt?")) return;
    try {
      await deleteFeedback(entry.id);
      setEntries((current) => current.filter((item) => item.id !== entry.id));
    } catch (deleteError) {
      console.error(deleteError);
      window.alert("Kustutamine ebaõnnestus.");
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-bar">
        <p className="muted-note">
          {isAdmin ? "Administraator" : staff.teacher} · {user.email}
        </p>
        <button type="button" className="link-button" onClick={signOut}>
          Logi välja
        </button>
      </div>

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {!entries && !error && <p className="muted-note">Laadin tagasisidet…</p>}

      {entries && (
        <>
          <div className="filters">
            {isAdmin && (
              <div className="field">
                <label className="field-label" htmlFor="filter-teacher">
                  Õpetaja
                </label>
                <select
                  id="filter-teacher"
                  className="control control-select"
                  value={teacher}
                  onChange={(event) => {
                    setTeacher(event.target.value);
                    setSubject("");
                  }}
                >
                  <option value="">Kõik õpetajad</option>
                  {teachers.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="field">
              <label className="field-label" htmlFor="filter-subject">
                Õppeaine
              </label>
              <select
                id="filter-subject"
                className="control control-select"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              >
                <option value="">Kõik ained</option>
                {subjects.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Summary entries={visible} />

          {visible.length ? (
            <ul className="entries">
              {visible.map((entry) => (
                <FeedbackCard
                  key={entry.id}
                  entry={entry}
                  showTeacher={isAdmin && !teacher}
                  onDelete={isAdmin ? handleDelete : null}
                />
              ))}
            </ul>
          ) : (
            <p className="muted-note">Tagasisidet veel pole.</p>
          )}
        </>
      )}

      {isAdmin && <StaffAdmin currentUid={user.uid} />}
    </div>
  );
}

export default Dashboard;
