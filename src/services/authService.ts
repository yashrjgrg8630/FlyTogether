import type { AuthResponse, LoginPayload, RegisterPayload, User } from "@/types";
import { api, ApiError, call } from "./api";
import { currentUser, mockToken, uid, users } from "./mockDb";

export const authService = {
  login: (p: LoginPayload) =>
    call<AuthResponse>(
      () => {
        const u = users.find(
          (x) => x.email.toLowerCase() === p.email.toLowerCase() && x.password === p.password,
        );
        if (!u) throw new ApiError(401, "Invalid email or password");
        const { password: _p, ...user } = u;
        return { access_token: mockToken(user), user };
      },
      async () => (await api.post("/auth/login", p)).data,
    ),
  register: (p: RegisterPayload) =>
    call<AuthResponse>(
      () => {
        if (users.some((x) => x.email.toLowerCase() === p.email.toLowerCase()))
          throw new ApiError(409, "An account with this email already exists");
        const user: User = {
          id: uid("u"),
          full_name: p.full_name,
          email: p.email,
          role: "traveller",
        };
        users.push({ ...user, password: p.password });
        return { access_token: mockToken(user), user };
      },
      async () => (await api.post("/auth/register", p)).data,
    ),
  me: () => call<User>(currentUser, async () => (await api.get("/users/me")).data),
};
