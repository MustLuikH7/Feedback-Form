// Kirjutab teachers.json ja subjects.json nimed firestore.rules faili, et
// reeglid lubaksid ainult olemasolevaid õpetajaid ja õppeaineid.
import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (file) => JSON.parse(readFileSync(new URL(file, root), "utf8"));

const teachers = read("teachers.json").map((teacher) => teacher.fullName);
const subjects = read("subjects.json").map((subject) => subject.name);

function listFunction(name, values) {
  const items = values
    .map((value) => `        ${JSON.stringify(value).replaceAll("'", "\\'")},`)
    .join("\n");
  return `    function ${name}(value) {\n      return value in [\n${items}\n      ];\n    }`;
}

const begin = "    // BEGIN GENERATED LISTS";
const end = "    // END GENERATED LISTS";
const rulesUrl = new URL("firestore.rules", root);
const rules = readFileSync(rulesUrl, "utf8");
const start = rules.indexOf(begin);
const stop = rules.indexOf(end);
if (start === -1 || stop === -1) {
  throw new Error("firestore.rules: generated list markers not found");
}

const generated = [
  begin,
  listFunction("isKnownTeacher", teachers),
  "",
  listFunction("isKnownSubject", subjects),
  end,
].join("\n");

writeFileSync(rulesUrl, rules.slice(0, start) + generated + rules.slice(stop + end.length));
console.log(`firestore.rules: ${teachers.length} teachers, ${subjects.length} subjects`);
