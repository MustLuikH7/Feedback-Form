import { useState } from "react";
import { resetPassword, signIn } from "../../firebase";

const errorMessages = {
  "auth/invalid-credential": "Vale e-posti aadress või parool.",
  "auth/invalid-email": "E-posti aadress pole korrektne.",
  "auth/user-disabled": "See konto on suletud.",
  "auth/too-many-requests": "Liiga palju katseid. Proovi mõne aja pärast uuesti.",
  "auth/network-request-failed": "Võrguühendus puudub. Proovi uuesti.",
};

function messageFor(error) {
  return errorMessages[error.code] ?? "Sisselogimine ebaõnnestus. Proovi uuesti.";
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (!email || !password) {
      setError("Sisesta e-posti aadress ja parool.");
      return;
    }
    setBusy(true);
    try {
      await signIn(email.trim(), password);
    } catch (signInError) {
      setError(messageFor(signInError));
      setBusy(false);
    }
  }

  async function handleReset() {
    setError(null);
    setNotice(null);
    if (!email) {
      setError("Sisesta esmalt oma e-posti aadress.");
      return;
    }
    try {
      await resetPassword(email.trim());
    } catch (resetError) {
      if (resetError.code !== "auth/user-not-found") {
        setError(messageFor(resetError));
        return;
      }
    }
    setNotice("Kui selle aadressiga konto on olemas, saatsime sinna parooli muutmise lingi.");
  }

  return (
    <form className="sheet sheet-narrow" noValidate onSubmit={handleSubmit}>
      <h2 className="sheet-title">Logi sisse</h2>

      <div className="field">
        <label className="field-label" htmlFor="login-email">
          E-posti aadress
        </label>
        <input
          id="login-email"
          className="control"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="login-password">
          Parool
        </label>
        <input
          id="login-password"
          className="control"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

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

      <div className="actions-row">
        <button type="submit" className="button" disabled={busy}>
          {busy ? "Login sisse…" : "Logi sisse"}
        </button>
        <button type="button" className="link-button" onClick={handleReset}>
          Unustasid parooli?
        </button>
      </div>
    </form>
  );
}

export default LoginForm;
