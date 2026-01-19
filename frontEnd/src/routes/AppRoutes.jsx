import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/loginPage/Login";
import Home from "../pages/homePage/Home";
import Turma from "../pages/turmaPage/Turma";
import Aluno from "../pages/alunosPage/Alunos";
import Finance from "../pages/financePage/FinancePage";
import AppLayout from "../layout/AppLayout";

export default function AppRoutes() {
    return (
        <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/turmas" element={<Turma />} />
            <Route path="/alunos" element={<Aluno />} />
            <Route path="/finance" element={<Finance />} />
        </Route>
        </Routes>
    );
}
