"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

export default function LoginPage(){
    const [passKeyValue, setPassKeyValue] = useState("")
    const [isLoading, setLoading] = useState(false)

    const router = useRouter()

    const HandleSubmit = async (e: FormEvent) => {
        if(isLoading) return;
        e.preventDefault()
        try{
            setLoading(true)
        
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({passKey: passKeyValue})
        })

        const resJson = await response.json()
        if(resJson.success == true){
            router.push("/")
            toast.success(resJson.content)
        } else{
            toast.error(resJson.content)
        }

        setLoading(false)
        }catch(err){
            setLoading(false)
            console.log(err)
        }
    }

    return(
        <>
            <form id="loginForm" onSubmit={HandleSubmit}>
                <h1>Login</h1>

                <input type="password" placeholder="Type here the key" onChange={(e)=>{setPassKeyValue(e.target.value)}} required />
                <input
                type="submit"
                disabled={isLoading}
                value={isLoading ? "Loading..." : "Login"}
                />
            </form>
        </>
    )
}