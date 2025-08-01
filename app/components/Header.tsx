"use client";

import { useRouter } from "next/navigation";

export default function Header() {
    const route = useRouter()

    return (
        <header>
        <div className="header-logo">
            <h1 onClick={()=>{route.push("/")}}>IIW24</h1>
        </div>

        <div className="header-buttons">
            <button onClick={()=>{route.push("/emails")}}>Emails</button>
        </div>
        </header>
    );
}
