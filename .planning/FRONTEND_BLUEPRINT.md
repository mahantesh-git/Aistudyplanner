# FRONTEND ARCHITECTURE (PRODUCTION-GRADE)

## 1. Project Structure
```text
src/
│
├── app/
│   ├── App.jsx
│   ├── routes.jsx
│
├── assets/
│   ├── images/
│   ├── icons/
│
├── components/
│   ├── ui/                 # reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Badge.jsx
│   │   ├── ProgressBar.jsx
│   │
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Layout.jsx
│   │
│   ├── common/
│   │   ├── Loader.jsx
│   │   ├── EmptyState.jsx
│   │   ├── ErrorState.jsx
│
├── features/
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   ├── components/
│   │   ├── authSlice.js
│   │   ├── authAPI.js
│
│   ├── subjects/
│   │   ├── pages/
│   │   │   ├── Subjects.jsx
│   │   ├── components/
│   │   │   ├── SubjectCard.jsx
│   │   │   ├── TopicList.jsx
│   │   ├── subjectSlice.js
│   │   ├── subjectAPI.js
│
│   ├── planner/
│   │   ├── pages/
│   │   │   ├── Planner.jsx
│   │   ├── components/
│   │   │   ├── Timeline.jsx
│   │   │   ├── TimeBlock.jsx
│   │   ├── plannerSlice.js
│   │   ├── plannerAPI.js
│
│   ├── tasks/
│   │   ├── pages/
│   │   │   ├── Tasks.jsx
│   │   ├── components/
│   │   │   ├── TaskItem.jsx
│   │   ├── taskSlice.js
│   │   ├── taskAPI.js
│
│   ├── progress/
│   │   ├── pages/
│   │   │   ├── Progress.jsx
│   │   ├── components/
│   │   │   ├── StatsCard.jsx
│   │   ├── progressSlice.js
│   │   ├── progressAPI.js
│
│   ├── recommendations/
│   │   ├── components/
│   │   │   ├── RecommendationCard.jsx
│   │   ├── recommendationAPI.js
│
├── services/
│   ├── apiClient.js
│   ├── interceptors.js
│
├── store/
│   ├── index.js
│
├── hooks/
│   ├── useAuth.js
│   ├── useFetch.js
│
├── utils/
│   ├── constants.js
│   ├── helpers.js
│
├── styles/
│   ├── index.css
```

## 🔌 2. API CLIENT SETUP
**`services/apiClient.js`**
```javascript
import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// Request interceptor (attach JWT)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor (handle 401)
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default apiClient;
```

## 🔐 3. AUTH MODULE
**API Mapping (`authAPI.js`)**
```javascript
import api from "@/services/apiClient";

export const registerUser = (data) =>
  api.post("/auth/register", data);

export const loginUser = (data) =>
  api.post("/auth/login", data);

export const getProfile = () =>
  api.get("/user/profile");

export const updateProfile = (data) =>
  api.put("/user/profile", data);
```
**State (`authSlice`)**
```javascript
{
  user: null,
  token: null,
  loading: false,
  error: null
}
```

## 📚 4. SUBJECT MODULE
**API Mapping (`subjectAPI.js`)**
```javascript
export const getSubjects = () => api.get("/subjects");

export const createSubject = (data) =>
  api.post("/subjects", data);

export const updateSubject = (id, data) =>
  api.put(`/subjects/${id}`, data);

export const deleteSubject = (id) =>
  api.delete(`/subjects/${id}`);
```
**UI Components**
- SubjectCard
- TopicList
- AddSubjectModal

## 🧠 5. PLANNER MODULE
**API Mapping (`plannerAPI.js`)**
```javascript
export const generatePlan = () =>
  api.post("/plan/generate");

export const getTodayPlan = () =>
  api.get("/plan/today");
```
**State**
```javascript
{
  plan: [],
  loading: false
}
```
**UI Components**
- Timeline
- TimeBlock
- GeneratePlanButton

## ✅ 6. TASK MODULE
**API Mapping (`taskAPI.js`)**
```javascript
export const getTodayTasks = () =>
  api.get("/tasks/today");

export const createTask = (data) =>
  api.post("/tasks", data);

export const updateTask = (id, data) =>
  api.put(`/tasks/${id}`, data);

export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`);
```
**UI Components**
- TaskItem
- TaskList
- TaskCheckbox

## 📊 7. PROGRESS MODULE
**API Mapping (`progressAPI.js`)**
```javascript
export const getProgress = () =>
  api.get("/progress");
```
**UI Components**
- ProgressBar
- StatsCard
- Chart (optional)

## 🤖 8. RECOMMENDATION MODULE
**API Mapping (`recommendationAPI.js`)**
```javascript
export const getRecommendations = () =>
  api.get("/recommendations");
```
**UI Components**
- RecommendationCard
- TipsList

## 🔄 9. GLOBAL STATE (STORE)
**`store/index.js`**
```javascript
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    subjects: subjectReducer,
    planner: plannerReducer,
    tasks: taskReducer,
    progress: progressReducer,
  },
});
```

## 🧭 10. ROUTING STRUCTURE
**`routes.jsx`**
```jsx
import { Routes, Route } from "react-router-dom";

<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  <Route path="/" element={<Layout />}>
    <Route index element={<Dashboard />} />
    <Route path="subjects" element={<Subjects />} />
    <Route path="planner" element={<Planner />} />
    <Route path="tasks" element={<Tasks />} />
    <Route path="progress" element={<Progress />} />
  </Route>
</Routes>
```

## 🧱 11. DASHBOARD COMPOSITION
Dashboard Page should combine:
- Today’s Plan (planner)
- Tasks (task module)
- Progress summary
- Recommendations panel
