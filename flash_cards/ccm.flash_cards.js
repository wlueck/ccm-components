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
            editor_deck: ["ccm.load", "./resources/editor_deck.html"],
            editor_course: ["ccm.load", "./resources/editor_course.html"],
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
                this.initListView(false);
            } else {
                dataset = dataset.value;
                this.initListView();
            }
        };

        this.initListView = (hasData = true) => {
            this.element.querySelector("#content").innerHTML = this.html.list;
            this.element.querySelector('.headline').innerHTML = "Karteikarten";
            this.element.querySelector('.sub-headline').innerHTML = "";

            this.initListViewButtons();

            if (hasData) {
                this.fillCourseList();
            }
        };

        this.initListViewButtons = () => {
            this.element.querySelector('#add-deck-button').addEventListener('click', () => {
                this.element.querySelector("#add-deck-options").classList.toggle('hidden');
            });

            this.element.querySelector('#create-deck').addEventListener('click', () => {
                this.initEditorDeckView();
            });

            this.element.querySelector('#import-deck').addEventListener('click', () => {
                this.element.querySelector("#add-deck-options").classList.toggle('hidden');

                if (document.querySelector('#course-select-dialog')) {
                    document.querySelector('#course-select-dialog').remove();
                }

                const courseSelectDialog = document.createElement('div');
                courseSelectDialog.id = 'course-select-dialog';
                courseSelectDialog.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 0 20px 20px 20px; border: 1px solid #ccc; border-radius: 5px; z-index: 1000;';
                courseSelectDialog.innerHTML = `
                    <h3>Stapel importieren</h3>
                    <label>Zugehöriger Kurs:</label><br>
                    <select id="course-select" style="margin: 10px 0; padding: 5px">
                        ${dataset.map(course => `<option value="${course.title}">${course.title}</option>`).join('')}
                    </select>
                    <div style="display: flex; gap: 10px; justify-content: flex-start; margin-top: 15px;">
                        <button id="confirm-import">Datei auswählen</button>
                        <button id="cancel-import">Abbrechen</button>
                    </div>
                `;

                document.body.appendChild(courseSelectDialog);

                document.querySelector('#cancel-import').addEventListener('click', () => {
                    courseSelectDialog.remove();
                });

                document.querySelector('#confirm-import').addEventListener('click', () => {
                    const selectedCourse = document.querySelector('#course-select').value;
                    courseSelectDialog.remove();

                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = async (event) => {
                        const file = event.target.files[0];
                        const reader = new FileReader();
                        reader.onload = async (e) => {
                            try {
                                const deck = JSON.parse(e.target.result);
                                if (!deck.title || !deck.cards || !Array.isArray(deck.cards)) {
                                    throw new Error('Invalid deck format');
                                }
                                const courseIndex = dataset.findIndex(c => c.title === selectedCourse);
                                if (dataset[courseIndex].cardDecks.some(d => d.title === deck.title)) {
                                    alert('Ein Stapel mit diesem Namen existiert bereits im ausgewählten Kurs');
                                    return;
                                }
                                dataset[courseIndex].cardDecks.push(deck);
                                await this.store.set({key: user.key, value: dataset});
                                this.initListView();
                            } catch (error) {
                                alert('Fehler beim Importieren: Ungültiges Dateiformat');
                            }
                        };
                        reader.readAsText(file);
                    };
                    input.click();
                });
            });

            this.element.querySelector('#create-course').addEventListener('click', () => {
                this.initEditorCourseView();
            });

            this.element.querySelector('#import-course').addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = async (event) => {
                    const file = event.target.files[0];
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        try {
                            const course = JSON.parse(e.target.result);
                            if (!course.title || !course.cardDecks || !Array.isArray(course.cardDecks)) {
                                throw new Error('Invalid course format');
                            }
                            if (dataset.some(c => c.title === course.title)) {
                                alert('A course with this name already exists');
                                return;
                            }
                            dataset.push(course);
                            await this.store.set({key: user.key, value: dataset});
                            this.initListView();
                        } catch (error) {
                            alert('Error importing course: Invalid file format');
                        }
                    };
                    reader.readAsText(file);
                };
                input.click();
            });

            // sort courses
            this.element.querySelector('#sort-courses-button').addEventListener('click', async () => {
                const sortDecksContainer = this.element.querySelector("#sort-courses");
                sortDecksContainer.classList.toggle("hidden");
            });

            this.element.querySelector('#sort-courses-title').addEventListener('click', async () => {
                dataset.sortPreference = 'title';
                dataset.sort((a, b) => a.title.localeCompare(b.title));
                await this.store.set({ key: user.key, value: dataset });
                this.initListView();
            });

            this.element.querySelector('#sort-courses-deadline').addEventListener('click', async () => {
                dataset.sortPreference = 'deadline';
                dataset.sort((a, b) => {
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return a.deadline.localeCompare(b.deadline);
                });
                await this.store.set({ key: user.key, value: dataset });
                this.initListView();
            });

            this.element.querySelector('#sort-courses-cardCount').addEventListener('click', async () => {
                dataset.sortPreference = 'cardCount';
                dataset.sort((a, b) => this.getCourseStatus(a).totalCards - this.getCourseStatus(b).totalCards);
                await this.store.set({ key: user.key, value: dataset });
                this.initListView();
            });

            this.element.querySelector('#sort-courses-status').addEventListener('click', async () => {
                dataset.sortPreference = 'status';
                dataset.sort((a, b) => {
                    const statusA = this.getCourseStatus(a);
                    const statusB = this.getCourseStatus(b);
                    return statusB.easyPercent - statusA.easyPercent ||
                        statusB.mediumPercent - statusA.mediumPercent ||
                        statusA.hardPercent - statusB.hardPercent;
                });
                await this.store.set({ key: user.key, value: dataset });
                this.initListView();
            });
        };

        this.initEditorDeckView = (deckToEdit) => {
            this.element.querySelector("#content").innerHTML = this.html.editor_deck;
            this.element.querySelector('.headline').innerHTML = deckToEdit? "Karteikartenstapel bearbeiten" : "Karteikartenstapel erstellen";
            this.element.querySelector('.sub-headline').innerHTML = "";

            this.element.querySelector("#back-button").addEventListener("click", (event) => {
                this.initListView();
            });

            this.element.querySelector("#add_card").addEventListener("click", (event) => {
                event.preventDefault();
                addCard();
            });

            const form = this.element.querySelector("#add-card-deck-form");
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

            if (deckToEdit) {
                const courseSelect = this.element.querySelector("#course");
                const selectedCourse = dataset.find(course => course.cardDecks.some(deck => deck.title === deckToEdit.title));

                if (selectedCourse) {
                    courseSelect.value = selectedCourse.title;
                }

                form.name.value = deckToEdit.title;
                form.description.value = deckToEdit.description || '';

                if (deckToEdit.deadline) {
                    const deadlineCheckbox = this.element.querySelector('#deadline');
                    const deadlineInput = this.element.querySelector('#deadlineInput');

                    deadlineCheckbox.checked = true;
                    deadlineInput.classList.remove('hidden');

                    const [day, month, year] = deckToEdit.deadline.split('.');
                    const dateObj = new Date(year, month-1, day);
                    deadlineInput.value = dateObj.toISOString().split('T')[0];
                }

                this.element.querySelector("#question").value = deckToEdit.cards[0].question;
                this.element.querySelector("#answer").value = deckToEdit.cards[0].answer;
                deckToEdit.cards.shift();

                //todo mit addcard
                deckToEdit.cards.forEach(card => {
                    const htmlCardString = `
                        <div id="card">
                            <div class="input-group">
                                <label for="question">Frage:</label>
                                <textarea id="question" name="question" cols="34" rows="5">${card.question}</textarea>
                            </div>
                            <div class="input-group">
                                <label for="answer">Antwort:</label>
                                <textarea id="answer" name="answer" cols="34" rows="5">${card.answer}</textarea>
                            </div>
                            <button id="delete-card-button">Karte löschen</button>
                        </div>`;
                    const htmlCard = this.ccm.helper.html(htmlCardString);
                    htmlCard.querySelector("#delete-card-button").addEventListener("click", (event) => {
                        htmlCard.remove();
                    });
                    this.element.querySelector("#cards").append(htmlCard);
                });
            }

            const addCourseBtn = this.element.querySelector("#add-course-btn");
            const addCourseContainer = this.element.querySelector("#add-course-container");
            addCourseBtn.addEventListener("click", async (event) => {
                event.preventDefault();
                if (addCourseContainer.classList.contains("hidden")) {
                    addCourseContainer.classList.remove("hidden");
                } else {
                    addCourseContainer.classList.add("hidden");
                }
            });

            const deadlineCheckboxCourse = this.element.querySelector('#courseDeadline');
            const deadlineTextFieldContainerCourse = this.element.querySelector('#courseDeadlineInput');

            deadlineCheckboxCourse.addEventListener('change', function (event) {
                if (event.currentTarget.checked) {
                    deadlineTextFieldContainerCourse.classList.remove('hidden');
                } else {
                    deadlineTextFieldContainerCourse.classList.add('hidden');
                }
            });

            const submitCourseBtn = this.element.querySelector("#submit-course");
            submitCourseBtn.addEventListener("click", async (event) => {
                event.preventDefault();
                if (!this.element.querySelector("#add-course-input").value) {
                    alert("Bitte füllen Sie alle erforderlichen Felder aus!");
                    return;
                }

                const deadlineInput = this.element.querySelector("#courseDeadlineInput").value;
                const courseDeadline = this.element.querySelector("#courseDeadline");
                let formattedDate = '';
                if (courseDeadline.checked && deadlineInput) {
                    formattedDate = new Intl.DateTimeFormat('de-DE').format(new Date(deadlineInput));
                }

                let newCourse = {
                    title: this.element.querySelector("#add-course-input").value,
                    description: this.element.querySelector("#courseDescripitionInput").value,
                    deadline: formattedDate,
                    cardDecks: []
                };

                const existingCourse = dataset.find(course => course.title === newCourse.title);
                if (existingCourse) {
                    alert("Ein Kurs mit diesem Namen existiert bereits! Bitte wählen Sie einen anderen Namen.");
                    return;
                }
                dataset.push(newCourse);
                await this.store.set({key: user.key, value: dataset});

                // close the add course container and reset the input fields
                addCourseContainer.classList.add("hidden");
                this.element.querySelector("#add-course-input").value = "";
                this.element.querySelector("#courseDescripitionInput").value = "";
                this.element.querySelector("#courseDeadlineInput").value = "";
                this.element.querySelector("#courseDeadline").checked = false;
                this.element.querySelector("#courseDeadlineInput").classList.add("hidden");

                // update the course select options
                const courseSelect = this.element.querySelector("#course");
                const newOption = document.createElement("option");
                newOption.value = newCourse.title;
                newOption.textContent = newCourse.title;
                courseSelect.append(newOption);
            });

            const submitButton = this.element.querySelector("#submit-deck");
            submitButton.innerHTML = deckToEdit? "Ändern" : "Erstellen";
            submitButton.addEventListener("click", async (event) => {
                const form = this.element.querySelector("#add-card-deck-form");
                if (!form.checkValidity()) {
                    event.preventDefault();
                    alert('Bitte fülle alle erforderlichen Felder aus.');
                    return;
                }
                event.preventDefault();
                if (deckToEdit) await updateDeck(form, deckToEdit);
                else await saveDeck(form);
            });

            const saveDeck = async (form) => {
                const course = form.course.value;

                let formattedDate = '';
                if (form.deadline.checked) {
                    const deadlineInput = form.deadlineInput.value;
                    if (deadlineInput) {
                        const dateObj = new Date(deadlineInput);
                        formattedDate = dateObj.toLocaleDateString('de-DE');
                    }
                }

                let newDeck = {
                    id: this.ccm.helper.generateKey(),
                    title: form.name.value,
                    description: form.description.value,
                    deadline: formattedDate,
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
                    const courseIndex = dataset.findIndex(coursel => coursel.title === course);
                    dataset[courseIndex].cardDecks.push(newDeck);
                    await this.store.set({key: user.key, value: dataset});
                    this.initListView();
                }
            }

            const updateDeck = async (form, deckToEdit) => {
                const course = form.course.value;

                let formattedDate = '';
                if (form.deadline.checked) {
                    const deadlineInput = form.deadlineInput.value;
                    if (deadlineInput) {
                        const dateObj = new Date(deadlineInput);
                        formattedDate = dateObj.toLocaleDateString('de-DE');
                    }
                }

                let updatedDeck = {
                    id: deckToEdit.id,
                    title: form.name.value,
                    description: form.description.value,
                    deadline: formattedDate,
                    cards: []
                };

                if (deckToEdit.title !== updatedDeck.title) {
                    const decks = dataset.filter(deck => deck.title === course)[0];
                    if (decks && decks.cardDecks.filter(deck => deck.title === updatedDeck.title).length > 0) {
                        alert("Ein Stapel mit dem Namen existiert bereits! Wählen Sie Bitte einen anderen Namen.");
                        return;
                    }
                }

                const cards = this.element.querySelectorAll("#card");
                let valid = true;
                cards.forEach(card => {
                    let question = card.querySelector("#question").value;
                    let answer = card.querySelector("#answer").value;

                    if (question !== "" && answer !== "") {
                        updatedDeck.cards.push({question: question, answer: answer, status: "hard"});
                    } else if (question !== "" && answer === "" || question === "" && answer !== "") {
                        alert("Bitte füllen Sie alle Felder aus!");
                        valid = false;
                    }
                });

                if (valid) {
                    const oldCourseIndex = dataset.findIndex(coursel => coursel.cardDecks.some(deck => deck.id === deckToEdit.id));
                    if (oldCourseIndex !== -1) {
                        dataset[oldCourseIndex].cardDecks = dataset[oldCourseIndex].cardDecks.filter(deck => deck.id !== deckToEdit.id);
                    }

                    const newCourseIndex = dataset.findIndex(coursel => coursel.title === course);
                    if (newCourseIndex !== -1) {
                        const deckIndex = dataset[newCourseIndex].cardDecks.findIndex(deck => deck.id === deckToEdit.id);
                        if (deckIndex !== -1) {
                            dataset[newCourseIndex].cardDecks[deckIndex] = updatedDeck;
                        } else {
                            dataset[newCourseIndex].cardDecks.push(updatedDeck);
                        }
                    }

                    await this.store.set({ key: user.key, value: dataset });
                    this.initListView();
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

        this.initEditorCourseView = (courseToEdit) => {
            this.element.querySelector("#content").innerHTML = this.html.editor_course;
            this.element.querySelector('.headline').innerHTML = courseToEdit ? "Lehrveranstaltung bearbeiten" : "Lehrveranstaltung erstellen";
            this.element.querySelector('.sub-headline').innerHTML = "";

            this.element.querySelector("#back-button").addEventListener("click", (event) => {
                this.initListView();
            });

            const form = this.element.querySelector("#add-course-form");
            const deadlineCheckbox = this.element.querySelector('#deadline');
            const deadlineInput = this.element.querySelector('#deadlineInput');

            if (courseToEdit) {
                form.name.value = courseToEdit.title;
                form.description.value = courseToEdit.description || '';

                if (courseToEdit.deadline) {
                    deadlineCheckbox.checked = true;
                    deadlineInput.classList.remove('hidden');

                    const [day, month, year] = courseToEdit.deadline.split('.');
                    const dateObj = new Date(`${year}-${month}-${day}`);
                    deadlineInput.value = dateObj.toISOString().split('T')[0];
                }
            }

            deadlineCheckbox.addEventListener('change', function (event) {
                if (event.currentTarget.checked) {
                    deadlineInput.classList.remove('hidden');
                } else {
                    deadlineInput.classList.add('hidden');
                }
            });

            const submitButton = this.element.querySelector("#submit-course");
            submitButton.innerHTML = courseToEdit ? "Ändern" : " Erstellen";
            submitButton.addEventListener("click", async (event) => {
                const form = this.element.querySelector("#add-course-form");
                if (!form.checkValidity()) {
                    event.preventDefault();
                    alert('Bitte fülle alle erforderlichen Felder aus.');
                    return;
                }
                event.preventDefault();
                if (courseToEdit) await this.updateCourse(form, courseToEdit);
                else await this.addCourse(form);
            });
        }

        this.fillCourseList = () => {
            const listContainer = this.element.querySelector('#list-of-courses');

            // Sortierpräferenz anwenden
            if (dataset.sortPreference) {
                switch (dataset.sortPreference) {
                    case 'title':
                        dataset.sort((a, b) => a.title.localeCompare(b.title));
                        break;
                    case 'deadline':
                        dataset.sort((a, b) => {
                            if (!a.deadline) return 1;
                            if (!b.deadline) return -1;
                            return a.deadline.localeCompare(b.deadline);
                        });
                        break;
                    case 'cardCount':
                        dataset.sort((a, b) => this.getCourseStatus(a).totalCards - this.getCourseStatus(b).totalCards);
                        break;
                    case 'status':
                        dataset.sort((a, b) => {
                            const statusA = this.getCourseStatus(a);
                            const statusB = this.getCourseStatus(b);
                            return statusB.easyPercent - statusA.easyPercent ||
                                statusB.mediumPercent - statusA.mediumPercent ||
                                statusA.hardPercent - statusB.hardPercent;
                        });
                        break;
                }
            }

            for (const course of dataset) {
                const isDeadlineExpired = course.deadline && new Date(course.deadline.split('.').reverse().join('-')) < new Date();
                const courseDeadlineHtml = course.deadline
                    ? `<a style="color: ${isDeadlineExpired ? 'red' : 'inherit'};">Deadline: ${course.deadline}</a>`
                    : '';

                const courseStatus = this.getCourseStatus(course);
                const courseStatusString = courseStatus.easy + ' / ' + courseStatus.medium + ' / ' + courseStatus.hard;
                const courseStatusChartStyle = `
                    width: 30px; height: 30px;
                    background-image: radial-gradient(circle, white 57%, transparent 57%),
                    conic-gradient(#b3261e 0% ${courseStatus.hardPercent}%,
                                   #e0cd00 ${courseStatus.hardPercent}% ${courseStatus.hardPercent + courseStatus.mediumPercent}%, 
                                   #2b6c22 ${courseStatus.hardPercent + courseStatus.mediumPercent}% 100%);
                    border-radius: 50%;`;

                const courseHtmlString = `<div id="card">
                    <div id="card-header">
                        <div id="card-content">
                            <div id="card-title">${course.title}</div>
                            <div id="card-description">${course.description ?? ''}</div>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <button id="card-toggle-btn" class="btn-low-style">⌄</button>
                                <button id="start-course-btn">Gesamten Kurs lernen</button>
                                <div id="card-options">
                                    <button id="course-option-btn" class="btn-low-style">...</button>
                                    <div id="course-options" class="hidden options">
                                        <a id="sort-decks">Sortieren</a>
                                        <div id="sort-deck-options" class="hidden options">
                                            <a id="sort-deck-title">Nach Titel</a>
                                            <a id="sort-deck-deadline">Nach Deadline</a>
                                            <a id="sort-deck-cardCount">Nach Anzahl der Karten</a>
                                        </div>
                                        <a id="edit-course">Bearbeiten</a>
                                        <a id="export-course">Exportieren</a>
                                        <a id="delete-course">Löschen</a>
                                    </div>
                                </div>
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
                    const isDeckDeadlineExpired = deck.deadline && new Date(deck.deadline.split('.').reverse().join('-')) < new Date();
                    const deckDeadlineHtml = deck.deadline
                        ? `<a style="color: ${isDeckDeadlineExpired ? 'red' : 'inherit'};">Deadline: ${deck.deadline}</a>`
                        : '';

                    const deckStatus = this.getDeckStatus(deck);
                    const deckStatusString = deckStatus.easy + ' / ' + deckStatus.medium + ' / ' + deckStatus.hard;
                    const deckStatusChartStyle = `
                        width: 30px; height: 30px;
                        background-image: radial-gradient(circle, white 57%, transparent 57%),
                        conic-gradient(#b3261e 0% ${deckStatus.hardPercent}%,
                                       #e0cd00 ${deckStatus.hardPercent}% ${deckStatus.hardPercent + deckStatus.mediumPercent}%, 
                                       #2b6c22 ${deckStatus.hardPercent + deckStatus.mediumPercent}% 100%);
                        border-radius: 50%;`;

                    const cardDecksHtmlString = `<div id="card">
                        <div id="card-header">
                            <div id="card-content">
                                <div id="card-title">${deck.title}</div>
                                <div id="card-description">${deck.description ?? ''}</div>
                                <div style="display: flex">
                                    <button class="start-deck-btn" data-deck-id="${deck.id}">Starten</button>
                                    <div id="card-options">
                                        <button id="option-btn" class="btn-low-style">...</button>
                                        <div id="deck-options" class="hidden options"> 
                                            <a id="edit-deck">Bearbeiten</a>
                                            <a id="export-deck">Exportieren</a>
                                            <a id="delete-deck">Löschen</a>
                                        </div>
                                    </div>
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
                        this.initEditorDeckView(deck);
                    });

                    cardDeckHtml.querySelector("#export-deck").addEventListener('click', (event) => {
                        const deckToExport = {
                            id: deck.id,
                            title: deck.title,
                            description: deck.description,
                            deadline: deck.deadline,
                            cards: deck.cards
                        };

                        const blob = new Blob([JSON.stringify(deckToExport, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${deck.title.replace(/\s+/g, '_')}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    });

                    cardDeckHtml.querySelector("#delete-deck").addEventListener('click', (event) => {
                        const courseTitle = course.title;
                        const deckTitle = deck.title;

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

                courseHtml.querySelector("#start-course-btn").addEventListener('click', (event) => {
                    // todo start course
                    this.startCourse(course.title);
                });

                courseHtml.querySelector("#course-option-btn").addEventListener('click', (event) => {
                    const options = courseHtml.querySelector("#course-options");
                    options.classList.toggle('hidden');
                });

                courseHtml.querySelector("#sort-decks").addEventListener('click', async () => {
                    courseHtml.querySelector("#sort-deck-options").classList.toggle("hidden");
                });

                courseHtml.querySelector("#sort-deck-title").addEventListener('click', async () => {
                    course.sortPreference = 'title';
                    course.cardDecks.sort((a, b) => a.title.localeCompare(b.title));
                    await this.store.set({ key: user.key, value: dataset });
                    this.initListView();
                });

                courseHtml.querySelector("#sort-deck-deadline").addEventListener('click', async () => {
                    course.sortPreference = 'deadline';
                    course.cardDecks.sort((a, b) => {
                        if (!a.deadline) return 1;
                        if (!b.deadline) return -1;
                        return a.deadline.localeCompare(b.deadline);
                    });
                    await this.store.set({ key: user.key, value: dataset });
                    this.initListView();
                });

                courseHtml.querySelector("#sort-deck-cardCount").addEventListener('click', async () => {
                    course.sortPreference = 'cardCount';
                    course.cardDecks.sort((a, b) => this.getDeckStatus(a).totalCards - this.getDeckStatus(b).totalCards);
                    await this.store.set({ key: user.key, value: dataset });
                    this.initListView();
                });

                courseHtml.querySelector("#edit-course").addEventListener('click', (event) => {
                    this.initEditorCourseView(course);
                });

                courseHtml.querySelector("#export-course").addEventListener('click', (event) => {
                    const courseToExport = {
                        title: course.title,
                        description: course.description,
                        deadline: course.deadline,
                        cardDecks: course.cardDecks
                    };

                    const blob = new Blob([JSON.stringify(courseToExport, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${course.title.replace(/\s+/g, '_')}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                });

                courseHtml.querySelector("#delete-course").addEventListener('click', (event) => {
                    const courseTitle = course.title;

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

            this.initListView();
        };

        this.deleteCourse = async (courseTitle) => {
            dataset = dataset.filter(course => course.title !== courseTitle);
            await this.store.set({ key: user.key, value: dataset });

            this.initListView();
        };

        this.addCourse = async (form) => {
            let formattedDate = '';
            if (form.deadline.checked) {
                const deadlineInput = form.deadlineInput.value;

                if (deadlineInput) {
                    formattedDate = new Intl.DateTimeFormat('de-DE').format(new Date(deadlineInput));
                }
            }

            let newCourse = {
                title: form.name.value,
                description: form.description.value,
                deadline: formattedDate,
                cardDecks: []
            };

            const existingCourse = dataset.find(course => course.title === newCourse.title);
            if (existingCourse) {
                alert("Ein Kurs mit diesem Namen existiert bereits! Bitte wählen Sie einen anderen Namen.");
                return;
            }
            dataset.push(newCourse);
            await this.store.set({key: user.key, value: dataset});
            this.initListView();
        }

        this.updateCourse = async (form, courseToEdit) => {
            let formattedDate = '';
            if (form.deadline.checked) {
                const deadlineInput = form.deadlineInput.value;

                if (deadlineInput) {
                    formattedDate = new Intl.DateTimeFormat('de-DE').format(new Date(deadlineInput));
                }
            }

            const updatedCourse = {
                title: form.name.value,
                description: form.description.value,
                deadline: formattedDate,
                cardDecks: courseToEdit.cardDecks || []
            };

            if (courseToEdit.title !== updatedCourse.title) {
                const existingCourse = dataset.find(course => course.title === updatedCourse.title);
                if (existingCourse) {
                    alert("Ein Kurs mit diesem Namen existiert bereits! Bitte wählen Sie einen anderen Namen.");
                    return;
                }
            }

            const courseIndex = dataset.findIndex(course => course.title === courseToEdit.title);
            dataset[courseIndex] = updatedCourse;
            await this.store.set({key: user.key, value: dataset});
            this.initListView();
        }

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

        this.startDeck = (courseTitle, deckId) => {
            this.element.querySelector("#content").innerHTML = this.html.card;

            const currentCourse = dataset.find(course => course.title === courseTitle);
            const currentCardDeck = currentCourse.cardDecks.find(deck => deck.id === deckId);

            this.element.querySelector(".headline").innerHTML = currentCardDeck.title;
            this.element.querySelector(".sub-headline").innerHTML = `(${currentCourse.title})`;
            this.element.querySelector('#description').innerHTML = currentCardDeck.description || '';
            this.element.querySelector('#max_number_cards').innerHTML = currentCardDeck.cards.length.toString();

            this.element.querySelector("#back-button").addEventListener("click", () => {
                this.initListView();
            });

            this.loadCardDeck(currentCourse, currentCardDeck);
        };

        this.startCourse = (courseTitle) => {
            this.element.querySelector("#content").innerHTML = this.html.card;

            const currentCourse = dataset.find(course => course.title === courseTitle);
            const allCards = currentCourse.cardDecks.flatMap(deck => deck.cards.map(card => ({
                card,
                deckTitle: deck.title
            })));

            if (allCards.length === 0) {
                alert("Dieser Kurs enthält keine Karten!");
                this.initListView();
                return;
            }

            this.element.querySelector(".headline").innerHTML = currentCourse.title;
            this.element.querySelector(".sub-headline").innerHTML = "Gesamter Kurs";
            this.element.querySelector('#description').innerHTML = currentCourse.description || '';
            this.element.querySelector('#max_number_cards').innerHTML = allCards.length.toString();

            this.element.querySelector("#back-button").addEventListener("click", () => {
                this.initListView();
            });

            this.loadCardDeck(currentCourse, { cards: allCards, title: currentCourse.title });
        };

        this.loadCardDeck = (course, cardDeck) => {
            const cards = cardDeck.cards.map(card => card.card ? card : { card, deckTitle: cardDeck.title });

            const updateCardDisplay = (index) => {
                if (index < 0 || index >= cards.length) return;

                const currentCard = cards[index].card;
                const deckTitle = cards[index].deckTitle;

                // Update navigation buttons
                this.element.querySelector('#previous_card_button').classList.toggle("unseen", index === 0);
                this.element.querySelector('#next_card_button').classList.toggle("unseen", index === cards.length - 1);
                this.element.querySelector('#current_card_number').innerHTML = (index + 1).toString();

                // Show question initially
                this.element.querySelector('#question_answer_text').innerHTML = currentCard.question;
                this.element.querySelector('#difficulty_buttons').classList.remove('answerStyle');
                this.element.querySelector('#difficulty_buttons').classList.add('questionStyle');

                const difficultyButtons = {
                    easy: this.element.querySelector('#easy'),
                    medium: this.element.querySelector('#medium'),
                    hard: this.element.querySelector('#hard')
                };
                // Reset selected-difficulty class for all difficulty buttons
                for (const btn of Object.values(difficultyButtons)) {
                    btn.classList.remove("selected-difficulty");
                }

                // Set up turn around button
                this.element.querySelector('#turn_around_button').onclick = () => {
                    if (this.element.querySelector('#question_answer_text').innerHTML === currentCard.question) {
                        this.element.querySelector('#question_answer_text').innerHTML = currentCard.answer;
                        this.element.querySelector('#difficulty_buttons').classList.remove('questionStyle');
                        this.element.querySelector('#difficulty_buttons').classList.add('answerStyle');
                    } else {
                        this.element.querySelector('#question_answer_text').innerHTML = currentCard.question;
                        this.element.querySelector('#difficulty_buttons').classList.remove('answerStyle');
                        this.element.querySelector('#difficulty_buttons').classList.add('questionStyle');
                    }
                };

                // Set up navigation buttons
                this.element.querySelector('#next_card_button').onclick = () => updateCardDisplay(index + 1);
                this.element.querySelector('#previous_card_button').onclick = () => updateCardDisplay(index - 1);

                for (const [difficulty, button] of Object.entries(difficultyButtons)) {
                    button.onclick = async () => {
                        // Reset selected-difficulty class for all difficulty buttons
                        for (const btn of Object.values(difficultyButtons)) {
                            btn.classList.remove("selected-difficulty");
                        }
                        button.classList.add("selected-difficulty");

                        const courseIndex = dataset.findIndex(c => c.title === course.title);
                        const deckIndex = cardDeck.title === course.title ? -1 :
                            dataset[courseIndex].cardDecks.findIndex(d => d.title === deckTitle);

                        if (deckIndex === -1) {
                            // Kursmodus: Finde das richtige Deck
                            const cardIndex = cards.findIndex(c => c.card === currentCard);
                            cards[cardIndex].card.status = difficulty;
                        } else {
                            const cardIndex = dataset[courseIndex].cardDecks[deckIndex].cards.findIndex(c =>
                                c.question === currentCard.question && c.answer === currentCard.answer);
                                dataset[courseIndex].cardDecks[deckIndex].cards[cardIndex].status = difficulty;
                        }

                        await this.store.set({ key: user.key, value: dataset });
                    };
                }
            };

            if (cards.length > 0) {
                updateCardDisplay(0);
            } else {
                this.element.querySelector('#question_answer_text').innerHTML = "Keine Karten vorhanden";
                this.element.querySelector('#difficulty_buttons').classList.add('hidden');
                this.element.querySelector('#turn_around_button').classList.add('hidden');
            }
        };
    },
};
