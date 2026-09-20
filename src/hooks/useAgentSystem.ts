import { useState, useEffect, useRef, useCallback } from 'react';
import { SystemState, AgentMessage } from '../types';

const initialState: SystemState = {
  supervisorStatus: 'IDLE',
  activeBranches: [],
  mainRepoVersion: 1,
  securityScore: 100,
  isHealthy: true,
};

export function useAgentSystem() {
  const [state, setState] = useState<SystemState>(initialState);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPrompt = useRef<string | null>(null);

  const handleServerMessage = useCallback((msg: AgentMessage | { type: string; payload?: unknown; message?: string }) => {
    if (msg.type === 'STATUS_CHANGE') {
      setState((prev) => ({ ...prev, supervisorStatus: msg.payload as SystemState['supervisorStatus'] }));
    } else if (msg.type === 'BRANCHES_INIT') {
      setState((prev) => ({ ...prev, activeBranches: msg.payload as SystemState['activeBranches'] }));
    } else if (msg.type === 'BRANCH_UPDATE') {
      const branch = msg.payload as SystemState['activeBranches'][number];
      setState((prev) => ({
        ...prev,
        activeBranches: prev.activeBranches.map((item) => item.id === branch.id ? branch : item),
      }));
    } else if (msg.type === 'ERROR') {
      setState((prev) => ({ ...prev, supervisorStatus: 'IDLE', isHealthy: false }));
    }
  }, []);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    ws.current = socket;
    socket.onopen = () => {
      setState((prev) => ({ ...prev, isHealthy: true }));
      if (pendingPrompt.current) {
        socket.send(JSON.stringify({ type: 'START_PROJECT', payload: pendingPrompt.current }));
        pendingPrompt.current = null;
      }
    };
    socket.onmessage = (event) => {
      try { handleServerMessage(JSON.parse(event.data)); } catch { /* Ignore malformed frames. */ }
    };
    socket.onclose = () => {
      ws.current = null;
      reconnectTimer.current = setTimeout(connect, 1500);
    };
    socket.onerror = () => setState((prev) => ({ ...prev, isHealthy: false }));
  }, [handleServerMessage]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [connect]);

  const startNewProject = (prompt: string) => {
    if (!prompt.trim()) return;
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'START_PROJECT', payload: prompt.trim() }));
    } else {
      pendingPrompt.current = prompt.trim();
      connect();
    }
  };

  return { state, startNewProject };
}

export default useAgentSystem;
