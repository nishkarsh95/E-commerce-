import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Play,
  Bug,
  RefreshCw,
  Copy,
  Check,
  Download,
  Terminal,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
  GitBranch,
  ShieldCheck,
  Settings,
  ExternalLink,
} from 'lucide-react';
import { ProjectFile, ProjectDirectory } from '../types';
import { MAVEN_FILES, MAVEN_PROJECT_TREE } from '../data/mavenProjectData';

interface IntelliJWorkspaceProps {
  onRunTestInSplitView?: (fileId?: string) => void;
}

export const IntelliJWorkspace: React.FC<IntelliJWorkspaceProps> = ({ onRunTestInSplitView }) => {
  const [openFiles, setOpenFiles] = useState<ProjectFile[]>([
    MAVEN_FILES.find((f) => f.id === 'login-page')!,
    MAVEN_FILES.find((f) => f.id === 'base-page')!,
    MAVEN_FILES.find((f) => f.id === 'login-feature')!,
    MAVEN_FILES.find((f) => f.id === 'pom-xml')!,
  ]);
  const [activeFileId, setActiveFileId] = useState<string>('login-page');
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);

  // Folder expanded states
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '.': true,
    '.github': true,
    '.github/workflows': true,
    'src': true,
    'src/main': true,
    'src/main/java': true,
    'src/main/java/com.lumen.automation': true,
    'src/main/java/com.lumen.automation/pages': true,
    'src/main/java/com.lumen.automation/drivers': true,
    'src/test': true,
    'src/test/java': true,
    'src/test/java/com.lumen.automation': true,
    'src/test/java/com.lumen.automation/stepdefinitions': true,
    'src/test/java/com.lumen.automation/runners': true,
    'src/test/resources': true,
    'src/test/resources/features': true,
  });

  // Bottom tool window tab
  const [bottomTab, setBottomTab] = useState<'console' | 'terminal' | 'maven' | 'problems'>('console');
  const [selectedRunConfig, setSelectedRunConfig] = useState<string>('Cucumber: login_authentication.feature');

  const activeFile = MAVEN_FILES.find((f) => f.id === activeFileId) || openFiles[0];

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleOpenFile = (file: ProjectFile) => {
    if (!openFiles.some((f) => f.id === file.id)) {
      setOpenFiles((prev) => [...prev, file]);
    }
    setActiveFileId(file.id);
  };

  const handleCloseTab = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = openFiles.filter((f) => f.id !== fileId);
    if (remaining.length > 0) {
      setOpenFiles(remaining);
      if (activeFileId === fileId) {
        setActiveFileId(remaining[remaining.length - 1].id);
      }
    }
  };

  const handleCopyCode = (file: ProjectFile) => {
    navigator.clipboard.writeText(file.content);
    setCopiedFileId(file.id);
    setTimeout(() => setCopiedFileId(null), 2000);
  };

  const handleDownloadFile = (file: ProjectFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderFileIcon = (type: ProjectFile['iconType']) => {
    switch (type) {
      case 'java':
        return <span className="text-amber-500 font-bold text-xs font-mono">C</span>;
      case 'feature':
        return <span className="text-emerald-500 font-bold text-xs font-mono">🥒</span>;
      case 'xml':
        return <span className="text-blue-400 font-bold text-xs font-mono">XML</span>;
      case 'yaml':
        return <span className="text-red-400 font-bold text-xs font-mono">YML</span>;
      default:
        return <FileText className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const renderDirectoryTree = (dir: ProjectDirectory, depth: number = 0) => {
    const isExpanded = expandedFolders[dir.path] ?? false;

    return (
      <div key={dir.path} className="select-none text-xs">
        {depth > 0 && (
          <div
            onClick={() => toggleFolder(dir.path)}
            className="flex items-center gap-1.5 py-1 px-2 hover:bg-[#2A2D32] text-zinc-300 cursor-pointer rounded-xs"
            style={{ paddingLeft: `${depth * 14 + 6}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
            ) : (
              <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 text-[#E5A84B] shrink-0" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-[#E5A84B] shrink-0" />
            )}
            <span className="truncate">{dir.name}</span>
          </div>
        )}

        {isExpanded && (
          <div>
            {dir.subdirectories?.map((sub) => renderDirectoryTree(sub, depth + 1))}
            {dir.files?.map((file) => {
              const isActive = activeFileId === file.id;
              return (
                <div
                  key={file.id}
                  onClick={() => handleOpenFile(file)}
                  className={`flex items-center gap-1.5 py-1 px-2 cursor-pointer rounded-xs text-xs transition-colors ${
                    isActive
                      ? 'bg-[#2E436E] text-white font-medium'
                      : 'hover:bg-[#2A2D32] text-zinc-300'
                  }`}
                  style={{ paddingLeft: `${(depth + 1) * 14 + 6}px` }}
                >
                  <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                    {renderFileIcon(file.iconType)}
                  </span>
                  <span className="truncate">{file.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto py-4 px-2 sm:px-6">
      {/* IntelliJ Outer Window Container */}
      <div className="rounded-xl border border-[#3C3F41] bg-[#1E1F22] text-zinc-200 shadow-2xl overflow-hidden font-sans">
        {/* Title Bar (macOS / JetBrains New UI Style) */}
        <div className="h-10 bg-[#2B2D30] border-b border-[#3C3F41] px-4 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-3">
              <div className="w-3 h-3 rounded-full bg-[#ED6A5E] border border-[#CF544B]" />
              <div className="w-3 h-3 rounded-full bg-[#F5BF4F] border border-[#D69E3D]" />
              <div className="w-3 h-3 rounded-full bg-[#62C554] border border-[#50A442]" />
            </div>
            <span className="font-semibold text-zinc-200">IntelliJ IDEA</span>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-400 font-mono truncate hidden sm:inline">
              ecommerce-selenium-cucumber-tests [~/IdeaProjects]
            </span>
          </div>

          <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
            <div className="flex items-center gap-1 bg-[#1E1F22] px-2 py-0.5 rounded border border-[#3C3F41]">
              <GitBranch className="w-3 h-3 text-emerald-400" />
              <span className="font-mono text-zinc-300">main</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>JDK 21 (Temurin)</span>
            </div>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="hidden sm:flex items-center gap-4 px-4 py-1.5 bg-[#2B2D30] border-b border-[#3C3F41] text-xs text-zinc-300 select-none">
          <span className="hover:text-white cursor-pointer">File</span>
          <span className="hover:text-white cursor-pointer">Edit</span>
          <span className="hover:text-white cursor-pointer">View</span>
          <span className="hover:text-white cursor-pointer">Navigate</span>
          <span className="hover:text-white cursor-pointer">Code</span>
          <span className="hover:text-white cursor-pointer">Refactor</span>
          <span className="hover:text-white cursor-pointer">Build</span>
          <span className="hover:text-white cursor-pointer font-medium text-emerald-400">Run</span>
          <span className="hover:text-white cursor-pointer">Tools</span>
          <span className="hover:text-white cursor-pointer">Git</span>
          <span className="hover:text-white cursor-pointer">Help</span>
        </div>

        {/* Action Toolbar */}
        <div className="px-4 py-2 bg-[#1E1F22] border-b border-[#3C3F41] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {/* Run Configurations Dropdown */}
            <div className="flex items-center rounded bg-[#2B2D30] border border-[#3C3F41] px-2.5 py-1">
              <span className="mr-1.5">🥒</span>
              <select
                value={selectedRunConfig}
                onChange={(e) => setSelectedRunConfig(e.target.value)}
                className="bg-transparent text-xs text-zinc-200 outline-hidden cursor-pointer"
              >
                <option value="Cucumber: login_authentication.feature" className="bg-[#2B2D30]">
                  Cucumber: login_authentication.feature
                </option>
                <option value="CucumberTestRunner" className="bg-[#2B2D30]">
                  CucumberTestRunner (JUnit 5)
                </option>
                <option value="mvn clean test" className="bg-[#2B2D30]">
                  Maven: clean test
                </option>
                <option value="LoginPageTest" className="bg-[#2B2D30]">
                  LoginPageTest (Selenium)
                </option>
              </select>
            </div>

            {/* Run button */}
            <button
              onClick={() => onRunTestInSplitView && onRunTestInSplitView(activeFileId)}
              title="Run Selected Configuration"
              className="flex items-center gap-1 bg-[#365880] hover:bg-[#3E6594] text-white px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current text-emerald-400" />
              <span>Run</span>
            </button>

            {/* Debug button */}
            <button
              onClick={() => onRunTestInSplitView && onRunTestInSplitView(activeFileId)}
              title="Debug Selected Configuration"
              className="p-1 rounded hover:bg-[#2B2D30] text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Bug className="w-3.5 h-3.5 text-emerald-500" />
            </button>

            {/* Maven sync button */}
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-zinc-400 ml-3 pl-3 border-l border-[#3C3F41]">
              <RefreshCw className="w-3 h-3 text-blue-400" />
              <span>Maven Dependencies: Synced (pom.xml)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyCode(activeFile)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2B2D30] hover:bg-[#35373B] text-zinc-300 text-xs transition-colors border border-[#3C3F41]"
            >
              {copiedFileId === activeFile.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownloadFile(activeFile)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2B2D30] hover:bg-[#35373B] text-zinc-300 text-xs transition-colors border border-[#3C3F41]"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Download File</span>
            </button>

            <button
              onClick={() => onRunTestInSplitView && onRunTestInSplitView(activeFileId)}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-xs"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Execute in Live Runner</span>
            </button>
          </div>
        </div>

        {/* Main Work Area: Project Explorer Sidebar + Code Editor */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[520px]">
          {/* Left Column: Project Explorer (3 cols) */}
          <div className="md:col-span-3 border-r border-[#3C3F41] bg-[#1E1F22] flex flex-col">
            <div className="px-3 py-2 border-b border-[#3C3F41] flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <span>Project</span>
              <span className="text-[10px] text-zinc-500 font-mono">Maven</span>
            </div>
            <div className="p-2 overflow-y-auto max-h-[500px]">
              {renderDirectoryTree(MAVEN_PROJECT_TREE)}
            </div>
          </div>

          {/* Right Column: Editor & Code Viewer (9 cols) */}
          <div className="md:col-span-9 bg-[#1E1F22] flex flex-col">
            {/* Editor Tabs */}
            <div className="flex items-center bg-[#2B2D30] border-b border-[#3C3F41] overflow-x-auto text-xs">
              {openFiles.map((file) => {
                const isActive = file.id === activeFileId;
                return (
                  <div
                    key={file.id}
                    onClick={() => setActiveFileId(file.id)}
                    className={`flex items-center gap-2 px-3 py-2 border-r border-[#3C3F41] cursor-pointer whitespace-nowrap transition-colors select-none ${
                      isActive
                        ? 'bg-[#1E1F22] text-white font-medium border-t-2 border-t-[#3574F0]'
                        : 'text-zinc-400 hover:bg-[#323538] hover:text-zinc-200'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 flex items-center justify-center">
                      {renderFileIcon(file.iconType)}
                    </span>
                    <span>{file.name}</span>
                    <button
                      onClick={(e) => handleCloseTab(file.id, e)}
                      className="ml-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-700/50 p-0.5"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Breadcrumb Path Bar */}
            <div className="px-4 py-1 bg-[#1E1F22] border-b border-[#2B2D30] text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
              <span>{activeFile.path}</span>
            </div>

            {/* Code Body with Line Numbers */}
            <div className="flex-1 p-4 overflow-x-auto overflow-y-auto max-h-[460px] font-mono text-xs leading-relaxed bg-[#1E1F22] text-zinc-300 selection:bg-[#2E436E]">
              <pre className="flex">
                {/* Line numbers column */}
                <div className="select-none pr-4 text-zinc-600 text-right font-mono shrink-0">
                  {activeFile.content.split('\n').map((_, index) => (
                    <div key={index}>{index + 1}</div>
                  ))}
                </div>
                {/* Code content */}
                <code className="text-zinc-200 overflow-x-auto">
                  {activeFile.content}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Bottom Tool Window (Console / Terminal / Output) */}
        <div className="border-t border-[#3C3F41] bg-[#1E1F22]">
          <div className="flex items-center bg-[#2B2D30] border-b border-[#3C3F41] px-2 text-xs">
            <button
              onClick={() => setBottomTab('console')}
              className={`px-3 py-1.5 border-b-2 font-medium transition-colors ${
                bottomTab === 'console'
                  ? 'border-[#3574F0] text-white bg-[#1E1F22]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Run: {selectedRunConfig}
            </button>
            <button
              onClick={() => setBottomTab('terminal')}
              className={`px-3 py-1.5 border-b-2 font-medium transition-colors ${
                bottomTab === 'terminal'
                  ? 'border-[#3574F0] text-white bg-[#1E1F22]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Terminal
            </button>
            <button
              onClick={() => setBottomTab('maven')}
              className={`px-3 py-1.5 border-b-2 font-medium transition-colors ${
                bottomTab === 'maven'
                  ? 'border-[#3574F0] text-white bg-[#1E1F22]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Maven Lifecycle
            </button>
            <button
              onClick={() => setBottomTab('problems')}
              className={`px-3 py-1.5 border-b-2 font-medium transition-colors ${
                bottomTab === 'problems'
                  ? 'border-[#3574F0] text-white bg-[#1E1F22]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Problems (0 errors)
            </button>
          </div>

          <div className="p-3 font-mono text-xs text-zinc-300 max-h-36 overflow-y-auto bg-[#18191C]">
            {bottomTab === 'console' && (
              <div className="space-y-1 text-[11px]">
                <div className="text-zinc-500">/usr/lib/jvm/temurin-21/bin/java -Dfile.encoding=UTF-8 ...</div>
                <div className="text-emerald-400">
                  io.cucumber.core.plugin.PluginFactory: Initialized pretty, html:target/cucumber-reports.html
                </div>
                <div className="text-zinc-400">
                  Feature: Luxury E-Commerce Store User Authentication
                </div>
                <div className="text-zinc-300">
                  [INFO] Headless Chrome 125.0 initiated with explicit WebDriverWait (10s)
                </div>
                <div className="text-emerald-400">
                  [PASS] 6 Scenarios passed cleanly in CI/CD configuration.
                </div>
              </div>
            )}
            {bottomTab === 'terminal' && (
              <div className="text-[11px] text-zinc-400">
                <span className="text-emerald-400">user@devbox:~/IdeaProjects/ecommerce-selenium-cucumber-tests$</span> mvn test -Dcucumber.filter.tags="@smoke"
                <div className="mt-1 text-zinc-500">[INFO] Scanning for projects...</div>
                <div className="text-zinc-500">[INFO] Building Lumen E-Commerce E2E Automation Suite 1.0.0-SNAPSHOT</div>
              </div>
            )}
            {bottomTab === 'maven' && (
              <div className="text-[11px] space-y-1 text-zinc-400">
                <div>clean ➔ validate ➔ compile ➔ <span className="text-emerald-400 font-semibold">test</span> ➔ package ➔ verify</div>
                <div className="text-zinc-500">Surefire plugin 3.2.5 attached to 'test' phase with long naming strategy.</div>
              </div>
            )}
            {bottomTab === 'problems' && (
              <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>No compiler syntax errors or missing dependencies found. Clean project structure.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
