// ==UserScript==
// @name         Automatyczne ulepszanie przedmiotów
// @version      0.1.2
// @description  Prosty dodatek do automatycznego ulepszania itemów.
// @author       Seba0456
// @match        http*://*.margonem.pl/
// @match        http*://*.margonem.com/
// @exclude      http*://margonem.*/*
// @exclude      http*://www.margonem.*/*
// @exclude      http*://new.margonem.*/*
// @exclude      http*://forum.margonem.*/*
// @exclude      http*://commons.margonem.*/*
// @exclude      http*://dev-commons.margonem.*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      margonem.pl
// @connect      margonem.com
// @run-at       document-body
// @updateURL    https://raw.githubusercontent.com/seba0456/Margonem-Item-Upgrade/main/itemUpgrades.js
// @downloadURL  https://raw.githubusercontent.com/seba0456/Margonem-Item-Upgrade/main/itemUpgrades.js
// @grant        GM_addStyle
// @grant GM_log
// ==/UserScript==

(function () {
    'use strict';
    console.log("Limonka z miętą załadowana!");
    //Zmienne
    var WorldName = null;
    var PlayerName = null;
    var itemDiv = null;
    var destBag = null;
    var itemsInBag = null;
    var equippedItems = null;
    //var freeBagDiv = null;
    var LoadedItemName = null;
    var draggable = null;
    var droppable = null;
    var burnUni = 0;
    var burnableItems = null;
    var burnableItemsLength = null;

    console.log(burnableItemsLength);

    function waitForLoading() {
        var loadingDiv = document.getElementById("loading");
        if (loadingDiv.style.display !== "none") {
            setTimeout(waitForLoading, 100); // wywołaj funkcję ponownie po 100 milisekundach
        } else {
            // wykonaj akcje po załadowaniu
            console.log("Gra załadowana!");
            refreshExtension();
            //RefreshMargo();
            refreshLoop();

        }
    }
    function refreshExtension() {
        console.log("Odswieżanie dodatku...");
        WorldName = getWorldName();

        console.log(WorldName);
        PlayerName = getPlayerName();
        [itemsInBag, equippedItems] = mapAllItems();
        //freeBagDiv = findBagWithSpace();

        document.body.appendChild(box);
        if (GM_getValue((WorldName, PlayerName)) !== undefined) {
            LoadedItemName = GM_getValue((WorldName, PlayerName));
            console.log(LoadedItemName);
            findItemByName(LoadedItemName, 1);
        }
        console.log(isItemEquippedByName(LoadedItemName));
        //console.log(freeBagDiv);
        //console.log(getBagCapacityByDiv(freeBagDiv));
        [burnableItems, burnableItemsLength] = getAllBurnableItems(itemsInBag, returnItemDivByName(LoadedItemName));

        console.log(burnableItemsLength, burnableItems);
    }
    waitForLoading();
    console.log("here")
    // Utwórz nowy element div
    var box = document.createElement("div");
    // Ustaw mu styl CSS z pozycją absolutną, tłem i obramowaniem
    box.style.position = "absolute";
    box.style.background = "black";
    box.style.border = "2px solid #ffd700";
    box.style.padding = "10px";
    box.style.textAlign = "center";
    box.style.width = "115x"; // ustawia szerokość elementu div na 300 pikseli
    box.style.wordWrap = "break-word";
    //box.style.zoom = "60%";
    // Dodaj treść do okna
    box.innerHTML = "<p style='text-align:center; font-size:12pt;'>Ulepszacz</p> </br>";

    // Utwórz funkcję, która będzie przesuwać okno
    function dragElement(element) {
        var pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;
        // Dodaj zdarzenie do nagłówka okna, które wywoła funkcję, gdy zostanie przesunięte
        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // Pobierz pozycję kursora myszy podczas kliknięcia
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // Wywołaj funkcję podczas przesuwania kursora myszy
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // Oblicz nową pozycję elementu
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // Sprawdź, czy nowa pozycja elementu nie wykracza poza granice okna
            if (element.offsetTop - pos2 >= 0 && element.offsetTop - pos2 + element.offsetHeight <= window.innerHeight) {
                element.style.top = element.offsetTop - pos2 + "px";
            }
            if (element.offsetLeft - pos1 >= 0 && element.offsetLeft - pos1 + element.offsetWidth <= window.innerWidth) {
                element.style.left = element.offsetLeft - pos1 + "px";
            }
        }


        function closeDragElement() {
            // Zakończ przesuwanie elementu
            document.onmouseup = null;
            document.onmousemove = null;
            // Zapamiętaj pozycję elementu w localStorage
            localStorage.setItem("boxPosition", JSON.stringify({ top: element.style.top, left: element.style.left }));
        }

    }
    //utwórz przycisk
    var button = document.createElement("button");
    button.disabled = true;
    button.innerText = "Ulepsz item";
    // Dodaj przycisk do okna
    box.appendChild(button);
    button.style.fontSize = "10px";
    //Dodaj br
    var br = document.createElement("br");
    var br2 = document.createElement("br");
    box.appendChild(br);
    //Odswież ID divów
    const para = document.createElement("p");
    para.style.fontSize = "12px";
    para.style.wordWrap = "break-word";
    const para2 = document.createElement("p");
    para2.innerHTML = "DEBUG";
    para2.style.fontSize = "12px";
    const itemIcon = document.createElement("img");
    itemIcon.style.zoom = "75%";
    function defaultPara() {
        console.log("domyłśne")
        para.innerHTML = "Brak itemu, proszę wybrać";
        para.style.fontColor = "White";
        itemIcon.src = "https://i.imgur.com/AY1S9di.png";
        button.disabled = true;
        //console.log(new Error().stack);
    }
    defaultPara();
    itemIcon.style.textAlign = "center";
    //para.style.fontSize = "40%";
    box.appendChild(para);


    box.appendChild(itemIcon);
    box.appendChild(br2);
    var buttonPick = document.createElement("button");
    buttonPick.innerText = "Pick";
    buttonPick.style.fontSize = "11px";
    // Dodaj przycisk do okna
    box.appendChild(buttonPick);
    box.appendChild(br);



    function findItemByName(itemName, addImage) {

        itemDiv = document.querySelector(`div[tip*="${itemName}"]`);
        para.innerHTML = itemName;
        const imgSrc = itemDiv.querySelector('img').getAttribute('src');
        itemIcon.src = imgSrc;
        button.disabled = false;
        if (itemDiv.getAttribute('tip').indexOf('* heroiczny *') !== -1) {
            para.style.color = "#228CF5";
            para.style.fontWeight = "bold";
        } else if (itemDiv.getAttribute('tip').indexOf('* unikatowy *') !== -1) {
            para.style.color = "#DAA520";
            para.style.fontWeight = "bold";
        } else if (itemDiv.getAttribute('tip').indexOf('* legendarny *') !== -1) {
            para.style.color = "#F94402";
            para.style.fontWeight = "bold";
        }
    }
    function returnItemDivByName(itemName) {
        var itemDivByName = document.querySelector(`div[tip*="${itemName}"]`);
        return itemDivByName;
    }
    function getWorldName() {
        var currentUrl = window.location.href;
        var parts = currentUrl.split(".");
        var name = parts[0].slice(8);

        return name;
    }

    function getPlayerName() {
        var element = document.getElementById("nick");
        var text = element.textContent; // lub element.innerText
        var name = text.split(" · ")[0]; // wyodrębnienie tylko pierwszej części tekstu

        console.log(name);
        return name;
    }

    function pickItem() {
        var picked_right = 0;
        console.log("Click on the item");
        para.innerHTML = "Proszę kliknąć na element...";
        para.style.color = "white";
        para.style.fontWeight = "normal";

        var divs = document.querySelectorAll('div');
        for (var i = 0; i < divs.length; i++) {
            divs[i].addEventListener('click', handleClick);
        }

        function handleClick(event) {
            if (event.target.tagName !== 'BUTTON' && picked_right !== 1) {
                var parentDiv = event.target.parentNode;
                var tipValue = parentDiv.getAttribute('tip');
                var parser = new DOMParser();
                var tipDoc = parser.parseFromString(tipValue, "text/html");
                try {
                    var itemName = tipDoc.querySelector('b.item-name').textContent;
                    var type = tipDoc.querySelector('span.type-text').textContent.split(':')[1].trim();

                    console.log(itemName, type);
                    if (type !== "Neutralne" && type !== "Strzały" && type !== "Konsumpcyjne" && type !== "Błogosławieństwa" && type !== "Torby" && type !== "Talizmany" && type !== "Questowe") {
                        para.innerHTML = ("Wybrano: ", itemName);
                        picked_right = 1;
                        findItemByName(itemName, 1);
                        GM_setValue((WorldName, PlayerName), itemName);
                        LoadedItemName = itemName;

                    } else {
                        defaultPara();
                    }
                } catch (error) {

                    defaultPara();
                    console.log(error);

                }
            }
        }

        console.log("here");

        // Usuwamy wszystkie zdarzenia click przypisane do elementów div
        for (var i2 = 0; i < divs.length; i2++) {
            divs[i2].removeEventListener('click', handleClick);
        }
    }
    function mapAllItems() {
        // Pobierz wszystkie divy na stronie
        var allDivs = document.querySelectorAll("div");

        // Pobierz wszystkie divy w bag
        var bag = document.querySelector("#bag");
        var itemsInBag = bag.querySelectorAll("div.item.ui-draggable.ui-draggable-handle");

        // Pobierz wszystkie divy, które są div.item.ui-draggable.ui-draggable-handle, ale nie są w bag
        var allItems = [];
        for (var i = 0; i < allDivs.length; i++) {
            var div = allDivs[i];
            if (div.classList.contains("item") && div.classList.contains("ui-draggable") && div.classList.contains("ui-draggable-handle") && !bag.contains(div)) {
                allItems.push(div);
            }
        }

        // Znajdź wszystkie itemy, które są equiped i dodaj je do tablicy equipedItems
        var equipedItems = [];
        for (var i3 = 0; i3 < allItems.length; i3++) {
            var item = allItems[i3];
            var itemName = item.getAttribute("tip").match(/<b class="item-name">([^<]+)/)[1];
            var isEquiped = false;
            for (var j = 0; j < itemsInBag.length; j++) {
                var bagItem = itemsInBag[j];
                if (bagItem.getAttribute("tip").indexOf(itemName) > -1) {
                    isEquiped = true;
                    break;
                }
            }
            if (!isEquiped) {
                equipedItems.push(item);
            }
        }

        // Zwróć tablicę itemsInBag oraz equipedItems
        return [itemsInBag, equipedItems];
    }
    function findBagWithSpace() {

        for (var i = 0; i < equippedItems.length; i++) {
            var tip = equippedItems[i].getAttribute("tip");
            //console.log("Torby",tip)
            if (tip.includes("Typ:  Torby") && !tip.includes("Tylko klucze")) {
                var small = equippedItems[i].querySelector("small");
                var value = parseInt(small.textContent);

                if (value > 0) {
                    return equippedItems[i];
                }
            }
        }

        console.log("Brak miejsc!");
    }
    function getBagCapacityByDiv(itemDiv) {
        var small = itemDiv.querySelector("small");
        var value = parseInt(small.textContent);
        return value;
    }
    function isItemEquippedByName(itemName) {
        const equippedItem = equippedItems.find(item => item.getAttribute('tip').includes(itemName));
        console.log("Czy", itemName, "jest w użyciu? ", Boolean(equippedItem));
        return Boolean(equippedItem);
    }

    box.appendChild(para2);

    function refreshLoop() {
        setInterval(function () {
            [itemsInBag, equippedItems] = mapAllItems();
            if (isItemEquippedByName(LoadedItemName)) {
                para2.innerHTML = "Umieść item w torbie!";
            }
            else {
                para2.innerHTML = "Item gotowy do ulepszania.";
            }
            //console.log("Odświeżam się co 0,5 sekundy!");
        }, 500); // 500 milisekund = 0,5 sekundy
    }
    function getAllBurnableItems(divArray, ignoreDiv) {
        var filteredDivs = [];
        for (var i3 = 0; i3 < divArray.length; i3++) {
            var currentDiv = divArray[i3];
            if (currentDiv === ignoreDiv) {
                continue;
            }
            var tipValue = currentDiv.getAttribute('tip');
            if (tipValue.indexOf('Bezużyteczny składnik rzemieślniczy') !== -1) {
                continue;
            }
            var parser = new DOMParser();
            var tipDoc = parser.parseFromString(tipValue, "text/html");
            var itemName = tipDoc.querySelector('b.item-name').textContent;
            var type = tipDoc.querySelector('span.type-text').textContent.split(':')[1].trim();
            var isUnique = tipValue.indexOf('* unikatowy *') !== -1;
            var isHeroic = tipValue.indexOf('* heroiczny *') !== -1;
            var isLegendary = tipValue.indexOf('* legendarny *') !== -1;
            const isOwned = tipValue.indexOf('Związany z właścicielem') !== -1;
            if (!isOwned && isUnique && !isHeroic && !isLegendary && type !== 'Neutralne' && type !== 'Strzały' && type !== 'Konsumpcyjne' && type !== 'Błogosławieństwa' && type !== 'Torby' && type !== 'Talizmany' && type !== 'Questowe') {
                filteredDivs.push(currentDiv);
            }
            else {
                //console.log(itemName, isOwned);
            }
        }
        return [filteredDivs, filteredDivs.length];
    }
    function isItemBurnable(itemDiv, burnUni) {
        console.log("Otrzymałem", itemDiv, burnUni);
        let tipValue;
        try {
            tipValue = itemDiv.getAttribute('tip');
        } catch (e) {
            console.error('Błąd przy pobieraniu atrybutu "tip":', e);
            return false;
        }
        if (tipValue.indexOf('Bezużyteczny składnik rzemieślniczy') !== -1) {
            return false;
        }
        const parser = new DOMParser();
        const tipDoc = parser.parseFromString(tipValue, "text/html");
        const itemName = tipDoc.querySelector('b.item-name').textContent;
        const type = tipDoc.querySelector('span.type-text').textContent.split(':')[1].trim();
        const isUnique = tipValue.indexOf('* unikatowy *') !== -1;
        const isHeroic = tipValue.indexOf('* heroiczny *') !== -1;
        const isLegendary = tipValue.indexOf('* legendarny *') !== -1;
        const isOwned = tipValue.indexOf('Związany z właścicielem') !== -1;
        console.log("Sprawdzanie itemu o nazwie:", itemName, burnUni, isUnique, isHeroic, isLegendary, "IsOwned:", isOwned);
        console.log(isHeroic, isLegendary);
        if (isHeroic || isLegendary) {
            return false;
        } else {
            console.log("zwracam true");
            return true;
        }
    }

    function openUpgradesTab() {
        // uzyskaj dostęp do elementu div o id "myDiv"
        const myDiv = document.getElementById("b_recipes");

        // kliknij na ten element
        myDiv.click();
    }

    function safetyCheck(itemName) {
        console.log("safetyCheck", LoadedItemName);
        const parentDiv = document.querySelector('.enhance__item--current');
        const itemDiv = parentDiv.querySelector(`div[tip*="${itemName}"]`);
        console.log("itemDiv: ", itemDiv, "Item parrent is: ", parentDiv);
        const tipValue = itemDiv.getAttribute('tip');
        const itemNameToCheck = new DOMParser().parseFromString(tipValue, 'text/html').querySelector('b.item-name').textContent;
        const itemNameToCheckWithoutLevel = itemNameToCheck.split('+')[0].trim();
        let str = itemName;

        // Wyłapanie liczby po znaku "+", konwersja na liczbę i dodanie 1

        let num = null;
        try {
            num = parseInt(str.match(/\+(\d+)/)[1]) + 1;
        }
        catch (e) {
            num = "błąd";
            console.log(e); // pass exception object to error handler
        }
        // Podmiana liczby w oryginalnym stringu
        const nextLevel = str.replace(/\+\d+/, `+${num.toString()}`);
        console.log(nextLevel);

        if ((itemName == itemNameToCheckWithoutLevel) || (itemName == itemNameToCheck)) {
            console.log(itemNameToCheck);
            console.log("Save!");

            return true;
        }
        else if ((itemName == nextLevel)) {
            LoadedItemName = GM_getValue((WorldName, PlayerName));
            GM_setValue((WorldName, PlayerName), LoadedItemName);
            return true;
        }
        else {

            console.log("Unsave!", itemName, itemNameToCheck);
            console.log(itemNameToCheckWithoutLevel !== itemName);
            return false;

        }
    }


    // Tworzenie elementu <label> z checkboxem i tekstem
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode("Palić unikaty?"));
    label.style.zoom = "60%";
    // Dodanie elementu <label> do strony
    box.appendChild(label);

    // Sprawdzenie, czy checkbox jest zaznaczony po kliknięciu
    checkbox.addEventListener("click", function () {
        if (checkbox.checked) {
            console.log("Checkbox jest zaznaczony!");
            burnUni = 1;
        } else {
            console.log("Checkbox nie jest zaznaczony.");
            burnUni = 0;
        }
        refreshExtension();
        [burnableItems, burnableItemsLength] = getAllBurnableItems(itemsInBag, returnItemDivByName(LoadedItemName));
        console.log(burnableItems);
    });

    function loadItemToSlot(itemDiv) {

        // uzyskaj dostęp do elementu div o id "myDiv"
        const myDiv = itemDiv;
        console.log("Klikam na: ", myDiv);
        // kliknij na ten element
        try {
            myDiv.click();
        } catch (err) {
            console.log(err);
        }
    }

    button.onclick = async () => {
        async function handleClick() {
            // Sprawdzenie czy przycisk jest zablokowany
            if (button.disabled) {
                return;
            }

            // Zablokowanie przycisku
            button.disabled = true;
            console.log("Delay");
            if (!isItemEquippedByName(LoadedItemName)) {
                openUpgradesTab();
                itemDiv = returnItemDivByName(LoadedItemName);
                console.log("Pierwszy item to:  ", itemDiv);
                const [burnableItems, burnableItemsLength] = getAllBurnableItems(itemsInBag, returnItemDivByName(LoadedItemName));
                //if (burnableItems.length == 0) {
                //  alert("Brak itemów, do ulepszania...");
                // }
                //kiedyś zadziała XD
                console.log("Itemy zdolne do przepalenia", burnableItems);
                var divButton = null;
                await new Promise(resolve => setTimeout(resolve, 300));

                loadItemToSlot(itemDiv);

                divButton = document.querySelector('div[tip="Dodaj automatycznie przedmioty pospolite z torby numer 1."]');
                for (let j = 0; j < 5; j++) {
                    //console.log("Klikam torbę:",i,j,"raz...")
                    console.log(`Iteracja wewnętrznego fora nr ${j}`);
                    divButton.click();
                    console.log("Jestem torbą 1!");
                    console.log("Klikam na: ", divButton);
                    await new Promise(resolve => setTimeout(resolve, 350));
                    const enhanceSubmit = document.querySelector(".enhance__submit");
                    const siButton = enhanceSubmit.querySelector(".SI-button");

                    if (siButton.classList.contains("disable")) {
                        console.log("SI-button is disabled, so skipping for...", siButton);
                        await new Promise(resolve => setTimeout(resolve, 100));
                        break;
                    } else {
                        console.log("SI-button is enabled loop 1");

                        await siButton.click();
                        const myButton = document.getElementById("a_ok");
                        await myButton.click();
                        await new Promise(resolve => setTimeout(resolve, 2300));
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 200));
                for (let j = 0; j < 5; j++) {
                    //console.log("Klikam torbę:",i,j,"raz...")
                    console.log(`Iteracja wewnętrznego fora nr ${j}`);
                    divButton.click();
                    console.log("Jestem torbą 1!");
                    console.log("Klikam na: ", divButton);
                    await new Promise(resolve => setTimeout(resolve, 350));
                    const enhanceSubmit = document.querySelector(".enhance__submit");
                    const siButton = enhanceSubmit.querySelector(".SI-button");

                    if (siButton.classList.contains("disable")) {
                        console.log("SI-button is disabled, so skipping for...", siButton);
                        await new Promise(resolve => setTimeout(resolve, 100));
                        break;
                    } else {
                        console.log("SI-button is enabled loop 1");

                        await siButton.click();
                        const myButton = document.getElementById("a_ok");
                        await myButton.click();
                        await new Promise(resolve => setTimeout(resolve, 2300));
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 200));
                divButton = document.querySelector('div[tip="Dodaj automatycznie przedmioty pospolite z torby numer 2."]');
                for (let j = 0; j < 5; j++) {
                    //console.log("Klikam torbę:",i,j,"raz...")
                    console.log(`Iteracja wewnętrznego fora nr ${j}`);
                    divButton.click();
                    await new Promise(resolve => setTimeout(resolve, 250));
                    const enhanceSubmit = document.querySelector(".enhance__submit");
                    const siButton = enhanceSubmit.querySelector(".SI-button");

                    if (siButton.classList.contains("disable")) {
                        console.log("SI-button is disabled, so skipping for...");
                        await new Promise(resolve => setTimeout(resolve, 100));
                        break;
                    } else {
                        console.log("SI-button is enabled");

                        await siButton.click();
                        const myButton = document.getElementById("a_ok");
                        await myButton.click();
                        await new Promise(resolve => setTimeout(resolve, 2300));
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 200));
                divButton = document.querySelector('div[tip="Dodaj automatycznie przedmioty pospolite z torby numer 3."]');
                for (let j = 0; j < 5; j++) {
                    //console.log("Klikam torbę:",i,j,"raz...")
                    console.log(`Iteracja wewnętrznego fora nr ${j}`);
                    divButton.click();
                    await new Promise(resolve => setTimeout(resolve, 250));
                    const enhanceSubmit = document.querySelector(".enhance__submit");
                    const siButton = enhanceSubmit.querySelector(".SI-button");

                    if (siButton.classList.contains("disable")) {
                        console.log("SI-button is disabled, so skipping for...");
                        await new Promise(resolve => setTimeout(resolve, 100));
                        break;
                    } else {
                        console.log("SI-button is enabled");

                        await siButton.click();
                        const myButton = document.getElementById("a_ok");
                        await myButton.click();
                        await new Promise(resolve => setTimeout(resolve, 2300));
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 200)); // dodana obietnica
                //divButton = document.querySelector('div[tip="Dodaj automatycznie przedmioty pospolite z torby numer 1."]');

                //await new Promise(resolve => setTimeout(resolve, 200)); // dodana obietnica


                if (burnUni == 1) {
                    console.log("Zaczynam palić uni!");
                    await new Promise(resolve => setTimeout(resolve, 300));

                    console.log(burnableItems);
                    const iterations = Math.ceil(burnableItems.length / 10);
                    let flag = true; // zmienna flagowa

                    for (let j = 0; j < iterations; j++) {
                        flag = true;
                        if (flag) {
                            const x = 0;
                            for (let x = 0; x < 11; x++) {
                                console.log("For wykonany! a x to:", x);
                                if (x == 10 || x == burnableItems.length) {

                                    await new Promise(resolve => setTimeout(resolve, 500));
                                    if (safetyCheck(LoadedItemName)) {
                                        const enhanceSubmit = document.querySelector(".enhance__submit");
                                        const siButton = enhanceSubmit.querySelector(".SI-button");

                                        if (siButton.classList.contains("disable")) {
                                            console.log("SI-button is disabled");
                                        } else {
                                            console.log("SI-button is enabled");
                                            await new Promise(resolve => setTimeout(resolve, 200));
                                            await siButton.click();
                                            const myButton = document.getElementById("a_ok");
                                            await myButton.click();
                                            await new Promise(resolve => setTimeout(resolve, 1200));
                                        }
                                    }
                                    flag = false; // zmiana wartości flagi
                                    break;
                                } else {
                                    if (typeof x === 'undefined') {
                                        x = x - 1;
                                    }
                                    console.log("Wysyłam:", burnableItems[x])
                                    if (isItemBurnable(burnableItems[x], burnUni)) {
                                        await new Promise(resolve => setTimeout(resolve, 200));
                                        console.log("Item palę");
                                        loadItemToSlot(burnableItems[x]);
                                        console.log(`Iteracja ${j + 1} z ${iterations}`);
                                        console.log("chcę wczytać...", x);
                                    }

                                }
                            }
                            burnableItems.splice(0, 10);
                        } else {
                            console.log(`Iteracja ${j + 1} z ${iterations} została opóźniona`);
                            await new Promise(resolve => setTimeout(resolve, 1000)); // czekaj sekundę
                        }
                    }

                }
                // Poczekaj 100ms po załadowaniu przed kolejnymi krokami

            } else {
                alert("Item nie znajduje się w torbie!");
            }
            // uzyskanie referencji do elementu <div class="close-but">
            const parentDiv = document.getElementById('crafting');
            const closeButton = parentDiv.querySelector('.close-but');
            closeButton.click();
            // dodanie obsługi zdarzenia kliknięcia dla elementu <div class="close-but">


            // Odblokowanie przycisku
            button.disabled = false;
        }

        await handleClick(); // wywołanie funkcji z użyciem await
    };
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    buttonPick.onclick = pickItem;

    var savedPosition = localStorage.getItem("boxPosition");
    if (savedPosition) {
        savedPosition = JSON.parse(savedPosition);
        box.style.top = savedPosition.top;
        box.style.left = savedPosition.left;
    }

    dragElement(box);
    box.style.zIndex = "9999";
})();
