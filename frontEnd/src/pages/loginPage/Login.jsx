import { useState } from "react"

export default function Home() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async (e) => {
        e.preventDefault()
        console.log("Email:", email)
        console.log("Password:", password)

        try {
            const response = await fetch(" http://127.0.0.1:8000/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password})
            })
            const data = await response.json()
            console.log(data)

            if (!response.ok || !data.success) {
                console.error("Login failed:", data.message || "Unknown error");
                return;
            }
        } catch (error) {
            console.error("Error during login request:", error)
        } finally {
            // Limpar os campos após a tentativa de login
            setEmail("")
            setPassword("")
        }
        //Adicionar função para requistar o login para o backend
    }

    return (
        <form onSubmit={handleLogin}>
            <div>
                Login Page
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email"></input>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password"></input>
                <button type="submit">Logar</button>
            </div>
        </form>
    )
}