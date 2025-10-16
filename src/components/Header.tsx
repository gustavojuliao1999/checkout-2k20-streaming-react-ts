import React from "react";

import mainLogoImg from "../img/main-logo.svg";

import "../styles/header.css";

function Header () {
    return (
        <header className="main-header-container">
            <img src={mainLogoImg} className="main-logo" alt="logo" />

            <a href="/ajuda">AJUDA</a>
        </header>
    )
}

export default Header;