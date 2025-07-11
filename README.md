# 💬 ChatFlow

**ChatFlow** is a real-time chat application built with:

- ⚛️ **Frontend**: React + TypeScript + Tailwind CSS + Vite  
- 🔌 **Backend**: Node.js + TypeScript + WebSocket

It supports features like:
- Live chat with WebSockets  
- Join/Create rooms  
- Private room access requests  
- Real-time message broadcasting  
- Upvote-based message interaction

---

## 📁 Project Structure

```
chatflow-app/
├── frontend/ # React app
├── backend/ # WebSocket server
├── .gitignore
├── README.md
```

## 🚀 Getting Started

### 🔧 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)  
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### 🧩 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Open your browser at: http://localhost:5173

### 🔌 Backend Setup

```bash
cd backend
npm install
npm run dev
```
WebSocket server runs on: ws://localhost:3000

## 🛠️ Build for Production

### Frontend

```bash
cd frontend
npm run build
```

### Backend

```bash
cd backend
npx tsc
```

## 🧪 Technologies Used

| Part      | Tech                                          |
|-----------|-----------------------------------------------|
| Frontend  | React, TypeScript, Vite                       |
| Styling   | Tailwind CSS                                  |
| Backend   | Node.js, TypeScript, WebSocket (`ws` library) |
| Tools     | ESLint, npm, Git                              |

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss major changes.
