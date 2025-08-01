"use client"
import { useEffect } from "react"
import Footer from "./components/Footer"

export default function Home(){
    useEffect(()=>{

    }, [])

    return(
        <>
        <main>
            <div className="main-card">
                <h3>Bem-vindo(a) ao site da turma de <strong>IIW24</strong></h3>
                <p>A turma IIW24 é formada por jovens dedicados ao aprendizado e à prática da Informática, unindo tecnologia, criatividade e inovação. Nosso objetivo é desenvolver não apenas habilidades técnicas, mas também a capacidade de resolver problemas e trabalhar em equipe, preparando-nos para os desafios do mercado de trabalho e do mundo digital.</p>
            </div>

            <section className="info-sec">
                <h1>O que estudamos</h1>
                <p>Conceitos e práticas de programação, redes de computadores, manutenção de hardware, banco de dados e outras áreas fundamentais da informática.</p>

                <h1>Projetos e atividades</h1>
                <p>Desenvolvimento de sistemas, criação de sites e aplicativos, além de participação em atividades práticas e eventos educacionais.</p>
            </section>
        </main>
        <Footer />
        </>
    )
}