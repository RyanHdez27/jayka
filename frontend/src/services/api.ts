const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : 'http://localhost:8000/api/v1';

export interface QuotationPayload {
  client_name: string;
  client_phone: string;
  client_email?: string;
  project_location?: string;
  wants_contact?: boolean;
  grand_total: number;
  services: Array<{
    service: string;
    area: number;
    unitPrice: number;
    subtotal: number;
  }>;
  result_json: Record<string, any>;
  type?: string;
}

export const api = {
  async getServices() {
    const res = await fetch(`${API_BASE_URL}/services`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async getProjects() {
    const res = await fetch(`${API_BASE_URL}/projects`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async getPosts() {
    const res = await fetch(`${API_BASE_URL}/posts`);
    const json = await res.json();
    return json.success ? json.data : [];
  },

  async submitLead(formData: { name: string; email: string; message: string }) {
    const res = await fetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Error enviando mensaje');
    return json;
  },

  async submitQuotation(payload: QuotationPayload) {
    try {
      const res = await fetch(`${API_BASE_URL}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        console.warn('Error backend al guardar cotización:', json.message || res.statusText);
        return { success: false, error: json.message };
      }
      return json;
    } catch (err: any) {
      console.warn('No se pudo conectar al backend de cotizaciones (modo offline/fallback activo):', err.message);
      return { success: false, error: err.message };
    }
  },
};
