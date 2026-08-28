import { apiClient, authHeader } from "@/lib/api/client";
import { toApiError } from "@/lib/api/errors";

export interface CurrentUser {
  id: number;
  clerk_id: string;
  role: "admin" | "manager" | "customer";
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * `GET /api/user` — the signed-in user's row, including the `role` that
 * `/redirect-after-login` routes on. The role lives in our database, not in
 * Clerk; Clerk only proves identity.
 */
export async function fetchCurrentUser(token: string): Promise<CurrentUser> {
  try {
    const { data } = await apiClient.get<CurrentUser>("/user", {
      headers: authHeader(token),
    });
    return data;
  } catch (error) {
    throw toApiError(error);
  }
}
