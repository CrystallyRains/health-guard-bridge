const API_BASE = import.meta.env.VITE_API_BASE;

export const api = {
  register:           `${API_BASE}/patient/register`,
  uploadDocument:     `${API_BASE}/documents/upload`,
  emergencyAccess:    `${API_BASE}/clinician/access`,
  auditLog:           (id) => `${API_BASE}/patient/${id}/audit`,
  getPatient:         (id) => `${API_BASE}/patient/${id}`,
  getPatientByPhone:  (phone) => `${API_BASE}/patient/by-phone?phone=${phone}`,
  getDocumentUrl:     (healthKeyId, docId) => `${API_BASE}/patient/${healthKeyId}/document/${docId}/url`,
};
