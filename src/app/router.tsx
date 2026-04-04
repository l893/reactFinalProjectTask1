import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { RequireAuth } from '@features/auth';
import { AuthPage } from '@pages/auth/auth-page';
import { NotesPage } from '@pages/notes/notes-page';
import { NotFoundPage } from '@pages/not-found/not-found-page';

import { Layout } from './layout';

export const AppRouter = (): React.JSX.Element => {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/notes" replace />} />

          <Route path="/auth" element={<AuthPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/notes" element={<NotesPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
