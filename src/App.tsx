import { AuthProvider } from './contexts/AuthContext';
import { CatalogProvider } from './contexts/CatalogContext';
import { AppShell } from './layouts/AppShell';

export default function App() {
  return (
    <AuthProvider>
      <CatalogProvider>
        <AppShell />
      </CatalogProvider>
    </AuthProvider>
  );
}