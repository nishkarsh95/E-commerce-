import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { IntelliJWorkspace } from './components/IntelliJWorkspace';
import { TestRunner } from './components/TestRunner';
import { CiCdPipeline } from './components/CiCdPipeline';
import { BrandGuideModal } from './components/BrandGuideModal';
import { AppMode, NetworkSpeed, UserAccount } from './types';
import { TEST_PERSONAS } from './data/mavenProjectData';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lumen-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // App mode
  const [currentMode, setCurrentMode] = useState<AppMode>('store');

  // Network simulation speed
  const [networkSpeed, setNetworkSpeed] = useState<NetworkSpeed>('normal');

  // Active user session
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Brand guide modal
  const [isBrandGuideOpen, setIsBrandGuideOpen] = useState(false);

  // Store interactive test values (for automation driving)
  const [automationEmail, setAutomationEmail] = useState<string | undefined>(undefined);
  const [automationPassword, setAutomationPassword] = useState<string | undefined>(undefined);

  // Sync dark mode class on HTML document
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('lumen-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('lumen-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Automated Store step driver called by TestRunner
  const handleExecuteStoreStep = async (scenarioId: string, payload?: any) => {
    const step = payload?.step;
    if (!step) return;

    if (scenarioId === 'sc-1' || scenarioId === 'sc-2') {
      // Standard customer happy path
      if (step.keyword === 'Given') {
        setCurrentUser(null);
        setAutomationEmail('');
        setAutomationPassword('');
      } else if (step.text.includes('enters email')) {
        setAutomationEmail(TEST_PERSONAS.customer.email);
      } else if (step.text.includes('enters password')) {
        setAutomationPassword(TEST_PERSONAS.customer.password);
      } else if (step.text.includes('clicks the Sign In button')) {
        // Trigger simulated post-login dashboard
        await new Promise((r) => setTimeout(r, 600));
        setCurrentUser(TEST_PERSONAS.customer);
      }
    } else if (scenarioId === 'sc-3') {
      // VIP 2FA flow
      if (step.keyword === 'Given') {
        setCurrentUser(null);
        setAutomationEmail('');
        setAutomationPassword('');
      } else if (step.text.includes('enters email')) {
        setAutomationEmail(TEST_PERSONAS.vip.email);
      } else if (step.text.includes('enters password')) {
        setAutomationPassword(TEST_PERSONAS.vip.password);
      } else if (step.text.includes('VIP status for "Alex Thorne"')) {
        setCurrentUser(TEST_PERSONAS.vip);
      }
    } else if (scenarioId === 'sc-4') {
      // Invalid credentials
      if (step.keyword === 'Given') {
        setCurrentUser(null);
      } else if (step.text.includes('enters email')) {
        setAutomationEmail('clara@lumengoods.com');
      } else if (step.text.includes('enters password')) {
        setAutomationPassword('WrongPassword2026');
      }
    } else if (scenarioId === 'sc-5') {
      // Locked user
      if (step.keyword === 'Given') {
        setCurrentUser(null);
      } else if (step.text.includes('enters email')) {
        setAutomationEmail('locked.user@lumengoods.com');
      } else if (step.text.includes('enters password')) {
        setAutomationPassword('WrongPassword99!');
      }
    } else if (scenarioId === 'sc-6') {
      // Missing validation
      setCurrentUser(null);
      setAutomationEmail('');
      setAutomationPassword('');
    }
  };

  const handleResetStoreState = () => {
    setCurrentUser(null);
    setAutomationEmail('clara@lumengoods.com');
    setAutomationPassword('Lumen2026!Secure');
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#0F0F11] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar navigation */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={(mode) => setCurrentMode(mode)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        networkSpeed={networkSpeed}
        onSelectNetworkSpeed={(spd) => setNetworkSpeed(spd)}
        onOpenBrandGuide={() => setIsBrandGuideOpen(true)}
        onTriggerQuickTest={() => setCurrentMode('split')}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {currentMode === 'store' && (
          <div className="flex-1 flex flex-col justify-center">
            <LoginPage
              networkSpeed={networkSpeed}
              currentUser={currentUser}
              onLoginSuccess={(user) => setCurrentUser(user)}
              onLogout={() => setCurrentUser(null)}
              externalEmail={automationEmail}
              externalPassword={automationPassword}
            />
          </div>
        )}

        {currentMode === 'ide' && (
          <div className="flex-1 py-4">
            <IntelliJWorkspace
              onRunTestInSplitView={() => {
                setCurrentMode('split');
              }}
            />
          </div>
        )}

        {currentMode === 'split' && (
          <div className="flex-1 max-w-[1560px] mx-auto w-full p-4 sm:p-6">
            {/* Split Mode Description Banner */}
            <div className="mb-4 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Live Dual E2E Testing View:</span>
                <span className="text-zinc-600 dark:text-zinc-300">
                  Left shows the real-time Storefront Login; Right executes Selenium Java Cucumber BDD steps with explicit waits.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentMode('ide')}
                  className="px-2.5 py-1 rounded bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:opacity-90 font-medium"
                >
                  View Maven POM Code
                </button>
              </div>
            </div>

            {/* Split Grid: Storefront on Left (6 cols), Live Runner on Right (6 cols) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-6 bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm overflow-hidden">
                <div className="text-xs font-mono text-zinc-400 mb-2 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span>Browser Viewport: https://store.lumengoods.com/login</span>
                  <span className="text-emerald-500 font-sans">Active Session</span>
                </div>
                <LoginPage
                  networkSpeed={networkSpeed}
                  currentUser={currentUser}
                  onLoginSuccess={(user) => setCurrentUser(user)}
                  onLogout={() => setCurrentUser(null)}
                  externalEmail={automationEmail}
                  externalPassword={automationPassword}
                  isExecutingAutomation={true}
                />
              </div>

              <div className="xl:col-span-6">
                <TestRunner
                  onExecuteStoreStep={handleExecuteStoreStep}
                  onResetStoreState={handleResetStoreState}
                />
              </div>
            </div>
          </div>
        )}

        {currentMode === 'cicd' && (
          <div className="flex-1 py-4">
            <CiCdPipeline />
          </div>
        )}
      </main>

      {/* Brand Guide Modal */}
      <BrandGuideModal
        isOpen={isBrandGuideOpen}
        onClose={() => setIsBrandGuideOpen(false)}
        isDarkMode={isDarkMode}
      />

      {/* Minimal Footer adhering to anti-slop guidelines */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-6 px-4 sm:px-6 text-xs text-zinc-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-950/50">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-zinc-800 dark:text-zinc-200">LUMEN ATELIER</span>
            <span aria-hidden="true">·</span>
            <span>Automated Functional Testing Suite</span>
            <span aria-hidden="true">·</span>
            <span>Selenium WebDriver 4 & Cucumber BDD</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span>Maven 3.9</span>
            <span aria-hidden="true">/</span>
            <span>JUnit 5 Platform</span>
            <span aria-hidden="true">/</span>
            <span>Java 21 LTS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
