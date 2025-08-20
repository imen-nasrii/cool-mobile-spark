import { createRoot } from 'react-dom/client'
import SimpleApp from './SimpleApp.tsx'
import './index.css'

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<SimpleApp />);
}