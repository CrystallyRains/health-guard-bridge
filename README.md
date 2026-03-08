# 🏥 HealthKey — AI-Powered Emergency Medical Access for India

> **AI for Bharat Hackathon 2026** | Powered by AWS | Organized by Hack2skill
> 
> **Track:** AI for Healthcare & Life Sciences

[![Live Demo](https://img.shields.io/badge/Live%20Demo-HealthKey-blue?style=for-the-badge)](https://main.d3815zbuat35tz.amplifyapp.com)
[![AWS](https://img.shields.io/badge/Built%20on-AWS-orange?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com)

---

## 🚨 The Problem

India has **1.4 billion people** and fragmented medical records. In an emergency, a doctor treating an unconscious patient has **no way to access** their medical history — allergies, medications, or critical conditions.

ABHA/ABDM only works when hospitals are affiliated. Most Indian medical data sits in PDFs, scattered across hospitals, in Hindi, Marathi, Tamil, and Telugu — inaccessible when it matters most.

**HealthKey bridges this gap.**

---

## 💡 What is HealthKey?

HealthKey is a **patient-controlled, AI-powered emergency medical access layer** for India.

- Patients register once and get a unique **HealthKey ID**
- They upload their medical documents (PDFs in any Indian language)
- In an emergency, a doctor enters the HealthKey ID and instantly gets an **AI-generated clinical summary** in their preferred language
- The session **auto-expires in 30 minutes** — no permanent access granted
- Every access is logged in a **tamper-evident audit trail**
- Patients control what doctors can see via **privacy toggles**

---

## 🏗️ Architecture

```
HealthKey Web App (React + TypeScript · AWS Amplify)
           ↓
   Amazon API Gateway (HTTP API · 6 routes)
           ↓
      AWS Lambda (Node.js 20.x)
     ↙         ↘
Amazon S3    AI Pipeline:
(PDF store)  Textract → Translate → Bedrock (Claude 3 Haiku)
                                        ↓
                               Amazon DynamoDB
                         (Patient profiles + Audit log)
```

---

## ⚙️ AWS Services Used

| Service | Purpose |
|---|---|
| **AWS Amplify** | Frontend hosting + CI/CD from GitHub |
| **Amazon API Gateway** | HTTP API, 6 routes, CORS enabled |
| **AWS Lambda** | All backend logic (Node.js 20.x) |
| **Amazon S3** | Encrypted medical document storage |
| **Amazon Textract** | Async OCR — multi-page PDFs, Devanagari script |
| **Amazon Translate** | Auto-detect language → EN on upload; EN → HI/MR/TA/TE on access |
| **Amazon Bedrock** | Claude 3 Haiku — 8-field clinical AI summary |
| **Amazon DynamoDB** | Patient profiles, audit log (GSI + TTL) |

---

## ✨ Key Features

- 🆔 **Unique HealthKey ID** — one ID, all your medical records
- 🔒 **Patient privacy controls** — toggle per data category
- ⏱️ **30-minute one-time session** — solves unconscious patient consent
- 🌐 **Multilingual summaries** — English, Hindi, Marathi, Tamil, Telugu
- 🧠 **AI clinical summary** — allergies, medications, conditions, lab highlights, drug contraindications
- 📋 **Audit log** — every access recorded with doctor, hospital, timestamp
- 📄 **Devanagari OCR** — reads Hindi and Marathi PDFs natively

---

## 🗂️ Project Structure

```
/
├── src/
│   ├── components/         # React UI components
│   ├── pages/              # Patient dashboard, Clinician access
│   └── lib/                # API client, utilities
├── lambdas/
│   ├── register/           # Patient registration
│   ├── upload/             # Document pipeline (S3→Textract→Translate→Bedrock→DynamoDB)
│   ├── emergency-access/   # Clinician access + AI summary
│   ├── get-patient/        # Fetch patient profile
│   ├── audit-log/          # Access history
│   └── get-document-url/   # Pre-signed S3 URL (15-min TTL)
└── README.md
```

---

## 🚀 How to Test the Live Demo

### Step 1 — Open the App
Visit 👉 **[https://main.d3815zbuat35tz.amplifyapp.com](https://main.d3815zbuat35tz.amplifyapp.com)**

---

### Step 2 — Register a Patient

1. Click **"Register as Patient"**
2. Fill in the details:
   - **Name:** Arjun Mehta
   - **Age:** 34 | **Gender:** Male | **Blood Group:** B+
   - **Phone:** 9876543210
   - **State:** Maharashtra
3. Click **Register**
4. 📋 **Copy the HealthKey ID** that appears — you'll need it in Step 4

---

### Step 3 — Upload a Medical Document

1. Log in as the patient (use phone number: `9876543210`)
2. Go to the **Documents** tab
3. Upload any medical PDF — prescription, discharge summary, lab report
   > 💡 Try uploading a Hindi or Marathi PDF to test Devanagari OCR
4. Wait a few seconds — the document will be processed by Textract + Bedrock

---

### Step 4 — Test Emergency Access (Clinician View)

1. Click **"Clinician / Emergency Access"**
2. Enter:
   - **HealthKey ID:** *(paste the ID from Step 2)*
   - **Doctor Name:** Dr. Kavita Nair
   - **Hospital:** City General Hospital, Nagpur
   - **Purpose:** Emergency Treatment
   - **Language:** Select Hindi or Marathi to test translation
3. Click **"Access Patient Records"**
4. ✅ You'll see an AI-generated clinical summary with a **30-minute countdown timer**

---

### Step 5 — Check the Audit Log

1. Log back in as the patient
2. Go to the **Audit** tab
3. You'll see the clinician access event logged — doctor name, hospital, timestamp

---

## 🧪 Test Data (Ready to Use)

```
Patient Name:     Arjun Ramesh Mehta
Age / Gender:     34 / Male
Blood Group:      B+
Phone:            9876543210
State:            Maharashtra

Known Allergies:  Penicillin (Anaphylaxis), Peanuts, Sulfa drugs
Medications:      Metformin 500mg, Amlodipine 5mg, Telmisartan 40mg
Conditions:       Hypertension, Type 2 Diabetes, Fatty Liver
Past Surgery:     Appendectomy (March 2021, Lilavati Hospital Mumbai)

Test Clinician:   Dr. Kavita Nair — City General Hospital, Nagpur
```

---

## 🔧 Run Locally

### Prerequisites
- Node.js 20.x
- AWS Account (us-east-1)
- AWS CLI configured

### Frontend Setup

```bash
git clone https://github.com/CrystallyRains/health-guard-bridge.git
cd health-guard-bridge
npm install
```

Create a `.env` file:
```env
VITE_API_BASE_URL=https://euddq4gmta.execute-api.us-east-1.amazonaws.com
```

```bash
npm run dev
```

### Lambda Deployment

Each Lambda function is in `/lambdas/<name>/index.mjs`. Deploy to AWS Lambda with:
- **Runtime:** Node.js 20.x
- **Region:** us-east-1
- **Timeout:** upload = 60s, all others = 30s
- **IAM Role:** Needs access to S3, DynamoDB, Textract, Translate, Bedrock

```bash
cd lambdas/upload
zip -r function.zip index.mjs
aws lambda update-function-code --function-name healthkey-upload --zip-file fileb://function.zip
```

### DynamoDB Tables Required

| Table | Partition Key | Notes |
|---|---|---|
| `healthkey-patients` | `healthKeyId` (String) | GSI on `phone` |
| `healthkey-audit-log` | `sessionId` (String) | GSI on `healthKeyId`, TTL enabled |

### S3 Bucket Required
- Bucket name: `healthkey-documents-table`
- Region: `us-east-1`
- Server-side encryption: enabled

---

## 💰 Cost Estimate

| Scale | Cost |
|---|---|
| **Prototype / Demo** | ~₹70 total |
| **10,000 patients/month** | ~₹10,500/month (~₹1.05 per patient) |

> Under ₹1 per patient per month — viable for pan-India government deployment.

---

## 👥 Team

**HealthKey** — AI for Bharat Hackathon 2026

| Role | Name |
|---|---|
| Team Leader | Snigdha Vijay Chaudhari |

---

## 📄 License

This project was built for the **AI for Bharat Hackathon 2026** powered by AWS.

---

*Built with ❤️ for Bharat 🇮🇳*
