import React from "react";
import { Tab } from "~/components/App";

interface FooterProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  showWallet?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ activeTab, setActiveTab, showWallet = false }) => (
  <div className="fixed bottom-0 left-0 right-0 mx-auto mb-4 max-w-md px-3 z-50">
    <div className="rounded-2xl border border-white/12 bg-slate-950/90 backdrop-blur-xl px-3 py-1.5 shadow-[0_16px_35px_rgba(0,0,0,0.85)]">
      <div className="flex justify-around items-center h-12">
        <button
          onClick={() => setActiveTab(Tab.Home)}
          className={`flex flex-col items-center justify-center w-full h-full ${
            activeTab === Tab.Home ? "text-primary-light" : "text-white/50"
          }`}
        >
          <span className="text-lg">🏠</span>
          <span className="text-[11px] mt-0.5">Home</span>
        </button>
        <button
          onClick={() => setActiveTab(Tab.Actions)}
          className={`flex flex-col items-center justify-center w-full h-full ${
            activeTab === Tab.Actions ? "text-primary-light" : "text-white/50"
          }`}
        >
          <span className="text-lg">⚡</span>
          <span className="text-[11px] mt-0.5">Actions</span>
        </button>
        <button
          onClick={() => setActiveTab(Tab.Context)}
          className={`flex flex-col items-center justify-center w-full h-full ${
            activeTab === Tab.Context ? "text-primary-light" : "text-white/50"
          }`}
        >
          <span className="text-lg">📋</span>
          <span className="text-[11px] mt-0.5">Context</span>
        </button>
        {showWallet && (
          <button
            onClick={() => setActiveTab(Tab.Wallet)}
            className={`flex flex-col items-center justify-center w-full h-full ${
              activeTab === Tab.Wallet ? "text-primary-light" : "text-white/50"
            }`}
          >
            <span className="text-lg">👛</span>
            <span className="text-[11px] mt-0.5">Wallet</span>
          </button>
        )}
      </div>
    </div>
  </div>
);
