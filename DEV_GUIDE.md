# How to Run the App in Development

## You Need TWO Servers Running:

### 🎨 Frontend (Vite) - Port 5173
Serves the React app

### 🔧 Backend (Node.js) - Port 5002
Handles API requests, authentication, data

---

## ✅ Quick Start

### **Method 1: Two Terminal Windows** (Recommended)

Open **TWO** separate terminal windows:

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
npm run server
```

Then open: http://localhost:5173

---

### **Method 2: Manual Commands**

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
node server/index.js
```

---

## 🔍 Verify Both Are Running

You should see:
- Terminal 1: `VITE v5.x.x ready in XXX ms` on port **5173**
- Terminal 2: `Server running on port 5002`

---

## ⚠️ Common Issues

### "Failed to fetch" or "Network Error"
**Problem:** Backend server is not running

**Solution:** Make sure you have BOTH terminals running (see above)

---

### CORS Errors
**Problem:** Frontend and backend ports mismatch

**Solution:** 
- Frontend should be on: `http://localhost:5173`
- Backend should be on: `http://localhost:5002`

Check your browser console for the actual ports being used.

---

## 🚀 For Production (Render)

On Render, only ONE command runs:
```bash
npm run start
```

This works because in production:
- Backend serves the built frontend files
- Everything runs on the same port
- No CORS issues
