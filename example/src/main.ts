import './app.css'
import App from './App.svelte'

const target = document.getElementById('app');
if (!target) {
  throw new Error('Could not find app element');
}

const app = new App({
  target: document.getElementById('app')!
});

export default app;
