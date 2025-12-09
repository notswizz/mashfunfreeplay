"use client";

import { useMiniApp } from "@neynar/react";

/**
 * ContextTab component displays the current mini app context in JSON format.
 * 
 * This component provides a developer-friendly view of the Farcaster mini app context,
 * including user information, client details, and other contextual data. It's useful
 * for debugging and understanding what data is available to the mini app.
 * 
 * The context includes:
 * - User information (FID, username, display name, profile picture)
 * - Client information (safe area insets, platform details)
 * - Mini app configuration and state
 * 
 * @example
 * ```tsx
 * <ContextTab />
 * ```
 */
export function ContextTab() {
  const { context } = useMiniApp();
  
  return (
    <div className="mx-3 text-slate-100">
      <h2 className="text-lg font-semibold mb-2">Context</h2>
      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg">
        <pre className="font-mono text-xs whitespace-pre-wrap break-words w-full text-slate-100">
          {JSON.stringify(context, null, 2)}
        </pre>
      </div>
    </div>
  );
} 