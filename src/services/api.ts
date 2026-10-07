import {
  Institution,
  ChatMessage,
  WhatIfSimulationInput,
  WhatIfSimulationResult,
} from '../types/institution';

export async function fetchInstitutions(): Promise<Institution[]> {
  try {
    const res = await fetch('/api/institutions');
    if (!res.ok) throw new Error('Failed to fetch institutions');
    const data = await res.json();
    return data.institutions || [];
  } catch (err) {
    console.warn('API error, using local fallback:', err);
    return [];
  }
}

export async function saveInstitution(inst: Partial<Institution>): Promise<Institution> {
  const res = await fetch('/api/institutions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inst),
  });
  if (!res.ok) throw new Error('Failed to save institution');
  const data = await res.json();
  return data.institution;
}

export async function updateInstitution(id: string, inst: Partial<Institution>): Promise<Institution> {
  const res = await fetch(`/api/institutions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inst),
  });
  if (!res.ok) throw new Error('Failed to update institution');
  const data = await res.json();
  return data.institution;
}

export async function deleteInstitution(id: string): Promise<boolean> {
  const res = await fetch(`/api/institutions/${id}`, {
    method: 'DELETE',
  });
  return res.ok;
}

export async function requestDeepAIAnalysis(inst: Institution): Promise<Institution> {
  try {
    const res = await fetch('/api/institution/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inst),
    });
    if (!res.ok) throw new Error('Analysis request failed');
    const data = await res.json();
    return data.institution || inst;
  } catch (err) {
    console.error('Deep AI analysis failed, preserving local calculations:', err);
    return inst;
  }
}

export async function askInstitutionAI(
  institution: Institution,
  message: string,
  history: ChatMessage[]
): Promise<{ reply: string; highlights: { label: string; value: string }[] }> {
  const res = await fetch('/api/institution/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ institution, message, history }),
  });
  if (!res.ok) throw new Error('Chat failed');
  return res.json();
}

export async function runSimulation(
  institution: Institution,
  input: WhatIfSimulationInput
): Promise<WhatIfSimulationResult> {
  const res = await fetch('/api/institution/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ institution, input }),
  });
  if (!res.ok) throw new Error('Simulation failed');
  const data = await res.json();
  return data.result;
}
