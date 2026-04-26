import { api } from '@/services/api';
import { AuthConfig, TestScenario } from '@/types/test-scenario';
import { MessageType } from '@/types/messages';

export const testScenarioApi = {
  uploadScenario: async (
    file: File,
    projectId: string,
    authConfig: AuthConfig
  ): Promise<{ message: string; id: string; sheets: number }> => {
    try {
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('projectId', projectId);
      formData.append('authConfig', JSON.stringify(authConfig));
      const response = await api.post<{ message: string; id: string; sheets: number }>('/test-scenarios/upload', { body: formData as any });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Failed to upload scenario');
    } catch (err: any) {
      throw new Error(err.message || 'Failed to upload scenario');
    }
  },

  listScenarios: async (): Promise<TestScenario[]> => {
    const response = await api.get<TestScenario[]>('/test-scenarios');
    if (!response.success) throw new Error(response.error);
    return response.data || [];
  },

  getScenario: async (id: string): Promise<TestScenario> => {
    const response = await api.get<TestScenario>(`/test-scenarios/${id}`);
    if (!response.success) throw new Error(response.error);
    return response.data!;
  },

  deleteScenario: async (
    id: string
  ): Promise<{ message: string; id: string }> => {
    const response = await api.delete<{ message: string; id: string }>(
      `/test-scenarios/${id}`
    );
    if (!response.success) throw new Error(response.error);
    return response.data!;
  },

  generateTests: async (
    id: string,
    sheetNames: string[]
  ): Promise<{ message: string; id: string }> => {
    const response = await api.post<{ message: string; id: string }>(
      `/test-scenarios/${id}/generate`,
      {
        body: JSON.stringify({ sheetNames }),
      }
    );
    if (!response.success) throw new Error(response.error);
    return response.data!;
  },

  bulkDeleteScenarios: async (ids: string[]) => {
    const response = await api.post<{
      message: string;
      deletedCount: number;
      notFound: string[];
      errors: string[];
    }>('/test-scenarios/bulk-delete', {
      body: JSON.stringify({ ids }),
    });
    if (!response.success) throw new Error(response.error);
    return response.data!;
  },
};
