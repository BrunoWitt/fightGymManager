import { Routes, Route } from 'react-router-dom'
import Login from '../pages/loginPage/Login'
import Home from '../pages/homePage/Home'
import Turma from '../pages/turmaPage/Turma'

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/turma" element={<Turma />} />
        </Routes>
    )
}
