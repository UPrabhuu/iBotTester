/**
 * Execution Event Types
 * WebSocket events emitted during test execution
 */

export type ExecutionEventType =
  | 'run_started'
  | 'step_started'
  | 'step_finished'
  | 'frame'
  | 'console'
  | 'log'
  | 'run_finished'
  | 'connected'
  | 'snapshot';

export interface BaseEvent {
  type: ExecutionEventType;
  executionId: string;
  timestamp: number;
}

export interface RunStartedEvent extends BaseEvent {
  type: 'run_started';
  testName: string;
  totalSteps: number;
  startUrl: string;
}

export interface StepStartedEvent extends BaseEvent {
  type: 'step_started';
  stepNumber: number;
  action: string;
  description?: string;
  selector?: string;
}

export interface StepFinishedEvent extends BaseEvent {
  type: 'step_finished';
  stepNumber: number;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

export interface FrameEvent extends BaseEvent {
  type: 'frame';
  mime: string; // 'image/png'
  base64: string;
  seq: number; // frame sequence number
}

export interface ConsoleEvent extends BaseEvent {
  type: 'console';
  level: 'log' | 'debug' | 'info' | 'warn' | 'error';
  text: string;
}

export interface LogEvent extends BaseEvent {
  type: 'log';
  level: 'info' | 'warning' | 'error';
  message: string;
}

export interface RunFinishedEvent extends BaseEvent {
  type: 'run_finished';
  status: 'passed' | 'failed';
  totalDuration: number;
  artifacts?: {
    traceUrl?: string;
    reportUrl?: string;
  };
}

export interface SnapshotEvent extends BaseEvent {
  type: 'snapshot';
  lastFrame: FrameEvent | null;
  steps: Array<{
    stepNumber: number;
    action: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: string;
  }>;
  logs: Array<{
    level: string;
    message: string;
    timestamp: number;
  }>;
}

export type ExecutionEvent =
  | RunStartedEvent
  | StepStartedEvent
  | StepFinishedEvent
  | FrameEvent
  | ConsoleEvent
  | LogEvent
  | RunFinishedEvent
  | SnapshotEvent;

export type ExecutionEventListener = (event: ExecutionEvent) => void;
