import { api } from "@/services/api";

export const uploadService = {
  /**
   * Uploads a file or blob directly to the backend API
   * @param file File or Blob to upload
   * @param fileName Name of the file
   * @returns The public/internal URL of the uploaded file
   */
  async uploadFile(file: File | Blob, fileName: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file, fileName);
    
    const response = await api.post<{ url: string }>('/upload', {
      body: formData as any,
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Upload failed');
    }
    
    return response.data.url;
  },
};
