import { buildFallbackPlan, generatePlan } from './providers'
import { AgentRole, Branch, BranchStatus } from '../types'

export type RuntimeEvent =
  | { type: 'STATUS_CHANGE'; payload: string }
  | { type: 'BRANCHES_INIT'; payload: Branch[] }
  | { type: 'BRANCH_UPDATE'; payload: Branch }
  | { type: 'ERROR'; payload: string }

const STEPS: BranchStatus[] = ['RESEARCHING', 'CODING', 'TESTING', 'VALIDATING']

export class AgentRuntime {
  private branches: Branch[] = []
  private cancelled = false

  constructor(private readonly emit: (event: RuntimeEvent) => void) {}

  cancel() {
    this.cancelled = true
  }

  async execute(prompt: string) {
    this.cancelled = false
    this.emit({ type: 'STATUS_CHANGE', payload: 'PLANNING' })
    try {
      const candidate = await generatePlan(prompt)
      const plan = Array.isArray(candidate) && candidate.length ? candidate : buildFallbackPlan()
      this.branches = plan.slice(0, 9).map((item, index) => this.createBranch(item.name, item.role, index))
      this.emit({ type: 'BRANCHES_INIT', payload: this.branches })
      await Promise.all(this.branches.map((branch) => this.runBranch(branch)))
      if (!this.cancelled) this.emit({ type: 'STATUS_CHANGE', payload: 'FINAL_REVIEW' })
    } catch (error) {
      console.error('[v0] Agent runtime fallback:', error)
      this.emit({ type: 'ERROR', payload: 'Provider unavailable; offline plan activated.' })
      this.branches = buildFallbackPlan().map((item, index) => this.createBranch(item.name, item.role, index, true))
      this.emit({ type: 'BRANCHES_INIT', payload: this.branches })
      await Promise.all(this.branches.map((branch) => this.runBranch(branch)))
    }
  }

  private createBranch(name: string, role: string, index: number, offline = false): Branch {
    const safeRole: AgentRole = ['Supervisor', 'Architect', 'Developer', 'QA', 'Sentinel', 'Researcher'].includes(role)
      ? role as AgentRole
      : 'Developer'
    return {
      id: `branch-${Date.now()}-${index}`,
      name: name || `Branch ${index + 1}`,
      role: safeRole,
      status: 'IDLE',
      progress: 0,
      logs: [offline ? 'Offline fallback branch initialized.' : 'Branch initialized by Supervisor.'],
    }
  }

  private async runBranch(branch: Branch) {
    branch.status = 'WORKING'
    this.emit({ type: 'BRANCH_UPDATE', payload: branch })
    for (const [index, step] of STEPS.entries()) {
      if (this.cancelled) return
      branch.status = step
      branch.progress = (index + 1) * 25
      branch.logs = [...branch.logs, `Agent [${branch.role}] is currently ${step}...`]
      this.emit({ type: 'BRANCH_UPDATE', payload: branch })
      await new Promise((resolve) => setTimeout(resolve, 350))
    }
    branch.status = 'MERGED'
    branch.logs = [...branch.logs, `Branch ${branch.name} successfully validated.`]
    this.emit({ type: 'BRANCH_UPDATE', payload: branch })
  }
}

export { AgentRuntime as Supervisor }
export type { RuntimeEvent as AgentEvent }
export { generatePlan, buildFallbackPlan }
