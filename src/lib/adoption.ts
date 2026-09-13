// Contenido compartido del proceso de adopción: la página /adopciones muestra
// estas preguntas y compromisos, y el formulario /adopciones/solicitud los usa
// para validar y armar el mensaje de WhatsApp.

export type AdoptionQuestion = {
  id: string;
  label: string;
  type: "text" | "number" | "textarea" | "yesno" | "dog";
  hint?: string;
  placeholder?: string;
};

export const ADOPTION_MIN_AGE = 18;
export const UNDECIDED_DOG = "undecided";

export const adoptionQuestions: AdoptionQuestion[] = [
  { id: "perrito", label: "¿Qué perrito quieres adoptar?", type: "dog", hint: "Envíanos una foto cuando ya estemos en comunicación." },
  { id: "ciudad", label: "¿En qué ciudad y barrio estás?", type: "text", placeholder: "Ej. Paipa, barrio El Centro" },
  { id: "edad", label: "¿Cuántos años tienes?", type: "number", placeholder: "Ej. 30" },
  { id: "personas", label: "¿Con cuántas personas vives?", type: "number", placeholder: "Ej. 3" },
  { id: "ninos", label: "¿Hay niños en casa? ¿De qué edades?", type: "textarea", placeholder: "Ej. Sí, dos niños de 6 y 10 años" },
  { id: "ocupacion", label: "Ocupación: ¿a qué te dedicas?", type: "text", placeholder: "Ej. Docente" },
  { id: "acuerdo", label: "¿Todas las personas de la casa están de acuerdo con la adopción?", type: "yesno" },
  { id: "condicion", label: "¿Alguien en casa tiene alguna condición que impida tener mascotas?", type: "yesno" },
];

// `text` se muestra en /adopciones; `statement` es lo que el adoptante acepta
// en el formulario y lo que llega por WhatsApp.
export const adoptionCommitments = [
  {
    text: "Ser mayor de edad.",
    statement: "Soy mayor de edad.",
  },
  {
    text: "Comprometerte a realizar una donación única de 2 bolsas de concentrado de 2 kg cada una (cualquier marca). Esto nos ayuda a seguir rescatando y ayudando a más perritos.",
    statement: "Me comprometo a realizar una donación única de 2 bolsas de concentrado de 2 kg cada una (cualquier marca).",
  },
  {
    text: "Comprometerte a firmar el \"Acuerdo de Adopción y Esterilización\" si la solicitud es aprobada.",
    statement: "Me comprometo a firmar el \"Acuerdo de Adopción y Esterilización\" si la solicitud es aprobada.",
  },
  {
    text: "Enviar un video del lugar donde vivirá el peludo (las zonas donde pasará la mayoría del tiempo).",
    statement: "Me comprometo a enviar un video del lugar donde vivirá el peludo (las zonas donde pasará la mayoría del tiempo).",
  },
];

export type AdoptionAnswers = Record<string, string>;

export function validateAdoptionForm(answers: AdoptionAnswers, accepted: boolean[]) {
  const errors: Record<string, string> = {};

  for (const question of adoptionQuestions) {
    if (!answers[question.id]?.trim()) errors[question.id] = "Responde esta pregunta.";
  }

  const age = Number(answers.edad);
  if (answers.edad?.trim() && (!Number.isFinite(age) || age < ADOPTION_MIN_AGE)) {
    errors.edad = `Para adoptar debes ser mayor de edad (${ADOPTION_MIN_AGE} años).`;
  }

  if (accepted.some((value) => !value)) errors.compromisos = "Debes aceptar todos los compromisos para enviar tu solicitud.";

  return errors;
}

export function buildAdoptionMessage(answers: AdoptionAnswers, dogLabel: string) {
  const lines = ["Hola, quiero adoptar. Esta es mi solicitud de adopción:", "", "*Paso 1 - Sobre mí*"];

  for (const question of adoptionQuestions) {
    const answer = question.type === "dog" ? dogLabel : answers[question.id].trim();
    lines.push(`*${question.label}*`, answer, "");
  }

  lines.push("*Paso 2 - Compromisos aceptados*");
  for (const commitment of adoptionCommitments) lines.push(`✅ ${commitment.statement}`);
  lines.push("", "Quedo atento(a) para enviar el video del lugar donde vivirá el peludo.");

  return lines.join("\n");
}
