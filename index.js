// ==UserScript==
// @name         PontoToday
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Injects button to quickly acess today's timesheet.
// @author       Filipe Miranda
// @match        https://web21.senior.com.br:38001/rubiweb/conector?redir=hrgeral.htm&ACAO=ENTRASISTEMA&SIS=HR
// @icon         https://www.google.com/s2/favicons?sz=64&domain=senior.com.br
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const INPUT_ID = "ponto-today_register_input";

    function getFrameWindow(document, frameName) {
        return document?.getElementsByName(frameName)?.[0]?.contentWindow;
    }

    function fetchDocuments() {
        const menuWindow = getFrameWindow(window.document, "MENU");
        const footerWindow = getFrameWindow(window.document, "RODAPE");
        const menuDocument = menuWindow?.document;
        const footerDocument = footerWindow?.document;
        return {
            menuDocument,
            footerDocument,
        };
    }

    function getCurrentDate() {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();

        return dd + "/" + mm + "/" + yyyy;
    }

    // This function is based on CarregaAcerto from hrpindiv_na.htm (timesheet date's onClick function)
    function loadToday(
        frame,
        NumEmp,
        TipCol,
        NumCad,
        DatAce,
        DatAceIni,
        DatAceFim,
        TipoAcerto,
        SomenteExcecoes,
        SomenteNaoVerificados,
        RowNum
    ) {
        const url =
            "https://web21.senior.com.br:38001/rubiweb/conector?ACAO=EXEACERTO&SIS=HR&STATUS=CARREGARACERTO&TEMMOT=0&TEMRAT=0&IDHR=44729676786_102105108105112101461091051149711010097.HR.NA" +
            "&NumEmp=" +
            NumEmp +
            "&TIPCOL=" +
            TipCol +
            "&NUMCAD=" +
            NumCad +
            "&DATACE=" +
            DatAce +
            "&DATACEINI=" +
            DatAceIni +
            "&DATACEFIM=" +
            DatAceFim +
            "&TIPOACERTO=" +
            TipoAcerto +
            "&ESOMEXC=" +
            SomenteExcecoes +
            "&ESOMNV=" +
            SomenteNaoVerificados +
            "&ROWNUM=" +
            RowNum +
            "&EAbrSit=" +
            "";
        try {
            frame.location = {};
            frame.location.href = url;
            frame.focus();
        } catch (e) {
            console.log(e);
        }
    }

    function onClick(menuDocument, footerDocument) {
        const containerWindow = getFrameWindow(window.document, "MESTRE");
        const containerDocument = containerWindow?.document;
        const mainWindow = getFrameWindow(containerDocument, "DADOSACERTO");
        function getPeriod() {
            const periodElement = footerDocument.querySelector(".DADOPERIODO");
            const period = periodElement.textContent.split("a");
            const start = period[0].trim();
            const end = period[1].trim();
            return {
                start,
                end,
            };
        }
        const register = menuDocument.getElementById(INPUT_ID).value;
        localStorage.setItem("register", register);

        loadToday(
            mainWindow,
            "1",
            "1",
            register,
            getCurrentDate(),
            getPeriod().start,
            getPeriod().end,
            "INDIVIDUAIS",
            "N",
            "N",
            "00"
        );
    }

    function openTimesheets(menuDocument) {
        const link = menuDocument.querySelector(
            "#item3 > tbody > tr > td:nth-child(2) > font > a"
        );
        link.click();
    }

    function createInput(menuDocument) {
        const storedRegister = localStorage.getItem("register");
        const input = menuDocument.createElement("input");
        input.name = "register";
        input.id = INPUT_ID;
        input.value = storedRegister;
        input.placeholder = "Insira seu cadastro";
        return input;
    }

    function createButton(menuDocument, footerDocument) {
        const button = menuDocument.createElement("button");
        button.textContent = "Hoje";
        button.onclick = () => onClick(menuDocument, footerDocument);
        return button;
    }

    function createDiv(menuDocument) {
        const div = menuDocument.createElement("div");
        div.style.display = "flex";
        div.style.flexDirection = "column";
        return div;
    }

    function renderElements(menuDocument, footerDocument) {
        openTimesheets(menuDocument);

        const input = createInput(menuDocument);
        const button = createButton(menuDocument, footerDocument);
        const container = createDiv(menuDocument);
        container.appendChild(input);
        container.appendChild(button);
        menuDocument.body.appendChild(container);
    }

    let interval = setInterval(() => {
        const { menuDocument, footerDocument } = fetchDocuments();
        if (!menuDocument) return;
        renderElements(menuDocument, footerDocument);
        console.log("Input injected.");
        clearInterval(interval);
    }, 1500);
})();
