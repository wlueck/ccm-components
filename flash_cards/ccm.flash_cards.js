/**
 * @overview ccm component for flash cards
 * @author Wiete Lück <wiete.lueck@gmail.com>, 2025
 * @license The MIT License (MIT)
 */

ccm.files["ccm.flash_cards.js"] = {
    name: "flash-cards",
    //ccm: "https://ccmjs.github.io/ccm/ccm.js",
    ccm: "../libs/ccm-master/ccm.js",
    config: {
        store: ["ccm.store", {url: "https://ccm2.inf.h-brs.de", name: "wlueck2s_mycollection"}],

        css: ["ccm.load", "./resources/styles.css"],
        html: {
            main: ["ccm.load", "./resources/main.html"],
            list: ["ccm.load", "./resources/list.html"],
            editor: ["ccm.load", "./resources/editor.html"],
            card: ["ccm.load", "./resources/card.html"],
        },

        user: ["ccm.start", "../libs/fb02user/ccm.fb02user.js"],
    },

    Instance: function () {
        let user, dataset;

        this.start = async () => {

            this.element.innerHTML = this.html.main;

            // user initialization
            this.element.querySelector('#user').append(this.user.root);
            user = await this.user.getValue();
            if (!user) {
                alert("Please login");
                console.log("User is not logged in");
                return;
            }

            dataset = await this.store.get(user.key);
            if (!dataset) {
                console.log("No dataset found");
                this.initListTemplate(false);
            } else {
                dataset = dataset.value;
                this.initListTemplate();
            }
        };

        this.initListTemplate = (hasData = true) => {
            this.element.querySelector("#content").innerHTML = this.html.list;
            this.element.querySelector('.headline').innerHTML = "Karteikarten";
            this.element.querySelector('.sub-headline').innerHTML = "";

            this.initListButtons();

            if (hasData) {
                this.fillCourseList();
            }
        }

        this.initListButtons = () => {
            this.element.querySelector('#add-deck-button').addEventListener('click', async () => {
                this.element.querySelector("#add-deck-options").classList.toggle('hidden');
                this.element.querySelector('#create-deck').addEventListener('click', async () => {
                    this.initEditorTemplate();
                });

                this.element.querySelector('#import-deck').addEventListener('click', async () => {
                    // todo import deck
                });
            });

            this.element.querySelector('#sort-decks-button').addEventListener('click', async () => {
                const sortDecksContainer = this.element.querySelector("#sort-decks");
                sortDecksContainer.classList.toggle("hidden");
                // todo sort
            });
        }

        this.initEditorTemplate = () => {
            this.element.querySelector("#content").innerHTML = this.html.editor;
            this.element.querySelector('.headline').innerHTML = "Karteikartenstapel erstellen";
            this.element.querySelector('.sub-headline').innerHTML = "";

            this.element.querySelector("#back-button").addEventListener("click", (event) => {
               this.initListTemplate();
            });

            this.element.querySelector("#add_card").addEventListener("click", (event) => {
                event.preventDefault();
                addCard();
            });

            const checkbox = this.element.querySelector('#deadline');
            const textFieldContainer = this.element.querySelector('#deadlineInput');

            checkbox.addEventListener('change', function (event) {
                if (event.currentTarget.checked) {
                    textFieldContainer.classList.remove('hidden');
                } else {
                    textFieldContainer.classList.add('hidden');
                }
            });

            const courseSelect = this.element.querySelector("#course");

            dataset.forEach(course => {
                const option = document.createElement("option");
                option.value = course.title;
                option.textContent = course.title;
                courseSelect.append(option);
            });

            const addCourseBtn = this.element.querySelector("#add-course-btn");
            const addCourseContainer = this.element.querySelector("#add-course-container");
            addCourseBtn.addEventListener("click", async (event) => {
                event.preventDefault();
                addCourseContainer.classList.remove("hidden");
            });

            const submitCourseBtn = this.element.querySelector("#submit-course");
            submitCourseBtn.addEventListener("click", async (event) => {
                event.preventDefault();
                let courseInput = this.element.querySelector("#add-course-input");

                if (courseInput.value === "") {
                    alert("Bitte geben Sie einen Kursnamen ein");
                    return;
                } else if (Array.from(courseSelect.options).filter(option => option.value === courseInput.value).length > 0) {
                    alert("Bitte geben Sie einen neuen Kursnamen ein!");
                    return;
                }
                const option = document.createElement("option");
                option.value = courseInput.value;
                option.textContent = courseInput.value;
                courseSelect.append(option);

                courseInput.value = "";
                addCourseContainer.classList.add("hidden");
            });


            const submitButton = this.element.querySelector("#submit-deck");
            submitButton.addEventListener("click", async (event) => {
                await saveDeck(event);
            });

            const saveDeck = async (event) => {
                const form = this.element.querySelector("#add-card-deck-form");
                if (!form.checkValidity()) {
                    event.preventDefault();
                    alert('Bitte fülle alle erforderlichen Felder aus.');
                    return;
                }
                event.preventDefault();

                const course = form.course.value;

                let newDeck = {
                    id: "",
                    title: form.name.value,
                    description: form.description.value,
                    deadline: form.deadlineInput.value,
                    cards: []
                };

                const decks = dataset.filter(deck => deck.title === course)[0];
                if (decks && decks.cardDecks.filter(deck => deck.title === newDeck.title).length > 0) {
                    alert("Ein Stapel mit dem Namen existiert bereits! Wählen Sie Bitte einen anderen Namen.");
                    return;
                }

                const cards = this.element.querySelectorAll("#card");
                let valid = true;
                cards.forEach(card => {
                    let question = card.querySelector("#question").value;
                    let answer = card.querySelector("#answer").value;

                    if (question !== "" && answer !== "") {
                        newDeck.cards.push({question: question, answer: answer, status: "hard"});
                    } else if (question !== "" && answer === "" || question === "" && answer !== "") {
                        alert("Bitte füllen Sie alle Felder aus!");
                        valid = false;
                    }

                });

                if (valid) {
                    const isNewCourse = dataset.filter(coursel => coursel.title === course).length === 0;
                    if (isNewCourse) {
                        this.store.set({key: user.key, value: [...dataset, {title: course, cardDecks: [newDeck]}]});
                    } else {
                        const courseIndex = dataset.findIndex(coursel => coursel.title === course);
                        dataset[courseIndex].cardDecks.push(newDeck);
                        await this.store.set({ key: user.key, value: dataset });
                    }
                    this.initListTemplate();
                }
            }

            const addCard = () => {
                const htmlCardString = `
                    <div id="card">
                        <div class="input-group">
                            <label for="question">Frage:</label>
                            <textarea id="question" name="question" cols="34" rows="5"></textarea>
                        </div>
                        <div class="input-group">
                            <label for="answer">Antwort:</label>
                            <textarea id="answer" name="answer" cols="34" rows="5"></textarea>
                        </div>
                        <button id="delete-card-button">Karte löschen</button>
                    </div>`;
                const htmlCard = this.ccm.helper.html(htmlCardString);
                htmlCard.querySelector("#delete-card-button").addEventListener("click", (event) => {
                    htmlCard.remove();
                });
                this.element.querySelector("#cards").append(htmlCard);
            }
        }

        this.fillCourseList = () => {
            const listContainer = this.element.querySelector('#list-of-card-decks');

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

                const courseHtmlString = `<div id="card">
                                                    <div id="card-header">
                                                        <div id="card-content">
                                                            <div id="card-title">${course.title}</div>
                                                            <div id="card-description">${course.description ?? ''}</div>
                                                            <button id="card-toggle-btn" class="btn-low-style">⌄</button>
                                                        </div>
                                                        <div id="card-options">
                                                            <button id="course-option-btn" class="btn-low-style">...</button>
                                                            <div id="course-options" class="hidden options">
                                                                <a id="edit-course">Lehrveranstaltung bearbeiten</a>
                                                                <a id="export-course">Lehrveranstaltung exportieren</a>
                                                                <a id="delete-course">Lehrveranstaltung löschen</a>
                                                            </div>
                                                        </div>
                                                        <div id="card-stats">
                                                            <div id="card-stats-chart" style="${courseStatusChartStyle}"></div>
                                                            <div id="card-stats-text">${courseStatusString}</div>
                                                        </div>
                                                        <div id="card-deadline">${courseDeadlineHtml}</div>
                                                    </div>
                                                    <div id="card-decks" class="hidden"></div>
                                                  </div>`;

                const courseHtml = this.ccm.helper.html(courseHtmlString);

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

                    const cardDecksHtmlString = `<div id="card">
                                                            <div id="card-header">
                                                                <div id="card-content">
                                                                    <div id="card-title">${deck.title}</div>
                                                                    <div id="card-description">${deck.description ?? ''}</div>
                                                                    <button class="start-deck-btn" data-deck-id="${deck.id}">Starten</button>
                                                                </div>
                                                                <div id="card-options">
                                                                    <button id="option-btn" class="btn-low-style">...</button>
                                                                    <div id="deck-options" class="hidden options"> 
                                                                        <a id="edit-deck">Stapel bearbeiten</a>
                                                                        <a id="export-deck">Stapel exportieren</a>
                                                                        <a id="delete-deck">Stapel löschen</a>
                                                                    </div>
                                                                </div>
                                                                <div id="card-stats">
                                                                    <div id="card-stats-chart" style="${deckStatusChartStyle}"></div>
                                                                    <div id="card-stats-text">${deckStatusString}</div>
                                                                </div>
                                                                    <div id="card-deadline">${deckDeadlineHtml}</div>
                                                            </div>
                                                        </div>`;

                    const cardDeckHtml = this.ccm.helper.html(cardDecksHtmlString);

                    cardDeckHtml.querySelector(".start-deck-btn").addEventListener('click', (event) => {
                        this.startDeck(course.title, deck.id);
                    });

                    cardDeckHtml.querySelector("#option-btn").addEventListener('click', (event) => {
                        const options = cardDeckHtml.querySelector("#deck-options");
                        options.classList.toggle('hidden');
                    });

                    cardDeckHtml.querySelector("#edit-deck").addEventListener('click', (event) => {
                        //todo edit deck
                    });

                    cardDeckHtml.querySelector("#export-deck").addEventListener('click', (event) => {
                        //todo export deck
                    });

                    cardDeckHtml.querySelector("#delete-deck").addEventListener('click', (event) => {
                        const courseTitle = course.title; // Titel des aktuellen Kurses
                        const deckTitle = deck.title; // Titel des zu löschenden Decks

                        const confirmDelete = confirm(`Möchtest du das Deck "${deckTitle}" wirklich löschen?`);
                        if (confirmDelete) {
                            this.deleteDeck(courseTitle, deckTitle);
                        }
                    });

                    courseHtml.querySelector("#card-decks").append(cardDeckHtml);
                }

                const toggleCardButton = courseHtml.querySelector('#card-toggle-btn');
                toggleCardButton.addEventListener('click', (event) => {
                    const decks = courseHtml.querySelector('#card-decks');
                    decks.classList.toggle('hidden');
                    toggleCardButton.textContent = decks.classList.contains('hidden') ? '⌄' : '⌃';
                });

                courseHtml.querySelector("#course-option-btn").addEventListener('click', (event) => {
                    const options = courseHtml.querySelector("#course-options");
                    options.classList.toggle('hidden');
                });

                courseHtml.querySelector("#edit-course").addEventListener('click', (event) => {
                    //todo edit deck
                });

                courseHtml.querySelector("#export-course").addEventListener('click', (event) => {
                    //todo export deck
                });

                courseHtml.querySelector("#delete-course").addEventListener('click', (event) => {
                    const courseTitle = course.title; // Titel des aktuellen Kurses

                    const confirmDelete = confirm(`Möchtest du die Lehrveranstaltung "${courseTitle}" wirklich löschen?`);
                    if (confirmDelete) {
                        this.deleteCourse(courseTitle);
                    }
                });

                listContainer.append(courseHtml)
            }
        }

        this.deleteDeck = async (courseTitle, deckTitle) => {
            const course = dataset.find(course => course.title === courseTitle);
            if (!course) {
                console.error("Lehrveranstaltung nicht gefunden");
                return;
            }

            course.cardDecks = course.cardDecks.filter(deck => deck.title !== deckTitle);

            await this.store.set({ key: user.key, value: dataset });

            this.initListTemplate();
        };

        this.deleteCourse = async (courseTitle) => {
            dataset = dataset.filter(course => course.title !== courseTitle);
            await this.store.set({ key: user.key, value: dataset });

            this.initListTemplate();
        };

        const calculateStatus = (cards) => {
            let countEasy = cards.filter(card => card.status === 'easy').length;
            let countMedium = cards.filter(card => card.status === 'medium').length;
            let countHard = cards.filter(card => card.status === 'hard').length;

            const totalCards = countEasy + countMedium + countHard;
            const easyPercent = totalCards > 0 ? (countEasy / totalCards) * 100 : 0;
            const mediumPercent = totalCards > 0 ? (countMedium / totalCards) * 100 : 0;
            const hardPercent = totalCards > 0 ? (countHard / totalCards) * 100 : 0;

            return {
                easy: countEasy,
                medium: countMedium,
                hard: countHard,
                totalCards: totalCards,
                easyPercent: easyPercent,
                mediumPercent: mediumPercent,
                hardPercent: hardPercent,
            };
        };

        this.getCourseStatus = (course) => {
            const allCards = course.cardDecks.flatMap(deck => deck.cards);
            return calculateStatus(allCards);
        };

        this.getDeckStatus = (deck) => {
            return calculateStatus(deck.cards);
        };

        this.startDeck = (courseTitle, deck_id) => {
            this.element.querySelector("#content").innerHTML = this.html.card;

            const currentCourse = dataset.filter(course => course.title === courseTitle)[0];
            console.log(currentCourse)
            const currentCardDeck = dataset.filter(course => course.title === courseTitle)[0].cardDecks.filter(deck => deck.id === deck_id)[0];
            console.log(currentCardDeck)

            this.element.querySelector(".headline").innerHTML = currentCardDeck.title;
            this.element.querySelector(".sub-headline").innerHTML = "(" + currentCourse.title + ")";
            this.element.querySelector('#description').innerHTML = currentCardDeck.description;
            this.element.querySelector('#max_number_cards').innerHTML = currentCardDeck.cards.length.toString();

            this.element.querySelector("#back-button").addEventListener("click", (event) => {
                this.initListTemplate();
            });

            const initShowQuestionButton = (currentCard) => {
                this.element.querySelector('#question_answer_text').innerHTML = currentCard.question;
                this.element.querySelector('#turn_around_button').onclick = function () {
                    initShowAnswerButton(currentCard)
                };
                this.element.querySelector('#difficulty_buttons').classList.remove('answerStyle');
                this.element.querySelector('#difficulty_buttons').classList.add('questionStyle');
            }

            const initShowAnswerButton = (currentCard) => {
                this.element.querySelector('#question_answer_text').innerHTML = currentCard.answer;
                this.element.querySelector('#turn_around_button').onclick = function () {
                    initShowQuestionButton(currentCard)
                };
                this.element.querySelector('#difficulty_buttons').classList.remove('questionStyle');
                this.element.querySelector('#difficulty_buttons').classList.add('answerStyle');
            }

            const loadCard = (cardDeck, cardIndex) => {
                if (cardIndex === 0) {
                    this.element.querySelector('#previous_card_button').classList.add("unseen");
                } else {
                    this.element.querySelector('#previous_card_button').classList.remove("unseen");
                }

                if (cardIndex === cardDeck.cards.length-1) {
                    this.element.querySelector('#next_card_button').classList.add("unseen");
                }else {
                    this.element.querySelector('#next_card_button').classList.remove("unseen");
                }

                const currentCard = cardDeck.cards[cardIndex];
                this.element.querySelector('#current_card_number').innerHTML = (cardIndex+ 1).toString()
                this.element.querySelector('#question_answer_text').innerHTML = currentCard.question;

                this.element.querySelector('#difficulty_buttons').classList.remove('answerStyle');
                this.element.querySelector('#difficulty_buttons').classList.add('questionStyle');

                this.element.querySelector('#turn_around_button').onclick = function () {
                    initShowAnswerButton(currentCard)
                };
                this.element.querySelector('#next_card_button').onclick = function () {
                    loadCard(cardDeck, cardIndex + 1)
                };
                this.element.querySelector('#previous_card_button').onclick = function () {
                    loadCard(cardDeck, cardIndex - 1)
                };

                let easyButton = this.element.querySelector('#easy');
                let mediumButton = this.element.querySelector('#middle');
                let hardButton = this.element.querySelector('#hard');

                easyButton.onclick = async () => {
                    easyButton.classList.add("selected-difficulty");
                    mediumButton.classList.remove("selected-difficulty");
                    hardButton.classList.remove("selected-difficulty");

                    const courseIndex = dataset.findIndex(course => course.title === courseTitle);
                    const deckIndex = dataset[courseIndex].cardDecks.findIndex(deck => deck.id === deck_id);

                    dataset[courseIndex].cardDecks[deckIndex].cards[cardIndex].status = "easy";
                    await this.store.set({ key: user.key, value: dataset });
                };

                mediumButton.onclick = async () => {
                    mediumButton.classList.add("selected-difficulty");
                    easyButton.classList.remove("selected-difficulty");
                    hardButton.classList.remove("selected-difficulty");

                    const courseIndex = dataset.findIndex(course => course.title === courseTitle);
                    const deckIndex = dataset[courseIndex].cardDecks.findIndex(deck => deck.id === deck_id);

                    dataset[courseIndex].cardDecks[deckIndex].cards[cardIndex].status = "medium";
                    await this.store.set({ key: user.key, value: dataset });

                };

                hardButton.onclick = async () => {
                    hardButton.classList.add("selected-difficulty");
                    mediumButton.classList.remove("selected-difficulty");
                    easyButton.classList.remove("selected-difficulty");

                    const courseIndex = dataset.findIndex(course => course.title === courseTitle);
                    const deckIndex = dataset[courseIndex].cardDecks.findIndex(deck => deck.id === deck_id);

                    dataset[courseIndex].cardDecks[deckIndex].cards[cardIndex].status = "hard";
                    await this.store.set({ key: user.key, value: dataset });

                };
            };

            const loadCardDeck = (course, cardDeck) => {
                loadCard(cardDeck, 0);
            };

            loadCardDeck(currentCourse, currentCardDeck);
        }

    },

};
