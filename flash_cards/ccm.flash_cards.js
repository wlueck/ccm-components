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
        "css": ["ccm.load", "./resources/styles.css"],
        "helper": ["ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-7.2.0.mjs"],
        "html": ["ccm.load", "./resources/templates.html"],
        "languages": {
            "de": "./resources/resources.js#de",
            "en": "./resources/resources.js#en"
        },
        "defaultLanguage": "de",
        "onchange": event => console.log(event),
        "store": ["ccm.store", {url: "https://ccm2.inf.h-brs.de", name: "wlueck2s_flash_cards"}],
        "text": ["ccm.load", {"url": "./resources/resources.js#de", "type": "module"}],
        "user": ["ccm.instance", "https://ccmjs.github.io/akless-components/user/ccm.user.js"]
    },

    Instance: function () {
        let user, dataset, $;

        this.init = async () => {
            $ = Object.assign({}, this.ccm.helper, this.helper);
            $.use(this.ccm);

            if (this.user) this.user.onchange = this.start;
        };

        this.start = async () => {
            $.setContent(this.element, $.html(this.html.main, {
                onClickOutside: this.events.onClickOutside,
                headline: this.text.headline_course_list,
                subHeadline: '',
                backButton: this.text.back,
                onBackButton: () => this.initListView(),
                defaultContent: this.text.default_content
            }));

            if (this.user) {
                $.append(this.element.querySelector('#user'), this.user.root);
                this.user.start();
            }

            user = await this.user.getValue();
            if (!user) {
                alert(this.text.login_warning);
                console.log("User is not logged in");
                return;
            }

            dataset = await this.store.get(user.key);
            if (!dataset) {
                console.log("No dataset found");
                // initialize new dataset
                await this.store.set({
                    key: user.key,
                    value: {
                        courses: [],
                        settings: {
                            language: this.defaultLanguage,
                            statusDisplay: 'count',
                            defaultCardOrder: 'original',
                            defaultCardSelection: 'all',
                            skipLearningDialog: false
                        },
                        sortPreference: 'title',
                    }});
                dataset = await this.store.get(user.key);
            }
            dataset = dataset.value;

            // load saved or default language
            const savedLanguage = dataset?.settings?.language || this.defaultLanguage;
            this.text = await this.ccm.load({url: this.languages[savedLanguage], type: "module"});
            this.initListView();
        };

        // event handler
        this.events = {
            // closes dropdowns when clicking outside
            onClickOutside: (event) => {
                const dropdowns = this.element.querySelectorAll('.dropdown-menu, .options');
                dropdowns.forEach(dropdown => {
                    if (!dropdown.contains(event.target) && !dropdown.previousElementSibling.contains(event.target)) {
                        dropdown.classList.add('hidden');
                    }
                });
            },

            onOpenSettings: () => {
                $.append(this.element.querySelector("#main"), this.html.overlay);

                const settingsDialog = $.html(this.html.settings_dialog, {
                    settingsHeadline: this.text.settings_headline,
                    languageSelect: this.text.language_select,
                    languageOptions: Object.keys(this.languages).map(lang => `<option value="${lang}">${this.text[lang]}</option>`).join(''),
                    learningModeSettings: this.text.learning_mode_settings,
                    learningModeStandards: this.text.learning_mode_standards,
                    cardsOrder: this.text.cards_order,
                    cardsOrderOriginal: this.text.cards_order_original,
                    cardsOrderRandom: this.text.cards_order_random,
                    cardsOrderDifficulty: this.text.cards_order_difficulty,
                    selectCards: this.text.select_cards,
                    selectCardsAll: this.text.select_cards_all,
                    selectCardsHard: this.text.select_cards_hard,
                    selectCardsMediumHard: this.text.select_cards_medium_hard,
                    skipLearningDialog: this.text.skip_learning_dialog,
                    statusSettings: this.text.status_settings,
                    percent: this.text.percent,
                    count: this.text.count,
                    onSubmitSettings: () => this.events.onSubmitSettings(settingsDialog, overlay),
                    submitSettings: this.text.save,
                    onCancelSettings: () => this.events.onCloseSettings(settingsDialog, overlay),
                    cancelSettings: this.text.cancel,
                });
                $.append(this.element.querySelector("#main"), settingsDialog);

                // populate settings dialog with current settings
                this.element.querySelector('#language-select').value = dataset.settings?.language || 'de';
                const statusDisplay = dataset.settings?.statusDisplay || 'count';
                this.element.querySelector(`input[name="status"][value="${statusDisplay}"]`).checked = true;
                this.element.querySelector('#default-card-order').value = dataset.settings?.defaultCardOrder || 'original';
                this.element.querySelector('#default-card-selection').value = dataset.settings?.defaultCardSelection || 'all';
                this.element.querySelector('#skip-learning-dialog').checked = !!dataset.settings?.skipLearningDialog;
            },

            onSubmitSettings: async (settingsDialog, overlay) => {
                dataset.settings = dataset.settings || {};
                const newLanguage = this.element.querySelector('#language-select').value;
                dataset.settings.language = newLanguage;
                dataset.settings.defaultCardOrder = this.element.querySelector('#default-card-order').value;
                dataset.settings.defaultCardSelection = this.element.querySelector('#default-card-selection').value;
                dataset.settings.skipLearningDialog = this.element.querySelector('#skip-learning-dialog').checked;
                dataset.settings.statusDisplay = this.element.querySelector('input[name="status"]:checked').value;

                this.text = await this.ccm.load({url: this.languages[newLanguage], type: "module"});
                await this.store.set({key: user.key, value: dataset});
                this.events.onCloseSettings(settingsDialog, overlay);
                await this.start();
            },

            onCloseSettings: (settingsDialog, overlay) => {
                settingsDialog.remove();
                overlay.remove();
            },

            onSortCourses: async (sortPreference) => {
                dataset.sortPreference = sortPreference;
                await this.store.set({key: user.key, value: dataset});
                this.initListView();
            },

            onSortDecks: (courseId, sortPreference) => {
                const course = dataset.courses.find(c => c.id === courseId);
                if (course) {
                    course.sortPreference = sortPreference;
                    this.store.set({key: user.key, value: dataset});
                    this.initListView();
                }
            },

            onImportCourse: async () => {
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
                            newCourse.id = newCourse.id || $.generateKey();
                            newCourse.cardDecks.forEach(deck => {
                                deck.id = deck.id || $.generateKey();
                                deck.cards.forEach(card => {
                                    card.id = card.id || $.generateKey();
                                    card.currentStatus = card.currentStatus || "hard";
                                    card.status = card.status || [];
                                });
                            });
                            if (dataset.courses.some(c => c.title === newCourse.title)) {
                                alert(this.text.duplicated_course_title_warning);
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
            },

            onExportCourseOrDeck: async (exportData, type) => {
                const itemToExport = {
                    id: exportData.id,
                    title: exportData.title,
                    description: exportData.description,
                    deadline: exportData.deadline,
                    ...(type === 'course' ? {cardDecks: exportData.cardDecks} : {cards: exportData.cards})
                };

                const blob = new Blob([JSON.stringify(itemToExport, null, 2)], {type: 'application/json'});
                const url = URL.createObjectURL(blob);
                const anchorElement = document.createElement('a');
                anchorElement.href = url;
                anchorElement.download = `${exportData.title.replace(/\s+/g, '_')}.json`;
                document.body.appendChild(anchorElement);
                anchorElement.click();
                document.body.removeChild(anchorElement);
                URL.revokeObjectURL(url);
            },

            onImportDeck: (courseSelectDialog, overlay) => {
                const selectedCourseId = this.element.querySelector('#import-deck-course-select').value;
                courseSelectDialog.remove();
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
                            newDeck.id = newDeck.id || $.generateKey();
                            newDeck.cards.forEach(card => {
                                card.id = card.id || $.generateKey();
                                card.currentStatus = card.currentStatus || "hard";
                                card.status = card.status || [];
                            });
                            const courseIndex = dataset.courses.findIndex(course => course.id === selectedCourseId);
                            if (courseIndex === -1) {
                                alert(this.text.course_not_found_warning);
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
            },

            onDeleteDeck: async (courseId, deckToDelete) => {
                const confirmDelete = confirm(this.text.delete_deck_warning.replace('%title%', deckToDelete.title));
                if (confirmDelete) {
                    const course = dataset.courses.find(course => course.id === courseId);
                    if (!course) {
                        console.error("Course not found");
                        return;
                    }
                    course.cardDecks = course.cardDecks.filter(deck => deck.id !== deckToDelete.id);
                    await this.store.set({key: user.key, value: dataset});
                    this.initListView();
                }
            },

            onDeleteCourse: async (courseToDelete) => {
                const confirmDelete = confirm(this.text.delete_course_warning.replace('%title%', courseToDelete.title));
                if (confirmDelete) {
                    dataset.courses = dataset.courses.filter(course => course.id !== courseToDelete.id);
                    await this.store.set({key: user.key, value: dataset});
                    this.initListView();
                }
            },

            onSubmitCourse: async (event, courseToEdit) => {
                const form = this.element.querySelector("#add-course-form");
                if (!form.checkValidity()) {
                    event.preventDefault();
                    alert(this.text.fill_all_fields_warning);
                    return false;
                }
                event.preventDefault();
                return await this.addOrUpdateCourse(form, courseToEdit);
            },

            onSubmitCourseInDeckEditor: async (event) => {
                const isSubmitted = await this.events.onSubmitCourse(event);
                if (!isSubmitted) return;

                // Update the course select options
                const form = this.element.querySelector("#add-course-form");
                const newOption = document.createElement("option");
                newOption.value = dataset.courses.find(course => course.title === form.title.value).id;
                newOption.textContent = form.title.value;
                $.append(this.element.querySelector("#select-course"), newOption);

                this.events.onResetCourseFormInDeckEditor();
            },

            onResetCourseFormInDeckEditor: () => {
                // Close the add course container and reset the input fields
                const form = this.element.querySelector("#add-course-form");
                this.element.querySelector("#add-course-container").classList.add("hidden");
                this.element.querySelector("#course-deadline-input").classList.add("hidden");
                form.reset();
            },

            onDeleteCard: (event, htmlCard) => {
                event.preventDefault();
                // check if at least one card exists before removing
                if (this.element.querySelectorAll("#cards > #card").length > 1) {
                    htmlCard.remove();
                } else {
                    alert(this.text.minimum_card_warning);
                }
            },

            onSubmitDeck: async (event, deckToEdit) => {
                const form = this.element.querySelector("#add-deck-form");
                if (!form.checkValidity()) {
                    event.preventDefault();
                    alert(this.text.fill_all_fields_warning);
                    return;
                }
                event.preventDefault();
                await this.addOrUpdateDeck(form, deckToEdit);
            },

            onCancelSubmit: (event) => {
                event.preventDefault();
                const confirmCancel = confirm(this.text.cancel_warning);
                if (confirmCancel) {
                    this.initListView();
                }
            },

            onStartLearning: async (course, deck, mode, learningModeDialog, overlay, order, selection) => {
                const orderMode = order || this.element.querySelector('#card-order').value;
                const selectionMode = selection || this.element.querySelector('#card-selection').value;
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
                    learningModeDialog?.remove();
                    overlay?.remove();
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
                learningModeDialog?.remove();
                overlay?.remove();

                if (filteredDeck) {
                    $.setContent(this.element.querySelector('#content'), $.html(this.html.learning_view, {
                        description: mode === "deck" ? deck.description || '' : course.description || '',
                        maxNumberOfCards: filteredDeck.cards.length.toString(),
                        difficulty_hard: this.text.difficulty_hard,
                        difficulty_medium: this.text.difficulty_medium,
                        difficulty_easy: this.text.difficulty_easy,
                    }));

                    $.setContent(this.element.querySelector('#headline'), mode === "deck" ? deck.title : course.title);
                    $.setContent(this.element.querySelector('#sub-headline'), mode === "deck" ? `(${course.title})` : this.text.sub_headline_course_learning);
                    this.element.querySelector("#back-button").classList.remove('hidden');
                    this.startLearningSession(course, filteredDeck);
                }
            }
        };

        this.initListView = () => {
            $.setContent(this.element.querySelector("#content"), $.html(this.html.list_view, {
                onAddDeckOrCourse: () => this.element.querySelector("#add-deck-course-options").classList.toggle('hidden'),
                addDeckOrCourse: this.text.add_deck_or_course,

                onCreateDeck: () => this.initDeckEditorView(),
                createDeck: this.text.create_deck,
                onImportDeck: this.initImportDeckDialog,
                importDeck: this.text.import_deck,
                onCreateCourse: () => this.initCourseEditorView(),
                createCourse: this.text.create_course,
                onImportCourse: this.events.onImportCourse,
                importCourse: this.text.import_course,
                onOpenSettings: () => this.events.onOpenSettings(),
                settings: this.text.settings,
                onSortCourses: () => this.element.querySelector("#sort-courses-options").classList.toggle("hidden"),
                sortCourses: this.text.sort_courses,
                onSortCoursesTitle: () => this.events.onSortCourses('title'),
                sortCoursesTitle: this.text.sort_courses_title + (dataset.sortPreference === 'title' ? " <span>✔</span>" : ""),
                onSortCoursesDeadline: () => this.events.onSortCourses('deadline'),
                sortCoursesDeadline: this.text.sort_courses_deadline + (dataset.sortPreference === 'deadline' ? " <span>✔</span>" : ""),
                onSortCoursesCardCount: () => this.events.onSortCourses('cardCount'),
                sortCoursesCardCount: this.text.sort_courses_cardCount + (dataset.sortPreference === 'cardCount' ? " <span>✔</span>" : ""),
                onSortCoursesStatus: () => this.events.onSortCourses('status'),
                sortCoursesStatus: this.text.sort_courses_status + (dataset.sortPreference === 'status' ? " <span>✔</span>" : ""),
            }));

            $.setContent(this.element.querySelector('#headline'), this.text.headline_course_list);
            $.setContent(this.element.querySelector('#sub-headline'), '');
            this.element.querySelector("#back-button").classList.add('hidden');

            // initialize text if there are no courses
            if (!dataset.courses || dataset.courses.length === 0) {
                this.element.querySelector("#sort-courses-button").classList.add('hidden');
                $.setContent(this.element.querySelector("#list-of-courses"), $.html(this.html.empty_course_list, {
                    noCoursesMessage: this.text.no_courses_message,
                    noCoursesClickToAdd: this.text.no_courses_click_to_add,
                    noCoursesCreateNewDeck: this.text.no_courses_create_new_deck,
                    noCoursesImportExistingDeck: this.text.no_courses_import_existing_deck,
                    noCoursesCreateNewCourse: this.text.no_courses_create_new_course,
                    noCoursesImportExistingCourse: this.text.no_courses_import_existing_course
                }));
                return;
            }
            this.fillCourseList();
        };

        this.fillCourseList = () => {
            // apply sort preference for courses
            if (dataset.sortPreference) sortCourses();

            for (const course of dataset.courses) {
                const courseHtml = createCourseListItemHtml(course);
                // apply sort preference for decks
                if (course.sortPreference) sortDecks(course);

                for (const deck of course.cardDecks) {
                    const cardDeckHtml = createDeckListItemHtml(course.id, deck);
                    $.append(courseHtml.querySelector("#card-decks"), cardDeckHtml);
                }
                $.append(this.element.querySelector('#list-of-courses'), courseHtml);
            }
        };

        this.initCourseEditorView = (courseToEdit = null) => {
            $.setContent(this.element.querySelector("#content"), $.html(this.html.editor_course_view, {
                courseTitleInput: this.text.course_title_input,
                courseDescriptionInput: this.text.course_description_input,
                onToggleDeadline: (event) => this.element.querySelector('#course-deadline-input').classList.toggle('hidden', !event.currentTarget.checked),
                courseDeadlineInput: this.text.course_deadline_input,
                onSubmitCourse: async (event) => {
                    await this.events.onSubmitCourse(event, courseToEdit);
                    this.initListView();
                },
                submitCourse: courseToEdit ? this.text.change : this.text.create,
                onCancelSubmitCourse: (event) => this.events.onCancelSubmit(event),
                cancelCourse: this.text.cancel,
                submitCourseHint: this.text.submit_course_hint,
            }));
            $.setContent(this.element.querySelector('#headline'), courseToEdit ? this.text.headline_edit_course : this.text.headline_create_course);
            $.setContent(this.element.querySelector('#sub-headline'), '');
            this.element.querySelector("#back-button").classList.remove('hidden');

            // initialize form in case of editing a course
            if (courseToEdit) {
                const form = this.element.querySelector("#add-course-form");
                const deadlineCheckbox = this.element.querySelector('#course-deadline');
                const deadlineInput = this.element.querySelector('#course-deadline-input');
                form.title.value = courseToEdit.title;
                form.description.value = courseToEdit.description || '';

                if (courseToEdit.deadline) {
                    deadlineCheckbox.checked = true;
                    deadlineInput.classList.remove('hidden');
                    const [day, month, year] = courseToEdit.deadline.split('.');
                    deadlineInput.value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }
            }
        };

        this.initDeckEditorView = async (deckToEdit = null) => {
            $.setContent(this.element.querySelector("#content"), $.html(this.html.editor_deck_view, {
                courseInput: this.text.select_course_input,
                selectCoursePlaceholder: this.text.deck_course_placeholder,
                courseOptions: dataset.courses?.length ? dataset.courses.map(course => `<option value="${course.id}">${course.title}</option>`).join('') : '',
                onAddCourse: (event) => {
                    event.preventDefault();
                    this.element.querySelector("#add-course-container").classList.toggle("hidden");
                },
                addCourse: this.text.add_course,

                deckTitleInput: this.text.deck_title_input,
                deckDescriptionInput: this.text.deck_description_input,
                onToggleDeadline: (event) => this.element.querySelector('#deck-deadline-input').classList.toggle('hidden', !event.currentTarget.checked),
                deckDeadlineInput: this.text.deck_deadline_input,
                cardsHeadline: this.text.deck_cards_container,
                onAddCard: (event) => {
                    event.preventDefault();
                    addCardInEditor();
                },
                addCard: this.text.add_card,
                onSubmitDeck: (event) => this.events.onSubmitDeck(event, deckToEdit),
                submitDeck: deckToEdit ? this.text.change : this.text.create,
                onCancelSubmitDeck: (event) => this.events.onCancelSubmit(event),
                cancelDeck: this.text.cancel,
                submitDeckHint: deckToEdit ? '' : this.text.submit_deck_hint,
            }));
            $.setContent(this.element.querySelector('#headline'), deckToEdit ? this.text.headline_edit_deck: this.text.headline_create_deck);
            $.setContent(this.element.querySelector('#sub-headline'), '');
            this.element.querySelector("#back-button").classList.remove('hidden');

            // add initial card in editor
            await addCardInEditor(deckToEdit?.cards[0] || {});

            // add small course editor to deck form
            $.setContent(this.element.querySelector("#add-course-container"), $.html(this.html.editor_course_view, {
                courseTitleInput: this.text.course_title_input,
                courseDescriptionInput: this.text.course_description_input,
                onToggleDeadline: (event) => this.element.querySelector('#course-deadline-input').classList.toggle('hidden', !event.currentTarget.checked),
                courseDeadlineInput: this.text.course_deadline_input,
                onSubmitCourse: async (event) => {
                    await this.events.onSubmitCourseInDeckEditor(event);
                },
                submitCourse: this.text.create,
                onCancelSubmitCourse: (event) => this.events.onResetCourseFormInDeckEditor(event),
                cancelCourse: this.text.cancel,
                submitCourseHint: this.text.submit_course_hint,
            }));

            // initialize form in case of editing a deck
            if (deckToEdit) {
                const form = this.element.querySelector("#add-deck-form");
                const selectedCourse = dataset.courses.find(course => course.cardDecks.some(deck => deck.id === deckToEdit.id));
                if (selectedCourse) {
                    this.element.querySelector("#select-course").value = selectedCourse.id;
                }

                form.title.value = deckToEdit.title;
                form.description.value = deckToEdit.description || '';

                if (deckToEdit.deadline) {
                    const deadlineInputDeck = this.element.querySelector("#deck-deadline-input");
                    this.element.querySelector("#deck-deadline").checked = true;
                    deadlineInputDeck.classList.remove('hidden');

                    const [day, month, year] = deckToEdit.deadline.split('.');
                    deadlineInputDeck.value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }
                // add existing cards to editor -> first one is already added
                deckToEdit.cards.slice(1).forEach(card => {
                    addCardInEditor(card);
                });
            }
        };

        this.initImportDeckDialog = () => {
            this.element.querySelector("#add-deck-course-options").classList.toggle('hidden');

            $.append(this.element.querySelector("#main"), this.html.overlay);

            const courseSelectDialog = $.html(this.html.import_deck_dialog, {
                importDeck: this.text.import_deck_headline,
                associatedCourse: this.text.associated_course,
                courseSelectOptions: dataset.courses.map(course => `<option value="${course.id}">${course.title}</option>`).join(''),
                onChooseDeckFileToImport: () => this.events.onImportDeck(courseSelectDialog, overlay),
                chooseDeckFileToImport: this.text.choose_deck_file_to_import,
                onCancelImportDeck: () => {
                    courseSelectDialog.remove();
                    overlay.remove();
                },
                cancelImportDeck: this.text.cancel
            });
            $.append(this.element.querySelector("#main"), courseSelectDialog);
        };

        const addCardInEditor = async (card = {}) => {
            const htmlCard = $.html(this.html.add_card, {
                cardId: card?.id || '',
                question: this.text.question_input,
                current_question: card?.question || '',
                answer: this.text.answer_input,
                current_answer: card?.answer || '',
                onDeleteCard: (event) => this.events.onDeleteCard(event, htmlCard),
                deleteCard: this.text.delete_card,
            });
            $.append(this.element.querySelector("#cards"), htmlCard);
        };

        this.addOrUpdateCourse = async (form, courseToEdit = null) => {
            let formattedDate = '';
            if (form.deadline.checked && form.deadlineInput.value) {
                const [year, month, day] = form.deadlineInput.value.split('-');
                formattedDate = `${day}.${month}.${year}`;
            }

            const course = {
                id: courseToEdit?.id || $.generateKey(),
                title: form.title.value,
                description: form.description.value,
                deadline: formattedDate,
                cardDecks: courseToEdit?.cardDecks || []
            };

            if (!courseToEdit || courseToEdit.title !== course.title) {
                const existingCourse = dataset.courses?.find(c => c.title === course.title);
                if (existingCourse) {
                    alert(this.text.duplicated_course_title_warning);
                    return false;
                }
            }

            if (courseToEdit) {
                const courseIndex = dataset.courses.findIndex(c => c.id === courseToEdit.id);
                if (courseIndex === -1) {
                    console.error(this.text.course_not_found_warning);
                    return false;
                }
                dataset.courses[courseIndex] = course;
            } else {
                dataset.courses.push(course);
            }
            await this.store.set({key: user.key, value: dataset});
            this.onchange && this.onchange({ event: courseToEdit ? 'updatedCourse' : 'createdCourse', instance: this });
            return true;
        };

        this.addOrUpdateDeck = async (form, deckToEdit = null) => {
            let formattedDate = '';
            if (form.deadline.checked && form.deadlineInput.value) {
                const [year, month, day] = form.deadlineInput.value.split('-');
                formattedDate = `${day}.${month}.${year}`;
            }

            let newDeck = {
                id: deckToEdit?.id || $.generateKey(),
                title: form.title.value,
                description: form.description.value,
                deadline: formattedDate,
                cards: []
            };

            const courseIndex = dataset.courses.findIndex(course => course.id === form.course.value);
            if (courseIndex === -1) {
                alert(this.text.course_not_found_warning);
                return;
            }

            if (!deckToEdit || deckToEdit.title !== newDeck.title) {
                if (dataset.courses[courseIndex].cardDecks.some(existingDeck => existingDeck.title === newDeck.title)) {
                    alert(this.text.duplicated_deck_title_warning);
                    return;
                }
            }

            const cards = this.element.querySelectorAll("#card");
            let valid = true;
            cards.forEach(card => {
                let question = card.querySelector("#question").value;
                let answer = card.querySelector("#answer").value;
                let cardId = card.getAttribute("data-card-id") || $.generateKey();

                if (question.trim() !== "" && answer.trim() !== "") {
                    newDeck.cards.push({
                        id: cardId,
                        question: question,
                        answer: answer,
                        currentStatus: deckToEdit?.cards.find(c => c.id === cardId)?.currentStatus || "hard",
                        status: deckToEdit?.cards.find(c => c.id === cardId)?.status || []
                    });
                } else {
                    alert(this.text.fill_answer_question_warning);
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
                this.onchange && this.onchange( { event: deckToEdit? 'updatedDeck' : 'createdDeck', instance: this } );
                this.initListView();
            }
        };

        this.startDeck = async (courseId, deckId) => {
            const currentCourse = dataset.courses.find(course => course.id === courseId);
            if (!currentCourse) {
                console.error(this.text.course_not_found_warning);
                return;
            }
            const currentCardDeck = currentCourse.cardDecks.find(deck => deck.id === deckId);
            if (!currentCardDeck) {
                console.error(this.text.deck_not_found_warning);
                return;
            }
            await this.showLearningModeDialog(currentCourse, currentCardDeck, "deck");
        };

        this.startCourse = async (courseId) => {
            const currentCourse = dataset.courses.find(course => course.id === courseId);
            if (!currentCourse) {
                console.error(this.text.course_not_found_warning);
                return;
            }
            const allCards = {cards: currentCourse.cardDecks.flatMap(deck => deck.cards)};
            if (allCards.length === 0) {
                alert(this.text.no_cards_warning);
                return;
            }
            await this.showLearningModeDialog(currentCourse, allCards);
        };

        this.showLearningModeDialog = async (course, deck, mode) => {
            // skip if settings are enabled
            if (dataset.settings?.skipLearningDialog) {
                const order = dataset.settings.defaultCardOrder || 'original';
                const selection = dataset.settings.defaultCardSelection || 'all';
                await this.events.onStartLearning(course, deck, mode, null, null, order, selection);
                return;
            }

            $.append(this.element.querySelector("#main"), this.html.overlay);

            const learningModeDialog = $.html(this.html.learning_mode_dialog, {
                learningMode: this.text.learning_mode,
                cardsOrder: this.text.cards_order,
                cardsOrderOriginal: this.text.cards_order_original,
                cardsOrderRandom: this.text.cards_order_random,
                cardsOrderDifficulty: this.text.cards_order_difficulty,
                selectCards: this.text.select_cards,
                selectCardsAll: this.text.select_cards_all,
                selectCardsHard: this.text.select_cards_hard,
                selectCardsMediumHard: this.text.select_cards_medium_hard,
                onStartLearning: () => this.events.onStartLearning(course, deck, mode, learningModeDialog, overlay),
                startLearning: this.text.start_learning,
                onCancelLearning: () => {
                    learningModeDialog.remove();
                    overlay.remove();
                },
                cancelLearning: this.text.cancel_learning
            });
            $.append(this.element.querySelector("#main"), learningModeDialog);
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


        // helper functions
        const sortCourses = () => {
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
        };

        const sortDecks = (course) => {
            switch (course.sortPreference) {
                case 'title':
                    course.cardDecks.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'deadline':
                    course.cardDecks.sort((a, b) => {
                        const dateA = a.deadline ? new Date(a.deadline.split('.').reverse().join('-')) : null;
                        const dateB = b.deadline ? new Date(b.deadline.split('.').reverse().join('-')) : null;
                        if (!dateA) return 1;
                        if (!dateB) return -1;
                        return dateA - dateB;
                    });
                    break;
                case 'cardCount':
                    course.cardDecks.sort((a, b) => this.getDeckStatus(a).totalCards - this.getDeckStatus(b).totalCards);
                    break;
                case 'status':
                    course.cardDecks.sort((a, b) => {
                        const statusA = this.getDeckStatus(a);
                        const statusB = this.getDeckStatus(b);
                        return statusB.hardPercent - statusA.hardPercent ||
                            statusB.mediumPercent - statusA.mediumPercent ||
                            statusA.easyPercent - statusB.easyPercent;
                    });
                    break;
            }
        };

        const getDeadlineHtml = (deadline) => {
            if (!deadline) return '';
            const isDeadlineExpired = (() => {
                const [day, month, year] = deadline.split('.');
                return new Date(year, month - 1, day) < new Date();
            })();
            return `<a style="color: ${isDeadlineExpired ? 'red' : 'inherit'};">Deadline: <br> ${deadline}</a>`;
        };

        const getStatusDisplay = (status) => {
            if (dataset.settings?.statusDisplay === 'percent') {
                return `${Math.round(status.easyPercent)}% / ${Math.round(status.mediumPercent)}% / ${Math.round(status.hardPercent)}%`;
            } else {
                return `${status.easyCount} / ${status.mediumCount} / ${status.hardCount}`;
            }
        };

        const getStatusChartStyle = (status) => {
            return `width: 30px; height: 30px;
                    background-image: radial-gradient(circle, white 57%, transparent 57%),
                                      conic-gradient(#b3261e 0% ${status.hardPercent}%,
                                                     #e0cd00 ${status.hardPercent}% ${status.hardPercent + status.mediumPercent}%, 
                                                     #2b6c22 ${status.hardPercent + status.mediumPercent}% 100%);
                    border-radius: 50%;`;
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
                easyCount: easyCount, mediumCount: mediumCount, hardCount: hardCount,
                totalCards: totalCards,
                easyPercent: easyPercent, mediumPercent: mediumPercent, hardPercent: hardPercent
            };
        };

        this.getCourseStatus = (course) => {
            const allCards = course.cardDecks.flatMap(deck => deck.cards);
            return calculateStatus(allCards);
        };

        this.getDeckStatus = (deck) => {
            return calculateStatus(deck.cards);
        };

        const createCourseListItemHtml = (course) => {
            const courseStatus = this.getCourseStatus(course);
            const courseHtml = $.html(this.html.course_list_item, {
                courseTitle: course.title,
                courseDescription: course.description || '',
                onToggleCourse: () => {
                    const toggleCardButton = courseHtml.querySelector('#toggle-course-button');
                    const decks = courseHtml.querySelector('#card-decks');
                    decks.classList.toggle('hidden');
                    toggleCardButton.innerHTML = decks.classList.contains('hidden') ? '&#9660;' : '&#9650;';
                },
                onStartCourse: async () => await this.startCourse(course.id),
                startCourse: this.text.start_course,
                onCourseOptions: () => courseHtml.querySelector("#course-options").classList.toggle('hidden'),
                onSortDecks: () => courseHtml.querySelector(("#sort-deck-options")).classList.toggle("hidden"),
                sortDecks: this.text.sort_decks,
                onSortDeckTitle: () => this.events.onSortDecks(course.id, 'title'),
                sortDeckTitle: this.text.sort_decks_title + (course.sortPreference === 'title' ? " <span>✔</span>" : ""),
                onSortDeckDeadline: () => this.events.onSortDecks(course.id, 'deadline'),
                sortDeckDeadline: this.text.sort_decks_deadline + (course.sortPreference === 'deadline' ? " <span>✔</span>" : ""),
                onSortDeckCardCount: () => this.events.onSortDecks(course.id, 'cardCount'),
                sortDeckCardCount: this.text.sort_decks_cardCount + (course.sortPreference === 'cardCount' ? " <span>✔</span>" : ""),
                onSortDeckStatus: () => this.events.onSortDecks(course.id, 'status'),
                sortDeckStatus: this.text.sort_decks_status + (course.sortPreference === 'status' ? " <span>✔</span>" : ""),
                onEditCourse: () => this.initCourseEditorView(course),
                editCourse: this.text.edit_course,
                onExportCourse: () => this.events.onExportCourseOrDeck(course, 'course'),
                exportCourse: this.text.export_course,
                onDeleteCourse: async () => await this.events.onDeleteCourse(course),
                deleteCourse: this.text.delete_course,
                courseStatusChartStyle: getStatusChartStyle(courseStatus),
                courseStatus: getStatusDisplay(courseStatus),
                courseDeadline: getDeadlineHtml(course.deadline),
            });
            return courseHtml;
        };

        const createDeckListItemHtml = (courseId, deck) => {
            const deckStatus = this.getDeckStatus(deck);
            const cardDeckHtml = $.html(this.html.deck_list_item, {
                deckTitle: deck.title,
                deckDescription: deck.description || '',
                deckId: deck.id,
                onStartDeck: async () => await this.startDeck(courseId, deck.id),
                startDeck: this.text.start_deck,
                onDeckOptions: () => cardDeckHtml.querySelector("#deck-options").classList.toggle('hidden'),
                onEditDeck: () => this.initDeckEditorView(deck),
                editDeck: this.text.edit_deck,
                onExportDeck: () => this.events.onExportCourseOrDeck(deck, 'deck'),
                exportDeck: this.text.export_deck,
                onDeleteDeck: async () => await this.events.onDeleteDeck(courseId, deck),
                deleteDeck: this.text.delete_deck,
                deckStatusChartStyle: getStatusChartStyle(deckStatus),
                deckStatus: getStatusDisplay(deckStatus),
                deckDeadline: getDeadlineHtml(deck.deadline),
            });
            return cardDeckHtml;
        };
    },
};
