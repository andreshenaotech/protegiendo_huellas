import type { Tables } from "@/types/database";

export type Dog = Tables<"dogs">;

export type DogValues = {
  name: string;
  description: string;
  age: string;
  size: string;
  status: string;
};

export const DEFAULT_DOG_DESCRIPTION = "Pronto agregaremos más información sobre su historia y personalidad.";

export const DOG_FIELD_LIMITS: Record<keyof DogValues, number> = {
  name: 80,
  description: 1200,
  age: 50,
  size: 80,
  status: 160,
};

export const DOGS_CACHE_TAG = "dogs";

export function normalizeDogValues(values: DogValues): DogValues {
  return {
    name: values.name.trim(),
    description: values.description.trim() || DEFAULT_DOG_DESCRIPTION,
    age: values.age.trim(),
    size: values.size.trim(),
    status: values.status.trim(),
  };
}

export function validateDogValues(values: DogValues) {
  if (!values.name || !values.age || !values.size || !values.status) {
    return "Completa nombre, edad, tamaño y estado.";
  }
  for (const field of Object.keys(DOG_FIELD_LIMITS) as (keyof DogValues)[]) {
    if (values[field].length > DOG_FIELD_LIMITS[field]) {
      return "Uno de los campos supera la longitud permitida.";
    }
  }
  return null;
}
