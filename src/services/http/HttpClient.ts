// Cliente HTTP con error handling centralizado

export class HttpClient {
  static async get<T>(url: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, {
        mode: 'cors',
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`HTTP request failed: ${url}`, error);
      throw error;
    }
  }
}
