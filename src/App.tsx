import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './views/Login'
import CreateTask from './views/CreateTask'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='' element={<Login />} />
        <Route path='/criar-tarefa' element={<CreateTask />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
