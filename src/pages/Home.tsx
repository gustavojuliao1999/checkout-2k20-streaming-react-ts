import React, { useState } from "react";
import { ICookieData, setCookie } from "../controllers/cookies.controller";

import Header from "../components/Header";

import "../styles/home.css";

type PersonalData = {
    docId: string,
    birtDate: string,
    email: string,
    name: string,
    surName: string,
    address: string,
    addressNumber: string,
    city: string,
    postalCode: string,
    password: string
}

const Home = () => {
    const [docId, setDocId] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [surName, setSurName] = useState("");
    const [address, setAddress] = useState("");
    const [addressNumber, setAddressNumber] = useState("");
    const [city, setCity] = useState("");
    const [hood, setHood] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [termsAccept, setTermsAccept] = useState(false);

    function handleDocIdChange(event: React.ChangeEvent<HTMLInputElement>) {
        var formatteddocId = event.target.value;
        formatteddocId = formatteddocId.replace(/[^\d]/g, "");
        formatteddocId = formatteddocId.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

        setDocId(formatteddocId);
    }

    function handleBirthDateChange(event: React.ChangeEvent<HTMLInputElement>) {
        setBirthDate(event.target.value);
    }

    function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
        setEmail(event.target.value);
    }

    function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
        setName(event.target.value);
    }

    function handleSurNameChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSurName(event.target.value);
    }

    function handleAddressChange(event: React.ChangeEvent<HTMLInputElement>) {
        setAddress(event.target.value);
    }

    function handleAddressNumberChange(event: React.ChangeEvent<HTMLInputElement>) {
        setAddressNumber(event.target.value);
    }

    function handleCityChange(event: React.ChangeEvent<HTMLInputElement>) {
        setCity(event.target.value);
    }

    function handleHoodChange(event: React.ChangeEvent<HTMLInputElement>) {
        setHood(event.target.value);
    }

    function handlePostalCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
        var formattedPostalCode = event.target.value;
        formattedPostalCode = formattedPostalCode.replace(/[^\d]/g, "");
        formattedPostalCode = formattedPostalCode.replace(/(\d{2})(\d{3})(\d{3})/, "$1.$2-$3");

        setPostalCode(formattedPostalCode);
    }

    function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
        setPassword(event.target.value);
    }

    function handlePasswordConfirmChange(event: React.ChangeEvent<HTMLInputElement>) {
        setPasswordConfirm(event.target.value);
    }

    function saveInfos(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        
        if (termsAccept) {
            const personalData: PersonalData = {
                docId: docId,
                birtDate: birthDate,
                email: email,
                name: name,
                surName: surName,
                address: address,
                addressNumber: addressNumber,
                city: city,
                postalCode: postalCode,
                password: password
            }

            var cookieData: ICookieData = {
                name: "personalData",
                value: JSON.stringify(personalData)
            }

            setCookie(cookieData);

            window.location.pathname = "/selecione-plano";

        } else {
            document.getElementById("termsAcceptEl")?.focus();
        }
    }



    return (
        <React.Fragment>
            <Header/>
            <form className="main-form-container" onSubmit={saveInfos}>
                <b className="main-header">Crie sua conta</b>

                <div className="form-group">
                    <span>CPF</span>
                    <input type="text" name="docId" id="docIdEl" placeholder="123.456.789-00" required value={docId} onChange={handleDocIdChange} maxLength={14}/>
                    <small className="error-message hidden">O cpf deve ter 11 dígitos</small>
                </div>
                <div className="form-group">
                    <span>DATA DE NASCIMENTO</span>
                    <input type="date" name="birthDate" id="birthDateEl" required value={birthDate} onChange={handleBirthDateChange}/>
                </div>
                <div className="form-group">
                    <span>E-MAIL</span>
                    <input type="email" name="email" id="emailEl" placeholder="exemplo@2k20.com.br" required value={email} onChange={handleEmailChange}/>
                    <small className="error-message hidden">O e-mail que você digitou não é válido</small>
                </div>
                <div className="form-group split">
                    <div>
                        <span>NOME</span>
                        <input type="text" name="name" id="nameEl" placeholder="João" required onChange={handleNameChange} value={name}/>
                    </div>
                    <div>
                        <span>SOBRENOME</span>
                        <input type="text" name="surname" id="surNameEl" placeholder="da Silva" required onChange={handleSurNameChange} value={surName} />
                    </div>
                </div>
                <div className="form-group split">
                    <div>
                        <span>ENDEREÇO COMPLETO</span>
                        <input type="text" name="address" id="addressEl" placeholder="Rua A" required value={address} onChange={handleAddressChange}/>
                    </div>
                    <div>
                        <span>NÚMERO</span>
                        <input type="text" name="addressNumber" id="addressNumberEl" placeholder="80" required value={addressNumber} onChange={handleAddressNumberChange}/>
                    </div>
                </div>
                <div className="form-group">
                    <span>CIDADE</span>
                    <input type="text" name="city" id="cityEl" placeholder="Neópolis" required onChange={handleCityChange} value={city}/>
                </div>
                <div className="form-group split">
                    <div>
                        <span>BAIRRO</span>
                        <input type="text" name="hood" id="hoodEl" placeholder="Centro" required onChange={handleHoodChange} value={hood}/>
                    </div>
                    <div>
                        <span>CEP</span>
                        <input type="text" name="postalCode" id="postalCodeEl" placeholder="49.980-000" required maxLength={10} onChange={handlePostalCodeChange} value={postalCode}/>
                    </div>
                </div>
                <div className="form-group">
                    <span>SENHA</span>
                    <input type="password" name="password" id="passwordEl" required onChange={handlePasswordChange} value={password}/>
                    <small className="error-message hidden">Sua senha deve conter pelo menos 8 caracteres entre letras e números</small>
                </div>
                <div className="form-group">
                    <span>DIGITE SUA SENHA NOVAMENTE</span>
                    <input type="password" name="passwordConfirm" id="passwordConfirmEl" required onChange={handlePasswordConfirmChange} value={passwordConfirm}/>
                    <small className="error-message hidden">As senhas não correspondem</small>
                </div>
                <div className="form-group checkbox">
                    <input type="checkbox" name="termsAccept" id="termsAcceptEl" onChange={() => setTermsAccept(!termsAccept)} checked={termsAccept}/>
                    <label htmlFor="termsAcceptEl">Ao clicar, você está aceitando os <a href="#">Termos e<br />Condições</a> e <a href="#">Políticas de Privacidade</a></label>
                </div>

                <button type="submit">Criar Conta</button>
            </form>

            <div className="bottom-links">
                <span>Já tem uma conta? <a href="#">Entre com sua conta aqui</a></span>
                <span>Você tem um código? <a href="#">Valide aqui aqui</a></span>
            </div>
        </React.Fragment>
    )
}

export default Home;