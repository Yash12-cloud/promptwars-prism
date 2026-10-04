export type Flavor = 'Association' | 'Baseline' | 'Inertia' | 'Outcome' | 'Self-Perspective';

export interface Assumption {
  text: string;
  flavor: Flavor;
  risk: 'low'|'medium'|'high';
  test: string;
}

export interface BiasTag {
  name: string;
  flavor: Flavor;
  quote: string;
  explain: string;
}

export interface Frame {
  title: string;
  desc: string;
  icon: string;
}

export interface Experiment {
  title: string;
  time: string;
  desc: string;
}

export interface RippleNode { id: string; label: string; type: 'decision'|'first'|'second'|'third'; x: number; y: number; }

export interface AnalysisResult {
  title: string;
  summary: string;
  assumptions: Assumption[];
  biases: BiasTag[];
  socratic: string[];
  frames: Frame[];
  experiments: Experiment[];
  premortems: { title: string; story: string; prob: string }[];
  ripples: { nodes: RippleNode[]; edges: [string,string][] };
  confidenceNote: string;
}

export interface DuelPayload {
  advocate: { points: string[]; verify: string };
  skeptic: { points: string[]; questions: string[] };
  rebuttal?: string[];
}

export interface ExampleCase {
  id: string;
  label: string;
  icon: string;
  decision: string;
  reasoning: string;
  confidence: number;
}
