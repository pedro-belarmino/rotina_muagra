import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './views/Login'
import CreateTask from './views/CreateTask'

import { ThemeProvider, createTheme, } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Home from './views/Home';
import Template from './components/shared/Template';
import History from './views/History';
import Report from './views/Report';
import PrivateWrapper from './routes/PriavateWrapper';
import ArchivedTasks from './views/ArchivedTasks';
import GlobalCouter from './views/GlobalCounter';
import AuthorizeEmail from './views/AuthorizeEmail';

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
                    <Route path='/authorize-email' element={<AuthorizeEmail />} />

                    <Route element={<PrivateWrapper />}>
                        <Route element={<Template />}>
                            <Route path='/criar-tarefa' element={<CreateTask />} />
                            <Route path='/home' element={<Home />} />
                            <Route path='/historico' element={<History />} />
                            <Route path='/relatorio' element={<Report />} />
                            <Route path='/arquivadas' element={<ArchivedTasks />} />
                            <Route path='muagrometro' element={<GlobalCouter />} />
                            <Route
                                path='--'
                                element={
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            minHeight: '100vh',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <img
                                            style={{ width: "50%" }}
                                            src="/-/guardiao.jpg"
                                            alt=""
                                        />
                                    </div>
                                }
                            />
                        </Route>



                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App
