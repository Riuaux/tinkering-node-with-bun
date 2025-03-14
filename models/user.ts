import { compare, hash } from "bcrypt";
import {
  email,
  minLength,
  object,
  pipe,
  string,
  type InferInput,
} from "valibot";

const emailSchema = pipe(string(), email());
const passwordSchema = pipe(string(), minLength(6));

export const authSchema = object({
  email: emailSchema,
  password: passwordSchema,
});

export enum Role {
  "ADMIN" = "admin",
  "USER" = "user",
}

export type User = InferInput<typeof authSchema> & {
  id: number;
  role: Role;
  refreshToken?: string;
};

const users: Map<string, User> = new Map();

/**
 * Creates a new user with given email and pass.
 * Pass must be hashed before storing.
 *
 * @param {string} email - The User email.
 * @param {string} password - The User password.
 * @returns {Promise<User>} - The brand new User as promise.
 */
export const createUser = async (
  email: string,
  password: string
): Promise<User> => {
  const hashedPassword = await hash(password, 10);

  const newUser: User = {
    id: Date.now(),
    email,
    password: hashedPassword,
    role: Role.USER,
  };

  users.set(email, newUser);
  return newUser;
};

/**
 * Finds a User by the given email.
 * Change to async when DB connection is implemented.
 *
 * @param {string} email: The target User's email.
 * @return {User | undefined} - The User if found, undefined otherwise.
 */
export const findUserByEmail = (email: string): User | undefined => {
  return users.get(email);
};

/**
 * Validates a User's password.
 *
 * @param {User} user - User whom password will be validated.
 * @param {string} password - The password to validate.
 * @returns {Promise<boolean>} - True if password is valid, false otherwise.
 */
export const validatePassword = async (
  user: User,
  password: string
): Promise<boolean> => {
  return compare(password, user.password);
};

/**
 * Revokes a User's token.
 *
 * @param {string} email - The User's email whom token will be revoked
 * @return {boolean} - True if token's succesfully revoked, false otherwise.
 */
export const revokeUserToken = (email: string): boolean => {
  const foundUser = users.get(email);
  if (!foundUser) return false;

  users.set(email, { ...foundUser, refreshToken: undefined });
  return true;
};

