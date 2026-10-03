export type AppMode = 'store' | 'ide' | 'split' | 'cicd';

export type NetworkSpeed = 'instant' | 'normal' | 'slow';

export interface UserAccount {
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'vip' | 'locked';
  requires2FA?: boolean;
  avatar?: string;
  orderCount?: number;
  loyaltyPoints?: number;
}

export interface TestScenario {
  id: string;
  name: string;
  tag: string;
  description: string;
  featureFile: string;
  steps: {
    keyword: 'Given' | 'When' | 'And' | 'Then';
    text: string;
    seleniumCommand: string;
    durationMs: number;
    action?: (storeActions: StoreTestActions) => Promise<void>;
  }[];
}

export interface StoreTestActions {
  navigateLogin: () => void;
  fillEmail: (email: string) => void;
  fillPassword: (password: string) => void;
  toggleRememberMe: (checked: boolean) => void;
  clickSubmit: () => Promise<void>;
  fillTwoFactorCode: (code: string) => void;
  submitTwoFactor: () => Promise<void>;
  assertDashboardVisible: () => boolean;
  assertErrorMessage: (expectedText: string) => boolean;
  assertLockoutBanner: () => boolean;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  language: 'java' | 'gherkin' | 'xml' | 'yaml' | 'markdown' | 'properties';
  content: string;
  iconType: 'java' | 'feature' | 'xml' | 'yaml' | 'markdown' | 'properties';
}

export interface ProjectDirectory {
  name: string;
  path: string;
  isOpen?: boolean;
  subdirectories?: ProjectDirectory[];
  files?: ProjectFile[];
}

export interface TestRunLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'DEBUG' | 'WARN' | 'PASS' | 'FAIL';
  message: string;
  scenarioId?: string;
  stepIndex?: number;
}

export interface ScenarioRunResult {
  scenarioId: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  currentStepIndex: number;
  durationMs: number;
  error?: string;
  stepsResults: {
    status: 'pending' | 'running' | 'passed' | 'failed';
    durationMs: number;
  }[];
}
