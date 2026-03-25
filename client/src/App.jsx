// client/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing   from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import History   from './pages/History.jsx';
import Navbar    from './components/Navbar.jsx';

import Success   from './pages/Success.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"             element={<Landing />}   />
        <Route path="/dashboard"    element={<Dashboard />} />
        <Route path="/history"      element={<History />}   />
        <Route path="/success"      element={<Success />}   />
        <Route path="/pricing"      element={<Landing />}   />
      </Routes>
    </BrowserRouter>
  );
}
