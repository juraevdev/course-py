import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getAuthState, type SessionUser } from "./auth";

/** Layout/sahifa uchun: stale cookie → tozalash, aks holda login. */
export async function requirePageUser(role: Role): Promise<SessionUser> {
  const state = await getAuthState(role);

  if (state.status === "ok") return state.user;
  if (state.status === "stale") redirect("/auth/clear");
  if (state.status === "forbidden") {
    redirect(state.user.role === Role.TEACHER ? "/teacher" : "/student");
  }
  redirect("/login");
}

export async function redirectIfAuthed() {
  const state = await getAuthState();
  if (state.status === "stale") redirect("/auth/clear");
  if (state.status === "ok") {
    redirect(state.user.role === Role.TEACHER ? "/teacher" : "/student");
  }
}
