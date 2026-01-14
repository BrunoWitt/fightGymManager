import { useState } from "react"

export default function Home() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async (e) => {
        /* Call backend login route to validate user credentials */
        e.preventDefault()
        console.log("Email:", email)
        console.log("Password:", password)

        try {
            const response = await fetch(" http://127.0.0.1:8001/login", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: 'include',
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
        }
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