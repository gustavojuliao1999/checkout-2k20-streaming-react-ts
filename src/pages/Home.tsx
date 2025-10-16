import React, { useState, useEffect } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import Header from "../components/Header";

import fxRightImg from "../img/fx-right.svg";
import fxLeftImg from "../img/fx-left.svg";

import "../styles/home.css";
import globals from '../globals.js';


type PersonalData = {
    docId: string,
    birtDate: string,
    email: string,
    phone: string
    name: string,
    surName: string,
    address: string,
    state: string,
    addressNumber: string,
    city: string,
    postalCode: string,
    password: string
}

type State = {
    id: string;
    text: string;
    sigla: string;
};

type City = {
    id: string;
    text: string;
};

type CepData = {
    logradouro?: string;
    bairro?: string;
    uf?: string;
    estado?: string;
    localidade?: string;
    erro?: boolean;
    street?: string;
    neighborhood?: string;
    state?: string;
    city?: string;
    name?: string; // For BrasilAPI error
};

type PostDataPayload = {
    [key: string]: string;
};


const Home = () => {
    const [docId, setDocId] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
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
    const [error, setError] = useState("");

    // Estados para os selects de Estado e Cidade
    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedState, setSelectedState] = useState("");

    const location = useLocation();


    function handleDocIdChange(event: React.ChangeEvent<HTMLInputElement>) {
        var formatteddocId = event.target.value;
        formatteddocId = formatteddocId.replace(/[^\d]/g, "");
        formatteddocId = formatteddocId.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

        setDocId(formatteddocId);
    }

    function handleBirthDateChange(event: React.ChangeEvent<HTMLInputElement>) {
        let value = event.target.value;
        // Remove tudo que não for dígito
        value = value.replace(/\D/g, "");
        // Adiciona a primeira barra
        value = value.replace(/(\d{2})(\d)/, "$1/$2");
        // Adiciona a segunda barra
        value = value.replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
        setBirthDate(value);
    }

    function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
        setEmail(event.target.value);
    }

    function handlePhoneChange(event: React.ChangeEvent<HTMLInputElement>) {
        setPhone(event.target.value);
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

    function handleCityChange(event: React.ChangeEvent<HTMLSelectElement>) {
        setCity(event.target.value);
    }

    function handleHoodChange(event: React.ChangeEvent<HTMLInputElement>) {
        setHood(event.target.value);
    }
    async function get_estados() {
        const responseEstados = await fetch(globals.apiBaseUrl + '/api', {
            method: 'POST',
            headers: {
                'Authorization': globals.token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "route": "get_estados"
            }),
        });
        const dataEstados = await responseEstados.json();
        return dataEstados['estados'];
    }
    async function get_cidades(uf: string) {
         console.log('getCidades');
        // try {
        // Faz a requisição POST para a URL desejada
        const response = await fetch(globals.apiBaseUrl + '/api/', {
            method: 'POST',
            headers: {
                'Authorization': globals.token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "route": "get_cidades",
                "data": {
                    "uf_id": uf
                }
            }),
        });

        if (!response.ok) {
            const data = await response.json();
            console.log('Erro:', data);
            throw new Error('Erro ao enviar os dados');
        }
        const data = await response.json(); // Processa a resposta JSON
        return data.cidades;
    }

    async function handlePostalCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
        let formattedPostalCode = event.target.value;
        formattedPostalCode = formattedPostalCode.replace(/(\d{5})(\d)/, "$1-$2");

        setPostalCode(formattedPostalCode);

        if (formattedPostalCode.length === 9) {
            setError(""); // Limpa erros de CEP anteriores
            try {
                let dataCep: CepData;
                // Tenta a API ViaCEP primeiro
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${formattedPostalCode}/json/`);
                    if (!response.ok) throw new Error("Erro na resposta do ViaCEP");
                    dataCep = await response.json();
                    if (dataCep.erro) throw new Error("CEP não encontrado no ViaCEP");
                    let set_state = null;
                    for (const st of states) {
                        if (st.text === dataCep.estado) {
                            setSelectedState(st.id);
                            set_state = st.id;
                        }
                    }
                    if (set_state != null){
                        const cidades = await get_cidades(selectedState);
                        setCities(cidades);
                        for (const cidade of cidades) {
                            
                            if (cidade.text === dataCep.localidade) {
                                console.log(cidade.text + " - " + dataCep.localidade);
                                setCity(cidade.id);
                            }
                        }
                    }
                    

                    // Preenche os campos com os dados do ViaCEP
                    setAddress(dataCep.logradouro || "");
                    setHood(dataCep.bairro || "");
                    // setSelectedState(dataCep.uf || "");
                    // A busca de cidades e seleção da cidade correta será feita no useEffect

                } catch (viaCepError) {
                    console.warn("ViaCEP falhou, tentando BrasilAPI...", viaCepError);

                    // // Tenta a API BrasilAPI como fallback
                    // const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${formattedPostalCode}`);
                    // if (!response.ok) throw new Error("Erro na resposta da BrasilAPI");
                    // dataCep = await response.json();
                    // if (dataCep.name === "CepPromiseError") throw new Error("CEP não encontrado na BrasilAPI");


                    // // Preenche os campos com os dados da BrasilAPI
                    // setAddress(dataCep.street || "");
                    // setHood(dataCep.neighborhood || "");
                    // setSelectedState(dataCep.state || "");
                }

                // Aguarda um ciclo para o estado `cities` ser atualizado pelo outro useEffect
                // setTimeout(() => {
                //     if (dataCep.localidade || dataCep.city) {
                //         setCity(dataCep.localidade || dataCep.city || "");
                //     }
                // }, 100);


            } catch (error: any) {
                console.error("Erro ao buscar CEP:", error);
                setError("CEP não encontrado. Por favor, verifique e tente novamente.");
                // Limpa os campos relacionados ao endereço em caso de erro
                setAddress("");
                setHood("");
                setCity("");
                setSelectedState("");
            }
        }
    }

    function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
        setPassword(event.target.value);
    }

    function handlePasswordConfirmChange(event: React.ChangeEvent<HTMLInputElement>) {
        setPasswordConfirm(event.target.value);
    }

    const navigate = useNavigate();

    // Simula a busca de estados na API ao montar o componente
    useEffect(() => {
        // TODO: Substituir pela sua chamada de API real para buscar estados
        const fetchStates = async () => {
            // Exemplo de dados mocados
            const estados = await get_estados();
            setStates(estados);
            // setStates(mockStates);
        };
        fetchStates();
    }, []);

    // Simula a busca de cidades na API quando um estado é selecionado
    async function set_state(uf: string) {
        setSelectedState(uf);
        setCity("");
        if (!uf) {
           
            setCities([]);
            return;
        }
        const cidades = await get_cidades(uf);
        setCities(cidades);
    }


    async function saveInfos(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(""); // Limpa erros anteriores

        // Validações
        if (password !== passwordConfirm) {
            setError("As senhas não correspondem.");
            return;
        }
        
        if (termsAccept) {

            // Estrutura de dados para o POST
            const searchParams = new URLSearchParams(location.search);
            const planoId = searchParams.get('plano');
            const registroToken = searchParams.get('token');

            const data: PostDataPayload = {
                'input-nome': name,
                'input-sobrenome': surName,
                'input-email': email,
                'input-cpf': docId,
                'input-estado': selectedState,
                'input-endereco': address,
                'input-numero': addressNumber,
                'input-cidade': city,
                'input-bairro': hood,
                'input-cep': postalCode,
                'input-senha': password
            };

            if(planoId){
                data['input-plano'] = planoId;
            }
            if (registroToken) {
                data['registro'] = registroToken;
            }
            data['input-data-nascimento'] = birthDate.split('/').reverse().join('-');

            const postData = {
                route: "set_cliente", // Exemplo, ajuste conforme sua API
                data: data
            };

            try {
                // Substitua pela URL da sua API
                const response = await fetch(globals.apiBaseUrl+'/api/streaming', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': globals.token
                    },
                    body: JSON.stringify(postData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.msg || 'Erro ao enviar os dados.');
                }

                const responseData = await response.json();
                console.log('Resposta do servidor:', responseData);

                if (responseData.token) {
                    
                    

                    if (planoId) {
                        // Se veio com um plano da URL, vai direto para o pagamento
                        navigate(`/pagamento?token=${responseData.token}&plano=${planoId}`);
                    } else {
                        // Senão, vai para a seleção de planos
                        navigate(`/plano?token=${responseData.token}`);
                    }
                } else {
                    throw new Error('Token não recebido na resposta.');
                }
            } catch (error: any) {
                console.error('Erro:', error);
                setError(error.message || 'Ocorreu um erro ao enviar os dados. Tente novamente.');
            }

        } else {
            setError("Você deve aceitar os termos e condições.");
            const termsEl = document.getElementById("termsAcceptEl");
            if (termsEl) termsEl.focus();
        }
    }

    return (
        <React.Fragment>
            <Header/>
            <form className="main-form-container" onSubmit={saveInfos}>
                {error && <div className="main-error-message">{error}</div>}
                <b className="main-header">Crie sua conta</b>

                <div className="form-group">
                    <span>CPF</span>
                    <input type="text" name="docId" id="docIdEl" placeholder="000.000.000-00" required value={docId} onChange={handleDocIdChange} maxLength={14}/>
                    <small className="error-message hidden">O cpf deve ter 11 dígitos</small>
                </div>
                <div className="form-group">
                    <span>DATA DE NASCIMENTO</span>
                    <input type="text" name="birthDate" id="birthDateEl" placeholder="DD/MM/AAAA" required value={birthDate} onChange={handleBirthDateChange} maxLength={10}/>
                </div>
                <div className="form-group split">
                    <div>
                        <span>E-MAIL</span>
                        <input type="email" name="email" id="emailEl" placeholder="exemplo@2k20.com.br" required value={email} onChange={handleEmailChange}/>
                        <small className="error-message hidden">O e-mail que você digitou não é válido</small>
                    </div>
                    <div>
                        <span>CONTATO</span>
                        <input type="text" name="phone" id="phoneEl" placeholder="99 99999-9999" required value={phone} onChange={handlePhoneChange}/>
                        <small className="error-message hidden">O e-mail que você digitou não é válido</small>
                    </div>
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
                        <span>CEP</span>
                        <input type="text" name="postalCode" id="postalCodeEl" placeholder="Apenas números" required maxLength={9} onChange={handlePostalCodeChange} value={postalCode}/>
                    </div>
                    <div>
                        <span>ESTADO</span>
                        <div className="select-wrapper">
                            
                            <select name="state" id="stateEl" required value={selectedState} onChange={(e) => set_state(e.target.value)}>
                                <option value="">Selecione um estado</option>
                         
                                {states.map((state) => (
                                    <option key={state.id} value={state.id}>
                                        {state.text}
                                    </option>
                                ))}
                            </select>
                            
                        </div>
                    </div>
                </div>
                 <div className="form-group split">
                    
                    <div>
                        <span>CIDADE</span>
                        <div className="select-wrapper">
                            <select name="city" id="cityEl" required value={city} onChange={handleCityChange} disabled={!selectedState}>
                                <option value="">Selecione uma cidade</option>
                                {cities.map((city) => (
                                    <option key={city.id} value={city.id}>
                                        {city.text}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <span>BAIRRO</span>
                        <input type="text" name="hood" id="hoodEl" placeholder="Centro" required onChange={handleHoodChange} value={hood}/>
                    </div>
                </div>
                <div className="form-group split">
                    <div>
                        <span>ENDEREÇO COMPLETO</span>
                        <input type="text" name="address" id="addressEl" placeholder="Digite a rua" required value={address} onChange={handleAddressChange}/>
                    </div>
                    <div>
                        <span>NÚMERO</span>
                        <input type="text" name="addressNumber" id="addressNumberEl" placeholder="0" required value={addressNumber} onChange={handleAddressNumberChange}/>
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
                    <label htmlFor="termsAcceptEl">Ao clicar, você está aceitando os <a href="/termos">Termos e<br />Condições</a> e <a href="/privacidade">Políticas de Privacidade</a></label>
                </div>

                <button type="submit">Criar Conta</button>
            </form>

            <div className="bottom-links">
                <span>Já tem uma conta? <a href="/login">Entre com sua conta aqui</a></span>
                <span>Você tem um código? <a href="/validar-codigo">Valide aqui aqui</a></span>
            </div>

            <img src={fxRightImg} className="fx-right-img" alt="decoration" />
            <img src={fxLeftImg} className="fx-left-img" alt="decoration" />
        </React.Fragment>
    )
}

export default Home;