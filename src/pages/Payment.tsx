import React, { ChangeEvent, useState, useEffect, useMemo, useRef } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import Header from "../components/Header";

import cardBg1 from "../img/card-bg.svg";
import cardFlags from "../img/flags.svg";
import chipImg from "../img/chip.svg";
import backCardElements from "../img/backCardElements.svg";
import fxRightImg from "../img/fx-right.svg";
import fxLeftImg from "../img/fx-left.svg";
import qrPixImg from "../img/qr-pix.svg";

import "../styles/payment.css"
import EfiPay from "payment-token-efi";



import globals from '../globals.js';


// Define types for better readability and type safety
type PaymentDataPayload = {
    registro: string;
    payment_token: string;
    installments: number;
};

type ApiResponse = {
    status: string;
    msg?: string;
    token?: string; // Assuming a token might be returned on success
    pix?: string; // For PIX payment
};
const Payment = () => {
    const [cardNumber, setCardNumber] = useState("");
    const [cardName, setCardName] = useState("");
    const [expDate, setExpDate] = useState("");
    const [displayExpDate, setDisplayExpDate] = useState("");
    const [expMonth, setExpMonth] = useState(""); // New state for expiration month
    const [expYear, setExpYear] = useState("");   // New state for expiration year
    const [flipped, setFlipped] = useState(false);
    const [cvv, setCvv] = useState("");
    const [docId, setDocId] = useState("");
    const [isPixVisible, setIsPixVisible] = useState(false);
    const [error, setError] = useState(""); // State to display errors for both card and pix

    const efipayRef = useRef<any>(null); // Ref to store the EfiPay SDK instance

    // Mock de dados do plano, já que não estava definido.
    // O ideal é que esses dados venham de um estado global, props ou API.
    const [planData] = useState({ price: 99.90 }); // Keeping mock for now


    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const token = new URLSearchParams(location.search).get("token");
        if (!token) {
            console.log("Token não encontrado, redirecionando para home.");
            navigate("/");
        }
        async function checkScriptBlocking() {
        const isBlocked = await EfiPay.CreditCard.isScriptBlocked();

        if (isBlocked) {
            console.log("O script de fingerprint está bloqueado.");
            alert("O script que gera o payment_token está bloqueado. Verifique seu navegador ou extensão. ");
        } else {
            console.log("O script de fingerprint não está bloqueado.");
        }
        }
        checkScriptBlocking();
    }, [location, navigate]);

    const cardChunks = useMemo(() => {
        const cleaned = String(cardNumber).replace(/\D/g, '');
        const padded = (cleaned + '••••••••••••••••').slice(0, 16);
        return [
            padded.slice(0, 4),
            padded.slice(4, 8),
            padded.slice(8, 12),
            padded.slice(12, 16),
        ];
    }, [cardNumber]);

    const [g1, g2, g3, g4] = cardChunks;

    function handleCardNumberChange(event: ChangeEvent<HTMLInputElement>) {
        setCardNumber(event.target.value);
    }

    function handleCardNameChange(event: ChangeEvent<HTMLInputElement>) {
        setCardName(event.target.value.toUpperCase());
    }

    // Helper to parse MM/AA to MM and YYYY
    function handleExpDate(event: ChangeEvent<HTMLInputElement>) {
        let { value } = event.target;
        value = value.replace(/\D/g, ''); // Remove non-digits

        if (value.length > 2) {
            value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
        }
        if (value.length > 5) {
            value = value.slice(0, 5);
        }
        setExpDate(value);
        setDisplayExpDate(value);

        // Parse month and year for EfiPay
        const parts = value.split('/');
        if (parts.length === 2) {
            setExpMonth(parts[0]);
            // Convert 'YY' to 'YYYY' for EfiPay. Assuming current century.
            const currentYear = new Date().getFullYear();
            const century = Math.floor(currentYear / 100) * 100;
            setExpYear(String(century + parseInt(parts[1], 10)));
        } else {
            setExpMonth("");
            setExpYear("");
        }
    }

    // Basic card brand detection (can be replaced by a library)
    const getCardBrand = (number: string): string => {
        if (/^4/.test(number)) return 'visa';
        if (/^5[1-5]/.test(number)) return 'mastercard';
        if (/^3[47]/.test(number)) return 'amex';
        return 'unknown';
    }

    function handleCvvChange(event: ChangeEvent<HTMLInputElement>) {
        setCvv(event.target.value);
    }

    function handleDocIdChange(event: ChangeEvent<HTMLInputElement>) {
        setDocId(event.target.value);
    }

    async function setPaymentData(event: React.FormEvent<HTMLFormElement>) {
        console.log('SetPayment');
        event.preventDefault();
        setError(""); // Clear previous errors

        const registroToken = new URLSearchParams(location.search).get("token");
        if (!registroToken) {
            setError("Token de registro não encontrado na URL.");
            return;
        }

        // if (!efipayRef.current) {
        //     setError("EfiPay SDK não inicializado. Verifique a integração.");
        //     return;
        // }

        // Validate form fields before tokenization
        if (!cardNumber || cardNumber.length < 13 || !cardName || !expMonth || !expYear || !cvv || !docId) {
            setError("Por favor, preencha todos os dados do cartão corretamente.");
            return;
        }

        const brand = getCardBrand(cardNumber);
        if (brand === 'unknown') {
            setError("Bandeira do cartão não reconhecida.");
            return;
        }

        try {
            const cardTokenizeResponse = await EfiPay.CreditCard
                .setAccount("817503942b37f7a33baff52d53b7d6ef")//Identificador de conta
                .setEnvironment("sandbox") // 'production' or 'sandbox'
                .setCreditCardData({
                    brand: brand,
                    number: cardNumber,
                    cvv: cvv,
                    expirationMonth: expMonth,
                    expirationYear: expYear,
                    holderName: cardName,
                    holderDocument: docId,
                    reuse: false,
                })
                .getPaymentToken();
            // 1. Generate payment_token using EfiPay SDK
            // const cardTokenizeResponse = await efipayRef.current.card.tokenize({
            //     brand: brand,
            //     number: cardNumber,
            //     cvv: cvv,
            //     expiration_month: expMonth,
            //     expiration_year: expYear,
            //     document: docId, // Assuming docId is CPF
            //     holder: cardName,
            // });

            // Check if the tokenization was successful
            if (!('payment_token' in cardTokenizeResponse)) {
                // It's an ErrorResponse
                throw new Error(cardTokenizeResponse.error_description || 'Falha ao gerar o token de pagamento.');
            }

            const paymentTokenFromEfi = cardTokenizeResponse.payment_token; // Now this is safe

            // 2. Send payment_token to your backend via /api/streaming
            const payload: PaymentDataPayload = {
                registro: registroToken,
                payment_token: paymentTokenFromEfi,
                installments: 1, // Assuming 1 installment, can be dynamic
            };

            const response = await fetch(`${globals.apiBaseUrl}/api/streaming`, {
                method: "POST",
                headers: {
                    'Authorization': globals.token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: registroToken, // This token identifies the user/session
                    route: "pagar_cartao",
                    data: payload,
                }),
            });

            const result: ApiResponse = await response.json();

            if (!response.ok || result.status !== 'success') {
                throw new Error(result.msg || "Falha ao processar o pagamento.");
            }

            // On success, navigate to the resume/success page
            navigate(`/resumo?token=${registroToken}`);

        } catch (error: any) {
            console.error("Erro no pagamento com cartão:", error);
            // EfiPay tokenization errors might be in error.response.data or error.message
            const errorMessage = error.message || (error.response && error.response.data && error.response.data.error_description) || "Ocorreu um erro ao processar seu pagamento.";
            setError(errorMessage);
        }
    }

    async function handlePixPayment() {
        const registroToken = new URLSearchParams(location.search).get("token");

        if (!registroToken) {
            console.error("Token (registro) não encontrado na URL.");
            return;
        }

        try {
            const response = await fetch(`${globals.apiBaseUrl}/api/streaming`, {
                method: "POST",
                headers: {
                    Authorization: globals.token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    route: "gerar_pix",
                    data: {
                        registro: registroToken,
                    },
                }),
            });

            const resposta_pix = await response.json();

            if (!response.ok || resposta_pix.status !== 'success') {
                throw new Error(resposta_pix.msg || "Erro ao gerar o PIX.");
            }

            console.log("PIX gerado:", resposta_pix.pix);
            setIsPixVisible(true); // Mostra o container do PIX
            return { status: 'success', pix: resposta_pix.pix }; // Corrigido: acesso ao objeto e 'sucess'
        } catch (error) {
            console.error("Erro ao gerar PIX:", error);
        }
    }

    function togglePixContainer() {
        setIsPixVisible(!isPixVisible);
    }

    return (
        <React.Fragment>
            <Header />
            <div className="payment-container">
                <div className="payment-header">
                    <b>Adicione um cartão</b>
                    <span>Este cartão será usado para pagar sua<br />assinatura na 2K20.</span>
                </div>

                <div className={`card-element-container ${flipped ? "flipped" : ""}`} >
                    <div className="card-face front-card-element">
                        <div className="top-wrapper">
                            <div className="flag">
                                <img src={cardFlags} alt="card flags"/>
                            </div>
                            <div className="chip">
                                <img src={chipImg} alt="chip"/>
                            </div>
                        </div>

                        <div className="number-wrapper">
                            <span>{g1}</span>
                            <span>{g2}</span>
                            <span>{g3}</span>
                            <span>{g4}</span>
                        </div>

                        <div className="bottom-wrapper">
                            <span className="name-element">
                                {cardName || "SEU NOME AQUI"}
                            </span>
                            <span className="exp-date-element">
                                {displayExpDate || "••/••"}
                            </span>
                        </div>
                    </div>

                    <div className="card-face back-card-element">
                        <img src={backCardElements} alt="back card elements" />
                        <span>{cvv || "•••"}</span>
                    </div>


                    <img src={cardBg1} className="card-bg-1" alt="card bg"/>
                </div>

                <form className="form-container" onSubmit={setPaymentData}>
                    {error && <div className="main-error-message">{error}</div>} {/* Display error message */}
                    <div className="form-group">
                        <span>CPF</span>
                        <input type="text" name="docId" id="docIdEl" required onFocus={() => setFlipped(false)} value={docId} onChange={handleDocIdChange}/>
                    </div>
                    <div className="form-group">
                        <span>NÚMERO DO CARTÃO</span>
                        <input type="text" name="cardNumber" id="cardNumberEl" onChange={handleCardNumberChange} maxLength={16} value={cardNumber} onFocus={() => setFlipped(false)}/>
                    </div>
                    <div className="form-group">
                        <span>NOME DO TITULAR</span>
                        <input type="text" name="cardName" id="cardNameEl" value={cardName} onChange={handleCardNameChange} onFocus={() => setFlipped(false)} />
                    </div>
                    <div className="form-group">
                        <span>VALIDADE</span>
                        <input type="text" name="cardExpireDate" id="cardExpireDateEl" placeholder="MM/AA" onChange={handleExpDate} value={displayExpDate} onFocus={() => setFlipped(false)} maxLength={5} />
                    </div>
                    <div className="form-group">
                        <span>CVV</span>
                        <input type="text" name="cvv" id="cvvEl" onFocus={() => setFlipped(true)} value={cvv} onChange={handleCvvChange} maxLength={3} />
                    </div>
                    <button className="continue" type="submit">Continuar</button>
                </form>

                <div className="pix-wrapper">
                    <span>OU</span>
                    <button onClick={handlePixPayment}>PAGAR COM PIX</button>
                </div>
                {/* Removed the old "Continuar" button as it's now part of the form */}

                <div className="security">
                    <svg height="15" viewBox="0 0 23 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.3934 0H1.85395C1.36225 0 0.890691 0.195326 0.543008 0.543008C0.195326 0.890691 0 1.36225 0 1.85395V8.66372C0 19.047 8.78539 22.4918 10.5443 23.077C10.92 23.2048 11.3274 23.2048 11.703 23.077C13.4643 22.4918 22.2474 19.047 22.2474 8.66372V1.85395C22.2474 1.36225 22.052 0.890691 21.7044 0.543008C21.3567 0.195326 20.8851 0 20.3934 0ZM16.4144 8.07162L9.92557 14.5604C9.83948 14.6466 9.73724 14.715 9.62471 14.7616C9.51218 14.8083 9.39155 14.8323 9.26974 14.8323C9.14792 14.8323 9.02729 14.8083 8.91476 14.7616C8.80223 14.715 8.69999 14.6466 8.6139 14.5604L5.83298 11.7795C5.65904 11.6056 5.56133 11.3697 5.56133 11.1237C5.56133 10.8777 5.65904 10.6418 5.83298 10.4678C6.00692 10.2939 6.24283 10.1962 6.48881 10.1962C6.7348 10.1962 6.97071 10.2939 7.14465 10.4678L9.26974 12.5929L15.1027 6.75995C15.1888 6.67383 15.2911 6.60551 15.4036 6.5589C15.5161 6.51229 15.6368 6.4883 15.7585 6.4883C15.8803 6.4883 16.001 6.51229 16.1135 6.5589C16.226 6.60551 16.3283 6.67383 16.4144 6.75995C16.5005 6.84608 16.5688 6.94832 16.6154 7.06085C16.662 7.17338 16.686 7.29399 16.686 7.41579C16.686 7.53759 16.662 7.65819 16.6154 7.77072C16.5688 7.88325 16.5005 7.9855 16.4144 8.07162Z" fill="#6EE7B7"/></svg>
                    <span>Todos os seus dados estão seguros e encriptados.</span>
                </div>


                <img src={fxRightImg} className="fx-right-img" alt="decoration" />
                <img src={fxLeftImg} className="fx-left-img" alt="decoration" />
            </div>

            <div className={`pix-payment-container ${!isPixVisible ? 'hidden' : ''}`} id="pix-container">
                <div className="pix-payment-wrapper">
                    <b className="title">Pagamento via PIX</b>

                    <img src={qrPixImg} alt="" />

                    <div className="payment-info">
                        <div className="info-wrapper">
                            <b>Valor: </b>
                            <b>{planData.price.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</b>
                        </div>
                        <div className="info-wrapper">
                            <b>Descrição: </b>
                            <b>2kPlay - Boleto #23452</b>
                        </div>
                        <div className="info-wrapper">
                            <b>Instituição: </b>
                            <b>2KPLAY LTDA</b>
                        </div>
                        <div className="info-wrapper">
                            <b>Copia e cola: </b>
                            <span>00020101021126850014br.gov.bcb.pix2563qrcodepix.bb.com.br/pix/v2/cfeb2909-2cf1-4404-b764-26f7d97f22bd520400005303986540599.905802BR59152kplay60062070503***6304AE70</span>
                        </div>
                    </div>

                    <button onClick={togglePixContainer}>Copiar código PIX</button>
                </div>
            </div>
        </React.Fragment>
    )
}

export default Payment;