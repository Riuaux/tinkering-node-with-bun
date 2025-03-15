import type { IncomingMessage, ServerResponse } from "http";
import {
  addRevokeToken,
  authSchema,
  createUser,
  findUserByEmail,
  HttpMethod,
  revokeUserToken,
  validatePassword,
} from "../models";
import { parseBody } from "../utils/parseBody";
import { safeParse } from "valibot";
import { sign } from "jsonwebtoken";
import config from "../token";
import type { AuthenticatedRequest } from "../middleware/authentication";

export const authRouter = async (req: IncomingMessage, res: ServerResponse) => {
  const { method, url } = req;

  if (url === "/auth/register" && method === HttpMethod.POST) {
    const body = await parseBody(req);
    const result = safeParse(authSchema, body);

    if (result.issues) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "Bad Request" }));
      return;
    }

    const { email, password } = body;

    try {
      const user = await createUser(email, password);

      res.statusCode = 201;
      res.end(JSON.stringify(user));
    } catch (err) {
      res.statusCode = 500;
      if (err instanceof Error) {
        res.end(JSON.stringify({ message: err.message }));
      } else {
        res.end(JSON.stringify({ message: "Internal Server Error" }));
      }
    }
  }

  if (url === "/auth/login" && method === HttpMethod.POST) {
    const body = await parseBody(req);
    const result = safeParse(authSchema, body);

    if (result.issues) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "Bad Request" }));
      return;
    }

    const { email, password } = body;

    try {
      const user = findUserByEmail(email);

      if (!user || !(await validatePassword(user, password))) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: "Invalid email or password" }));
        return;
      }

      const accessToken = sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        config.jwtSecret,
        { expiresIn: "1h" }
      );

      const refreshToken = sign(
        {
          id: user.id,
        },
        config.jwtSecret,
        { expiresIn: "1d" }
      );

      user.refreshToken = refreshToken;

      res.end(JSON.stringify({ accessToken, refreshToken }));
    } catch (err) {
      res.statusCode = 500;
      if (err instanceof Error) {
        res.end(JSON.stringify({ message: err.message }));
      } else {
        res.end(JSON.stringify({ message: "Internal Server Error" }));
      }
    }
  }

  if (url === "/auth/logout" && method === HttpMethod.POST) {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (token) {
      addRevokeToken(token);

      const formattedRequest = req as AuthenticatedRequest;

      if (
        formattedRequest.user &&
        typeof formattedRequest.user === "object" &&
        "id" in formattedRequest.user
      ) {
        const result = revokeUserToken(formattedRequest.user.email);

        if (!result) {
          req.statusCode = 403;
          res.end(JSON.stringify({ message: "Forbidden" }));
          return;
        }
      }

      res.end(JSON.stringify({ message: "Logged out" }));
      return;
    }
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ message: "Endpoint Not Found" }));
};

