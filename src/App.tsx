import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AppLoader } from './components/layout/AppLoader';
import { Dashboard } from './pages/Dashboard';
import { Exercises } from './pages/Exercises';
import { Templates } from './pages/Templates';
import { TemplateEditor } from './pages/TemplateEditor';
import { LogWorkout } from './pages/LogWorkout';
import { History } from './pages/History';
import { Progress } from './pages/Progress';

function App() {
  return (
    <BrowserRouter>
      <AppLoader>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/templates/new" element={<TemplateEditor />} />
            <Route path="/templates/:id/edit" element={<TemplateEditor />} />
            <Route path="/log" element={<LogWorkout />} />
            <Route path="/history" element={<History />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AppLoader>
    </BrowserRouter>
  );
}

export default App;

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-6xl mb-4">🏋️</p>
      <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
      <p className="text-slate-400 mb-6">That page doesn't exist.</p>
      <Link to="/" className="text-violet-400 hover:text-violet-300 underline">
        Back to dashboard
      </Link>
    </div>
  );
}
