const TOKEN_NAME = "token";
const tokenStorage = localStorage;

export const Token = {
  getToken() {
    return tokenStorage.getItem(TOKEN_NAME);
  },
  removeToken() {
    return tokenStorage.removeItem(TOKEN_NAME);
  },
};
