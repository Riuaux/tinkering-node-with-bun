import { minLength, object, pipe, string, type InferInput } from "valibot";

export const CharacterSchema = object({
  name: pipe(string(), minLength(6)),
  lastName: pipe(string(), minLength(6)),
});

export type Character = InferInput<typeof CharacterSchema> & { id: number };

/**
 * ? Using map to leverage logic to: If found -> update, if not -> create.
 */
const characters: Map<string, Character> = new Map();

export const getAllCharacters = (): Character[] => {
  return Array.from(characters.values());
};

export const getCharacterById = (id: number): Character | undefined => {
  return characters.get(id.toString());
};

export const addCharacter = (character: Character): Character => {
  if (characters.has(character.id.toString())) {
    console.error(`Character with id ${character.id} already exists`);
    return character;
  }

  const newCharacter = {
    ...character,
    id: new Date().getTime(),
  };

  characters.set(newCharacter.id.toString(), newCharacter);

  return newCharacter;
};

export const updateCharacter = (
  id: number,
  updatedCharacter: Character
): Character | null => {
  if (!characters.has(id.toString())) {
    console.error(`Character with id ${id} not found.`);
    return null;
  }

  characters.set(id.toString(), updatedCharacter);
  return updatedCharacter;
};

export const deleteCharacter = (id: number): boolean => {
  if (!characters.has(id.toString())) {
    console.log(`Character with id ${id} can't be deleted because not found`);
    return false;
  }

  characters.delete(id.toString());
  return true;
};

