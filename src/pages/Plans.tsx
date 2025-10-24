import React, { useState, useEffect, useCallback } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import Header from "../components/Header";

import globals from '../globals.js';

import planTotalImg from "../img/2k20-total.svg";
import fxRightImg from "../img/fx-right.svg";
import fxLeftImg from "../img/fx-left.svg";

import "../styles/plans.css";

type PlanData = {
    name: string,
    price: number
}

type ApiPlan = {
    id: number;
    nome: string;
    valor: number;
    tipo_pessoa: 'F' | 'J' | 'T';
    download: string | null;
    upload: string | null;
    descricaoSla: string | null;
    extra: string | null;
    cor_background: string;
    id_plano: number;
};

const Plans = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [plans, setPlans] = useState<ApiPlan[]>([]);

    const fetchPlans = useCallback(async () => {
        const searchParams = new URLSearchParams(location.search);
        const regiaoFromUrl = searchParams.get('regiao');

        const dt_get_plano: { route: string; data: { regiao?: string } } = {
            route: "get_plano",
            data: {}
        };

        if (regiaoFromUrl) {
            dt_get_plano.data['regiao'] = regiaoFromUrl;
        }

        try {
            const response = await fetch(globals.apiBaseUrl + "/api/streaming", {
                method: "POST",
                headers: {
                    Authorization: globals.token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dt_get_plano),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch plans');
            }

            const dt_plano = await response.json();
            const allPlans: ApiPlan[] = dt_plano.plano || [];
            setPlans(allPlans);

            // const personalDataCookie = getCookies("personalData");
            // const personalData = personalDataCookie ? JSON.parse(personalDataCookie) : null;
            // const tipoPessoa = personalData?.tipo_pessoa;
            
            // if (tipoPessoa) {
            //     const filteredPlans = allPlans.filter(plan => plan.tipo_pessoa === tipoPessoa || plan.tipo_pessoa === 'T');
            //     setPlans(filteredPlans);
            // } else {
            //     setPlans(allPlans);
            // }
            // Not implemented from user snippet: pre-selecting plan, servicosAdicionais
        } catch (error) {
            console.error("Error fetching plans:", error);
        }
    }, [location.search]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    async function setPlanInfo(planId: number, planName: string, planPrice: number) {
        const registroToken = new URLSearchParams(location.search).get("token");

        if (!registroToken) {
            console.error("Token (registro) não encontrado na URL.");
            // Opcional: exibir um erro para o usuário
            return;
        }

        try {
            const response = await fetch(`${globals.apiBaseUrl}/api/streaming`, {
                method: "POST",
                headers: {
                    'Authorization': globals.token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    route: "set_plano",
                    data: {
                        'registro': registroToken,
                        'plano': planId,
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Erro ao enviar os dados do plano');
            }

            await response.json();
            navigate(`/pagamento?token=${registroToken}`);
        } catch (error) {
            console.error("Erro ao salvar o plano:", error);
        }
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
                    {plans.map((plan, index) => (
                        <div className={`plan-element ${index % 2 !== 0 ? 'purple' : ''}`} key={plan.id} style={{backgroundColor: plan.cor_background || ''}}>
                            <img src={planTotalImg} className="plan-logo" alt={`${plan.nome} logo`} />

                            <div className="price-wrapper">
                                <span>R$</span>
                                <span className="price-dest">{Math.floor(plan.valor)}</span>
                                <span className="price-small">,{(plan.valor.toFixed(2).split('.')[1] || '00')}</span>
                                <span className="month">/mês</span>
                            </div>
                            
                            <div className="benefits-wrapper">
                                {plan.download && <div className="benefit-row">🖥️ <span>Download: {plan.download}</span></div>}
                                {plan.upload && <div className="benefit-row">🖥️ <span>Upload: {plan.upload}</span></div>}
                                {plan.descricaoSla && <div className="benefit-row">▶️ <span>SLA: {plan.descricaoSla}</span></div>}
                                {plan.extra && <div className="benefit-row">⏪ <span>{plan.extra}</span></div>}
                            </div>

                            <div className="button-wrapper">
                                <button onClick={() => setPlanInfo(plan.id, plan.nome, plan.valor)}>Assinar {plan.nome}</button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <img src={fxRightImg} className="fx-right-img" alt="decoration" />
                <img src={fxLeftImg} className="fx-left-img" alt="decoration" />
            </div>
        </React.Fragment>
    )
}

export default Plans;