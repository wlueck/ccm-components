/**
 * @overview ccm component for flash cards
 * @author Wiete Lück <wiete.lueck@gmail.com>, 2025
 * @license The MIT License (MIT)
 */

ccm.files["ccm.flash_cards.js"] = {
    name: "flash-cards",
    ccm: "https://ccmjs.github.io/ccm/ccm.js",
    //ccm: "../libs/ccm-master/ccm.js",
    config: {
        "store": ["ccm.store", {url: "https://ccm2.inf.h-brs.de", name: "wlueck2s_mycollection"}],
        "css": ["ccm.load", "./resources/styles.css"],
        "html": {
            "main": ["ccm.load", "./resources/main.html"],
            "list": ["ccm.load", "./resources/list.html"],
            "editor_deck": ["ccm.load", "./resources/editor_deck.html"],
            "editor_course": ["ccm.load", "./resources/editor_course.html"],
            "card": ["ccm.load", "./resources/card.html"],
        },
        //"onchange": event => console.log( event ),

        //"user": ["ccm.start", "../libs/fb02user/ccm.fb02user.js"],
        "user": ["ccm.instance", "https://ccmjs.github.io/akless-components/user/ccm.user.js"]
        //"user": [ "ccm.instance", "https://ccmjs.github.io/akless-components/user/versions/ccm.user-9.7.1.js" ]
    },

    Instance: function () {
        let user, dataset;

        this.init = async () => {
            if (this.user) this.user.onchange = this.start;
        }

        this.start = async () => {
            this.element.innerHTML = this.html.main;

            if (this.user) {
                this.element.querySelector('#user').append(this.user.root);
                this.user.start();
            }

            user = await this.user.getValue();
            if (!user) {
                alert("Please log in to continue.");
                console.log("User is not logged in");
                return;
            }

            dataset = await this.store.get(user.key);
            if (!dataset) {
                console.log("No dataset found");
                await this.store.set({key: user.key, value: []});
                dataset = await this.store.get(user.key);
            }

            dataset = dataset.value;
            this.initListView();

            // close dropdowns when clicking outside
            this.element.addEventListener('click', (event) => {
                const dropdowns = this.element.querySelectorAll('.dropdown-menu, .options');
                dropdowns.forEach(dropdown => {
                    if (!dropdown.contains(event.target) && !dropdown.previousElementSibling.contains(event.target)) {
                        dropdown.classList.add('hidden');
                    }
                });
            });
        };

        this.initListView = () => {
            this.element.querySelector("#content").innerHTML = this.html.list;
            this.element.querySelector('#headline').innerHTML = "Karteikarten";
            this.element.querySelector('#sub-headline').innerHTML = "";

            // init add deck and course buttons
            this.element.querySelector('#add-deck-course-button').addEventListener('click', () => {
                this.element.querySelector("#add-deck-course-options").classList.toggle('hidden');
            });
            this.element.querySelector('#create-deck').addEventListener('click', () => {
                this.initEditorDeckView();
            });
            this.element.querySelector('#import-deck').addEventListener('click', () => {
                this.initImportDeckDialog();
            });
            this.element.querySelector('#create-course').addEventListener('click', () => {
                this.initEditorCourseView();
            });
            this.element.querySelector('#import-course').addEventListener('click', () => {
                this.initImportCourse();
            });

            if (dataset.courses.length === 0) {
                this.element.querySelector("#sort-courses-button").classList.add('hidden');
                this.element.querySelector("#list-of-courses").innerHTML = `
                    <div style="padding-left: 20px; margin-top: 10px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
                        <p style="margin-bottom: 15px;">Noch keine Lehrveranstaltungen und Karteikartenstapeltapel vorhanden.</p>
                        <p>Klicke auf <strong>Hinzufügen</strong>, um:</p>
                        <ul style="padding-left:10px; margin: 5px 0;">
                            <li>einen neuen Karteikartenstapel zu erstellen</li>
                            <li>einen bestehenden Stapel zu importieren</li>
                            <li>eine neue Lehrveranstaltung anzulegen</li>
                            <li>eine Lehrveranstaltung zu importieren</li>
                        </ul>
                    </div>`;
                return;
            }

            this.initSortCoursesButtons();
            this.fillCourseList();
        };

        this.initSortCoursesButtons = () => {
            this.element.querySelector('#sort-courses-button').addEventListener('click', async () => {
                this.element.querySelector("#sort-courses-options").classList.toggle("hidden");
            });

            this.element.querySelector('#sort-courses-title').addEventListener('click', async () => {
                dataset.sortPreference = 'title';
                dataset.courses.sort((a, b) => a.title.localeCompare(b.title));
                await this.store.set({key: user.key, value: dataset});
                this.initListView();
            });

            this.element.querySelector('#sort-courses-deadline').addEventListener('click', async () => {
                dataset.sortPreference = 'deadline';
                dataset.courses.sort((a, b) => {
                    const dateA = a.deadline ? new Date(a.deadline.split('.').reverse().join('-')) : null;
                    const dateB = b.deadline ? new Date(b.deadline.split('.').reverse().join('-')) : null;
                    if (!dateA) return 1;
                    if (!dateB) return -1;
                    return dateA - dateB;
                });
                await this.store.set({key: user.key, value: dataset});
                this.initListView();
            });

            this.element.querySelector('#sort-courses-cardCount').addEventListener('click', async () => {
                dataset.sortPreference = 'cardCount';
                dataset.courses.sort((a, b) => this.getCourseStatus(a).totalCards - this.getCourseStatus(b).totalCards);
                await this.store.set({key: user.key, value: dataset});
                this.initListView();
            });

            this.element.querySelector('#sort-courses-status').addEventListener('click', async () => {
                dataset.sortPreference = 'status';
                dataset.courses.sort((a, b) => {
                    const statusA = this.getCourseStatus(a);
                    const statusB = this.getCourseStatus(b);
                    return statusB.hardPercent - statusA.hardPercent ||
                        statusB.mediumPercent - statusA.mediumPercent ||
                        statusA.easyPercent - statusB.easyPercent;
                });
                await this.store.set({key: user.key, value: dataset});
                this.initListView();
            });

            this.element.querySelectorAll("#sort-courses-options a").forEach(sortOption => {
                let sortOptionCheck = sortOption.querySelector("span");
                if (sortOption.id === `sort-courses-${dataset.sortPreference}`) {
                    sortOptionCheck.classList.remove('hidden');
                } else {
                    sortOptionCheck.classList.add('hidden');
                }
            });
        }

        this.initEditorDeckView = (deckToEdit) => {
            this.element.querySelector("#content").innerHTML = this.html.editor_deck;
            this.element.querySelector('#headline').innerHTML = deckToEdit ? "Karteikartenstapel bearbeiten" : "Karteikartenstapel erstellen";
            this.element.querySelector('#sub-headline').innerHTML = "";

            this.element.querySelector("#back-button").addEventListener("click", () => {
                this.initListView();
            });

            const form = this.element.querySelector("#add-card-deck-form");

            const deadlineCheckboxDeck = this.element.querySelector('#deadline');
            const deadlineInputDeck = this.element.querySelector('#deadlineInput');
            deadlineCheckboxDeck.addEventListener('change', function (event) {
                if (event.currentTarget.checked) {
                    deadlineInputDeck.classList.remove('hidden');
                } else {
                    deadlineInputDeck.classList.add('hidden');
                }
            });

            const courseSelect = this.element.querySelector("#course");
            dataset.courses.forEach(course => {
                const option = document.createElement("option");
                option.value = course.id;
                option.textContent = course.title;
                courseSelect.append(option);
            });

            if (deckToEdit) {
                const selectedCourse = dataset.courses.find(course => course.cardDecks.some(deck => deck.id === deckToEdit.id));
                if (selectedCourse) {
                    courseSelect.value = selectedCourse.id;
                }

                form.name.value = deckToEdit.title;
                form.description.value = deckToEdit.description || '';

                if (deckToEdit.deadline) {
                    deadlineCheckboxDeck.checked = true;
                    deadlineInputDeck.classList.remove('hidden');

                    const [day, month, year] = deckToEdit.deadline.split('.');
                    deadlineInputDeck.value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }

                if (deckToEdit.cards.length > 0) {
                    this.element.querySelector("#card").setAttribute('data-card-id', deckToEdit.cards[0].id);
                    this.element.querySelector("#question").value = deckToEdit.cards[0].question;
                    this.element.querySelector("#answer").value = deckToEdit.cards[0].answer;
                }

                deckToEdit.cards.slice(1).forEach(card => {
                    addCard(card);
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
            const deadlineInputCourse = this.element.querySelector('#course-deadline-input');

            deadlineCheckboxCourse.addEventListener('change', function (event) {
                if (event.currentTarget.checked) {
                    deadlineInputCourse.classList.remove('hidden');
                } else {
                    deadlineInputCourse.classList.add('hidden');
                }
            });

            const submitCourseButton = this.element.querySelector("#submit-course");
            submitCourseButton.addEventListener("click", async (event) => {
                event.preventDefault();
                if (!this.element.querySelector("#add-course-input").value) {
                    alert("Bitte füllen Sie alle erforderlichen Felder aus!");
                    return;
                }

                const deadlineInput = this.element.querySelector("#course-deadline-input").value;
                const courseDeadline = this.element.querySelector("#courseDeadline");
                let formattedDate = '';
                if (courseDeadline.checked && deadlineInput) {
                    const [year, month, day] = deadlineInput.split('-');
                    formattedDate = `${day}.${month}.${year}`;
                }

                let newCourse = {
                    id: this.ccm.helper.generateKey(),
                    title: this.element.querySelector("#add-course-input").value,
                    description: this.element.querySelector("#course-description-input").value,
                    deadline: formattedDate,
                    cardDecks: []
                };

                const existingCourse = dataset.courses.find(course => course.title === newCourse.title);
                if (existingCourse) {
                    alert("Eine Lehrveranstaltung mit diesem Namen existiert bereits! Bitte wählen Sie einen anderen Namen.");
                    return;
                }
                dataset.courses.push(newCourse);
                await this.store.set({key: user.key, value: dataset});

                // close the add course container and reset the input fields
                addCourseContainer.classList.add("hidden");
                this.element.querySelector("#add-course-input").value = "";
                this.element.querySelector("#course-description-input").value = "";
                this.element.querySelector("#course-deadline-input").value = "";
                this.element.querySelector("#courseDeadline").checked = false;
                this.element.querySelector("#course-deadline-input").classList.add("hidden");

                // update the course select options
                const courseSelect = this.element.querySelector("#course");
                const newOption = document.createElement("option");
                newOption.value = newCourse.id;
                newOption.textContent = newCourse.title;
                courseSelect.append(newOption);
            });

            this.element.querySelector("#add-card").addEventListener("click", (event) => {
                event.preventDefault();
                addCard();
            });

            const submitDeckButton = this.element.querySelector("#submit-deck");
            submitDeckButton.innerHTML = deckToEdit ? "Ändern" : "Erstellen";
            submitDeckButton.addEventListener("click", async (event) => {
                const form = this.element.querySelector("#add-card-deck-form");
                if (!form.checkValidity()) {
                    event.preventDefault();
                    alert('Bitte fülle alle erforderlichen Felder aus.');
                    return;
                }
                event.preventDefault();
                await this.addOrUpdateDeck(form, deckToEdit);
                //this.onchange && this.onchange( { event: 'submitDeck', instance: this } );
            });

            const cancelButton = this.element.querySelector(".cancel");
            cancelButton.addEventListener("click", (event) => {
                event.preventDefault();
                const confirmCancel = confirm(`Möchten Sie die Änderungen wirklich verwerfen?`);
                if (confirmCancel) {
                    this.initListView();
                }
            });

            const saveHint = this.element.querySelector(".save-hint");
            deckToEdit ? saveHint.classList.add("hidden") : saveHint.classList.remove("hidden");

            this.addOrUpdateDeck = async (form, deckToEdit = null) => {
                const courseId = form.course.value;

                let formattedDate = '';
                if (form.deadline.checked && form.deadlineInput.value) {
                    const [year, month, day] = form.deadlineInput.value.split('-');
                    formattedDate = `${day}.${month}.${year}`;
                }

                let newDeck = {
                    id: deckToEdit?.id || this.ccm.helper.generateKey(),
                    title: form.name.value,
                    description: form.description.value,
                    deadline: formattedDate,
                    cards: []
                };

                const courseIndex = dataset.courses.findIndex(course => course.id === courseId);
                if (courseIndex === -1) {
                    alert("Lehrveranstaltung nicht gefunden");
                    return;
                }

                if (!deckToEdit || deckToEdit.title !== newDeck.title) {
                    if (dataset.courses[courseIndex].cardDecks.some(existingDeck => existingDeck.title === newDeck.title)) {
                        alert("Ein Stapel mit dem Namen existiert bereits! Wählen Sie einen anderen Namen.");
                        return;
                    }
                }

                const cards = this.element.querySelectorAll("#card");
                let valid = true;
                cards.forEach(card => {
                    let question = card.querySelector("#question").value;
                    let answer = card.querySelector("#answer").value;
                    let cardId = card.getAttribute("data-card-id") || this.ccm.helper.generateKey();

                    if (question !== "" && answer !== "") {
                        newDeck.cards.push({
                            id: cardId,
                            question: question,
                            answer: answer,
                            currentStatus: deckToEdit?.cards.find(c => c.id === cardId)?.currentStatus || "hard",
                            status: deckToEdit?.cards.find(c => c.id === cardId)?.status || []
                        });
                    } else if (question !== "" || answer !== "") {
                        alert("Bitte füllen Sie beide Felder (Frage und Antwort) aus!");
                        valid = false;
                    }
                });

                if (valid) {
                    if (deckToEdit) {
                        const oldCourseIndex = dataset.courses.findIndex(course => course.cardDecks.some(deck => deck.id === deckToEdit.id));
                        if (oldCourseIndex !== -1) {
                            dataset.courses[oldCourseIndex].cardDecks = dataset.courses[oldCourseIndex].cardDecks.filter(deck => deck.id !== deckToEdit.id);
                        }
                    }

                    dataset.courses[courseIndex].cardDecks.push(newDeck);
                    await this.store.set({key: user.key, value: dataset});
                    this.initListView();
                }
            };
        };

        this.initImportDeckDialog = () => {
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
                    <label>Zugehörige Lehrveranstaltung:</label><br>
                    <select id="course-select" style="margin: 10px 0; padding: 5px">
                        ${dataset.courses.map(course => `<option value="${course.id}">${course.title}</option>`).join('')}
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
                            const newDeck = JSON.parse(e.target.result);
                            if (!newDeck.title || !newDeck.cards || !Array.isArray(newDeck.cards)) {
                                alert('Ungültiges Dateiformat: Titel oder Karten fehlen');
                                return;
                            }
                            newDeck.id = newDeck.id || this.ccm.helper.generateKey();
                            newDeck.cards.forEach(card => {
                                card.id = card.id || this.ccm.helper.generateKey();
                                card.currentStatus = card.currentStatus || "hard";
                                card.status = card.status || [];
                            });
                            const courseIndex = dataset.courses.findIndex(course => course.id === selectedCourseId);
                            if (courseIndex === -1) {
                                alert('Lehrveranstaltung nicht gefunden');
                                return;
                            }
                            if (dataset.courses[courseIndex].cardDecks.some(deck => deck.title === newDeck.title)) {
                                alert('Ein Stapel mit diesem Namen existiert bereits in der ausgewählten Lehrveranstaltung');
                                return;
                            }
                            dataset.courses[courseIndex].cardDecks.push(newDeck);
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
                if (!form.checkValidity()) {
                    event.preventDefault();
                    alert('Bitte fülle alle erforderlichen Felder aus.');
                    return;
                }
                event.preventDefault();
                await this.addOrUpdateCourse(form, courseToEdit);
            });

            const cancelButton = this.element.querySelector(".cancel");
            cancelButton.addEventListener("click", (event) => {
                event.preventDefault();
                const confirmCancel = confirm(`Möchten Sie die Änderungen wirklich verwerfen?`);
                if (confirmCancel) {
                    this.initListView();
                }
            });

            const saveHint = this.element.querySelector(".save-hint");
            courseToEdit ? saveHint.classList.add("hidden") : saveHint.classList.remove("hidden");
        };

        this.initImportCourse = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (event) => {
                const file = event.target.files[0];
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const newCourse = JSON.parse(e.target.result);
                        if (!newCourse.title || !newCourse.cardDecks || !Array.isArray(newCourse.cardDecks)) {
                            alert('Ungültiges Dateiformat: Titel oder Karten fehlen');
                            return;
                        }
                        newCourse.id = newCourse.id || this.ccm.helper.generateKey();
                        newCourse.cardDecks.forEach(deck => {
                            deck.id = deck.id || this.ccm.helper.generateKey();
                            deck.cards.forEach(card => {
                                card.id = card.id || this.ccm.helper.generateKey();
                                card.currentStatus = card.currentStatus || "hard";
                                card.status = card.status || [];
                            });
                        });
                        if (dataset.courses.some(c => c.title === newCourse.title)) {
                            alert('Eine Lehrveranstaltung mit diesem Namen existiert bereits');
                            return;
                        }
                        dataset.courses.push(newCourse);
                        await this.store.set({key: user.key, value: dataset});
                        this.initListView();
                    } catch (error) {
                        alert('Fehler beim Importieren: Ungültiges Dateiformat');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        }

        this.fillCourseList = () => {
            const listContainer = this.element.querySelector('#list-of-courses');

            // apply sort preference
            if (dataset.sortPreference) {
                switch (dataset.sortPreference) {
                    case 'title':
                        dataset.courses.sort((a, b) => a.title.localeCompare(b.title));
                        break;
                    case 'deadline':
                        dataset.courses.sort((a, b) => {
                            const dateA = a.deadline ? new Date(a.deadline.split('.').reverse().join('-')) : null;
                            const dateB = b.deadline ? new Date(b.deadline.split('.').reverse().join('-')) : null;
                            if (!dateA) return 1;
                            if (!dateB) return -1;
                            return dateA - dateB;
                        });
                        break;
                    case 'cardCount':
                        dataset.courses.sort((a, b) => this.getCourseStatus(a).totalCards - this.getCourseStatus(b).totalCards);
                        break;
                    case 'status':
                        dataset.courses.sort((a, b) => {
                            const statusA = this.getCourseStatus(a);
                            const statusB = this.getCourseStatus(b);
                            return statusB.hardPercent - statusA.hardPercent ||
                                statusB.mediumPercent - statusA.mediumPercent ||
                                statusA.easyPercent - statusB.easyPercent;
                        });
                        break;
                }
            }

            for (const course of dataset.courses) {
                const isDeadlineExpired = course.deadline && (() => {
                    const [day, month, year] = course.deadline.split('.');
                    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)) < new Date();
                })();
                const courseDeadlineHtml = course.deadline ?
                    `<a style="color: ${isDeadlineExpired ? 'red' : 'inherit'};">Deadline: <br> ${course.deadline}</a>`
                    : '';

                const courseStatus = this.getCourseStatus(course);
                const courseStatusString = courseStatus.easyCount + ' / ' + courseStatus.mediumCount + ' / ' + courseStatus.hardCount;
                const courseStatusChartStyle = `
                    width: 30px; height: 30px;
                    background-image: radial-gradient(circle, white 57%, transparent 57%),
                                      conic-gradient(#b3261e 0% ${courseStatus.hardPercent}%,
                                                     #e0cd00 ${courseStatus.hardPercent}% ${courseStatus.hardPercent + courseStatus.mediumPercent}%, 
                                                     #2b6c22 ${courseStatus.hardPercent + courseStatus.mediumPercent}% 100%);
                    border-radius: 50%;`;

                const courseHtmlString = `
                    <div id="card">
                        <div id="card-header">
                            <div id="card-content">
                                <div id="card-title">${course.title}</div>
                                <div id="card-description">${course.description ?? ''}</div>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <button id="card-toggle-btn" class="btn-low-style">&#9660;</button>
                                    <button id="start-course-btn">Gesamte Lehrveranstaltung lernen</button>
                                    <div id="card-options">
                                        <button id="course-option-btn" class="btn-low-style">...</button>
                                        <div id="course-options" class="hidden options">
                                            <a id="sort-decks">Sortieren</a>
                                            <div id="sort-deck-options" class="hidden options">
                                                <a id="sort-deck-title">Nach Titel${course.sortPreference === 'title' ? ' <span>✔</span>' : ''}</a>
                                                <a id="sort-deck-deadline">Nach Deadline${course.sortPreference === 'deadline' ? ' <span>✔</span>' : ''}</a>
                                                <a id="sort-deck-cardCount">Nach Anzahl der Karten${course.sortPreference === 'cardCount' ? ' <span>✔</span>' : ''}</a>
                                                <a id="sort-deck-status">Nach Status${course.sortPreference === 'status' ? ' <span>✔</span>' : ''}</a>
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
                    const deckStatusString = deckStatus.easyCount + ' / ' + deckStatus.mediumCount + ' / ' + deckStatus.hardCount;
                    const deckStatusChartStyle = `
                        width: 30px; height: 30px;
                        background-image: radial-gradient(circle, white 57%, transparent 57%),
                                          conic-gradient(#b3261e 0% ${deckStatus.hardPercent}%,
                                                         #e0cd00 ${deckStatus.hardPercent}% ${deckStatus.hardPercent + deckStatus.mediumPercent}%, 
                                                         #2b6c22 ${deckStatus.hardPercent + deckStatus.mediumPercent}% 100%);
                        border-radius: 50%;`;

                    const cardDecksHtmlString = `
                        <div id="card">
                            <div id="card-header">
                                <div id="card-content">
                                    <div id="card-title">${deck.title}</div>
                                    <div id="card-description">${deck.description ?? ''}</div>
                                    <div style="display: flex">
                                        <button class="start-deck-btn" data-deck-id="${deck.id}">Starten</button>
                                        <div id="card-options">
                                            <button id="deck-option-btn" class="btn-low-style">...</button>
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

                    cardDeckHtml.querySelector("#deck-option-btn").addEventListener('click', () => {
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

                        const blob = new Blob([JSON.stringify(deckToExport, null, 2)], {type: 'application/json'});
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
                        const confirmDelete = confirm(`Möchten Sie das Deck "${deck.title}" wirklich löschen?`);
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
                    toggleCardButton.innerHTML = decks.classList.contains('hidden') ? '&#9660;' : '&#9650;';
                });

                courseHtml.querySelector("#start-course-btn").addEventListener('click', async () => {
                    await this.startCourse(course.id);
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
                    await this.store.set({key: user.key, value: dataset});
                    this.initListView();
                });

                courseHtml.querySelector("#sort-deck-deadline").addEventListener('click', async () => {
                    course.sortPreference = 'deadline';
                    course.cardDecks.sort((a, b) => {
                        const dateA = a.deadline ? new Date(a.deadline.split('.').reverse().join('-')) : null;
                        const dateB = b.deadline ? new Date(b.deadline.split('.').reverse().join('-')) : null;
                        if (!dateA) return 1;
                        if (!dateB) return -1;
                        return dateA - dateB;
                    });
                    await this.store.set({key: user.key, value: dataset});
                    this.initListView();
                });

                courseHtml.querySelector("#sort-deck-cardCount").addEventListener('click', async () => {
                    course.sortPreference = 'cardCount';
                    course.cardDecks.sort((a, b) => this.getDeckStatus(a).totalCards - this.getDeckStatus(b).totalCards);
                    await this.store.set({key: user.key, value: dataset});
                    this.initListView();
                });

                courseHtml.querySelector("#sort-deck-status").addEventListener('click', async () => {
                    course.sortPreference = 'status';
                    course.cardDecks.sort((a, b) => {
                        const statusA = this.getDeckStatus(a);
                        const statusB = this.getDeckStatus(b);
                        return statusB.hardPercent - statusA.hardPercent ||
                            statusB.mediumPercent - statusA.mediumPercent ||
                            statusA.easyPercent - statusB.easyPercent;
                    });
                    await this.store.set({key: user.key, value: dataset});
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

                    const blob = new Blob([JSON.stringify(courseToExport, null, 2)], {type: 'application/json'});
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
                    const confirmDelete = confirm(`Möchten Sie die Lehrveranstaltung "${course.title}" wirklich löschen?`);
                    if (confirmDelete) {
                        await this.deleteCourse(course.id);
                    }
                });

                listContainer.append(courseHtml);
            }
        };

        const addCard = (card = {}) => {
            const htmlCardString = `
                    <div id="card" data-card-id="${card?.id || ''}">
                        <div class="input-group">
                            <label for="question">Frage:</label>
                            <textarea id="question" name="question" cols="34" rows="5">${card?.question || ''}</textarea>
                        </div>
                        <div class="input-group">
                            <label for="answer">Antwort:</label>
                            <textarea id="answer" name="answer" cols="34" rows="5">${card?.answer || ''}</textarea>
                        </div>
                        <button id="delete-card-button">Karte löschen</button>
                    </div>`;
            const htmlCard = this.ccm.helper.html(htmlCardString);
            htmlCard.querySelector("#delete-card-button").addEventListener("click", () => {
                htmlCard.remove();
            });
            this.element.querySelector("#cards").append(htmlCard);
        };

        this.deleteDeck = async (courseId, deckId) => {
            const course = dataset.courses.find(course => course.id === courseId);
            if (!course) {
                console.error("Lehrveranstaltung nicht gefunden");
                return;
            }
            course.cardDecks = course.cardDecks.filter(deck => deck.id !== deckId);
            await this.store.set({key: user.key, value: dataset});
            this.initListView();
        };

        this.deleteCourse = async (courseId) => {
            dataset.courses = dataset.courses.filter(course => course.id !== courseId);
            await this.store.set({key: user.key, value: dataset});
            this.initListView();
        };

        this.addOrUpdateCourse = async (form, courseToEdit = null) => {
            let formattedDate = '';
            if (form.deadline.checked && form.deadlineInput.value) {
                const [year, month, day] = form.deadlineInput.value.split('-');
                formattedDate = `${day}.${month}.${year}`;
            }

            const course = {
                id: courseToEdit?.id || this.ccm.helper.generateKey(),
                title: form.name.value,
                description: form.description.value,
                deadline: formattedDate,
                cardDecks: courseToEdit?.cardDecks || []
            };

            if (!courseToEdit || courseToEdit.title !== course.title) {
                const existingCourse = dataset.courses?.find(c => c.title === course.title);
                if (existingCourse) {
                    alert("Eine Lehrveranstaltung mit diesem Namen existiert bereits! Bitte wählen Sie einen anderen Namen.");
                    return;
                }
            }

            if (courseToEdit) {
                const courseIndex = dataset.courses.findIndex(c => c.id === courseToEdit.id);
                if (courseIndex === -1) {
                    console.error("Lehrveranstaltung nicht gefunden");
                    return;
                }
                dataset.courses[courseIndex] = course;
            } else {
                dataset.courses.push(course);
            }

            await this.store.set({key: user.key, value: dataset});
            this.initListView();
        };

        const calculateStatus = (cards) => {
            let easyCount = cards.filter(card => card.currentStatus === 'easy').length;
            let mediumCount = cards.filter(card => card.currentStatus === 'medium').length;
            let hardCount = cards.filter(card => card.currentStatus === 'hard').length;

            const totalCards = easyCount + mediumCount + hardCount;

            const easyPercent = totalCards > 0 ? (easyCount / totalCards) * 100 : 0;
            const mediumPercent = totalCards > 0 ? (mediumCount / totalCards) * 100 : 0;
            const hardPercent = totalCards > 0 ? (hardCount / totalCards) * 100 : 0;

            return {
                easyCount: easyCount,
                mediumCount: mediumCount,
                hardCount: hardCount,
                totalCards: totalCards,
                easyPercent: easyPercent,
                mediumPercent: mediumPercent,
                hardPercent: hardPercent
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
            const currentCourse = dataset.courses.find(course => course.id === courseId);
            if (!currentCourse) {
                console.error("Lehrveranstaltung nicht gefunden");
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
                this.element.querySelector('#max-number-cards').innerHTML = selectedDeck.cards.length.toString();

                this.element.querySelector("#back-button").addEventListener("click", () => {
                    this.initListView();
                });

                this.startLearningSession(currentCourse, selectedDeck);
            }
        };

        this.startCourse = async (courseId) => {
            const currentCourse = dataset.courses.find(course => course.id === courseId);
            if (!currentCourse) {
                console.error("Lehrveranstaltung nicht gefunden");
                this.initListView();
                return;
            }

            const allCards = {cards: currentCourse.cardDecks.flatMap(deck => deck.cards)};

            if (allCards.length === 0) {
                alert("Diese Lehrveranstaltung enthält keine Karten!");
                this.initListView();
                return;
            }

            const selectedCards = await this.showLearningModeModal(currentCourse, allCards);
            //console.log(allCards)
            if (selectedCards) {
                this.element.querySelector("#content").innerHTML = this.html.card;

                this.element.querySelector("#headline").innerHTML = currentCourse.title;
                this.element.querySelector("#sub-headline").innerHTML = "Gesamte Lehrveranstaltung";
                this.element.querySelector('#description').innerHTML = currentCourse.description || '';
                this.element.querySelector('#max-number-cards').innerHTML = selectedCards.cards.length.toString();

                this.element.querySelector("#back-button").addEventListener("click", () => {
                    this.initListView();
                });
                this.startLearningSession(currentCourse, selectedCards);
            }
        };

        this.showLearningModeModal = (course, deck) => {
            if (this.element.querySelector('#learning-mode-dialog')) {
                this.element.querySelector('#learning-mode-dialog').remove();
            }

            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            this.element.querySelector("#main").appendChild(overlay);

            const learningModeDialogString = `
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

            const learningModeDialogElement = this.ccm.helper.html(learningModeDialogString);
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


                    let filteredCards = deck.cards;

                    // Apply card selection
                    switch (selectionMode) {
                        case 'hard':
                            filteredCards = filteredCards.filter(card => card.currentStatus === 'hard');
                            break;
                        case 'medium-hard':
                            filteredCards = filteredCards.filter(card => card.currentStatus === 'hard' || card.currentStatus === 'medium');
                            break;
                    }

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
                                const statusA = this.getDeckStatus(a);
                                const statusB = this.getDeckStatus(b);
                                return statusB.hardPercent - statusA.hardPercent ||
                                    statusB.mediumPercent - statusA.mediumPercent ||
                                    statusA.easyPercent - statusB.easyPercent;
                            });
                            break;
                    }

                    const filteredDeck = {...deck, cards: filteredCards};
                    learningModeDialogElement.remove();
                    overlay.remove();
                    resolve(filteredDeck);
                });
            });
        };

        this.startLearningSession = (course, cardDeck) => {
            const cards = cardDeck.cards;
            const updateCardDisplay = (index) => {
                if (index < 0 || index >= cards.length) return;

                const currentCard = cards[index];

                // Update navigation buttons
                this.element.querySelector('#previous-card-button').classList.toggle("unseen", index === 0);
                this.element.querySelector('#next-card-button').classList.toggle("unseen", index === cards.length - 1);
                this.element.querySelector('#current-card-number').innerHTML = (index + 1).toString();

                // Show question initially
                this.element.querySelector('#question-answer-text').innerHTML = currentCard.question;
                this.element.querySelector('#difficulty-buttons').classList.remove('answerStyle');
                this.element.querySelector('#difficulty-buttons').classList.add('questionStyle');

                const difficultyButtons = {
                    easy: this.element.querySelector('#easy'),
                    medium: this.element.querySelector('#medium'),
                    hard: this.element.querySelector('#hard')
                };
                for (const btn of Object.values(difficultyButtons)) {
                    btn.classList.remove("selected-difficulty");
                }

                this.element.querySelector('#turn-around-button').onclick = () => {
                    if (this.element.querySelector('#question-answer-text').innerHTML === currentCard.question) {
                        this.element.querySelector('#question-answer-text').innerHTML = currentCard.answer;
                        this.element.querySelector('#difficulty-buttons').classList.remove('questionStyle');
                        this.element.querySelector('#difficulty-buttons').classList.add('answerStyle');
                    } else {
                        this.element.querySelector('#question-answer-text').innerHTML = currentCard.question;
                        this.element.querySelector('#difficulty-buttons').classList.remove('answerStyle');
                        this.element.querySelector('#difficulty-buttons').classList.add('questionStyle');
                    }
                };

                // Set up navigation buttons
                this.element.querySelector('#next-card-button').onclick = () => updateCardDisplay(index + 1);
                this.element.querySelector('#previous-card-button').onclick = () => updateCardDisplay(index - 1);

                for (const [difficulty, button] of Object.entries(difficultyButtons)) {
                    button.onclick = async () => {
                        // Reset selected-difficulty class for all difficulty buttons
                        for (const btn of Object.values(difficultyButtons)) {
                            btn.classList.remove("selected-difficulty");
                        }
                        button.classList.add("selected-difficulty");

                        const courseIndex = dataset.courses.findIndex(c => c.id === course.id);
                        const deckIndex = cardDeck.title === course.title ? -1 :
                            dataset.courses[courseIndex].cardDecks.findIndex(d => d.id === cardDeck.id);

                        if (deckIndex === -1) {
                            // Modus: gesamte Lehrveranstaltung
                            const cardIndex = cards.findIndex(c => c.id === currentCard.id);
                            cards[cardIndex].currentStatus = difficulty;
                            cards[cardIndex].status.push(difficulty);
                        } else {
                            const cardIndex = dataset.courses[courseIndex].cardDecks[deckIndex].cards.findIndex(c => c.id === currentCard.id);
                            dataset.courses[courseIndex].cardDecks[deckIndex].cards[cardIndex].currentStatus = difficulty;
                            dataset.courses[courseIndex].cardDecks[deckIndex].cards[cardIndex].status.push(difficulty);
                        }

                        await this.store.set({key: user.key, value: dataset});
                    };
                }
            };

            if (cards.length > 0) {
                updateCardDisplay(0);
            } else {
                this.element.querySelector('#question-answer-text').innerHTML = "Keine Karten vorhanden";
                this.element.querySelector('#difficulty-buttons').classList.add('hidden');
                this.element.querySelector('#turn-around-button').classList.add('hidden');
            }
        };
    },
};