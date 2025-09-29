import React from "react";
import { ICookieData, setCookie, getCookies } from "../controllers/cookies.controller";

import Header from "../components/Header";

import planLivreImg from "../img/2k20-livre.svg";
import planTotalImg from "../img/2k20-total.svg";
import fxRightImg from "../img/fx-right.svg";
import fxLeftImg from "../img/fx-left.svg";

import "../styles/plans.css";

type PlanData = {
    name: string,
    price: number
}

const Plans = () => {
    function setPlanInfo(event: React.MouseEvent<HTMLButtonElement>) {
        const targetButton = event.target as HTMLButtonElement;
        
        const planData: PlanData = {
            name: targetButton.dataset.planName || "",
            price: parseFloat(targetButton.dataset.planPrice as string),
        }

        const cookieData: ICookieData = {
            name: "planData",
            value: JSON.stringify(planData)
        }

        setCookie(cookieData);

        window.location.pathname = "/dados-pagamento"
    }

    return (
        <React.Fragment>
            <Header />
            <div className="plans-container">
                <div className="plans-header">
                    <b>Escolha o Plano Ideal para você<br />na 2k20 Streaming!</b>
                    <span>Aproveite a melhor programação ao vivo, seus canais locais favoritos e uma vasta biblioteca de filmes e séries para assistir quando quiser.<br />Liberdade e entretenimento sob medida para você!</span>
                </div>

                <div className="plans-grid">
                    <div className="plan-element">
                        <img src={planLivreImg} className="plan-logo" alt="plan logo" />

                        <div className="price-wrapper">
                            <span>R$</span>
                            <span className="price-dest">19</span>
                            <span className="price-small">,90</span>
                            <span className="month">/mês</span>
                        </div>
                        
                        <div className="benefits-wrapper">
                            <div className="benefit-row">🖥️ <span>Mais de 40 canais</span> (incluindo canais locais)</div>
                            <div className="benefit-row">▶️ <span>Filmes e séries sob demanda</span></div>
                            <div className="benefit-row">⏪ <span>Voltar conteúdo ao vivo</span> para assistir o que já passou</div>
                            <div className="benefit-row">📱 <span>Até 3 dispositivos simultâneos</span></div>
                        </div>

                        <div className="button-wrapper">
                            <button data-plan-name="Plano Livre" data-plan-price={19.9} onClick={(event) => setPlanInfo(event)}>Assinar Plano Livre</button>
                        </div>
                    </div>

                    <div className="plan-element purple">
                        <img src={planTotalImg} className="plan-logo" alt="plan logo" />

                        <div className="price-wrapper">
                            <span>R$</span>
                            <span className="price-dest">99</span>
                            <span className="price-small">,90</span>
                            <span className="month">/mês</span>
                        </div>
                        
                        <div className="benefits-wrapper">
                            <div className="benefit-row">🖥️ <span>Mais de 100 canais</span> (incluindo canais locais)</div>
                            <div className="benefit-row">🎬 <span>Acesso ilimitado a filmes e séries</span></div>
                            <div className="benefit-row">⏪ <span>Voltar conteúdo ao vivo</span> para assistir o que já passou</div>
                            <div className="benefit-row">📱 <span>Até 5 dispositivos simultâneos</span></div>
                        </div>

                        <div className="button-wrapper">
                            <button data-plan-name="Plano Total" data-plan-price={99.9} onClick={(event) => setPlanInfo(event)}>Assinar Plano Total</button>
                        </div>
                    </div>
                </div>
                
                <img src={fxRightImg} className="fx-right-img" alt="decoration" />
                <img src={fxLeftImg} className="fx-left-img" alt="decoration" />
            </div>
        </React.Fragment>
    )
}

export default Plans;