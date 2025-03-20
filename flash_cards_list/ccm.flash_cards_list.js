/**
 * @overview ccm component for flash cards
 * @author Wiete Lück <wiete.lueck@gmail.com>, 2025
 * @license The MIT License (MIT)
 */

ccm.files["ccm.flash_cards_list.js"] = {
    name: "flash-cards-list",
    //ccm: "https://ccmjs.github.io/ccm/ccm.js",
    ccm: "../libs/ccm-master/ccm.js",
    config: {
        store: ["ccm.store", {url:"https://ccm2.inf.h-brs.de", name:"wlueck2s_mycollection"}],

        css: ["ccm.load", "./resources/styles.css"],
        //html: ["ccm.load", "./resources/template.html"],
        html: {
            list: ["ccm.load", "./resources/template.html"],
            editor: ["ccm.load", "./resources/editor.html"],
            //card: ["ccm.load", "./resources/card.html"],
        },

        user: ["ccm.start", "../libs/fb02user/ccm.fb02user.js"],
        //editor: ["ccm.instance", "../flash_cards_editor/ccm.flash_cards_editor.js"],
        //flash_cards: ["ccm.instance", "../flash_cards/ccm.flash_cards.js"]
    },

    Instance: function () {

        this.start = async () => {

            this.element.innerHTML = this.html.list;
            this.initButtons();

            this.element.querySelector('#user').append(this.user.root);
            let user;
            try {
                user = await this.user.getValue();
                if (!user) {
                    console.log("User is not logged in");
                    return;
                }
            } catch (e) {
                console.log("User is not logged in: ", e);
                return;
            }

            const dataset = await this.store.get(user.key);
            if (!dataset) {
                console.log("No dataset found");
                return;
            }
            this.fillCourseList(dataset.value);
        };

        this.initButtons = () => {
            const addDeckButton = this.element.querySelector('#add_deck_button');
            addDeckButton.addEventListener('click', async () => {
                //todo add deck
                //this.element.innerHTML = '';
                //await this.editor.start();
                //this.element.append(this.editor.root);
            });

            const sortButton = this.element.querySelector('#sort_decks_button');
            sortButton.addEventListener('click', async () => {
                // todo sort
            });
        }

        this.fillCourseList = (dataset) => {

            const listContainer = this.element.querySelector('#list_of_card_decks');

            for (const course of dataset) {
                const courseDeadlineHtml = course.deadline ? `<a>Deadline: ${course.deadline}</a>` : '';

                const courseStatus = this.getCourseStatus(course);
                const courseStatusString = courseStatus.easy + ' / ' + courseStatus.medium + ' / ' + courseStatus.hard;
                const courseStatusChartStyle = `
                                    width: 30px; height: 30px;
                                    background-image: radial-gradient(circle, white 57%, transparent 57%),
                                    conic-gradient( #2b6c22 0% ${courseStatus.easyPercent}%, 
                                                    #e0cd00 ${courseStatus.easyPercent}% ${courseStatus.easyPercent + courseStatus.mediumPercent}%, 
                                                    #b3261e ${courseStatus.easyPercent + courseStatus.mediumPercent}% 100%);
                                    border-radius: 50%;`;

                const coursesHtml = `<div id="card">
                                                <div id="card-header">
                                                    <div id="card-content">
                                                        <div id="card-title">${course.title}</div>
                                                        <div id="card-description">${course.description ?? ''}</div>
                                                        <button id="card-toggle-btn" class="btn-low-style">⌄</button>
                                                    </div>
                                                    <button class="btn-low-style">...</button>
                                                    <div id="card-stats">
                                                        <div id="card-stats-chart" style="${courseStatusChartStyle}"></div>
                                                        <div id="card-stats-text">${courseStatusString}</div>
                                                    </div>
                                                    <div id="card-deadline">${courseDeadlineHtml}</div>
                                                </div>
                                                <div id="card-decks" class="hidden"></div>
                                             </div>`;

                const htm = this.ccm.helper.html(coursesHtml);

                for (const deck of course.cardDecks) {
                    const deckDeadlineHtml = deck.deadline ? `<a>Deadline: ${deck.deadline}</a>` : '';

                    const deckStatus = this.getDeckStatus(deck);
                    const deckStatusString = deckStatus.easy + ' / ' + deckStatus.medium + ' / ' + deckStatus.hard;
                    const deckStatusChartStyle = `
                                    width: 30px; height: 30px;
                                    background-image: radial-gradient(circle, white 57%, transparent 57%),
                                    conic-gradient( #2b6c22 0% ${deckStatus.easyPercent}%, 
                                                    #e0cd00 ${deckStatus.easyPercent}% ${deckStatus.easyPercent + deckStatus.mediumPercent}%, 
                                                    #b3261e ${deckStatus.easyPercent + deckStatus.mediumPercent}% 100%);
                                    border-radius: 50%;`;

                    const cardDecksHtml = `<div id="card">
                                                <div id="card-header">
                                                    <div id="card-content">
                                                        <div id="card-title">${deck.title}</div>
                                                        <div id="card-description">${deck.description ?? ''}</div>
                                                        <button class="start-deck-btn" data-deck-id="${deck.id}">Starten</button>
                                                    </div>
                                                    <button id="option-btn" class="btn-low-style">...</button>
                                                    <div id="deck-options" class="hidden options"> 
                                                        <a id="export-deck">Stapel exportieren</a>
                                                        <a id="delete-deck">Stapel löschen</a>
                                                    </div>
                                                    <div id="card-stats">
                                                        <div id="card-stats-chart" style="${deckStatusChartStyle}"></div>
                                                        <div id="card-stats-text">${deckStatusString}</div>
                                                    </div>
                                                        <div id="card-deadline">${deckDeadlineHtml}</div>
                                                </div>
                                             </div>`;

                    const ht = this.ccm.helper.html(cardDecksHtml);

                    ht.querySelector(".start-deck-btn").addEventListener('click', (event) => {
                        this.startDeck(deck.id);
                    });

                    ht.querySelector("#option-btn").addEventListener('click', (event) => {
                        //todo show options
                        const options = ht.querySelector("#deck-options");
                        options.classList.toggle('hidden');
                    });

                    ht.querySelector("#export-deck").addEventListener('click', (event) => {
                        //todo export deck
                    });

                    ht.querySelector("#delete-deck").addEventListener('click', (event) => {
                        //todo delete deck
                    });

                    htm.querySelector("#card-decks").append(ht);
                }

                const toggleCardButton = htm.querySelector('#card-toggle-btn');
                toggleCardButton.addEventListener('click', (event) => {
                    const decks = htm.querySelector('#card-decks');
                    decks.classList.toggle('hidden');
                    toggleCardButton.textContent = decks.classList.contains('hidden') ? '⌄' : '⌃';
                });
                listContainer.append(htm)
            }
        }

        const calculateStatus = (cards) => {
            let countEasy = cards.filter(card => card.status === 'easy').length;
            let countMedium = cards.filter(card => card.status === 'medium').length;
            let countHard = cards.filter(card => card.status === 'hard').length;

            const totalCards = countEasy + countMedium + countHard;
            const easyPercent = totalCards > 0 ? (countEasy / totalCards) * 100 : 0;
            const mediumPercent = totalCards > 0 ? (countMedium / totalCards) * 100 : 0;
            const hardPercent = totalCards > 0 ? (countHard / totalCards) * 100 : 0;

            return { easy: countEasy, medium: countMedium, hard: countHard, totalCards: totalCards, easyPercent: easyPercent, mediumPercent: mediumPercent, hardPercent: hardPercent,};
        };

        this.getCourseStatus = (course) => {
            const allCards = course.cardDecks.flatMap(deck => deck.cards);
            return calculateStatus(allCards);
        };

        this.getDeckStatus = (deck) => {
            return calculateStatus(deck.cards);
        };

        this.startDeck = (deck_id) => {
            console.log("Start deck with id: ", deck_id);
            this.element.innerHTML = '';
            //this.flash_cards.start();
            //this.element.append(this.flash_cards.root);
        }

    },

};
