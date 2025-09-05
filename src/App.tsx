import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './views/Login'
import CreateTask from './views/CreateTask'

import { ThemeProvider, createTheme, } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Home from './views/Home';
import Template from './components/shared/Template';
import History from './views/History';
import PrivateWrapper from './routes/PriavateWrapper';
import ArchivedTasks from './views/ArchivedTasks';

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
                    <Route path='/' element={<Login />} />
                    <Route path='*' element={<Login />} />

                    <Route element={<PrivateWrapper />}>
                        <Route element={<Template />}>
                            <Route path='/criar-tarefa' element={<CreateTask />} />
                            <Route path='/home' element={<Home />} />
                            <Route path='/historico' element={<History />} />
                            <Route path='/arquivadas' element={<ArchivedTasks />} />
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App
