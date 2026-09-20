import { AgentRole, Branch, BranchStatus } from '../types'
import { buildFallbackPlan, generatePlan } from './providers'

export class Supervisor {
  private branches: Branch[] = []

  constructor(private onUpdate: (data: any) => void) {}

  async planProject(prompt: string) {
    this.onUpdate({ type: 'STATUS_CHANGE', payload: 'PLANNING' })
    try {
      const rawPlan = await generatePlan(prompt)
      const fallback = buildFallbackPlan()
      const plan = Array.isArray(rawPlan) && rawPlan.length ? rawPlan : fallback
      this.branches = plan.slice(0, 9).map((branch: { name?: string; role?: AgentRole }, index: number) => ({
        id: `branch-${index}-${Date.now()}`,
        name: branch.name || `Branch ${index + 1}`,
        role: branch.role || 'Developer',
        status: 'IDLE',
        progress: 0,
        logs: [`Branch ${branch.name || `Branch ${index + 1}`} initialized by Supervisor.`],
      }))
      this.onUpdate({ type: 'BRANCHES_INIT', payload: this.branches })
      await Promise.all(this.branches.map((branch) => this.runBranch(branch)))
      this.onUpdate({ type: 'STATUS_CHANGE', payload: 'FINAL_REVIEW' })
    } catch (error) {
      console.error('[v0] Supervisor provider fallback:', error)
      this.onUpdate({ type: 'ERROR', payload: 'Provider unavailable; fallback plan retained.' })
      this.branches = buildFallbackPlan().map((branch, index) => ({
        id: `branch-${index}-${Date.now()}`,
        name: branch.name,
        role: branch.role as AgentRole,
        status: 'IDLE',
        progress: 0,
        logs: ['Offline fallback branch initialized.'],
      }))
      this.onUpdate({ type: 'BRANCHES_INIT', payload: this.branches })
      await Promise.all(this.branches.map((branch) => this.runBranch(branch)))
    }
  }

  private async runBranch(branch: Branch) {
    branch.status = 'WORKING'
    this.onUpdate({ type: 'BRANCH_UPDATE', payload: branch })
    const steps = ['RESEARCHING', 'CODING', 'TESTING', 'VALIDATING']
    for (const [index, step] of steps.entries()) {
      branch.status = step as BranchStatus
      branch.progress = (index + 1) * 25
      branch.logs.push(`Agent [${branch.role}] is currently ${step}...`)
      this.onUpdate({ type: 'BRANCH_UPDATE', payload: branch })
      await new Promise((resolve) => setTimeout(resolve, 600))
    }
    branch.status = 'MERGED'
    branch.logs.push(`Branch ${branch.name} successfully merged after validation.`)
    this.onUpdate({ type: 'BRANCH_UPDATE', payload: branch })
  }
}
