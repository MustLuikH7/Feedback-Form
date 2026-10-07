import { useEffect, useState } from "react";
import { getStaff, onUserChanged, signOut } from "../../firebase";
import LoginForm from "./LoginForm";
import Dashboard from "./Dashboard";
import "../form/form.css";
import "./teacher.css";

function TeacherPage() {
  // undefined = veel laadimas, null = välja logitud
  const [user, setUser] = useState(undefined);
  const [staff, setStaff] = useState(undefined);
  const [loadError, setLoadError] = useState(null);

  useEffect(
    () =>
      onUserChanged(async (nextUser) => {
        setLoadError(null);
        setStaff(undefined);
        setUser(nextUser);
        if (!nextUser) return;
        try {
          setStaff(await getStaff(nextUser.uid));
        } catch (error) {
          console.error(error);
          setLoadError("Konto andmete laadimine ebaõnnestus. Proovi lehte värskendada.");
        }
      }),
    [],
  );

  if (user === undefined) return <p className="muted-note">Laadin…</p>;
  if (!user) return <LoginForm />;

  if (loadError || staff === null) {
    return (
      <section className="sheet sheet-narrow" role="status">
        <h2 className="sheet-title">
          {loadError ? "Midagi läks valesti" : "Konto pole veel seotud"}
        </h2>
        <p className="done-text">
          {loadError ??
            `Oled sisse logitud kui ${user.email}, aga see konto pole veel ühegi õpetajaga seotud. Palu administraatoril konto seadistada.`}
        </p>
        <button type="button" className="button" onClick={signOut}>
          Logi välja
        </button>
      </section>
    );
  }

  if (staff === undefined) return <p className="muted-note">Laadin…</p>;

  return <Dashboard user={user} staff={staff} />;
}

export default TeacherPage;
