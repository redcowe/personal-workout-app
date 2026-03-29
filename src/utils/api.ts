const BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${init?.method ?? 'GET'} ${path} → ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  // Exercises
  getExercises: () => request<any[]>('/api/exercises'),
  createExercise: (data: object) => request<any>('/api/exercises', { method: 'POST', body: JSON.stringify(data) }),
  updateExercise: (id: string, data: object) => request<any>(`/api/exercises/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExercise: (id: string) => request<void>(`/api/exercises/${id}`, { method: 'DELETE' }),

  // Templates
  getTemplates: () => request<any[]>('/api/templates'),
  createTemplate: (data: object) => request<any>('/api/templates', { method: 'POST', body: JSON.stringify(data) }),
  updateTemplate: (id: string, data: object) => request<any>(`/api/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTemplate: (id: string) => request<void>(`/api/templates/${id}`, { method: 'DELETE' }),

  // Logs
  getLogs: () => request<any[]>('/api/logs'),
  createLog: (data: object) => request<any>('/api/logs', { method: 'POST', body: JSON.stringify(data) }),
  deleteLog: (id: string) => request<void>(`/api/logs/${id}`, { method: 'DELETE' }),
};
