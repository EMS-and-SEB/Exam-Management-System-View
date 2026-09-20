import { RouterProvider } from 'react-router-dom';
import { AppProviders } from './providers/Providers';
import router from './Router';

function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}

export default App;
