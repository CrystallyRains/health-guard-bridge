const API_BASE = import.meta.env.VITE_API_BASE;

export const api = {
  register:        `${API_BASE}/patient/register`,
  uploadDocument:  `${API_BASE}/documents/upload`,
  emergencyAccess: `${API_BASE}/clinician/access`,
  auditLog:        (id) => `${API_BASE}/patient/${id}/audit`,
};
