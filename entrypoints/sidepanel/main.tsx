import { createRoot } from 'react-dom/client';
import '@/assets/main.css';
import App from '@/components/App';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
