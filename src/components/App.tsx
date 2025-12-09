"use client";

import { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import { Header } from "~/components/ui/Header";
import { HomeTab, PastGuessesTab, AdminTab } from "~/components/ui/tabs";

export interface AppProps {
  title?: string;
}

/**
 * App component serves as the main container for the mini app interface.
 * 
 * This component orchestrates the overall mini app experience by:
 * - Managing tab navigation and state
 * - Handling Farcaster mini app initialization
 * - Coordinating wallet and context state
 * - Providing error handling and loading states
 * - Rendering the appropriate tab content based on user selection
 * 
 * The component integrates with the Neynar SDK for Farcaster functionality
 * and Wagmi for wallet management. It provides a complete mini app
 * experience with multiple tabs for different functionality areas.
 * 
 * Features:
 * - Tab-based navigation (Home, Actions, Context, Wallet)
 * - Farcaster mini app integration
 * - Wallet connection management
 * - Error handling and display
 * - Loading states for async operations
 * 
 * @param props - Component props
 * @param props.title - Optional title for the mini app (defaults to "Neynar Starter Kit")
 * 
 * @example
 * ```tsx
 * <App title="My Mini App" />
 * ```
 */
export default function App(_props: AppProps = { title: "Neynar Starter Kit" }) {
  // --- Hooks ---
  const { isSDKLoaded, context, setInitialTab } = useMiniApp();

  // --- Effects ---
  /**
   * Sets the initial tab to "home" when the SDK is loaded.
   * 
   * This effect ensures that users start on the home tab when they first
   * load the mini app. It only runs when the SDK is fully loaded to
   * prevent errors during initialization.
   */
  useEffect(() => {
    if (isSDKLoaded) {
      setInitialTab("home");
    }
  }, [isSDKLoaded, setInitialTab]);

  // --- Early Returns ---
  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="spinner h-8 w-8 mx-auto mb-4"></div>
          <p>Loading SDK...</p>
        </div>
      </div>
    );
  }

  // --- Render ---
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex justify-center"
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="w-full max-w-md px-3 pb-20 pt-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-950/95 backdrop-blur-xl shadow-[0_18px_45px_rgba(0,0,0,0.85)] overflow-hidden">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-white/10">
            <Header />
          </div>

          {/* Main content */}
          <div className="px-4 pb-4 pt-3">
            <TabSwitcher isAdmin={context?.user?.fid === 1441046} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TabSwitcher({ isAdmin }: { isAdmin: boolean }) {
  const [view, setView] = useState<"play" | "view" | "admin">("play");

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-full bg-slate-900/80 border border-slate-800 p-0.5 text-xs">
        <button
          type="button"
          className={`px-3 py-1.5 rounded-full ${
            view === "play"
              ? "bg-primary text-white shadow-sm"
              : "text-slate-300"
          }`}
          onClick={() => setView("play")}
        >
          Play
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 rounded-full ${
            view === "view"
              ? "bg-primary text-white shadow-sm"
              : "text-slate-300"
          }`}
          onClick={() => setView("view")}
        >
          View
        </button>
        {isAdmin && (
          <button
            type="button"
            className={`px-3 py-1.5 rounded-full ${
              view === "admin"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-300"
            }`}
            onClick={() => setView("admin")}
          >
            Admin
          </button>
        )}
      </div>

      {view === "play" && <HomeTab />}
      {view === "view" && <PastGuessesTab />}
      {view === "admin" && isAdmin && <AdminTab />}
    </div>
  );
}

