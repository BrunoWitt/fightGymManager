import { Outlet } from "react-router-dom";
import Sidebar from "../pages/Sidebar";

export default function AppLayout() {
    /*
        App layout é o elemento pai, renderizando fixamente o <Sidebar/> e Outlet funciona como um placeholder puxando a url, que acaba por renderizar os route
    */
    return (
        <div className="min-h-screen bg-zinc-50">
        <div className="flex">
            <Sidebar />
            <main className="flex-1 p-4 md:p-6">
            <Outlet />
            </main>
        </div>
        </div>
    );
}
