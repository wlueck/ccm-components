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
            this.element.querySelector('#headline').innerHTML = "Karteikarten";
            this.element.querySelector('#sub-headline').innerHTML = "";

            this.initListViewButtons();

            if (hasData) {
                this.fillCourseList();
            }
        };

        this.initListViewButtons = () => {
            this.element.querySelector('#add-deck-course-button').addEventListener('click', () => {
                this.element.querySelector("#add-deck-course-options").classList.toggle('hidden');
            });

            this.element.querySelector('#create-deck').addEventListener('click', () => {
                this.initEditorDeckView();
            });

            this.element.querySelector('#import-deck').addEventListener('click', () => {
                this.element.querySelector("#add-deck-course-options").classList.toggle('hidden');

                if (this.element.querySelector('#course-select-dialog')) {
                    this.element.querySelector('#course-select-dialog').remove();
                }

                const overlay = document.createElement('div');
                overlay.className = 'overlay';
                this.element.querySelector("#main").appendChild(overlay);

                const courseSelectDialog = `
                    <div id="course-select-dialog" class="modal-dialog">
                        <h3>Stapel importieren</h3>
                        <label>Zugehöriger Kurs:</label><br>
                        <select id="course-select" style="margin: 10px 0; padding: 5px">
                            ${dataset.map(course => `<option value="${course.id}">${course.title}</option>`).join('')}
                        </select>
                        <div style="display: flex; gap: 10px; justify-content: flex-start; margin-top: 15px;">
                            <button id="confirm-import">Datei auswählen</button>
                            <button id="cancel-import">Abbrechen</button>
                        </div>
                    </div>
                `;

                const courseSelectDialogElement = this.ccm.helper.html(courseSelectDialog);
                this.element.querySelector("#main").appendChild(courseSelectDialogElement);

                this.element.querySelector('#cancel-import').addEventListener('click', () => {
                    courseSelectDialogElement.remove();
                    overlay.remove();
                });

                this.element.querySelector('#confirm-import').addEventListener('click', () => {
                    const selectedCourseId = this.element.querySelector('#course-select').value;
                    courseSelectDialogElement.remove();
                    overlay.remove();

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
                                    alert('Ungültiges Dateiformat: Titel oder Karten fehlen');
                                    return;
                                }
                                deck.id = deck.id || this.ccm.helper.generateKey();
                                deck.cards.forEach(card => {
                                    card.id = card.id || this.ccm.helper.generateKey();
                                    card.status = card.status || "hard";
                                });
                                const courseIndex = dataset.findIndex(c => c.id === selectedCourseId);
                                if (courseIndex === -1) {
                                    alert('Kurs nicht gefunden');
                                    return;
                                }
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
                                alert('Ungültiges Dateiformat: Titel oder Karten fehlen');
                                return;
                            }
                            course.id = course.id || this.ccm.helper.generateKey();
                            course.cardDecks.forEach(deck => {
                                deck.id = deck.id || this.ccm.helper.generateKey();
                                deck.cards.forEach(card => {
                                    card.id = card.id || this.ccm.helper.generateKey();
                                    card.status = card.status || "hard";
                                });
                            });
                            if (dataset.some(c => c.title === course.title)) {
                                alert('Ein Kurs mit diesem Namen existiert bereits');
                                return;
                            }
                            dataset.push(course);
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

            // sort courses
            this.element.querySelector('#sort-courses-button').addEventListener('click', async () => {
                const sortDecksContainer = this.element.querySelector("#sort-courses-options");
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
            this.element.querySelector('#headline').innerHTML = deckToEdit ? "Karteikartenstapel bearbeiten" : "Karteikartenstapel erstellen";
            this.element.querySelector('#sub-headline').innerHTML = "";

            this.element.querySelector("#back-button").addEventListener("click", () => {
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
                option.value = course.id;
                option.textContent = course.title;
                courseSelect.append(option);
            });

            if (deckToEdit) {
                const courseSelect = this.element.querySelector("#course");
                const selectedCourse = dataset.find(course => course.cardDecks.some(deck => deck.id === deckToEdit.id));

                if (selectedCourse) {
                    courseSelect.value = selectedCourse.id;
                }

                form.name.value = deckToEdit.title;
                form.description.value = deckToEdit.description || '';

                if (deckToEdit.deadline) {
                    const deadlineCheckbox = this.element.querySelector('#deadline');
                    const deadlineInput = this.element.querySelector('#deadlineInput');

                    deadlineCheckbox.checked = true;
                    deadlineInput.classList.remove('hidden');

                    const [day, month, year] = deckToEdit.deadline.split('.');
                    deadlineInput.value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }

                if (deckToEdit.cards.length > 0) {
                    this.element.querySelector("#question").value = deckToEdit.cards[0].question;
                    this.element.querySelector("#answer").value = deckToEdit.cards[0].answer;
                }

                deckToEdit.cards.slice(1).forEach(card => {
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
                            <input type="hidden" name="card-id" value="${card.id}">
                        </div>`;
                    const htmlCard = this.ccm.helper.html(htmlCardString);
                    htmlCard.querySelector("#delete-card-button").addEventListener("click", () => {
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
                    const [year, month, day] = deadlineInput.split('-');
                    formattedDate = `${day}.${month}.${year}`;
                }

                let newCourse = {
                    id: this.ccm.helper.generateKey(),
                    title: this.element.querySelector("#add-course-input").value,
                    description: this.element.querySelector("#courseDescriptionInput").value,
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
                this.element.querySelector("#courseDescriptionInput").value = "";
                this.element.querySelector("#courseDeadlineInput").value = "";
                this.element.querySelector("#courseDeadline").checked = false;
                this.element.querySelector("#courseDeadlineInput").classList.add("hidden");

                // update the course select options
                const courseSelect = this.element.querySelector("#course");
                const newOption = document.createElement("option");
                newOption.value = newCourse.id;
                newOption.textContent = newCourse.title;
                courseSelect.append(newOption);
            });

            const submitButton = this.element.querySelector("#submit-deck");
            submitButton.innerHTML = deckToEdit ? "Ändern" : "Erstellen";
            submitButton.addEventListener("click", async (event) => {
                const form = this.element.querySelector("#add-card-deck-form");
                if (!form.checkValidity()) {
                    event.preventDefault();
                    alert('Bitte fülle alle erforderlichen Felder aus.');
                    return;
                }
                event.preventDefault();
                if (deckToEdit) await this.updateDeck(form, deckToEdit);
                else await this.saveDeck(form);
            });

            this.saveDeck = async (form) => {
                const courseId = form.course.value;

                let formattedDate = '';
                if (form.deadline.checked && form.deadlineInput.value) {
                    const [year, month, day] = form.deadlineInput.value.split('-');
                    formattedDate = `${day}.${month}.${year}`;
                }

                let newDeck = {
                    id: this.ccm.helper.generateKey(),
                    title: form.name.value,
                    description: form.description.value,
                    deadline: formattedDate,
                    cards: []
                };

                const courseIndex = dataset.findIndex(course => course.id === courseId);
                if (courseIndex === -1) {
                    alert("Kurs nicht gefunden");
                    return;
                }
                if (dataset[courseIndex].cardDecks.some(deck => deck.title === newDeck.title)) {
                    alert("Ein Stapel mit dem Namen existiert bereits! Wählen Sie einen anderen Namen.");
                    return;
                }

                const cards = this.element.querySelectorAll("#card");
                let valid = true;
                cards.forEach(card => {
                    let question = card.querySelector("#question").value;
                    let answer = card.querySelector("#answer").value;

                    if (question !== "" && answer !== "") {
                        newDeck.cards.push({
                            id: this.ccm.helper.generateKey(),
                            question: question,
                            answer: answer,
                            status: "hard"
                        });
                    } else if (question !== "" || answer !== "") {
                        alert("Bitte füllen Sie beide Felder (Frage und Antwort) aus!");
                        valid = false;
                    }
                });

                if (valid) {
                    dataset[courseIndex].cardDecks.push(newDeck);
                    await this.store.set({key: user.key, value: dataset});
                    this.initListView();
                }
            };

            this.updateDeck = async (form, deckToEdit) => {
                const courseId = form.course.value;

                let formattedDate = '';
                if (form.deadline.checked && form.deadlineInput.value) {
                    const [year, month, day] = form.deadlineInput.value.split('-');
                    formattedDate = `${day}.${month}.${year}`;
                }

                let updatedDeck = {
                    id: deckToEdit.id,
                    title: form.name.value,
                    description: form.description.value,
                    deadline: formattedDate,
                    cards: []
                };

                const courseIndex = dataset.findIndex(course => course.id === courseId);
                if (courseIndex === -1) {
                    alert("Kurs nicht gefunden");
                    return;
                }
                if (deckToEdit.title !== updatedDeck.title && dataset[courseIndex].cardDecks.some(deck => deck.title === updatedDeck.title)) {
                    alert("Ein Stapel mit dem Namen existiert bereits! Wählen Sie einen anderen Namen.");
                    return;
                }

                const cards = this.element.querySelectorAll("#card");
                let valid = true;
                cards.forEach(card => {
                    let question = card.querySelector("#question").value;
                    let answer = card.querySelector("#answer").value;
                    let cardId = card.querySelector("input[name='card-id']")?.value || this.ccm.helper.generateKey();

                    if (question !== "" && answer !== "") {
                        updatedDeck.cards.push({
                            id: cardId,
                            question: question,
                            answer: answer,
                            status: deckToEdit.cards.find(c => c.id === cardId)?.status || "hard"
                        });
                    } else if (question !== "" || answer !== "") {
                        alert("Bitte füllen Sie beide Felder (Frage und Antwort) aus!");
                        valid = false;
                    }
                });

                if (valid) {
                    const oldCourseIndex = dataset.findIndex(coursel => coursel.cardDecks.some(deck => deck.id === deckToEdit.id));
                    if (oldCourseIndex !== -1) {
                        dataset[oldCourseIndex].cardDecks = dataset[oldCourseIndex].cardDecks.filter(deck => deck.id !== deckToEdit.id);
                    }

                    if (courseIndex !== -1) {
                        dataset[courseIndex].cardDecks.push(updatedDeck);
                    } else {
                        console.error("Neuer Kurs nicht gefunden");
                        return;
                    }

                    await this.store.set({ key: user.key, value: dataset });
                    this.initListView();
                }
            };

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
                htmlCard.querySelector("#delete-card-button").addEventListener("click", () => {
                    htmlCard.remove();
                });
                this.element.querySelector("#cards").append(htmlCard);
            };
        };

        this.initEditorCourseView = (courseToEdit) => {
            this.element.querySelector("#content").innerHTML = this.html.editor_course;
            this.element.querySelector('#headline').innerHTML = courseToEdit ? "Lehrveranstaltung bearbeiten" : "Lehrveranstaltung erstellen";
            this.element.querySelector('#sub-headline').innerHTML = "";

            this.element.querySelector("#back-button").addEventListener("click", () => {
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
                    deadlineInput.value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
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
        };

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
                const isDeadlineExpired = course.deadline && (() => {
                    const [day, month, year] = course.deadline.split('.');
                    return new Date(year, month - 1, day) < new Date();
                })();
                const courseDeadlineHtml = course.deadline ?
                    `<a style="color: ${isDeadlineExpired ? 'red' : 'inherit'};">Deadline: <br> ${course.deadline}</a>`
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
                                            <a id="sort-deck-status">Nach Status</a>
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
                    const isDeckDeadlineExpired = deck.deadline && (() => {
                        const [day, month, year] = deck.deadline.split('.');
                        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)) < new Date();
                    })();
                    const deckDeadlineHtml = deck.deadline ?
                        `<a style="color: ${isDeckDeadlineExpired ? 'red' : 'inherit'};">Deadline: <br> ${deck.deadline}</a>`
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

                    cardDeckHtml.querySelector(".start-deck-btn").addEventListener('click', async () => {
                        await this.startDeck(course.id, deck.id);
                    });

                    cardDeckHtml.querySelector("#option-btn").addEventListener('click', () => {
                        const options = cardDeckHtml.querySelector("#deck-options");
                        options.classList.toggle('hidden');
                    });

                    cardDeckHtml.querySelector("#edit-deck").addEventListener('click', () => {
                        this.initEditorDeckView(deck);
                    });

                    cardDeckHtml.querySelector("#export-deck").addEventListener('click', () => {
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

                    cardDeckHtml.querySelector("#delete-deck").addEventListener('click', async () => {
                        const confirmDelete = confirm(`Möchtest du das Deck "${deck.title}" wirklich löschen?`);
                        if (confirmDelete) {
                            await this.deleteDeck(course.id, deck.id);
                        }
                    });

                    courseHtml.querySelector("#card-decks").append(cardDeckHtml);
                }

                const toggleCardButton = courseHtml.querySelector('#card-toggle-btn');
                toggleCardButton.addEventListener('click', () => {
                    const decks = courseHtml.querySelector('#card-decks');
                    decks.classList.toggle('hidden');
                    toggleCardButton.textContent = decks.classList.contains('hidden') ? '⌄' : '⌃';
                });

                courseHtml.querySelector("#start-course-btn").addEventListener('click', () => {
                    this.startCourse(course.id);
                });

                courseHtml.querySelector("#course-option-btn").addEventListener('click', () => {
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

                courseHtml.querySelector("#sort-deck-status").addEventListener('click', async () => {
                    course.sortPreference = 'status';
                    course.cardDecks.sort((a, b) => {
                        const statusA = this.getDeckStatus(a);
                        const statusB = this.getDeckStatus(b);
                        return statusB.easyPercent - statusA.easyPercent ||
                            statusB.mediumPercent - statusA.mediumPercent ||
                            statusA.hardPercent - statusB.hardPercent;
                    });
                    await this.store.set({ key: user.key, value: dataset });
                    this.initListView();
                });

                courseHtml.querySelector("#edit-course").addEventListener('click', () => {
                    this.initEditorCourseView(course);
                });

                courseHtml.querySelector("#export-course").addEventListener('click', () => {
                    const courseToExport = {
                        id: course.id,
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

                courseHtml.querySelector("#delete-course").addEventListener('click', async () => {
                    const confirmDelete = confirm(`Möchtest du die Lehrveranstaltung "${course.title}" wirklich löschen?`);
                    if (confirmDelete) {
                        await this.deleteCourse(course.id);
                    }
                });

                listContainer.append(courseHtml);
            }
        };

        this.deleteDeck = async (courseId, deckId) => {
            const course = dataset.find(course => course.id === courseId);
            if (!course) {
                console.error("Lehrveranstaltung nicht gefunden");
                return;
            }
            course.cardDecks = course.cardDecks.filter(deck => deck.id !== deckId);
            await this.store.set({ key: user.key, value: dataset });
            this.initListView();
        };

        this.deleteCourse = async (courseId) => {
            dataset = dataset.filter(course => course.id !== courseId);
            await this.store.set({ key: user.key, value: dataset });
            this.initListView();
        };

        this.addCourse = async (form) => {
            let formattedDate = '';
            if (form.deadline.checked && form.deadlineInput.value) {
                const [year, month, day] = form.deadlineInput.value.split('-');
                formattedDate = `${day}.${month}.${year}`;
            }

            let newCourse = {
                id: this.ccm.helper.generateKey(),
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
        };

        this.updateCourse = async (form, courseToEdit) => {
            let formattedDate = '';
            if (form.deadline.checked && form.deadlineInput.value) {
                const [year, month, day] = form.deadlineInput.value.split('-');
                formattedDate = `${day}.${month}.${year}`;
            }

            const updatedCourse = {
                id: courseToEdit.id,
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

            const courseIndex = dataset.findIndex(course => course.id === courseToEdit.id);
            if (courseIndex === -1) {
                console.error("Kurs nicht gefunden");
                return;
            }
            dataset[courseIndex] = updatedCourse;
            await this.store.set({key: user.key, value: dataset});
            this.initListView();
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

        this.startDeck = async (courseId, deckId) => {
            const currentCourse = dataset.find(course => course.id === courseId);
            if (!currentCourse) {
                console.error("Kurs nicht gefunden");
                return;
            }
            const currentCardDeck = currentCourse.cardDecks.find(deck => deck.id === deckId);
            if (!currentCardDeck) {
                console.error("Deck nicht gefunden");
                return;
            }

            const selectedDeck = await this.showLearningModeModal(currentCourse, currentCardDeck);
            if (selectedDeck) {
                this.element.querySelector("#content").innerHTML = this.html.card;

                this.element.querySelector("#headline").innerHTML = currentCardDeck.title;
                this.element.querySelector("#sub-headline").innerHTML = `(${currentCourse.title})`;
                this.element.querySelector('#description').innerHTML = currentCardDeck.description || '';
                this.element.querySelector('#max_number_cards').innerHTML = selectedDeck.cards.length.toString();

                this.element.querySelector("#back-button").addEventListener("click", () => {
                    this.initListView();
                });

                this.loadCardDeck(currentCourse, selectedDeck);
            }
        };

        this.showLearningModeModal = (course, deck) => {
            if (this.element.querySelector('#learning-mode-dialog')) {
                this.element.querySelector('#learning-mode-dialog').remove();
            }

            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            this.element.querySelector("#main").appendChild(overlay);

            const learningModeDialog = `
                <div id="learning-mode-dialog" class="modal-dialog">
                    <h3>Lernmodus wählen</h3>
                    <div>
                        <label>Karten sortieren nach:</label><br>
                        <select id="card-order" style="margin: 10px 0; padding: 5px; width: 200px;">
                            <option value="original">Originalreihenfolge</option>
                            <option value="random">Zufällig</option>
                            <option value="status">Schwierigkeitsgrad</option>
                        </select>
                    </div>
                    <div style="margin: 15px 0;">
                        <label>Karten auswählen:</label><br>
                        <select id="card-selection" style="margin: 10px 0; padding: 5px; width: 200px;">
                            <option value="all">Alle Karten</option>
                            <option value="hard">Nur schwere Karten</option>
                            <option value="medium-hard">Mittel und schwere Karten</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px;">
                        <button id="start-learning">Lernen beginnen</button>
                        <button id="cancel-learning">Abbrechen</button>
                    </div>
                </div>
            `;

            const learningModeDialogElement = this.ccm.helper.html(learningModeDialog);
            this.element.querySelector("#main").appendChild(learningModeDialogElement);

            return new Promise((resolve) => {
                this.element.querySelector('#cancel-learning').addEventListener('click', () => {
                    learningModeDialogElement.remove();
                    overlay.remove();
                    resolve(false);
                });

                this.element.querySelector('#start-learning').addEventListener('click', () => {
                    const orderMode = this.element.querySelector('#card-order').value;
                    const selectionMode = this.element.querySelector('#card-selection').value;

                    let filteredCards = [...deck.cards];

                    // Apply card selection filter
                    switch (selectionMode) {
                        case 'hard':
                            filteredCards = filteredCards.filter(card => card.status === 'hard');
                            break;
                        case 'medium-hard':
                            filteredCards = filteredCards.filter(card => card.status === 'hard' || card.status === 'medium');
                            break;
                    }

                    // Check if there are cards to learn
                    if (filteredCards.length === 0) {
                        alert("Keine Karten zum Lernen gefunden!");
                        learningModeDialogElement.remove();
                        overlay.remove();
                        resolve(false);
                        return;
                    }

                    // Apply ordering
                    switch (orderMode) {
                        case 'random':
                            filteredCards.sort(() => Math.random() - 0.5);
                            break;
                        case 'status':
                            filteredCards.sort((a, b) => {
                                const statusOrder = { hard: 0, medium: 1, easy: 2 };
                                return statusOrder[a.status] - statusOrder[b.status];
                            });
                            break;
                    }

                    const tempDeck = { ...deck, cards: filteredCards };
                    learningModeDialogElement.remove();
                    overlay.remove();
                    resolve(tempDeck);
                });
            });
        };

        this.startCourse = (courseId) => {
            this.element.querySelector("#content").innerHTML = this.html.card;

            const currentCourse = dataset.find(course => course.id === courseId);
            if (!currentCourse) {
                console.error("Kurs nicht gefunden");
                return;
            }
            const allCards = currentCourse.cardDecks.flatMap(deck => deck.cards.map(card => ({
                card,
                deckTitle: deck.title
            })));

            if (allCards.length === 0) {
                alert("Dieser Kurs enthält keine Karten!");
                this.initListView();
                return;
            }

            this.element.querySelector("#headline").innerHTML = currentCourse.title;
            this.element.querySelector("#sub-headline").innerHTML = "Gesamter Kurs";
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

                        const courseIndex = dataset.findIndex(c => c.id === course.id);
                        const deckIndex = cardDeck.title === course.title ? -1 :
                            dataset[courseIndex].cardDecks.findIndex(d => d.id === cardDeck.id);

                        if (deckIndex === -1) {
                            // Kursmodus: Finde das richtige Deck
                            const cardIndex = cards.findIndex(c => c.card.id === currentCard.id);
                            cards[cardIndex].card.status = difficulty;
                        } else {
                            const cardIndex = dataset[courseIndex].cardDecks[deckIndex].cards.findIndex(c => c.id === currentCard.id);
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