/**
 * @overview ccm component for flash cards
 * @author Wiete Lück <wiete.lueck@gmail.com>, 2025
 * @license The MIT License (MIT)
 */

ccm.files['ccm.flash_cards.js'] = {
    name: 'flash_cards',
    ccm: 'https://ccmjs.github.io/ccm/ccm.js',
    config: {
        "css": ["ccm.load", "https://wlueck.github.io/ccm-components/flash_cards/resources/styles.css"],
        "editor": ["ccm.component", "https://ccmjs.github.io/tkless-components/editor/versions/ccm.editor-4.0.0.js", {
            "settings": {
                "modules": {
                    "syntax": true,
                    "toolbar": [
                        [{'header': [1, 2, 3, false]}],
                        ['bold', 'italic', 'underline', {'color': []}],
                        [{'list': 'ordered'}, {'list': 'bullet'}],
                        ['link', 'image', 'code-block'],
                        [{'script': 'sub'}, {'script': 'super'}]
                    ]
                },
                "placeholder": "",
                "theme": "snow"
            }
        }],
        "helper": ["ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-7.2.0.mjs"],
        "html": ["ccm.load", "https://wlueck.github.io/ccm-components/flash_cards/resources/templates.html"],
        "languages": {
            "de": "https://wlueck.github.io/ccm-components/flash_cards/resources/resources.js#de",
            "en": "https://wlueck.github.io/ccm-components/flash_cards/resources/resources.js#en"
        },
        "defaultLanguage": "de",
        "onchange": event => console.log(event),
        "store": ["ccm.store", {url: "https://ccm2.inf.h-brs.de", name: "wlueck2s_flash_cards"}],
        "text": ["ccm.load", {"url": "https://wlueck.github.io/ccm-components/flash_cards/resources/resources.js#de", "type": "module"}],
        "user": ["ccm.instance", "https://ccmjs.github.io/akless-components/user/ccm.user.js"]
    },

    Instance: function () {
        let user, dataset, $;
        let cardEditorInstances = [];

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
            }));

            if (this.user) {
                $.append(this.element.querySelector('#user'), this.user.root);
                this.user.start();
            }

            user = await this.user.getValue();
            if (!user) {
                alert(this.text.login_warning);
                console.log('User is not logged in');
                $.setContent(this.element.querySelector('#content'), this.text.default_content);
                return;
            }

            dataset = await this.store.get(user.key);
            if (!dataset) {
                console.log('No dataset found for user:', user.key);
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
                    }
                });
                dataset = await this.store.get(user.key);
            }
            dataset = dataset.value;

            // load saved or default language
            const savedLanguage = dataset?.settings?.language || this.defaultLanguage;
            this.text = await this.ccm.load({url: this.languages[savedLanguage], type: "module"});
            $.setContent(this.element.querySelector('#back-button'), this.text.back);

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
                const modal = this.element.querySelector('#settings-dialog') || $.html(this.html.settings_dialog, {
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
                    onSubmitSettings: () => this.events.onSubmitSettings(),
                    submitSettings: this.text.save,
                    onCancelSettings: () => modal.close(),
                    cancelSettings: this.text.cancel,
                });
                if (!this.element.querySelector('#settings-dialog')) {
                    $.append(this.element.querySelector('#main'), modal);
                }
                modal.showModal();

                // populate settings dialog with current settings
                modal.querySelector('#language-select').value = dataset.settings?.language || 'de';
                const statusDisplay = dataset.settings?.statusDisplay || 'count';
                modal.querySelector(`input[name="status"][value="${statusDisplay}"]`).checked = true;
                modal.querySelector('#default-card-order').value = dataset.settings?.defaultCardOrder || 'original';
                modal.querySelector('#default-card-selection').value = dataset.settings?.defaultCardSelection || 'all';
                modal.querySelector('#skip-learning-dialog').checked = !!dataset.settings?.skipLearningDialog;
            },
            onSubmitSettings: async () => {
                dataset.settings = dataset.settings || {};
                const newLanguage = this.element.querySelector('#language-select').value;
                dataset.settings.language = newLanguage;
                dataset.settings.defaultCardOrder = this.element.querySelector('#default-card-order').value;
                dataset.settings.defaultCardSelection = this.element.querySelector('#default-card-selection').value;
                dataset.settings.skipLearningDialog = this.element.querySelector('#skip-learning-dialog').checked;
                dataset.settings.statusDisplay = this.element.querySelector('input[name="status"]:checked').value;

                this.text = await this.ccm.load({url: this.languages[newLanguage], type: "module"});
                this.element.querySelector('#settings-dialog').close();
                await this.store.set({key: user.key, value: dataset});
                await this.initListView();
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
                                    card.currentStatus = card.currentStatus || 'hard';
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
            onImportDeck: () => {
                const selectedCourseId = this.element.querySelector('#import-deck-course-select').value;
                if (!selectedCourseId || selectedCourseId === this.text.no_courses_available) {
                    alert(this.text.select_course_warning);
                    return;
                }
                this.element.querySelector('#import-deck-dialog').close();

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
                                card.currentStatus = card.currentStatus || 'hard';
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
            onDeleteDeck: async (courseId, deckToDelete, cardDeckHtml) => {
                const confirmDelete = confirm(this.text.delete_deck_warning.replace('%title%', deckToDelete.title));
                if (confirmDelete) {
                    const course = dataset.courses.find(course => course.id === courseId);
                    if (!course) {
                        console.error('Course not found');
                        return;
                    }
                    course.cardDecks = course.cardDecks.filter(deck => deck.id !== deckToDelete.id);
                    await this.store.set({key: user.key, value: dataset});
                    this.onchange && this.onchange({name: 'deletedDeck', instance: this, deletedDeck: deckToDelete, fromCourse: courseId});
                    cardDeckHtml.remove();
                }
            },
            onDeleteCourse: async (courseToDelete, courseHtml) => {
                const confirmDelete = confirm(this.text.delete_course_warning.replace('%title%', courseToDelete.title));
                if (confirmDelete) {
                    dataset.courses = dataset.courses.filter(course => course.id !== courseToDelete.id);
                    await this.store.set({key: user.key, value: dataset});
                    this.onchange && this.onchange({name: 'deletedCourse', instance: this, deletedCourse: courseToDelete});
                    courseHtml.remove();
                }
            },
            onSubmitCourse: async (courseToEdit) => {
                const form = this.element.querySelector('#add-course-form');
                if (!form.checkValidity()) {
                    alert(this.text.fill_all_fields_warning);
                    return false;
                }
                return await this.addOrUpdateCourse(form, courseToEdit);
            },
            onSubmitCourseInDeckEditor: async () => {
                const isSubmitted = await this.events.onSubmitCourse();
                if (!isSubmitted) return;

                // Update the course select options
                const form = this.element.querySelector('#add-course-form');
                const newOption = document.createElement('option');
                newOption.value = dataset.courses.find(course => course.title === form.title.value).id;
                newOption.textContent = form.title.value;
                $.append(this.element.querySelector('#select-course'), newOption);
                this.events.onResetCourseFormInDeckEditor();
            },
            onResetCourseFormInDeckEditor: () => {
                // Close the add course container and reset the input fields
                const form = this.element.querySelector('#add-course-form');
                this.element.querySelector('#add-course-container').classList.add('hidden');
                this.element.querySelector('#course-deadline-input').classList.add('hidden');
                form.reset();
            },
            onDeleteCard: (htmlCard) => {
                // check if at least one card exists before removing
                if (this.element.querySelectorAll('#cards > #card').length > 1) {
                    // remove editorInstance from cardEditorInstances
                    cardEditorInstances = cardEditorInstances.filter(instance => instance.htmlCard !== htmlCard);
                    htmlCard.remove();
                } else {
                    alert(this.text.minimum_card_warning);
                }
            },
            onSubmitDeck: async (deckToEdit) => {
                const form = this.element.querySelector('#add-deck-form');
                if (!form.checkValidity()) {
                    alert(this.text.fill_all_fields_warning);
                    return;
                }
                await this.addOrUpdateDeck(form, deckToEdit);
            },
            onCancelSubmit: () => {
                const confirmCancel = confirm(this.text.cancel_warning);
                if (confirmCancel) {
                    this.initListView();
                }
            },
            onStartCourseOrDeck: async (courseId, deckId = null) => {
                const currentCourse = structuredClone(dataset.courses.find(course => course.id === courseId));
                if (!currentCourse) {
                    console.error(this.text.course_not_found_warning);
                    return;
                }
                let learningContent, currentDeck, mode;

                if (deckId) {
                    currentDeck = currentCourse.cardDecks.find(deck => deck.id === deckId);
                    if (!currentDeck) {
                        console.error(this.text.deck_not_found_warning);
                        return;
                    }
                    learningContent = currentDeck.cards;
                    mode = 'deck';
                } else {
                    // mode: learn entire course
                    learningContent = currentCourse.cardDecks.flatMap(deck => deck.cards);
                    if (learningContent.length === 0) {
                        alert(this.text.no_cards_warning);
                        return;
                    }
                    mode = 'course';
                }
                await this.showLearningModeDialog(currentCourse, currentDeck || null,  learningContent, mode);
            },
            onStartLearning: async (course, deck, cards, mode, order, selection) => {
                const filteredCards = filterAndSortCardsForLearning(cards,
                    order || this.element.querySelector('#card-order').value,
                    selection || this.element.querySelector('#card-selection').value);
                if (filteredCards.length === 0) {
                    alert(this.text.no_cards_for_filter_warning);
                    return;
                }
                if (!dataset.settings?.skipLearningDialog) this.element.querySelector('#learning-mode-dialog').remove();
                this.initLearningView(course, deck, filteredCards, mode);
            }
        };

        this.getValue = () => {
            return dataset;
        }

        this.initListView = () => {
            $.setContent(this.element.querySelector('#content'), $.html(this.html.list_view, {
                onAddDeckOrCourse: () => this.element.querySelector('#add-deck-course-options').classList.toggle('hidden'),
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
                settingsIcon: this.text.settings_Icon,
                settings: this.text.settings,
                onSortCourses: () => this.element.querySelector('#sort-courses-options').classList.toggle('hidden'),
                sortCourses: this.text.sort_courses,
                onSortCoursesTitle: () => this.events.onSortCourses('title'),
                sortCoursesTitle: this.text.sort_courses_title + (dataset.sortPreference === 'title' ? ' <span>✔</span>' : ''),
                onSortCoursesDeadline: () => this.events.onSortCourses('deadline'),
                sortCoursesDeadline: this.text.sort_courses_deadline + (dataset.sortPreference === 'deadline' ? ' <span>✔</span>' : ''),
                onSortCoursesCardCount: () => this.events.onSortCourses('cardCount'),
                sortCoursesCardCount: this.text.sort_courses_cardCount + (dataset.sortPreference === 'cardCount' ? ' <span>✔</span>' : ''),
                onSortCoursesStatus: () => this.events.onSortCourses('status'),
                sortCoursesStatus: this.text.sort_courses_status + (dataset.sortPreference === 'status' ? ' <span>✔</span>' : ''),
            }));

            $.setContent(this.element.querySelector('#headline'), this.text.headline_course_list);
            $.setContent(this.element.querySelector('#sub-headline'), '');
            this.element.querySelector('#back-button').classList.add('hidden');

            // initialize text if there are no courses
            if (!dataset.courses || dataset.courses.length === 0) {
                this.element.querySelector('#sort-courses-button').classList.add('hidden');
                $.setContent(this.element.querySelector('#list-of-courses'), $.html(this.html.empty_course_list, {
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
            // deep copy to avoid modifying the original dataset
            let courses = structuredClone(dataset.courses);
            // apply sort preference for courses
            if (dataset.sortPreference) courses = sortItems(courses, dataset.sortPreference, this.getCourseStatus);

            for (let course of courses) {
                const courseHtml = createCourseListItemHtml(course);
                // apply sort preference for decks
                if (course.sortPreference) course.cardDecks = sortItems(course.cardDecks, course.sortPreference, this.getDeckStatus);

                for (const deck of course.cardDecks) {
                    const cardDeckHtml = createDeckListItemHtml(course.id, deck);
                    $.append(courseHtml.querySelector('#card-decks'), cardDeckHtml);
                }
                $.append(this.element.querySelector('#list-of-courses'), courseHtml);
            }
        };

        this.initCourseEditorView = (courseToEdit = null) => {
            $.setContent(this.element.querySelector('#content'), $.html(this.html.editor_course_view, {
                courseTitleInput: this.text.course_title_input,
                courseDescriptionInput: this.text.course_description_input,
                onToggleDeadline: (event) => this.element.querySelector('#course-deadline-input').classList.toggle('hidden', !event.currentTarget.checked),
                courseDeadlineInput: this.text.course_deadline_input,
                onSubmitCourse: async () => {
                    const isSubmitted = await this.events.onSubmitCourse(courseToEdit);
                    if (isSubmitted) this.initListView();
                },
                submitCourse: courseToEdit ? this.text.change : this.text.create,
                onCancelSubmitCourse: () => this.events.onCancelSubmit(),
                cancelCourse: this.text.cancel,
                submitCourseHint: this.text.submit_course_hint,
            }));
            $.setContent(this.element.querySelector('#headline'), courseToEdit ? this.text.headline_edit_course : this.text.headline_create_course);
            $.setContent(this.element.querySelector('#sub-headline'), '');
            this.element.querySelector('#back-button').classList.remove('hidden');

            // initialize form in case of editing a course
            if (courseToEdit) {
                const form = this.element.querySelector('#add-course-form');
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
            $.setContent(this.element.querySelector('#content'), $.html(this.html.editor_deck_view, {
                courseInput: this.text.select_course_input,
                selectCoursePlaceholder: this.text.deck_course_placeholder,
                courseOptions: dataset.courses?.length ? dataset.courses.map(course => `<option value="${course.id}">${course.title}</option>`).join('') : '',
                onAddCourse: () => this.element.querySelector('#add-course-container').classList.toggle('hidden'),
                addCourse: this.text.add_course,

                deckTitleInput: this.text.deck_title_input,
                deckDescriptionInput: this.text.deck_description_input,
                onToggleDeadline: (event) => this.element.querySelector('#deck-deadline-input').classList.toggle('hidden', !event.currentTarget.checked),
                deckDeadlineInput: this.text.deck_deadline_input,
                cardsHeadline: this.text.deck_cards_container,
                onAddCard: () => addCardInEditor(),
                addCard: this.text.add_card,
                onSubmitDeck: () => this.events.onSubmitDeck(deckToEdit),
                submitDeck: deckToEdit ? this.text.change : this.text.create,
                onCancelSubmitDeck: () => this.events.onCancelSubmit(),
                cancelDeck: this.text.cancel,
                submitDeckHint: deckToEdit ? '' : this.text.submit_deck_hint,
            }));
            $.setContent(this.element.querySelector('#headline'), deckToEdit ? this.text.headline_edit_deck : this.text.headline_create_deck);
            $.setContent(this.element.querySelector('#sub-headline'), '');
            this.element.querySelector('#back-button').classList.remove('hidden');

            // add initial card in editor
            await addCardInEditor(deckToEdit?.cards[0] || {});

            // add small course editor to deck form
            $.setContent(this.element.querySelector('#add-course-container'), $.html(this.html.editor_course_view, {
                courseTitleInput: this.text.course_title_input,
                courseDescriptionInput: this.text.course_description_input,
                onToggleDeadline: (event) => this.element.querySelector('#course-deadline-input').classList.toggle('hidden', !event.currentTarget.checked),
                courseDeadlineInput: this.text.course_deadline_input,
                onSubmitCourse: async () => await this.events.onSubmitCourseInDeckEditor(),
                submitCourse: this.text.create,
                onCancelSubmitCourse: () => this.events.onResetCourseFormInDeckEditor(),
                cancelCourse: this.text.cancel,
                submitCourseHint: this.text.submit_course_hint,
            }));

            // initialize form in case of editing a deck
            if (deckToEdit) {
                const form = this.element.querySelector('#add-deck-form');
                const selectedCourse = dataset.courses.find(course => course.cardDecks.some(deck => deck.id === deckToEdit.id));
                if (selectedCourse) {
                    this.element.querySelector('#select-course').value = selectedCourse.id;
                }

                form.title.value = deckToEdit.title;
                form.description.value = deckToEdit.description || '';

                if (deckToEdit.deadline) {
                    const deadlineInputDeck = this.element.querySelector('#deck-deadline-input');
                    this.element.querySelector('#deck-deadline').checked = true;
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
            const modal = this.element.querySelector('#import-deck-dialog') || $.html(this.html.import_deck_dialog, {
                importDeck: this.text.import_deck_headline,
                associatedCourse: this.text.associated_course,
                courseSelectOptions: dataset.courses?.length ? dataset.courses.map(course => `<option value="${course.id}">${course.title}</option>`).join('') : `<option selected disabled>${this.text.no_courses_available}</option>`,
                onChooseDeckFileToImport: () => this.events.onImportDeck(),
                chooseDeckFileToImport: this.text.choose_deck_file_to_import,
                onCancelImportDeck: () => modal.close(),
                cancelImportDeck: this.text.cancel
            });
            if (!this.element.querySelector('#import-deck-dialog')) {
                $.append(this.element.querySelector('#main'), modal);
            }
            modal.showModal();
        };

        const addCardInEditor = async (card = {}) => {
            const htmlCard = $.html(this.html.add_card, {
                cardId: card?.id || '',
                question: this.text.question_input,
                current_question: card?.question || '',
                answer: this.text.answer_input,
                current_answer: card?.answer || '',
                onDeleteCard: () => this.events.onDeleteCard(htmlCard),
                deleteCard: this.text.delete_card,
            });
            // Start editor component if available
            const questionEditor = this.editor ? await this.editor.start() : null;
            const answerEditor = this.editor ? await this.editor.start() : null;

            // Populate editor with existing text, if available
            if (questionEditor && card?.question) questionEditor.get().root.innerHTML = card.question;
            if (answerEditor && card?.answer) answerEditor.get().root.innerHTML = card.answer;

            // Set editor or textarea
            $.setContent(htmlCard.querySelector('#question-input'), this.editor ? questionEditor.root : `<textarea id="question" cols="34" rows="5">${card?.question || ''}</textarea>`);
            $.setContent(htmlCard.querySelector('#answer-input'), this.editor ? answerEditor.root : `<textarea id="answer" cols="34" rows="5">${card?.answer || ''}</textarea>`);

            if (questionEditor && answerEditor) {
                cardEditorInstances.push({questionEditor, answerEditor, htmlCard});
            }
            $.append(this.element.querySelector('#cards'), htmlCard);
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
                cardDecks: courseToEdit?.cardDecks || [],
                sortPreference: courseToEdit?.sortPreference || 'title'
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
            this.onchange && this.onchange({name: courseToEdit ? 'updatedCourse' : 'createdCourse', instance: this, newOrUpdatedCourse: course});
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

            const cards = this.element.querySelectorAll('#card');
            let valid = true;
            cards.forEach(card => {
                // Get editor instances if available
                const questionEditor = cardEditorInstances.find(instance => instance.htmlCard === card)?.questionEditor;
                const answerEditor = cardEditorInstances.find(instance => instance.htmlCard === card)?.answerEditor;

                // Get text out of editor or value from textarea
                const question = questionEditor ? questionEditor.getValue().inner : card.querySelector('#question').value.trim();
                const answer = answerEditor ? answerEditor.getValue().inner : card.querySelector('#answer').value.trim();
                const cardId = card.getAttribute('data-card-id') || $.generateKey();

                if ((this.editor && questionEditor.get().getLength() > 1 && answerEditor.get().getLength() > 1) ||
                    (!this.editor && question !== '' && answer !== '')) {
                    newDeck.cards.push({
                        id: cardId,
                        question: question,
                        answer: answer,
                        currentStatus: deckToEdit?.cards.find(c => c.id === cardId)?.currentStatus || 'hard',
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
                // reset cardEditorInstances
                cardEditorInstances = [];
                this.onchange && this.onchange({name: deckToEdit ? 'updatedDeck' : 'createdDeck', instance: this, newOrUpdatedDeck: newDeck});
                this.initListView();
            }
        };

        this.showLearningModeDialog = async (course, deck, cards, mode) => {
            // skip if settings are enabled
            if (dataset.settings?.skipLearningDialog) {
                const order = dataset.settings?.defaultCardOrder || 'original';
                const selection = dataset.settings?.defaultCardSelection || 'all';
                await this.events.onStartLearning(course, deck, cards, mode, order, selection);
                return;
            }
            const modal = $.html(this.html.learning_mode_dialog, {
                learningMode: this.text.learning_mode,
                cardsOrder: this.text.cards_order,
                cardsOrderOriginal: this.text.cards_order_original,
                cardsOrderRandom: this.text.cards_order_random,
                cardsOrderDifficulty: this.text.cards_order_difficulty,
                selectCards: this.text.select_cards,
                selectCardsAll: this.text.select_cards_all,
                selectCardsHard: this.text.select_cards_hard,
                selectCardsMediumHard: this.text.select_cards_medium_hard,
                onStartLearning: async () => await this.events.onStartLearning(course, deck, cards, mode),
                startLearning: this.text.start_learning,
                onCancelLearning: () => modal.remove(),
                cancelLearning: this.text.cancel_learning
            });
            this.element.querySelector('#learning-mode-dialog')?.remove();
            $.append(this.element.querySelector('#main'), modal);

            // populate dialog with default settings
            modal.querySelector('#card-order').value = dataset.settings?.defaultCardOrder || 'original';
            modal.querySelector('#card-selection').value = dataset.settings?.defaultCardSelection || 'all';
            modal.showModal();
        };

        this.initLearningView = (course, deck, cards, mode) => {
            $.setContent(this.element.querySelector('#content'), $.html(this.html.learning_view, {
                description: mode === 'deck' ? deck.description || '' : course.description || '',
                difficulty_hard: this.text.difficulty_hard,
                difficulty_medium: this.text.difficulty_medium,
                difficulty_easy: this.text.difficulty_easy,
            }));

            $.setContent(this.element.querySelector('#headline'), mode === 'deck' ? deck.title : course.title);
            $.setContent(this.element.querySelector('#sub-headline'), mode === 'deck' ? `(${course.title})` : this.text.sub_headline_course_learning);
            this.element.querySelector('#back-button').classList.remove('hidden');

            const updateCardContent = (index) => {
                if (index < 0 || index >= cards.length) return;
                const currentCard = cards[index];

                $.setContent(this.element.querySelector('#card-content-container'), $.html(this.html.learning_view_card, {
                    question: currentCard.question,
                    answer: currentCard.answer,
                    hidePrevBtn: index === 0 ? 'unseen' : '',
                    onPreviousCard: () => {
                        this.element.querySelector('#difficulty-buttons').classList.add('unseen');
                        updateCardContent(index - 1);
                    },
                    onTurnAround: () => {
                        const cardContent = this.element.querySelector('#card-content');
                        cardContent.style.transform = cardContent.style.transform === 'rotateY(180deg)'
                            ? 'rotateY(0deg)'
                            : 'rotateY(180deg)';
                        this.element.querySelector('#difficulty-buttons').classList.toggle('unseen');
                    },
                    hideNextBtn: index === cards.length - 1 ? 'unseen' : '',
                    onNextCard: () => {
                        this.element.querySelector('#difficulty-buttons').classList.add('unseen');
                        updateCardContent(index + 1);
                    },
                    currentCardNumber: (index + 1).toString(),
                    maxNumberOfCards: cards.length.toString()
                }));
                this.updateDifficultyButtons(course, deck, currentCard);
            };
            updateCardContent(0);
        };

        this.updateDifficultyButtons = (course, cardDeck, currentCard) => {
            const difficultyButtons = {
                easy: this.element.querySelector('#easy'),
                medium: this.element.querySelector('#medium'),
                hard: this.element.querySelector('#hard')
            };
            for (const btn of Object.values(difficultyButtons)) {
                btn.classList.remove('selected-difficulty');
            }
            for (const [difficulty, button] of Object.entries(difficultyButtons)) {
                button.onclick = async () => {
                    // Reset selected-difficulty class for all difficulty buttons
                    for (const btn of Object.values(difficultyButtons)) {
                        btn.classList.remove('selected-difficulty');
                    }
                    button.classList.add('selected-difficulty');

                    const courseIndex = dataset.courses.findIndex(c => c.id === course.id);
                    let deckIndex, cardIndex;
                    if (!cardDeck) {
                        // Mode: entire course
                        deckIndex = dataset.courses[courseIndex].cardDecks.findIndex(deck => deck.cards.some(card => card.id === currentCard.id));
                        cardIndex = dataset.courses[courseIndex].cardDecks[deckIndex].cards.findIndex(c => c.id === currentCard.id);
                    } else {
                        // Mode: single deck
                        deckIndex = dataset.courses[courseIndex].cardDecks.findIndex(d => d.id === cardDeck.id);
                        cardIndex = dataset.courses[courseIndex].cardDecks[deckIndex].cards.findIndex(c => c.id === currentCard.id);
                    }
                    // Update card status
                    dataset.courses[courseIndex].cardDecks[deckIndex].cards[cardIndex].currentStatus = difficulty;
                    dataset.courses[courseIndex].cardDecks[deckIndex].cards[cardIndex].status.push(difficulty);
                    await this.store.set({key: user.key, value: dataset});
                };
            }
        };


        // helper functions
        const sortItems = (items, sortPreference, getStatus) => {
            let sortedItems = [...items];
            switch (sortPreference) {
                case 'title':
                    sortedItems.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'deadline':
                    sortedItems.sort((a, b) => {
                        const dateA = a.deadline ? new Date(a.deadline.split('.').reverse().join('-')) : null;
                        const dateB = b.deadline ? new Date(b.deadline.split('.').reverse().join('-')) : null;
                        if (!dateA) return 1;
                        if (!dateB) return -1;
                        return dateA - dateB;
                    });
                    break;
                case 'cardCount':
                    sortedItems.sort((a, b) => getStatus(a).totalCards - getStatus(b).totalCards);
                    break;
                case 'status':
                    sortedItems.sort((a, b) => {
                        const statusA = getStatus(a);
                        const statusB = getStatus(b);
                        return statusB.hardPercent - statusA.hardPercent ||
                            statusB.mediumPercent - statusA.mediumPercent ||
                            statusA.easyPercent - statusB.easyPercent;
                    });
                    break;
            }
            return sortedItems;
        };

        const getDeadlineHtml = (totalCards, deadline) => {
            if (!deadline) return '';

            const [day, month, year] = deadline.split('.');
            const deadlineDate = new Date(year, month - 1, day);
            const today = new Date();
            const isDeadlineExpired = deadlineDate < today;
            let additionalInfo = '';
            if (!isDeadlineExpired) {
                const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
                const cardsPerDay = daysLeft > 0 ? Math.ceil(totalCards / daysLeft) : '';
                additionalInfo = `(Karten pro Tag: ${cardsPerDay})`;
            }
            return `<a class="${isDeadlineExpired ? "expired" : ""}"><b>Deadline: ${deadline}</b><br>${additionalInfo}</a>`;
        };

        const getStatusDisplay = (status) => {
            return dataset.settings?.statusDisplay === 'percent'
                ? `${Math.round(status.easyPercent)}% / ${Math.round(status.mediumPercent)}% / ${Math.round(status.hardPercent)}%`
                : `${status.easyCount} / ${status.mediumCount} / ${status.hardCount}`;
        };

        const getStatusChartStyle = (status, backgroundColor) => {
            return `width: 45px; height: 45px;
                    background-image: radial-gradient(circle, ${backgroundColor} 45%, transparent 45%),
                                      conic-gradient(#d9534f 0% ${status.hardPercent}%,
                                                     #f0e54e ${status.hardPercent}% ${status.hardPercent + status.mediumPercent}%, 
                                                     #5cb85c ${status.hardPercent + status.mediumPercent}% 100%);
                    border-radius: 50%;`;
        };

        const calculateStatus = (cards) => {
            const easyCount = cards.filter(card => card.currentStatus === 'easy').length;
            const mediumCount = cards.filter(card => card.currentStatus === 'medium').length;
            const hardCount = cards.filter(card => card.currentStatus === 'hard').length;
            const totalCards = easyCount + mediumCount + hardCount;

            return {
                easyCount, mediumCount, hardCount,
                totalCards,
                easyPercent: totalCards > 0 ? (easyCount / totalCards) * 100 : 0,
                mediumPercent: totalCards > 0 ? (mediumCount / totalCards) * 100 : 0,
                hardPercent: totalCards > 0 ? (hardCount / totalCards) * 100 : 0
            };
        };

        this.getCourseStatus = (course) => calculateStatus(course.cardDecks.flatMap(deck => deck.cards));

        this.getDeckStatus = (deck) => calculateStatus(deck.cards);

        const createCourseListItemHtml = (course) => {
            const courseStatus = this.getCourseStatus(course);
            const courseHtml = $.html(this.html.course_list_item, {
                courseTitle: course.title,
                courseDescription: course.description || '',
                onToggleCourse: () => {
                    const decks = courseHtml.querySelector('#card-decks');
                    decks.classList.toggle('hidden');
                    courseHtml.querySelector('#toggle-course-button').innerHTML = decks.classList.contains('hidden') ? '&#9660;' : '&#9650;';
                },
                onStartCourse: async () => await this.events.onStartCourseOrDeck(course.id),
                startCourse: this.text.start_course,
                onCourseOptions: () => courseHtml.querySelector('#course-options').classList.toggle('hidden'),
                onSortDecks: () => courseHtml.querySelector('#sort-deck-options').classList.toggle('hidden'),
                sortDecks: this.text.sort_decks,
                onSortDeckTitle: () => this.events.onSortDecks(course.id, 'title'),
                sortDeckTitle: this.text.sort_decks_title + (course.sortPreference === 'title' ? ' <span>✔</span>' : ''),
                onSortDeckDeadline: () => this.events.onSortDecks(course.id, 'deadline'),
                sortDeckDeadline: this.text.sort_decks_deadline + (course.sortPreference === 'deadline' ? ' <span>✔</span>' : ''),
                onSortDeckCardCount: () => this.events.onSortDecks(course.id, 'cardCount'),
                sortDeckCardCount: this.text.sort_decks_cardCount + (course.sortPreference === 'cardCount' ? ' <span>✔</span>' : ''),
                onSortDeckStatus: () => this.events.onSortDecks(course.id, 'status'),
                sortDeckStatus: this.text.sort_decks_status + (course.sortPreference === 'status' ? ' <span>✔</span>' : ''),
                onEditCourse: () => this.initCourseEditorView(course),
                editCourse: this.text.edit_course,
                onExportCourse: () => this.events.onExportCourseOrDeck(course, 'course'),
                exportCourse: this.text.export_course,
                onDeleteCourse: async () => await this.events.onDeleteCourse(course, courseHtml),
                deleteCourse: this.text.delete_course,
                courseStatusChartStyle: getStatusChartStyle(courseStatus, "#ffffff"),
                courseStatus: getStatusDisplay(courseStatus),
                courseDeadline: getDeadlineHtml(courseStatus.hardCount + courseStatus.mediumCount, course.deadline),
            });
            return courseHtml;
        };

        const createDeckListItemHtml = (courseId, deck) => {
            const deckStatus = this.getDeckStatus(deck);
            const cardDeckHtml = $.html(this.html.deck_list_item, {
                deckTitle: deck.title,
                deckDescription: deck.description || '',
                deckId: deck.id,
                onStartDeck: async () => await this.events.onStartCourseOrDeck(courseId, deck.id),
                startDeck: this.text.start_deck,
                onDeckOptions: () => cardDeckHtml.querySelector('#deck-options').classList.toggle('hidden'),
                onEditDeck: () => this.initDeckEditorView(deck),
                editDeck: this.text.edit_deck,
                onExportDeck: () => this.events.onExportCourseOrDeck(deck, 'deck'),
                exportDeck: this.text.export_deck,
                onDeleteDeck: async () => await this.events.onDeleteDeck(courseId, deck, cardDeckHtml),
                deleteDeck: this.text.delete_deck,
                deckStatusChartStyle: getStatusChartStyle(deckStatus, "#f9f9f9"),
                deckStatus: getStatusDisplay(deckStatus),
                deckDeadline: getDeadlineHtml(deckStatus.hardCount + deckStatus.mediumCount, deck.deadline),
            });
            return cardDeckHtml;
        };

        const filterAndSortCardsForLearning = (cards, order, selection) => {
            let filteredCards = cards;
            // Apply card selection
            switch (selection) {
                case 'hard':
                    filteredCards = filteredCards.filter(card => card?.currentStatus === 'hard');
                    break;
                case 'medium-hard':
                    filteredCards = filteredCards.filter(card => card?.currentStatus === 'hard' || card?.currentStatus === 'medium');
                    break;
            }
            // Apply order
            switch (order) {
                case 'random':
                    filteredCards.sort(() => Math.random() - 0.5);
                    break;
                case 'status':
                    filteredCards.sort((a, b) => {
                        const statusPriority = {hard: 3, medium: 2, easy: 1};
                        return statusPriority[b.currentStatus] - statusPriority[a.currentStatus];
                    });
                    break;
            }
            return filteredCards;
        };
    },
};
