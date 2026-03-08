export const mockPatient = {
  id: "HK-2847-NKGP",
  name: "Snigdha Chaudhari",
  age: 28,
  gender: "Female",
  phone: "+91-98765-43210",
  email: "snigdha@email.com",
  blood: "A+",
  state: "Maharashtra",
  allergies: ["Penicillin", "Peanuts", "Sulfa drugs"],
  medications: ["Lisinopril 10mg", "Metformin 500mg"],
  conditions: ["Hypertension", "Type 2 Diabetes"],
  surgeries: [{ name: "Appendectomy", date: "March 2023" }],
  emergencyContacts: [
    { name: "Vijay Chaudhari", relation: "Father", phone: "+91-98XXX-XXXXX" },
    { name: "Meena Chaudhari", relation: "Mother", phone: "+91-97XXX-XXXXX" },
  ],
  privacyToggles: { allergies: true, medications: true, conditions: true, surgeries: true },
  documents: [
    { name: "City_Hospital_Discharge_Jan2026.pdf", date: "Jan 15, 2026", status: "Processed" as const, lang: "English" },
    { name: "Prescription_Feb2026.jpg", date: "Feb 10, 2026", status: "Processed" as const, lang: "Marathi → English" },
    { name: "BloodReport_Dec2025.pdf", date: "Dec 5, 2025", status: "Processed" as const, lang: "English" },
  ],
};

export const mockAuditLog = [
  { time: "08 Mar 2026, 09:14 AM", doctor: "Dr. Ramesh Patil", hospital: "AIIMS Nagpur", purpose: "Emergency Treatment", duration: "30 min", status: "Expired" as const },
  { time: "05 Mar 2026, 03:42 PM", doctor: "Dr. Priya Sharma", hospital: "Wockhardt Hospital, Mumbai", purpose: "OPD Consultation", duration: "30 min", status: "Expired" as const },
  { time: "01 Mar 2026, 11:00 AM", doctor: "Dr. Anil Mehta", hospital: "Apollo Hospitals, Nagpur", purpose: "Pre-surgery Review", duration: "30 min", status: "Expired" as const },
];

export const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

export const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export const clinicianTranslations: Record<string, Record<string, string>> = {
  EN: {
    allergies: "Allergies",
    medications: "Current Medications",
    conditions: "Existing Conditions",
    bloodGroup: "Blood Group",
    surgeries: "Recent Surgeries",
    emergencyContacts: "Emergency Contacts",
    warning: "Critical-Only View · Full records not accessible · Sourced from patient-consented data",
    sessionExpired: "Session Expired. Access has been revoked. This event has been logged.",
  },
  HI: {
    allergies: "एलर्जी",
    medications: "वर्तमान दवाइयाँ",
    conditions: "मौजूदा स्थितियाँ",
    bloodGroup: "रक्त समूह",
    surgeries: "हाल की सर्जरी",
    emergencyContacts: "आपातकालीन संपर्क",
    warning: "केवल गंभीर जानकारी · पूर्ण रिकॉर्ड उपलब्ध नहीं · रोगी की सहमति से प्राप्त डेटा",
    sessionExpired: "सत्र समाप्त। पहुँच रद्द कर दी गई है। यह घटना लॉग की गई है।",
  },
  MR: {
    allergies: "ऍलर्जी",
    medications: "सध्याची औषधे",
    conditions: "विद्यमान परिस्थिती",
    bloodGroup: "रक्तगट",
    surgeries: "अलीकडील शस्त्रक्रिया",
    emergencyContacts: "आणीबाणी संपर्क",
    warning: "फक्त गंभीर माहिती · पूर्ण नोंदी उपलब्ध नाहीत · रुग्णाच्या संमतीने मिळवलेला डेटा",
    sessionExpired: "सत्र संपले. प्रवेश रद्द करण्यात आला आहे. ही घटना नोंदवली गेली आहे.",
  },
  TA: {
    allergies: "ஒவ்வாமை",
    medications: "தற்போதைய மருந்துகள்",
    conditions: "இருக்கும் நிலைமைகள்",
    bloodGroup: "இரத்தப் பிரிவு",
    surgeries: "சமீபத்திய அறுவை சிகிச்சைகள்",
    emergencyContacts: "அவசர தொடர்புகள்",
    warning: "முக்கியமான மட்டும் · முழு பதிவுகள் கிடைக்காது · நோயாளி ஒப்புதல் தரவு",
    sessionExpired: "அமர்வு முடிந்தது. அணுகல் ரத்து செய்யப்பட்டது. இந்த நிகழ்வு பதிவு செய்யப்பட்டது.",
  },
  TE: {
    allergies: "అలెర్జీలు",
    medications: "ప్రస్తుత మందులు",
    conditions: "ఉన్న పరిస్థితులు",
    bloodGroup: "రక్తం గ్రూపు",
    surgeries: "ఇటీవలి శస్త్రచికిత్సలు",
    emergencyContacts: "అత్యవసర సంప్రదింపులు",
    warning: "క్లిష్టమైన మాత్రమే · పూర్తి రికార్డులు అందుబాటులో లేవు · రోగి సమ్మతి డేటా",
    sessionExpired: "సెషన్ ముగిసింది. యాక్సెస్ రద్దు చేయబడింది. ఈ సంఘటన లాగ్ చేయబడింది.",
  },
};
