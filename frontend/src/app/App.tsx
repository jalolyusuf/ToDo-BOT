import { useEffect, useState } from "react";

import { getAuthMe, getHealth, type CurrentUserResponse } from "../shared/api/client";
import { getRawInitData, telegramExpand, telegramReady } from "../shared/telegram";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; healthStatus: string }
  | { status: "authenticated"; user: CurrentUserResponse }
  | { status: "error"; message: string };

export function App() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    telegramReady();
    telegramExpand();

    getHealth()
      .then((health) => setState({ status: "ready", healthStatus: health.status }))
      .catch((error: unknown) => {
        setState({ status: "error", message: error instanceof Error ? error.message : "Health check failed" });
      });
  }, []);

  useEffect(() => {
    const initData = getRawInitData();
    if (!initData) {
      return;
    }

    getAuthMe(`tma ${initData}`)
      .then((user) => setState({ status: "authenticated", user }))
      .catch((error: unknown) => {
        setState({ status: "error", message: error instanceof Error ? error.message : "Authentication failed" });
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <section className="mx-auto flex max-w-md flex-col gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-emerald-300">Telegram Mini App</p>
          <h1 className="mt-2 text-3xl font-semibold">Telegram Task Platform</h1>
        </div>

        {state.status === "loading" && <p className="mt-2 text-lg">Loading…</p>}

        {state.status === "ready" && (
          <div className="rounded border border-slate-700 bg-slate-900 p-4">
            <p className="text-sm text-slate-300">API health</p>
            <p className="mt-2 text-lg font-medium">{state.healthStatus === "ok" ? "Ready" : "Degraded"}</p>
          </div>
        )}

        {state.status === "authenticated" && (
          <div className="rounded border border-slate-700 bg-slate-900 p-4">
            <p className="text-sm text-slate-300">Authenticated user</p>
            <p className="mt-2 text-lg font-medium">{state.user.first_name}</p>
            <p className="text-slate-400">{state.user.username ? `@${state.user.username}` : "(no username)"}</p>
          </div>
        )}

        {state.status === "error" && (
          <div className="rounded border border-rose-700 bg-rose-950/20 p-4 text-rose-200">
            <p className="text-sm font-semibold">Authentication error</p>
            <p className="mt-2 text-sm">{state.message}</p>
          </div>
        )}
      </section>
    </main>
  );
}
