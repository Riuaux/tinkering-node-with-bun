const revokedTokens: Set<string> = new Set();

export const addRevokeToken = (token: string): void => {
  revokedTokens.add(token);
};

export const isTokenRevoked = (token: string): boolean => {
  return revokedTokens.has(token);
};

