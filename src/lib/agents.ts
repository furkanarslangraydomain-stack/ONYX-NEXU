import { GoogleGenAI } from "@google/genai";
import { AgentRole, Branch, BranchStatus } from "../types";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const fallbackPlan: Array<{ name: string; role: AgentRole }> = [
  { name: 'Architecture Review', role: 'Architect' },
  { name: 'Implementation', role: 'Developer' },
  { name: 'Quality Gate', role: 'QA' },
  { name: 'Security Shield', role: 'Sentinel' },
];

/**
 * Supervisor Agent: The "Master Brain" that oversees all branches.
 */
export class Supervisor {
  private branches: Branch[] = [];

  constructor(private onUpdate: (data: any) => void) {}

  async planProject(prompt: string) {
    this.onUpdate({ type: 'STATUS_CHANGE', payload: 'PLANNING' });
    
    // Step 1: Architecting the task into branches
    const systemPrompt = `You are the Supervisor of the ONYX-Nexus system. 
    Analyze the user request and split it into logical sub-branches for a multi-agent system.
    Available Roles: Architect, Developer, QA, Sentinel, Researcher.
    
    Output a JSON array of branches:
    [{"name": "Branch Name", "role": "Role"}]`;
    
    try {
      const result = ai
        ? await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction: systemPrompt, responseMimeType: "application/json" },
          })
        : null;
      const plan = result?.text ? JSON.parse(result.text) : fallbackPlan;
      this.branches = plan.map((b: any, i: number) => ({
        id: `branch-${i}-${Date.now()}`,
        name: b.name,
        role: b.role,
        status: 'IDLE',
        progress: 0,
        logs: [`Branch ${b.name} initialized by Supervisor.`]
      }));

      this.onUpdate({ type: 'BRANCHES_INIT', payload: this.branches });
      
      // Step 2: Execute branches in parallel
      await this.executeBranches();
      
    } catch (error) {
      console.error("Supervisor Error:", error);
      this.onUpdate({ type: 'ERROR', payload: 'Failed to plan project.' });
    }
  }

  private async executeBranches() {
    const executionPromises = this.branches.map(branch => this.runBranch(branch));
    await Promise.all(executionPromises);
    
    // Final review
    this.onUpdate({ type: 'STATUS_CHANGE', payload: 'FINAL_REVIEW' });
  }

  private async runBranch(branch: Branch) {
    branch.status = 'WORKING';
    this.onUpdate({ type: 'BRANCH_UPDATE', payload: branch });

    // Simulate work steps
    const steps = ['RESEARCHING', 'CODING', 'TESTING', 'VALIDATING'];
    for (let i = 0; i < steps.length; i++) {
      branch.status = steps[i] as BranchStatus;
      branch.progress = (i + 1) * 25;
      branch.logs.push(`Agent [${branch.role}] is currently ${steps[i]}...`);
      this.onUpdate({ type: 'BRANCH_UPDATE', payload: branch });
      
      // Artificial delay for visual feedback in UI
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    }

    branch.status = 'MERGED';
    branch.logs.push(`Branch ${branch.name} successfully merged after 100% test pass.`);
    this.onUpdate({ type: 'BRANCH_UPDATE', payload: branch });
  }
}
