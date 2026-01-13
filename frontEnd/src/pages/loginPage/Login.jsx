import { useState } from "react"

export default function Home() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = (e) => {
        e.preventDefault()
        console.log("Email:", email)
        console.log("Password:", password)
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