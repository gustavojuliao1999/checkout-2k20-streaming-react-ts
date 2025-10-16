import React from "react";
import { getCookies, ICookieData } from "../controllers/cookies.controller"

import Header from "../components/Header";

import planLivreImg from "../img/2k20-livre.svg";
import planTotalImg from "../img/2k20-total.svg";
import confettiImg from "../img/confetti.png";

import "../styles/resume.css";

const Resume = () => {
    const planData =  JSON.parse(JSON.stringify(getCookies("planData")));
    console.log(planData);
    const isPLanTotal = planData.name === "Plano Total";

    return (
        <React.Fragment>
            <Header/>
            <div className="confetti"></div>
            <div className="resume-container">
                <b className="header">Obrigado por escolher a 2KPLAY</b>

                <div className="plan-card">
                    <div className="top">
                        <div className="separator">
                            <b>Informações da sua <br />assinatura:</b>
                        </div>
                        <div className="separator">
                            <img src={isPLanTotal?  planTotalImg : planLivreImg} className="plan-logo" alt="plan logo" />
                            
                            {
                                isPLanTotal ? <div className="benefits-wrapper">
                                    <div className="benefit-row">🖥️ <span>Mais de 100 canais</span> (incluindo canais locais)</div>
                                    <div className="benefit-row">🎬 <span>Acesso ilimitado a filmes e séries</span></div>
                                    <div className="benefit-row">⏪ <span>Voltar conteúdo ao vivo</span> para assistir o que já passou</div>
                                    <div className="benefit-row">📱 <span>Até 5 dispositivos simultâneos</span></div>
                                </div>
                                : <div className="benefits-wrapper">
                                    <div className="benefit-row">🖥️ <span>Mais de 40 canais</span> (incluindo canais locais)</div>
                                    <div className="benefit-row">▶️ <span>Filmes e séries sob demanda</span></div>
                                    <div className="benefit-row">⏪ <span>Voltar conteúdo ao vivo</span> para assistir o que já passou</div>
                                    <div className="benefit-row">📱 <span>Até 3 dispositivos simultâneos</span></div>
                                </div>
                            }
                        </div>
                    </div>
                    <span className="total">Total: {planData.price.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</span>
                </div>

                <a href="/">Nova assinatura</a>
            </div>
        </React.Fragment>
    )   
}

export default Resume;