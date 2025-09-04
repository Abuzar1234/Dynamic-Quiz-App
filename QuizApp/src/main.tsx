import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router'
import App from './App.tsx'
import Quiz from './Quiz.tsx'

const router = createBrowserRouter([
  {
    path : "/",
    element: <App/>
  },
  {
    path : "/quiz",
    element: <Quiz/>
  }
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router = {router}/>
  </StrictMode>,
)
