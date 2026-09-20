import { useState, useEffect, useRef } from 'react';
import { SystemState, AgentMessage } from './types';

export function useAgentSystem() {
  const [state, setState] = useState<SystemState>({
    supervisorStatus: 'IDLE',
    activeBranches: [],
    mainRepoVersion: 1,
    securityScore: 100,
    isHealthy: true,
  });
  
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    ws.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as AgentMessage;
      handleServerMessage(data);
    };

    return () => socket.close();
  }, []);

  const handleServerMessage = (msg: any) => {
    if (msg.type === 'INIT') {
      console.log(msg.message);
    }
    
    if (msg.type === 'STATUS_CHANGE') {
      setState(prev => ({ ...prev, supervisorStatus: msg.payload }));
    }

    if (msg.type === 'BRANCHES_INIT') {
      setState(prev => ({ ...prev, activeBranches: msg.payload }));
    }

    if (msg.type === 'BRANCH_UPDATE') {
      setState(prev => ({
        ...prev,
        activeBranches: prev.activeBranches.map(b => 
          b.id === msg.payload.id ? msg.payload : b
        )
      }));
    }
  };

  const startNewProject = (prompt: string) => {
    ws.current?.send(JSON.stringify({ type: 'START_PROJECT', payload: prompt }));
  };

  return { state, startNewProject };
}
