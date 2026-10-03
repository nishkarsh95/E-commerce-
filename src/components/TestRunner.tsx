import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  FileCheck,
  Shield,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { TestScenario, ScenarioRunResult, TestRunLog, UserAccount } from '../types';
import { CUCUMBER_SCENARIOS, TEST_PERSONAS } from '../data/mavenProjectData';

interface TestRunnerProps {
  onExecuteStoreStep?: (action: string, payload?: any) => Promise<void>;
  onResetStoreState?: () => void;
  isCompact?: boolean;
}

export const TestRunner: React.FC<TestRunnerProps> = ({
  onExecuteStoreStep,
  onResetStoreState,
  isCompact = false,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [filterTag, setFilterTag] = useState<string>('all');

  const [results, setResults] = useState<Record<string, ScenarioRunResult>>(() => {
    const initial: Record<string, ScenarioRunResult> = {};
    CUCUMBER_SCENARIOS.forEach((sc) => {
      initial[sc.id] = {
        scenarioId: sc.id,
        status: 'pending',
        currentStepIndex: -1,
        durationMs: 0,
        stepsResults: sc.steps.map(() => ({ status: 'pending', durationMs: 0 })),
      };
    });
    return initial;
  });

  const [logs, setLogs] = useState<TestRunLog[]>([
    {
      id: 'init-1',
      timestamp: '00:00:00.001',
      level: 'INFO',
      message: 'Selenium WebDriver 4.21.0 initialized with Headless Chrome 125.0',
    },
    {
      id: 'init-2',
      timestamp: '00:00:00.003',
      level: 'INFO',
      message: 'Cucumber BDD runtime: Glue code matched to com.lumen.automation.stepdefinitions',
    },
  ]);

  const addLog = (level: TestRunLog['level'], message: string, scenarioId?: string) => {
    const now = new Date();
    const ts = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    setLogs((prev) => [
      ...prev.slice(-90),
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: ts,
        level,
        message,
        scenarioId,
      },
    ]);
  };

  const runScenario = async (scenario: TestScenario) => {
    setActiveScenarioId(scenario.id);
    addLog('INFO', `Starting scenario: "${scenario.name}" [${scenario.tag}]`, scenario.id);

    if (onResetStoreState) {
      onResetStoreState();
      await new Promise((r) => setTimeout(r, 200));
    }

    const updatedSteps: {
      status: 'pending' | 'running' | 'passed' | 'failed';
      durationMs: number;
    }[] = scenario.steps.map(() => ({ status: 'pending', durationMs: 0 }));
    setResults((prev) => ({
      ...prev,
      [scenario.id]: {
        scenarioId: scenario.id,
        status: 'running',
        currentStepIndex: 0,
        durationMs: 0,
        stepsResults: updatedSteps,
      },
    }));

    let scenarioStartTime = Date.now();

    for (let i = 0; i < scenario.steps.length; i++) {
      const step = scenario.steps[i];
      setActiveStepIndex(i);

      // Log the Selenium command
      addLog('DEBUG', `[STEP] ${step.keyword} ${step.text}`, scenario.id);
      addLog('INFO', `  ↳ Selenium: ${step.seleniumCommand}`, scenario.id);

      // Execute on live storefront if callback is provided
      if (onExecuteStoreStep) {
        await onExecuteStoreStep(scenario.id, { stepIndex: i, step });
      }

      // Realistic step latency
      const stepDuration = Math.min(Math.max(step.durationMs * 0.7, 180), 600);
      await new Promise((r) => setTimeout(r, stepDuration));

      updatedSteps[i] = {
        status: 'passed',
        durationMs: stepDuration,
      };

      setResults((prev) => ({
        ...prev,
        [scenario.id]: {
          ...prev[scenario.id],
          currentStepIndex: i,
          stepsResults: [...updatedSteps],
        },
      }));
    }

    const totalDuration = Date.now() - scenarioStartTime;
    setResults((prev) => ({
      ...prev,
      [scenario.id]: {
        ...prev[scenario.id],
        status: 'passed',
        durationMs: totalDuration,
      },
    }));

    addLog('PASS', `✓ Scenario Passed cleanly: "${scenario.name}" (${totalDuration}ms)`, scenario.id);
  };

  const handleRunAll = async () => {
    setIsRunning(true);
    addLog('INFO', '=== Triggering Cucumber Test Suite Execution ===');

    for (const sc of filteredScenarios) {
      await runScenario(sc);
      await new Promise((r) => setTimeout(r, 400));
    }

    setIsRunning(false);
    setActiveScenarioId(null);
    setActiveStepIndex(-1);
    addLog('PASS', '=== All Cucumber Scenarios Completed. Build Status: CLEAN PASS ===');
  };

  const handleRunSingle = async (sc: TestScenario) => {
    if (isRunning) return;
    setIsRunning(true);
    await runScenario(sc);
    setIsRunning(false);
    setActiveScenarioId(null);
    setActiveStepIndex(-1);
  };

  const handleReset = () => {
    if (onResetStoreState) onResetStoreState();
    const resetResults: Record<string, ScenarioRunResult> = {};
    CUCUMBER_SCENARIOS.forEach((sc) => {
      resetResults[sc.id] = {
        scenarioId: sc.id,
        status: 'pending',
        currentStepIndex: -1,
        durationMs: 0,
        stepsResults: sc.steps.map(() => ({ status: 'pending', durationMs: 0 })),
      };
    });
    setResults(resetResults);
    setActiveScenarioId(null);
    setActiveStepIndex(-1);
    addLog('INFO', 'Test results and browser state reset.');
  };

  const filteredScenarios = CUCUMBER_SCENARIOS.filter((sc) => {
    if (filterTag === 'all') return true;
    if (filterTag === 'smoke') return sc.tag.includes('@smoke');
    if (filterTag === 'security') return sc.tag.includes('@security');
    if (filterTag === 'validation') return sc.tag.includes('@validation');
    return true;
  });

  const passedCount = Object.values(results).filter((r) => r.status === 'passed').length;
  const totalCount = CUCUMBER_SCENARIOS.length;

  return (
    <div className="w-full bg-[#18191C] border border-[#2B2D30] rounded-xl text-zinc-200 overflow-hidden font-sans shadow-xl">
      {/* Test Suite Header */}
      <div className="p-4 bg-[#212226] border-b border-[#2B2D30] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">
              Cucumber BDD · Selenium WebDriver
            </span>
            <span className="text-zinc-500">·</span>
            <span className="text-xs text-zinc-400 font-mono">login_authentication.feature</span>
          </div>
          <h2 className="text-lg font-semibold text-zinc-100 mt-0.5">
            Automated Functional Test Runner
          </h2>
        </div>

        {/* Action Controls & Metrics */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#18191C] border border-[#2B2D30] text-xs font-mono">
            <span className="text-zinc-400">Passed:</span>
            <span className="font-bold text-emerald-400">
              {passedCount} / {totalCount}
            </span>
            <span className="text-zinc-500">({Math.round((passedCount / totalCount) * 100)}%)</span>
          </div>

          <button
            onClick={handleRunAll}
            disabled={isRunning}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
              isRunning
                ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run All Scenarios</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            disabled={isRunning}
            title="Reset test suite"
            className="p-1.5 rounded-lg bg-[#2B2D30] hover:bg-[#35373B] text-zinc-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2 bg-[#1C1D21] border-b border-[#2B2D30] flex items-center gap-2 text-xs">
        <Filter className="w-3 h-3 text-zinc-500" />
        <span className="text-zinc-400 mr-2 text-[11px]">Filter Tag:</span>
        {(['all', 'smoke', 'security', 'validation'] as const).map((tag) => (
          <button
            key={tag}
            onClick={() => setFilterTag(tag)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              filterTag === tag
                ? 'bg-[#3574F0] text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            @{tag}
          </button>
        ))}
      </div>

      {/* Scenarios List */}
      <div className="divide-y divide-[#2B2D30] max-h-[460px] overflow-y-auto">
        {filteredScenarios.map((scenario) => {
          const result = results[scenario.id];
          const isThisRunning = activeScenarioId === scenario.id;

          return (
            <div
              key={scenario.id}
              className={`p-4 transition-colors ${
                isThisRunning
                  ? 'bg-[#1F2633]'
                  : result.status === 'passed'
                  ? 'bg-[#18191C]/90 hover:bg-[#1C1D21]'
                  : 'hover:bg-[#1C1D21]'
              }`}
            >
              {/* Scenario Summary Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {result.status === 'passed' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    {result.status === 'running' && (
                      <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                    )}
                    {result.status === 'pending' && (
                      <div className="w-4 h-4 rounded-full border border-zinc-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-xs text-zinc-200">
                        Scenario: {scenario.name}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {scenario.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{scenario.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {result.durationMs > 0 && (
                    <span className="text-[11px] font-mono text-zinc-400">
                      {result.durationMs}ms
                    </span>
                  )}
                  <button
                    onClick={() => handleRunSingle(scenario)}
                    disabled={isRunning}
                    className="p-1 px-2 rounded bg-[#2B2D30] hover:bg-[#35373B] text-[11px] text-zinc-300 font-medium transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-2.5 h-2.5 fill-current text-emerald-400" />
                    <span>Run</span>
                  </button>
                </div>
              </div>

              {/* Steps Details (Shown when running or passed) */}
              {(isThisRunning || result.status === 'passed') && (
                <div className="mt-3 pl-6 border-l-2 border-zinc-700/60 space-y-1.5 font-mono text-xs">
                  {scenario.steps.map((step, sIdx) => {
                    const stepRes = result.stepsResults[sIdx];
                    const isStepActive = isThisRunning && activeStepIndex === sIdx;

                    return (
                      <div
                        key={sIdx}
                        className={`py-0.5 px-2 rounded flex items-center justify-between text-[11px] transition-colors ${
                          isStepActive
                            ? 'bg-[#2E436E] text-white font-medium'
                            : stepRes.status === 'passed'
                            ? 'text-zinc-300'
                            : 'text-zinc-500'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={
                              stepRes.status === 'passed'
                                ? 'text-emerald-400 font-bold'
                                : 'text-zinc-500'
                            }
                          >
                            {stepRes.status === 'passed' ? '✓' : '·'}
                          </span>
                          <span className="font-bold text-[#D4AF37]">{step.keyword}</span>
                          <span className="truncate">{step.text}</span>
                        </div>
                        {stepRes.durationMs > 0 && (
                          <span className="text-[10px] text-zinc-500 shrink-0 ml-2">
                            {stepRes.durationMs}ms
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Live Selenium WebDriver Console Output */}
      <div className="p-3 bg-[#121315] border-t border-[#2B2D30]">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
          <div className="flex items-center gap-1.5 font-mono">
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span>WebDriver Live Log Stream</span>
          </div>
          <span className="text-zinc-600 font-mono">Driver: ChromeDriver 125.0 (Headless)</span>
        </div>
        <div className="font-mono text-[11px] leading-relaxed text-zinc-300 h-28 overflow-y-auto space-y-1 p-2 bg-[#0E0F11] rounded border border-zinc-800">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2">
              <span className="text-zinc-600 select-none">{log.timestamp}</span>
              <span
                className={`font-semibold shrink-0 ${
                  log.level === 'PASS'
                    ? 'text-emerald-400'
                    : log.level === 'FAIL'
                    ? 'text-red-400'
                    : log.level === 'DEBUG'
                    ? 'text-blue-400'
                    : 'text-zinc-400'
                }`}
              >
                [{log.level}]
              </span>
              <span className="text-zinc-300 break-all">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
