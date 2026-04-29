import { api } from '@/services/api';
import { AuthConfig, TestScenario } from '@/types/test-scenario';

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
    params: { sheetNames?: string[]; sectionIds?: string[]; testCaseIds?: string[] }
  ): Promise<{ message: string; id: string }> => {
    const response = await api.post<{ message: string; id: string }>(
      `/test-scenarios/${id}/generate`,
      {
        body: JSON.stringify(params),
      }
    );
    if (!response.success) throw new Error(response.error);
    return response.data!;
  },

  updateScenario: async (
    id: string,
    data: { title?: string; description?: string }
  ): Promise<TestScenario> => {
    const response = await api.patch<TestScenario>(`/test-scenarios/${id}`, {
      body: JSON.stringify(data),
    });
    if (!response.success) throw new Error(response.error);
    return response.data!;
  },

  updateTestCase: async (
    id: string,
    sectionId: string,
    tcId: string,
    data: any
  ): Promise<TestScenario> => {
    const response = await api.patch<TestScenario>(
      `/test-scenarios/${id}/sections/${sectionId}/test-cases/${tcId}`,
      { body: JSON.stringify(data) }
    );
    if (!response.success) throw new Error(response.error);
    return response.data!;
  },

  addTestCase: async (
    id: string,
    sectionId: string,
    data: any
  ): Promise<TestScenario> => {
    const response = await api.post<TestScenario>(
      `/test-scenarios/${id}/sections/${sectionId}/test-cases`,
      { body: JSON.stringify(data) }
    );
    if (!response.success) throw new Error(response.error);
    return response.data!;
  },

  deleteTestCase: async (
    id: string,
    sectionId: string,
    tcId: string
  ): Promise<TestScenario> => {
    const response = await api.delete<TestScenario>(
      `/test-scenarios/${id}/sections/${sectionId}/test-cases/${tcId}`
    );
    if (!response.success) throw new Error(response.error);
    return response.data!;
  },

  reorderTestCases: async (
    id: string,
    sectionId: string,
    orderedIds: string[]
  ): Promise<TestScenario> => {
    const response = await api.patch<TestScenario>(
      `/test-scenarios/${id}/sections/${sectionId}/test-cases/reorder`,
      { body: JSON.stringify({ orderedIds }) }
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
