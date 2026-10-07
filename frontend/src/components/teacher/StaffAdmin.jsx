import { useEffect, useState } from "react";
import teachers from "../../../../teachers.json" with { type: "json" };
import { createStaffAccount, listStaff } from "../../firebase";

const errorMessages = {
  "auth/email-already-in-use": "Selle e-posti aadressiga konto on juba olemas.",
  "auth/invalid-email": "E-posti aadress pole korrektne.",
  "permission-denied": "Sul pole õigust kontosid lisada.",
};

function StaffAdmin({ currentUid }) {
  const [staff, setStaff] = useState(null);
  const [email, setEmail] = useState("");
  const [teacher, setTeacher] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listStaff()
      .then(setStaff)
      .catch((loadError) => {
        console.error(loadError);
        setError("Kontode laadimine ebaõnnestus.");
      });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError("Sisesta õpetaja e-posti aadress.");
      return;
    }
    if (!teacher && !isAdmin) {
      setError("Vali õpetaja, kelle tagasisidet konto näeb.");
      return;
    }
    setBusy(true);
    try {
      const account = {
        email: email.trim(),
        teacher: teacher || null,
        role: isAdmin ? "admin" : "teacher",
      };
      await createStaffAccount(account);
      setStaff(await listStaff());
      setNotice(
        `Konto loodud. Aadressile ${account.email} saadeti link parooli määramiseks.`,
      );
      setEmail("");
      setTeacher("");
      setIsAdmin(false);
    } catch (createError) {
      console.error(createError);
      setError(
        errorMessages[createError.code] ?? "Konto loomine ebaõnnestus. Proovi uuesti.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin" aria-labelledby="admin-title">
      <h2 className="section-title" id="admin-title">
        Kontod
      </h2>

      <form className="sheet" noValidate onSubmit={handleSubmit}>
        <h3 className="sheet-title">Lisa õpetaja</h3>
        <div className="name-row">
          <div className="field">
            <label className="field-label" htmlFor="staff-email">
              E-posti aadress
            </label>
            <input
              id="staff-email"
              className="control"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="staff-teacher">
              Õpetaja
            </label>
            <select
              id="staff-teacher"
              className="control control-select"
              value={teacher}
              onChange={(event) => setTeacher(event.target.value)}
            >
              <option value="">{isAdmin ? "Pole seotud" : "Vali õpetaja"}</option>
              {teachers.map(({ fullName }) => (
                <option key={fullName} value={fullName}>
                  {fullName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={(event) => setIsAdmin(event.target.checked)}
          />
          Administraator (näeb kogu tagasisidet ja saab kontosid lisada)
        </label>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="field-hint" role="status">
            {notice}
          </p>
        )}
        <button type="submit" className="button" disabled={busy}>
          {busy ? "Loon kontot…" : "Loo konto"}
        </button>
      </form>

      {staff && (
        <table className="sheet staff-table">
          <thead>
            <tr>
              <th scope="col">E-post</th>
              <th scope="col">Õpetaja</th>
              <th scope="col">Roll</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((account) => (
              <tr key={account.id}>
                <td>
                  {account.email}
                  {account.id === currentUid && (
                    <span className="muted-note"> (sina)</span>
                  )}
                </td>
                <td>{account.teacher ?? "–"}</td>
                <td>{account.role === "admin" ? "Administraator" : "Õpetaja"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default StaffAdmin;
