import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './views/Login'
import CreateTask from './views/CreateTask'

import { ThemeProvider, createTheme, } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import DailyTasks from './components/DailyTasks';

function App() {

  const theme = createTheme({
    colorSchemes: {
      dark: true,
    },
  });


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path='' element={<Login />} />
            <Route path='/criar-tarefa' element={<CreateTask />} />
            <Route path='/home' element={<DailyTasks />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
