import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Cpu, 
  Zap, 
  Binary, 
  Search, 
  GitBranch, 
  CheckCircle2, 
  AlertCircle,
  Terminal,
  Activity,
  Layers,
  Bot
} from 'lucide-react';
import { useAgentSystem } from './hooks/useAgentSystem';
import { Branch } from './types';

export default function App() {
  const { state, startNewProject } = useAgentSystem();
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    startNewProject(prompt);
    setPrompt('');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-cyan-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* Main Layout */}
      <main className="relative max-w-7xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: System Info */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="font-bold tracking-tight">Supervisor</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Status</span>
                <span className="flex items-center gap-2 text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  {state.supervisorStatus}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Security Score</span>
                <span className="font-mono text-emerald-400">{state.securityScore}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Main Version</span>
                <span className="font-mono">v{state.mainRepoVersion}.0.0</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Real-time Metrics
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span>Logic Coverage</span>
                  <span className="text-cyan-400">98.2%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '98.2%' }}
                    className="h-full bg-cyan-500" 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span>Branch Synchronization</span>
                  <span className="text-blue-400">100%</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className="h-full bg-blue-500" 
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Center: Command Center & Active Branches */}
        <section className="lg:col-span-9 space-y-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                ONYX<span className="text-cyan-500">.</span>Nexus
              </h1>
              <p className="text-slate-400 text-lg">Next-Gen Agentic Branching Architecture</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-colors">
                <Terminal className="w-4 h-4" />
                <span className="text-sm font-medium">Logs</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all shadow-lg shadow-cyan-900/20">
                <Layers className="w-4 h-4" />
                <span className="text-sm font-medium">New Branch</span>
              </button>
            </div>
          </header>

          {/* Input Area */}
          <div className="p-1 rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-800/50 backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="relative flex items-center p-2">
              <div className="absolute left-6 pointer-events-none">
                <Bot className="w-6 h-6 text-cyan-400" />
              </div>
              <input 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the project goal for the Supervisor..."
                className="w-full bg-transparent pl-14 pr-32 py-4 text-lg text-white placeholder-slate-500 focus:outline-none"
              />
              <button 
                type="submit"
                className="absolute right-4 px-6 py-2 bg-white text-black font-bold rounded-2xl hover:bg-cyan-50 transition-colors"
              >
                Execute
              </button>
            </form>
          </div>

          {/* Branches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {state.activeBranches.length === 0 ? (
                <div className="col-span-2 py-20 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800/50 rounded-3xl">
                  <GitBranch className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm tracking-wide">SYSTEM IDLE - WAITING FOR INPUT</p>
                </div>
              ) : (
                state.activeBranches.map((branch) => (
                  <BranchCard key={branch.id} branch={branch} />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Visual Capabilities Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <CapabilityCard 
              icon={<Binary className="w-5 h-5 text-purple-400" />}
              title="Polyglot Engine"
              desc="Cross-language compilation & sandbox testing."
            />
            <CapabilityCard 
              icon={<Search className="w-5 h-5 text-emerald-400" />}
              title="Deep Research"
              desc="Real-time knowledge graph generation."
            />
            <CapabilityCard 
              icon={<Zap className="w-5 h-5 text-amber-400" />}
              title="Auto-Repair"
              desc="Self-healing logic with 3-cycle recursion."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function BranchCard({ branch }: { branch: Branch }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/50 group hover:border-cyan-500/30 transition-all"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-500">#{branch.id.slice(0, 8)}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              branch.status === 'MERGED' ? 'bg-emerald-500/10 text-emerald-400' : 
              branch.status === 'FAILED' ? 'bg-red-500/10 text-red-400' : 
              'bg-cyan-500/10 text-cyan-400'
            }`}>
              {branch.status}
            </span>
          </div>
          <h3 className="font-bold text-white text-lg">{branch.name}</h3>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-xl">
          <GitBranch className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Role: {branch.role}</span>
          <span>{branch.progress}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${branch.progress}%` }}
            className={`h-full ${
              branch.status === 'FAILED' ? 'bg-red-500' : 'bg-cyan-500'
            }`}
          />
        </div>
        
        <div className="pt-2">
          <p className="text-[10px] font-mono text-slate-500 truncate">
            {branch.logs[branch.logs.length - 1] || 'Initializing branch...'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function CapabilityCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-800/30">
      <div className="mb-4">{icon}</div>
      <h4 className="font-bold text-white mb-2">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
