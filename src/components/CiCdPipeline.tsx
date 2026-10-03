import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  GitBranch,
  Play,
  RotateCcw,
  Terminal,
  FileCheck,
  ShieldCheck,
  Download,
  ExternalLink,
} from 'lucide-react';

export const CiCdPipeline: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'graph' | 'logs' | 'report'>('graph');
  const [isReRunning, setIsReRunning] = useState(false);
  const [buildTime, setBuildTime] = useState('1m 14s');

  const handleReRun = async () => {
    setIsReRunning(true);
    await new Promise((r) => setTimeout(r, 2200));
    setIsReRunning(false);
    setBuildTime('1m 12s');
  };

  const stages = [
    {
      name: 'Set up JDK 21 (Temurin)',
      duration: '3.1s',
      status: 'success',
      command: 'actions/setup-java@v4 with java-version: 21',
    },
    {
      name: 'Cache Maven local repository',
      duration: '1.4s',
      status: 'success',
      command: 'actions/cache@v4 (~/.m2/repository)',
    },
    {
      name: 'Provision Headless Chrome 125.0',
      duration: '4.2s',
      status: 'success',
      command: 'google-chrome --version && chromedriver --version',
    },
    {
      name: 'Compile Page Objects & Step Definitions',
      duration: '5.8s',
      status: 'success',
      command: 'mvn compile test-compile -DskipTests=false',
    },
    {
      name: 'Execute Maven Surefire Cucumber BDD Suite',
      duration: '12.4s',
      status: 'success',
      command: 'mvn clean test -Dbrowser=chrome -Dheadless=true -Dcucumber.filter.tags="@regression"',
    },
    {
      name: 'Generate & Publish Cucumber HTML Artifacts',
      duration: '2.1s',
      status: 'success',
      command: 'actions/upload-artifact@v4 (target/cucumber-reports/)',
    },
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto py-8 px-4 sm:px-6">
      {/* CI/CD Header Card */}
      <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm mb-6 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Build & Tests Passing Cleanly
              </span>
              <span className="text-xs text-zinc-400 font-mono">Run #142</span>
            </div>
            <h1 className="text-2xl font-serif font-medium text-zinc-900 dark:text-zinc-100">
              CI/CD Pipeline: Maven E2E Test & Verification
            </h1>
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-mono">
              <span className="flex items-center gap-1">
                <GitBranch className="w-3 h-3 text-zinc-400" />
                <span>main (commit e48f21a)</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-400" />
                <span>Duration: {buildTime}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>Trigger: Push (Automated Functional Regression)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReRun}
              disabled={isReRunning}
              className="px-4 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isReRunning ? 'animate-spin' : ''}`} />
              <span>{isReRunning ? 'Running CI Pipeline...' : 'Re-run Workflow'}</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-4 mt-6 border-b border-zinc-100 dark:border-zinc-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('graph')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'graph'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Workflow Graph & Stages
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Maven Surefire Build Console
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'report'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Cucumber Test Report
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'graph' && (
          <div className="mt-6 space-y-3">
            {stages.map((stage, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-between gap-4 text-xs transition-colors hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">{stage.name}</div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                      {stage.command}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-zinc-500 text-[11px]">{stage.duration}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                    Pass
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="mt-6 p-4 rounded-xl bg-[#0E0F11] border border-zinc-800 text-zinc-300 font-mono text-xs max-h-96 overflow-y-auto leading-relaxed space-y-1">
            <div className="text-zinc-500">[INFO] Scanning for projects...</div>
            <div className="text-zinc-400">[INFO] ------------------------------------------------------------------------</div>
            <div className="text-zinc-200">[INFO] Building ecommerce-selenium-cucumber-tests 1.0.0-SNAPSHOT</div>
            <div className="text-zinc-200">[INFO] ------------------------------------------------------------------------</div>
            <div className="text-zinc-500">[INFO] --- maven-resources-plugin:3.3.1:resources (default-resources) ---</div>
            <div className="text-zinc-500">[INFO] --- maven-compiler-plugin:3.13.0:compile (default-compile) ---</div>
            <div className="text-zinc-300">[INFO] Compiling 4 source files with javac [Temurin JDK 21] to target/classes</div>
            <div className="text-zinc-500">[INFO] --- maven-surefire-plugin:3.2.5:test (default-test) ---</div>
            <div className="text-zinc-200">[INFO] Running com.lumen.automation.runners.CucumberTestRunner</div>
            <div className="text-emerald-400">Scenario: Successful customer login with valid credentials ... PASSED</div>
            <div className="text-emerald-400">Scenario: Authentication flow safely handles simulated network delay ... PASSED</div>
            <div className="text-emerald-400">Scenario: VIP member login challenges for Multi-Factor Authentication code ... PASSED</div>
            <div className="text-emerald-400">Scenario: Login rejection with incorrect password credentials ... PASSED</div>
            <div className="text-emerald-400">Scenario: Account lockout trigger after repeated failed authentication attempts ... PASSED</div>
            <div className="text-emerald-400">Scenario: Client-side validation triggers on missing mandatory fields ... PASSED</div>
            <div className="text-zinc-400">[INFO] </div>
            <div className="text-zinc-200">[INFO] Results:</div>
            <div className="text-emerald-400 font-bold">[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0</div>
            <div className="text-zinc-400">[INFO] </div>
            <div className="text-emerald-400 font-bold">[INFO] ------------------------------------------------------------------------</div>
            <div className="text-emerald-400 font-bold">[INFO] BUILD SUCCESS</div>
            <div className="text-emerald-400 font-bold">[INFO] ------------------------------------------------------------------------</div>
            <div className="text-zinc-500">[INFO] Total time: 18.210 s</div>
            <div className="text-zinc-500">[INFO] Finished at: 2026-10-03T01:14:00Z</div>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="mt-6 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                Cucumber HTML Report Summary
              </h3>
              <span className="text-xs text-zinc-500 font-mono">Report: target/cucumber-reports/index.html</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-white dark:bg-[#18181B] rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs text-zinc-500">Total Scenarios</div>
                <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">6</div>
              </div>
              <div className="p-3 bg-white dark:bg-[#18181B] rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                <div className="text-xs text-emerald-600 dark:text-emerald-400">Passed</div>
                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">6 (100%)</div>
              </div>
              <div className="p-3 bg-white dark:bg-[#18181B] rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs text-zinc-500">Failed / Errors</div>
                <div className="text-xl font-bold font-mono text-zinc-400">0</div>
              </div>
              <div className="p-3 bg-white dark:bg-[#18181B] rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="text-xs text-zinc-500">Execution Time</div>
                <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">12.4s</div>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every scenario in <code className="font-mono text-zinc-800 dark:text-zinc-200">login_authentication.feature</code> executed successfully against the Page Object Model. Dynamic loading overlays, 2FA validation codes, and security lockout conditions passed all test assertions without unhandled flakiness.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
