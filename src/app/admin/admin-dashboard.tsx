"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CurrentAdmin } from "@/lib/auth";
import { deleteDog as deleteDogAction, removeDogImage, setDogAdopted } from "@/lib/dog-actions";
import { DOG_FIELD_LIMITS, type Dog, type DogValues, isAdopted } from "@/lib/dog-content";
import { submitDog, validateDogImageFile } from "@/lib/dog-editor";
import { getDogImageUrl } from "@/lib/dog-images";
import { createClient } from "@/lib/supabase/client";

type AdminDashboardProps = {
  admin: CurrentAdmin;
  initialDogs: Dog[];
};

type DogFormState = DogValues;

type Notice = {
  type: "success" | "error";
  text: string;
} | null;

const emptyDogForm: DogFormState = {
  name: "",
  description: "",
  age: "",
  size: "",
  status: "",
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function AdminDashboard({ admin, initialDogs }: AdminDashboardProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dogs, setDogs] = useState(initialDogs);
  const [dogForm, setDogForm] = useState<DogFormState>(emptyDogForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dogBusy, setDogBusy] = useState(false);
  const [dogNotice, setDogNotice] = useState<Notice>(null);
  const [search, setSearch] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminNotice, setAdminNotice] = useState<Notice>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<Notice>(null);

  const filteredDogs = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es");
    if (!term) return dogs;
    return dogs.filter((dog) =>
      [dog.name, dog.age, dog.size, dog.status, isAdopted(dog) ? "adoptado" : "en adopción"]
        .join(" ")
        .toLocaleLowerCase("es")
        .includes(term),
    );
  }, [dogs, search]);

  const availableCount = dogs.filter((dog) => !isAdopted(dog)).length;

  const editingDog = editingId === null
    ? null
    : dogs.find((dog) => dog.id === editingId) ?? null;

  const resetDogForm = () => {
    setDogForm(emptyDogForm);
    setImageFile(null);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateDogField = (field: keyof DogFormState, value: string) => {
    setDogForm((current) => ({ ...current, [field]: value }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setDogNotice(null);
    if (!file) {
      setImageFile(null);
      return;
    }
    const validationError = validateDogImageFile(file);
    if (validationError) {
      setDogNotice({ type: "error", text: validationError });
      event.target.value = "";
      setImageFile(null);
      return;
    }
    setImageFile(file);
  };

  const handleDogSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDogNotice(null);
    setDogBusy(true);

    const result = await submitDog({ id: editingId, values: dogForm, imageFile });

    setDogBusy(false);
    if (!result.ok || !result.dog) {
      setDogNotice({ type: "error", text: result.ok ? "No fue posible guardar la información." : result.error });
      return;
    }

    const savedDog = result.dog;
    if (editingId === null) {
      setDogs((current) => [savedDog, ...current]);
      setDogNotice({ type: "success", text: `${savedDog.name} fue agregado correctamente.` });
    } else {
      setDogs((current) => current.map((dog) => dog.id === savedDog.id ? savedDog : dog));
      setDogNotice({ type: "success", text: `${savedDog.name} fue actualizado correctamente.` });
    }
    resetDogForm();
  };

  const removeCurrentImage = async () => {
    if (!editingDog?.image_path) return;

    const confirmed = window.confirm(
      `¿Eliminar la imagen actual de ${editingDog.name}? Podrás subir otra después.`,
    );
    if (!confirmed) return;

    setDogBusy(true);
    setDogNotice(null);
    const result = await removeDogImage(editingDog.id).catch(() => null);
    setDogBusy(false);

    if (!result?.ok || !result.dog) {
      setDogNotice({ type: "error", text: result && !result.ok ? result.error : "No fue posible quitar la imagen de la ficha." });
      return;
    }

    const updatedDog = result.dog;
    setDogs((current) => current.map((dog) => dog.id === updatedDog.id ? updatedDog : dog));
    setDogNotice({ type: "success", text: `La imagen de ${updatedDog.name} fue eliminada.` });
  };

  const startEditing = (dog: Dog) => {
    setEditingId(dog.id);
    setDogForm({
      name: dog.name,
      description: dog.description ?? "",
      age: dog.age,
      size: dog.size,
      status: dog.status,
    });
    setImageFile(null);
    setDogNotice(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const deleteDog = async (dog: Dog) => {
    const confirmed = window.confirm(`¿Eliminar a ${dog.name}? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    setDogBusy(true);
    setDogNotice(null);
    const result = await deleteDogAction(dog.id).catch(() => null);
    setDogBusy(false);

    if (!result?.ok) {
      setDogNotice({ type: "error", text: `No fue posible eliminar a ${dog.name}.` });
      return;
    }

    setDogs((current) => current.filter((item) => item.id !== dog.id));
    if (editingId === dog.id) resetDogForm();
    setDogNotice({ type: "success", text: `${dog.name} fue eliminado.` });
  };

  const toggleAdopted = async (dog: Dog) => {
    const adopt = !isAdopted(dog);
    const confirmed = window.confirm(adopt
      ? `¿Marcar a ${dog.name} como adoptado? Pasará a la sección "Ya encontraron un hogar".`
      : `¿Devolver a ${dog.name} a la lista de perritos en adopción?`);
    if (!confirmed) return;

    setDogBusy(true);
    setDogNotice(null);
    const result = await setDogAdopted(dog.id, adopt).catch(() => null);
    setDogBusy(false);

    if (!result?.ok || !result.dog) {
      setDogNotice({ type: "error", text: result && !result.ok ? result.error : "No fue posible actualizar el estado de adopción." });
      return;
    }

    const updatedDog = result.dog;
    setDogs((current) => current.map((item) => item.id === updatedDog.id ? updatedDog : item));
    setDogNotice({
      type: "success",
      text: adopt ? `${dog.name} fue marcado como adoptado.` : `${dog.name} volvió a la lista de adopción.`,
    });
  };

  const createAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAdminNotice(null);

    if (adminPassword.length < 10) {
      setAdminNotice({ type: "error", text: "La contraseña debe tener al menos 10 caracteres." });
      return;
    }
    if (adminPassword !== adminPasswordConfirm) {
      setAdminNotice({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }

    setAdminBusy(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const result = await response.json() as { error?: string; admin?: { email: string } };
      if (!response.ok) throw new Error(result.error || "No fue posible crear el administrador.");

      setAdminEmail("");
      setAdminPassword("");
      setAdminPasswordConfirm("");
      setAdminNotice({ type: "success", text: `${result.admin?.email ?? "El administrador"} ya puede ingresar.` });
    } catch (error) {
      setAdminNotice({ type: "error", text: getErrorMessage(error, "No fue posible crear el administrador.") });
    } finally {
      setAdminBusy(false);
    }
  };

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordNotice(null);

    if (newPassword.length < 10) {
      setPasswordNotice({ type: "error", text: "La nueva contraseña debe tener al menos 10 caracteres." });
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setPasswordNotice({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }

    setPasswordBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordNotice({ type: "error", text: "No fue posible cambiar la contraseña." });
    } else {
      setNewPassword("");
      setNewPasswordConfirm("");
      setPasswordNotice({ type: "success", text: "La contraseña fue actualizada." });
    }
    setPasswordBusy(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div className="admin-shell admin-header-inner">
          <Link className="admin-brand" href="/">
            <Image src="/logo.png" alt="" width={58} height={58} />
            <span><strong>Protegiendo Huellas</strong><small>Panel administrativo</small></span>
          </Link>
          <div className="admin-session">
            <span><strong>{admin.email}</strong><small>{admin.role === "superadmin" ? "Superadministradora" : "Administradora"}</small></span>
            <button className="admin-text-button" type="button" onClick={logout}>Cerrar sesión</button>
          </div>
        </div>
      </header>

      <div className="admin-shell admin-content">
        <section className="admin-intro">
          <div>
            <p className="admin-kicker">Gestión de adopciones</p>
            <h1>Historias que esperan una familia</h1>
            <p>Actualiza la información y las fotografías que aparecen en la landing.</p>
          </div>
          <div className="admin-count-card"><strong>{availableCount}</strong><span>en adopción · {dogs.length - availableCount} adoptados</span></div>
        </section>

        <div className="admin-workspace">
          <section className="admin-panel admin-dog-form-panel" ref={formRef}>
            <div className="admin-panel-heading">
              <div>
                <p className="admin-kicker">{editingId === null ? "Nuevo registro" : "Editando ficha"}</p>
                <h2>{editingId === null ? "Agregar un perro" : `Editar a ${dogForm.name}`}</h2>
              </div>
              {editingId !== null && <button className="admin-text-button" type="button" onClick={resetDogForm}>Cancelar</button>}
            </div>

            <form className="admin-form" onSubmit={handleDogSubmit}>
              <label className="admin-field">
                <span>Nombre</span>
                <input required maxLength={DOG_FIELD_LIMITS.name} value={dogForm.name} onChange={(event) => updateDogField("name", event.target.value)} />
              </label>
              <label className="admin-field">
                <span>Descripción</span>
                <textarea rows={5} maxLength={DOG_FIELD_LIMITS.description} placeholder="Cuenta un poco sobre su historia y personalidad." value={dogForm.description} onChange={(event) => updateDogField("description", event.target.value)} />
                <small>Si la dejas vacía, se agregará automáticamente el texto informativo predeterminado.</small>
              </label>
              <div className="admin-field-row">
                <label className="admin-field">
                  <span>Edad</span>
                  <input required maxLength={DOG_FIELD_LIMITS.age} placeholder="Ej. 3 años" value={dogForm.age} onChange={(event) => updateDogField("age", event.target.value)} />
                </label>
                <label className="admin-field">
                  <span>Tamaño</span>
                  <input required maxLength={DOG_FIELD_LIMITS.size} placeholder="Ej. Mediana" value={dogForm.size} onChange={(event) => updateDogField("size", event.target.value)} />
                </label>
              </div>
              <label className="admin-field">
                <span>Estado</span>
                <input required maxLength={DOG_FIELD_LIMITS.status} placeholder="Ej. Esterilizada y vacunada" value={dogForm.status} onChange={(event) => updateDogField("status", event.target.value)} />
                <small>Es un texto libre: esterilizado, castrado, vacunado u otra información.</small>
              </label>
              {editingDog?.image_path && (
                <div className="admin-current-image">
                  <div className="admin-current-image-thumb">
                    <Image src={getDogImageUrl(editingDog.image_path)!} alt={`Imagen actual de ${editingDog.name}`} fill sizes="72px" />
                  </div>
                  <div className="admin-current-image-copy">
                    <strong>Imagen actual</strong>
                    <span>Puedes reemplazarla eligiendo otra o eliminarla ahora.</span>
                  </div>
                  <button className="admin-remove-image" type="button" onClick={removeCurrentImage} disabled={dogBusy}>
                    Eliminar imagen
                  </button>
                </div>
              )}
              <label className="admin-field admin-file-field">
                <span>{editingId === null ? "Imagen" : "Nueva imagen"}</span>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
                <small>{imageFile ? imageFile.name : editingId === null ? "JPG, PNG o WebP. Se optimiza automáticamente." : "Déjalo vacío para conservar la imagen actual."}</small>
              </label>
              {dogNotice && <p className={`admin-message ${dogNotice.type}`} role="status">{dogNotice.text}</p>}
              <button className="btn btn-primary admin-submit" type="submit" disabled={dogBusy}>
                {dogBusy ? "Guardando…" : editingId === null ? "Agregar perro" : "Guardar cambios"}
              </button>
            </form>
          </section>

          <section className="admin-panel admin-dog-list-panel">
            <div className="admin-panel-heading admin-list-heading">
              <div><p className="admin-kicker">Landing page</p><h2>Perros publicados</h2></div>
              <label className="admin-search"><span className="sr-only">Buscar perros</span><input type="search" placeholder="Buscar…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
            </div>
            <p className="admin-result-count">{filteredDogs.length} {filteredDogs.length === 1 ? "resultado" : "resultados"}</p>
            <div className="admin-dog-list">
              {filteredDogs.map((dog) => {
                const imageUrl = getDogImageUrl(dog.image_path);
                const adopted = isAdopted(dog);
                return (
                  <article className={`admin-dog-row${adopted ? " is-adopted" : ""}`} key={dog.id}>
                    <div className={`admin-dog-thumb${imageUrl ? " has-image" : ""}`}>
                      {imageUrl ? <Image src={imageUrl} alt={`Foto de ${dog.name}`} fill sizes="76px" /> : <span>Foto<br />pendiente</span>}
                    </div>
                    <div className="admin-dog-summary">
                      <h3>{dog.name}{adopted && <em className="admin-adopted-badge">Adoptado</em>}</h3>
                      <p>{dog.age} · {dog.size}</p>
                      <span>{dog.status}</span>
                    </div>
                    <div className="admin-row-actions">
                      <button type="button" onClick={() => startEditing(dog)} disabled={dogBusy}>Editar</button>
                      <button type="button" onClick={() => toggleAdopted(dog)} disabled={dogBusy}>{adopted ? "Devolver a adopción" : "Marcar adoptado"}</button>
                      <button className="danger" type="button" onClick={() => deleteDog(dog)} disabled={dogBusy}>Eliminar</button>
                    </div>
                  </article>
                );
              })}
              {filteredDogs.length === 0 && <div className="admin-empty"><strong>No hay coincidencias.</strong><span>Prueba con otro nombre, edad, tamaño o estado.</span></div>}
            </div>
          </section>
        </div>

        <section className="admin-account-section">
          <div className="admin-section-heading">
            <p className="admin-kicker">Seguridad y equipo</p>
            <h2>Accesos administrativos</h2>
          </div>
          <div className="admin-account-grid">
            {admin.role === "superadmin" && (
              <section className="admin-panel">
                <div className="admin-panel-heading"><div><p className="admin-kicker">Solo superadmin</p><h3>Crear administrador</h3></div></div>
                <p className="admin-panel-copy">Esta cuenta podrá agregar, editar y eliminar perros, pero no podrá crear otros administradores.</p>
                <form className="admin-form" onSubmit={createAdmin}>
                  <label className="admin-field"><span>Correo electrónico</span><input type="email" autoComplete="off" required value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} /></label>
                  <label className="admin-field"><span>Contraseña temporal</span><input type="password" autoComplete="new-password" minLength={10} required value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} /></label>
                  <label className="admin-field"><span>Confirmar contraseña</span><input type="password" autoComplete="new-password" minLength={10} required value={adminPasswordConfirm} onChange={(event) => setAdminPasswordConfirm(event.target.value)} /></label>
                  {adminNotice && <p className={`admin-message ${adminNotice.type}`} role="status">{adminNotice.text}</p>}
                  <button className="btn btn-primary admin-submit" type="submit" disabled={adminBusy}>{adminBusy ? "Creando…" : "Crear administrador"}</button>
                </form>
              </section>
            )}

            <section className="admin-panel">
              <div className="admin-panel-heading"><div><p className="admin-kicker">Mi cuenta</p><h3>Cambiar contraseña</h3></div></div>
              <p className="admin-panel-copy">Actualiza la contraseña de la cuenta con la que tienes la sesión iniciada.</p>
              <form className="admin-form" onSubmit={changePassword}>
                <label className="admin-field"><span>Nueva contraseña</span><input type="password" autoComplete="new-password" minLength={10} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
                <label className="admin-field"><span>Confirmar nueva contraseña</span><input type="password" autoComplete="new-password" minLength={10} required value={newPasswordConfirm} onChange={(event) => setNewPasswordConfirm(event.target.value)} /></label>
                {passwordNotice && <p className={`admin-message ${passwordNotice.type}`} role="status">{passwordNotice.text}</p>}
                <button className="btn btn-outline admin-submit" type="submit" disabled={passwordBusy}>{passwordBusy ? "Actualizando…" : "Cambiar contraseña"}</button>
              </form>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
