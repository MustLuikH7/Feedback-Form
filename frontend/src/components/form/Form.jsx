import { useState } from "react";
import teachers from "../../../../teachers.json" with { type: "json" };
import subjects from "../../../../subjects.json" with { type: "json" };
import "./form.css";

const grades = [
  { value: "1", label: "nõrk" },
  { value: "2", label: "puudulik" },
  { value: "3", label: "rahuldav" },
  { value: "4", label: "hea" },
  { value: "5", label: "väga hea" },
];

const requiredFields = {
  selectSubjects: "Vali õppeaine, mida hindad.",
  selectTeacher: "Vali õpetaja, kes seda ainet annab.",
  grade: "Pane tunnile hinne 1–5.",
};

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p className="field-error" id={id}>
      {message}
    </p>
  );
}

function Form() {
  const [errors, setErrors] = useState({});
  const [sentGrade, setSentGrade] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const nextErrors = {};
    for (const [name, message] of Object.entries(requiredFields)) {
      if (!data.get(name)) nextErrors[name] = message;
    }
    setErrors(nextErrors);

    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      const element = event.currentTarget.elements[firstInvalid];
      (element instanceof RadioNodeList ? element[0] : element).focus();
      return;
    }

    // TODO: saada andmed backendi, kui see on valmis.
    setSentGrade(data.get("grade"));
  }

  function clearError(name) {
    if (errors[name]) setErrors({ ...errors, [name]: undefined });
  }

  function startOver() {
    setSentGrade(null);
    setErrors({});
  }

  if (sentGrade) {
    return (
      <section className="sheet sheet-done" role="status">
        <p className="done-grade" aria-hidden="true">
          <span className="grade-num is-circled">{sentGrade}</span>
        </p>
        <h2 className="done-title">Aitäh tagasiside eest!</h2>
        <p className="done-text">
          Iga vastus aitab õpetajal tunde paremaks teha. Võid hinnata ka
          mõnda teist ainet.
        </p>
        <button type="button" className="button" onClick={startOver}>
          Hinda veel üht ainet
        </button>
      </section>
    );
  }

  return (
    <form
      className="sheet"
      action="submit"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="field">
        <label className="field-label" htmlFor="subject">
          Õppeaine
        </label>
        <select
          id="subject"
          className="control control-select"
          name="selectSubjects"
          defaultValue=""
          aria-invalid={Boolean(errors.selectSubjects)}
          aria-describedby={errors.selectSubjects ? "subject-error" : undefined}
          onChange={() => clearError("selectSubjects")}
        >
          <option value="" disabled>
            Vali õppeaine
          </option>
          {subjects.map((subject) => (
            <option key={subject.name} value={subject.name}>
              {subject.name}
            </option>
          ))}
        </select>
        <FieldError id="subject-error" message={errors.selectSubjects} />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="teacher">
          Õpetaja
        </label>
        <select
          id="teacher"
          className="control control-select"
          name="selectTeacher"
          defaultValue=""
          aria-invalid={Boolean(errors.selectTeacher)}
          aria-describedby={errors.selectTeacher ? "teacher-error" : undefined}
          onChange={() => clearError("selectTeacher")}
        >
          <option value="" disabled>
            Vali õpetaja
          </option>
          {teachers.map((teacher) => (
            <option key={teacher.fullName} value={teacher.fullName}>
              {teacher.fullName}
            </option>
          ))}
        </select>
        <FieldError id="teacher-error" message={errors.selectTeacher} />
      </div>

      <fieldset
        className="field grades"
        aria-describedby={errors.grade ? "grade-error" : undefined}
      >
        <legend className="field-label">Hinne</legend>
        <div className="grades-row">
          {grades.map((grade) => (
            <div className="grade" key={grade.value}>
              <input
                className="grade-input"
                type="radio"
                id={`grade-${grade.value}`}
                name="grade"
                value={grade.value}
                onChange={() => clearError("grade")}
              />
              <label className="grade-label" htmlFor={`grade-${grade.value}`}>
                <span className="grade-num">{grade.value}</span>
                <span className="grade-word">{grade.label}</span>
              </label>
            </div>
          ))}
        </div>
        <FieldError id="grade-error" message={errors.grade} />
      </fieldset>

      <div className="field">
        <label className="field-label" htmlFor="comment">
          Kommentaar <span className="field-optional">(valikuline)</span>
        </label>
        <textarea
          id="comment"
          className="control control-textarea"
          name="kommentaar"
          rows="4"
          placeholder="Mis töötas hästi? Mida võiks teisiti teha?"
        />
      </div>

      <fieldset className="field">
        <legend className="field-label">
          Sinu nimi <span className="field-optional">(valikuline)</span>
        </legend>
        <p className="field-hint" id="name-hint">
          Jäta tühjaks, kui soovid vastata anonüümselt.
        </p>
        <div className="name-row">
          <div className="field">
            <label className="field-sublabel" htmlFor="first-name">
              Eesnimi
            </label>
            <input
              id="first-name"
              className="control"
              type="text"
              name="firstName"
              autoComplete="given-name"
              aria-describedby="name-hint"
            />
          </div>
          <div className="field">
            <label className="field-sublabel" htmlFor="last-name">
              Perekonnanimi
            </label>
            <input
              id="last-name"
              className="control"
              type="text"
              name="lastName"
              autoComplete="family-name"
              aria-describedby="name-hint"
            />
          </div>
        </div>
      </fieldset>

      <button type="submit" className="button">
        Saada tagasiside
      </button>
    </form>
  );
}
export default Form;
