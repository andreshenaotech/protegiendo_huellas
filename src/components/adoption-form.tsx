"use client";

import { type FormEvent, useEffect, useState } from "react";
import { ChatIcon } from "@/components/icons";
import {
  ADOPTION_MIN_AGE,
  type AdoptionAnswers,
  adoptionCommitments,
  adoptionQuestions,
  buildAdoptionMessage,
  UNDECIDED_DOG,
  validateAdoptionForm,
} from "@/lib/adoption";
import { whatsappUrl } from "@/lib/contact";
import { readStoredFavorites } from "@/lib/favorites";

type AdoptionFormProps = {
  dogs: { id: number; name: string }[];
};

const initialAnswers = Object.fromEntries(adoptionQuestions.map((question) => [question.id, ""])) as AdoptionAnswers;

export function AdoptionForm({ dogs }: AdoptionFormProps) {
  const [answers, setAnswers] = useState<AdoptionAnswers>(initialAnswers);
  const [accepted, setAccepted] = useState<boolean[]>(() => adoptionCommitments.map(() => false));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => new Set());

  // Lee los favoritos y preselecciona el perrito cuando se llega desde su ficha
  // (?perrito=<id>). Se hace en el navegador para que la página siga siendo estática.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavoriteIds(readStoredFavorites());
    const dogId = new URLSearchParams(window.location.search).get("perrito");
    if (dogId && dogs.some((dog) => String(dog.id) === dogId)) {
      setAnswers((current) => ({ ...current, perrito: dogId }));
    }
  }, [dogs]);

  const updateAnswer = (id: string, value: string) => {
    setAnswers((current) => ({ ...current, [id]: value }));
    if (errors[id]) setErrors((current) => ({ ...current, [id]: "" }));
  };

  const toggleCommitment = (index: number) => {
    setAccepted((current) => current.map((value, i) => (i === index ? !value : value)));
    if (errors.compromisos) setErrors((current) => ({ ...current, compromisos: "" }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateAdoptionForm(answers, accepted);
    setErrors(validation);

    const firstError = Object.keys(validation).find((key) => validation[key]);
    if (firstError) {
      document.getElementById(`adoption-${firstError}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const dogLabel = answers.perrito === UNDECIDED_DOG
      ? "Aún no lo he decidido"
      : dogs.find((dog) => String(dog.id) === answers.perrito)?.name ?? answers.perrito;

    window.location.href = whatsappUrl(buildAdoptionMessage(answers, dogLabel));
  };

  const hasErrors = Object.values(errors).some(Boolean);
  // Los favoritos marcados en el catálogo aparecen primero en el selector.
  const favoriteDogs = dogs.filter((dog) => favoriteIds.has(dog.id));
  const otherDogs = dogs.filter((dog) => !favoriteIds.has(dog.id));

  return (
    <form className="adoption-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="adoption-fieldset">
        <legend><span>Paso 1</span>Cuéntanos sobre ti</legend>

        {adoptionQuestions.map((question) => {
          const fieldId = `adoption-${question.id}`;
          const error = errors[question.id];
          const describedBy = [question.hint ? `${fieldId}-hint` : "", error ? `${fieldId}-error` : ""].filter(Boolean).join(" ") || undefined;

          return (
            <div className={`adoption-field${error ? " has-error" : ""}`} key={question.id} id={fieldId}>
              {question.type === "yesno" ? (
                <fieldset className="adoption-choice" aria-describedby={describedBy}>
                  <legend>{question.label}</legend>
                  <div>
                    {["Sí", "No"].map((option) => (
                      <label key={option}>
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(event) => updateAnswer(question.id, event.target.value)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : (
                <>
                  <label htmlFor={`${fieldId}-input`}>{question.label}</label>
                  {question.type === "textarea" && (
                    <textarea
                      id={`${fieldId}-input`}
                      rows={3}
                      maxLength={400}
                      placeholder={question.placeholder}
                      value={answers[question.id]}
                      aria-invalid={Boolean(error)}
                      aria-describedby={describedBy}
                      onChange={(event) => updateAnswer(question.id, event.target.value)}
                    />
                  )}
                  {(question.type === "text" || question.type === "number") && (
                    <input
                      id={`${fieldId}-input`}
                      type={question.type === "number" ? "number" : "text"}
                      inputMode={question.type === "number" ? "numeric" : undefined}
                      min={question.id === "edad" ? ADOPTION_MIN_AGE : question.type === "number" ? 1 : undefined}
                      maxLength={question.type === "text" ? 160 : undefined}
                      placeholder={question.placeholder}
                      value={answers[question.id]}
                      aria-invalid={Boolean(error)}
                      aria-describedby={describedBy}
                      onChange={(event) => updateAnswer(question.id, event.target.value)}
                    />
                  )}
                  {question.type === "dog" && (
                    <select
                      id={`${fieldId}-input`}
                      value={answers[question.id]}
                      aria-invalid={Boolean(error)}
                      aria-describedby={describedBy}
                      onChange={(event) => updateAnswer(question.id, event.target.value)}
                    >
                      <option value="">Elige un perrito</option>
                      {favoriteDogs.length > 0 ? (
                        <>
                          <optgroup label="Tus favoritos">
                            {favoriteDogs.map((dog) => <option key={dog.id} value={dog.id}>{dog.name}</option>)}
                          </optgroup>
                          <optgroup label="Todos los perritos">
                            {otherDogs.map((dog) => <option key={dog.id} value={dog.id}>{dog.name}</option>)}
                          </optgroup>
                        </>
                      ) : (
                        otherDogs.map((dog) => <option key={dog.id} value={dog.id}>{dog.name}</option>)
                      )}
                      <option value={UNDECIDED_DOG}>Aún no lo he decidido</option>
                    </select>
                  )}
                </>
              )}
              {question.hint && <small id={`${fieldId}-hint`}>{question.hint}</small>}
              {error && <p className="adoption-error" id={`${fieldId}-error`}>{error}</p>}
            </div>
          );
        })}
      </fieldset>

      <fieldset className={`adoption-fieldset${errors.compromisos ? " has-error" : ""}`} id="adoption-compromisos">
        <legend><span>Paso 2</span>Tus compromisos como adoptante</legend>
        <p className="adoption-fieldset-copy">Te hacemos las preguntas y te pedimos un video no para complicarte, sino para asegurarnos de que tu peludo estará seguro y feliz.</p>

        <div className="adoption-commitments">
          {adoptionCommitments.map((commitment, index) => (
            <label className="adoption-commitment" key={commitment.statement}>
              <input type="checkbox" checked={accepted[index]} onChange={() => toggleCommitment(index)} />
              <span>{commitment.statement}</span>
            </label>
          ))}
        </div>
        {errors.compromisos && <p className="adoption-error">{errors.compromisos}</p>}
      </fieldset>

      <div className="adoption-submit">
        {hasErrors && <p className="adoption-error" role="alert">Revisa los campos marcados antes de enviar.</p>}
        <button className="btn btn-primary" type="submit">
          Enviar solicitud por WhatsApp <ChatIcon />
        </button>
        <small>Se abrirá WhatsApp con tu solicitud lista para enviar. Solo tienes que presionar enviar.</small>
      </div>
    </form>
  );
}
