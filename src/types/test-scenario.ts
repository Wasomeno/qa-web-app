import { RecordingStep } from './recording';

export interface AuthConfig {
  baseUrl: string;
  loginUrl: string;
  username: string;
  password?: string;
}

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type TestCaseStatus = 'draft' | 'ready' | 'blocked' | 'deprecated';
export type ScenarioStatus = 'draft' | 'uploaded' | 'ready' | 'generating' | 'failed';
export type AutomationStatus = 'idle' | 'running' | 'pass' | 'fail';

export interface AutomationTest {
  id: string;
  name: string;
  status: AutomationStatus;
  lastRunAt?: string;
  runDurationMs?: number;
  steps?: RecordingStep[];
  screenshotUrl?: string;
  errorMessage?: string;
  failedStepIndex?: number;
}

export interface TestStep {
  id: string;
  order: number;
  action: string;
  data?: string;
  expected: string;
}

export interface TestCase {
  id: string;
  order: number;
  code: string;
  title: string;
  description?: string;
  preCondition?: string;
  steps: TestStep[];
  tags: string[];
  priority: Priority;
  type: string;
  status: TestCaseStatus;
  automationTest?: AutomationTest;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestSection {
  id: string;
  order: number;
  title: string;
  description?: string;
  testCases: TestCase[];
}

export interface ScenarioStats {
  totalSections: number;
  totalTestCases: number;
  totalSteps: number;
  automatedCount: number;
  passCount: number;
  failCount: number;
  draftCount: number;
}

export interface TestScenario {
  id: string;
  title: string;
  description?: string;
  sections?: TestSection[];
  projectId?: string;
  projectName?: string;
  status: ScenarioStatus;
  error?: string;
  stats?: ScenarioStats;
  authConfig?: AuthConfig;
  createdAt: string;
  updatedAt: string;
  creatorId?: number;
}
