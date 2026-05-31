import { api } from "@/services/api";

export const uploadService = {
  /**
   * Uploads a file or blob to the backend API using the project-scoped endpoint.
   * @param file File or Blob to upload
   * @param fileName Name of the file
   * @param projectId Optional project ID. If not provided, reads from localStorage.
   * @returns The public/internal URL of the uploaded file
   */
  async uploadFile(file: File | Blob, fileName: string, projectId?: string | number): Promise<string> {
    // Resolve projectId from localStorage if not explicitly provided
    let resolvedId = projectId;
    if (!resolvedId) {
      try {
        const raw = localStorage.getItem('selectedProjectId');
        if (raw) resolvedId = JSON.parse(raw);
      } catch { /* ignore */ }
    }

    if (!resolvedId) {
      throw new Error('No project selected. Please select a project before uploading files.');
    }

    const formData = new FormData();
    formData.append('file', file, fileName);

    const response = await api.post<{ url: string }>(
      `/projects/${resolvedId}/uploads`,
      { body: formData as any },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Upload failed');
    }

    return response.data.url;
  },
};
