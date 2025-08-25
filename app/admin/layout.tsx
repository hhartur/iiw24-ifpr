"use server";

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({children}: {children: ReactNode}){
    const session = await getSession()

    if(!session.isLoggedIn){
        redirect("/login")
    }

    return(
        <>
            {children}
        </>
    )
}