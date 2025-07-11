import { Routes, Route } from "react-router-dom";
import { SigninPage } from "./pages/SigninPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CreateRoomPage } from "./pages/CreateRoomPage";
import { JoinRoomPage } from "./pages/JoinRoomPage";
import { ApproveRequestPage } from "./pages/ApproveRequestModal";
import { ChatRoomPage } from "./pages/ChatRoomPage";

const App = () => {
  return <div>
      <Routes>
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/signin" element={<SigninPage/>}/>
        <Route path="/dashboard" element={<DashboardPage/>} />
        <Route path="/create" element={<CreateRoomPage/>} />
        <Route path="/join" element={<JoinRoomPage/>} />
        <Route path="/approve" element={<ApproveRequestPage/>} />
        <Route path="/rooms/:roomId" element={<ChatRoomPage key={window.location.pathname}/>} />
        <Route path="*" element={<SigninPage/>}/>
      </Routes>
  </div>
}

export default App;