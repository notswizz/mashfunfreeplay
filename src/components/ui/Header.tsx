import { APP_NAME } from "~/lib/constants";
import { useMiniApp } from "@neynar/react";

export function Header() {
  const { context } = useMiniApp();

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9">
            <div className="absolute inset-0 rounded-2xl bg-primary/40 blur-xl" />
            <img
              src="/mashlogo.jpg"
              alt={APP_NAME}
              className="relative h-9 w-9 rounded-2xl border border-white/20 bg-white object-cover shadow-md"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold leading-tight text-slate-50">
              {APP_NAME}
            </span>
            <span className="text-[11px] text-slate-200 leading-tight">
              Guess the jersey number total that scores.
            </span>
          </div>
        </div>

        {context?.user?.pfpUrl && (
          <img
            src={context.user.pfpUrl}
            alt="Profile"
            className="w-6 h-6 rounded-full border border-slate-200/60 shadow-sm"
          />
        )}
      </div>
    </div>
  );
}
