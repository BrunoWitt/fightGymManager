import { Routes, Route } from 'react-router-dom'
import Login from '../pages/loginPage/Login'

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
        </Routes>
    )
}
