/**
 * ONYX-Nexus Mimari Yenilemesi: Tip Tanımlamaları
 */

export type AgentRole = 'Supervisor' | 'Architect' | 'Developer' | 'QA' | 'Sentinel' | 'Researcher';

export type BranchStatus = 'IDLE' | 'WORKING' | 'TESTING' | 'VALIDATING' | 'MERGED' | 'FAILED';

export interface Branch {
  id: string;
  name: string;
  role: AgentRole;
  status: BranchStatus;
  progress: number;
  logs: string[];
  artifact?: string;
}

export interface SystemState {
  supervisorStatus: 'ACTIVE' | 'DECIDING' | 'IDLE';
  activeBranches: Branch[];
  mainRepoVersion: number;
  securityScore: number;
  isHealthy: boolean;
}

export interface AgentMessage {
  type: 'LOG' | 'STATUS_CHANGE' | 'ARTIFACT_READY' | 'TEST_REPORT' | 'SUPERVISOR_DECISION';
  branchId?: string;
  payload: any;
  timestamp: string;
}
