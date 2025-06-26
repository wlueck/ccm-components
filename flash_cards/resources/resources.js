/**
 * local app configuration
 * @type {Object}
 */
export const config = {
    "css": ["ccm.load", "./resources/styles.css"],
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
};

/**
 * german texts and labels
 * @type {Object}
 */
export const de = {
    // general
    "back": "Zurück",
    "cancel": "Abbrechen",
    "create": "Erstellen",
    "save": "Speichern",
    "change": "Ändern",
    "de": "Deutsch",
    "en": "Englisch",

    // warning messages
    "login_warning": "Bitte loggen Sie sich ein, um fortzufahren!",
    "duplicated_course_title_warning": "Eine Lehrveranstaltung mit diesem Namen existiert bereits!",
    "fill_all_fields_warning": "Bitte füllen Sie alle erforderlichen Felder aus!",
    "cancel_warning": "Möchten Sie die Änderungen wirklich verwerfen?",
    "course_not_found_warning": "Lehrveranstaltung nicht gefunden!",
    "duplicated_deck_title_warning": "Ein Stapel mit diesem Namen existiert bereits!",
    "deck_not_found_warning": "Deck nicht gefunden!",
    "no_cards_warning": "Diese Lehrveranstaltung enthält keine Karten!",
    "no_cards_for_filter_warning": "Keine Karten für den gewählten Filter vorhanden!",
    "delete_deck_warning": "Möchten Sie das Deck \"%title%\" wirklich löschen?",
    "delete_course_warning": "Möchten Sie die Lehrveranstaltung \"%title%\" wirklich löschen?",
    "fill_answer_question_warning": "Bitte füllen Sie beide Felder (Frage und Antwort) aus!",
    "minimum_card_warning": "Ein Stapel muss mindestens eine Karte enthalten!",
    "select_course_warning": "Bitte wählen Sie einen Kurs aus",

    // main template
    "default_content": "Bitte loggen Sie sich ein, um auf Ihre Karteikarten zuzugreifen.",


    // list-view template
    "headline_course_list": "Karteikarten",
    "add_deck_or_course": "Hinzufügen",
    "create_deck": "Stapel erstellen",
    "import_deck": "Stapel importieren",
    "create_course": "Lehrveranstaltung erstellen",
    "import_course": "Lehrveranstaltung importieren",
    "sort_courses": "Sortieren",
    "sort_courses_title": "Nach Titel",
    "sort_courses_deadline": "Nach Deadline",
    "sort_courses_cardCount": "Nach Anzahl der Karten",
    "sort_courses_status": "Nach Status",

    // empty-course-list template
    "no_courses_message": "Noch keine Lehrveranstaltungen und Karteikartenstapeltapel vorhanden.",
    "no_courses_click_to_add": "Klicke auf Hinzufügen, um:",
    "no_courses_create_new_deck": "einen neuen Karteikartenstapel zu erstellen",
    "no_courses_import_existing_deck": "einen bestehenden Stapel zu importieren",
    "no_courses_create_new_course": "eine neue Lehrveranstaltung anzulegen",
    "no_courses_import_existing_course": "eine Lehrveranstaltung zu importieren",

    // course-list-item template
    "start_course": "Gesamte Lehrveranstaltung lernen",
    "sort_decks": "Sortieren",
    "sort_decks_title": "Nach Titel",
    "sort_decks_deadline": "Nach Deadline",
    "sort_decks_cardCount": "Nach Anzahl der Karten",
    "sort_decks_status": "Nach Status",
    "edit_course": "Bearbeiten",
    "export_course": "Exportieren",
    "delete_course": "Löschen",

    // deck-list-item template
    "start_deck": "Starten",
    "edit_deck": "Bearbeiten",
    "export_deck": "Exportieren",
    "delete_deck": "Löschen",

    // import-deck-dialog template
    "import_deck_headline": "Stapel importieren",
    "associated_course": "Zugehörige Lehrveranstaltung:",
    "no_courses_available": "Keine Kurse vorhanden",
    "choose_deck_file_to_import": "Datei auswählen",

    // settings-dialog template
    "settings_headline": "Einstellungen",
    "language_select": "Sprache auswählen",
    "learning_mode_settings": "Lernmodus",
    "learning_mode_standards": "Standartwerte",
    "skip_learning_dialog": "Lernmodus-Dialog überspringen",
    "status_settings": "Status anzeigen in",
    "percent": "Prozent",
    "count": "Anzahl",


    // edit/create-course template
    "headline_create_course": "Lehrveranstaltung erstellen",
    "headline_edit_course": "Lehrveranstaltung bearbeiten",
    "course_title_input": "Titel*",
    "course_description_input": "Beschreibung",
    "course_deadline_input": "Deadline",
    "submit_course_hint": "Die Lehrveranstaltung kann nach dem Speichern jederzeit bearbeitet werden.",


    // edit/create-deck template
    "headline_create_deck": "Karteikartenstapel erstellen",
    "headline_edit_deck": "Karteikartenstapel bearbeiten",
    "select_course_input": "Lehrveranstaltung*",
    "deck_course_placeholder": "-- Lehrveranstaltung wählen --",
    "deck_cards_container": "Karten",
    "add_course": "Lehrveranstaltung hinzufügen",
    "deck_title_input": "Titel*",
    "deck_description_input": "Beschreibung",
    "deck_deadline_input": "Deadline",
    "add_card": "Karte hinzufügen",
    "submit_deck_hint": "Der Karteikartenstapel kann nach dem Speichern jederzeit bearbeitet werden.",

    // add-card template
    "question_input_required": "Frage*",
    "answer_input_required": "Antwort*",
    "question_input": "Frage",
    "answer_input": "Antwort",
    "delete_card": "Karte löschen",


    // learning-mode template
    "learning_mode": "Lernmodus wählen",
    "cards_order": "Karten sortieren nach",
    "cards_order_original": "Originalreihenfolge",
    "cards_order_random": "Zufällig",
    "cards_order_difficulty": "Schwierigkeitsgrad",
    "select_cards": "Karten auswählen",
    "select_cards_all": "Alle Karten",
    "select_cards_hard": "Nur schwere Karten",
    "select_cards_medium_hard": "Mittel und schwere Karten",
    "start_learning": "Lernen beginnen",
    "cancel_learning": "Abbrechen",

    // learning-view template
    "sub_headline_course_learning": "Gesamte Lehrveranstaltung",
    "difficulty_hard": "Nicht gewusst",
    "difficulty_medium": "Unsicher",
    "difficulty_easy": "Gut gewusst",
};

/**
 * english texts and labels
 * @type {Object}
 */
export const en = {
    // general
    "back": "Back",
    "cancel": "Cancel",
    "create": "Create",
    "save": "Save",
    "change": "Change",
    "de": "German",
    "en": "English",

    // warning messages
    "login_warning": "Please log in to continue!",
    "duplicated_course_title_warning": "A course with this title already exists!",
    "fill_all_fields_warning": "Please fill out all required fields!",
    "cancel_warning": "Do you really want to discard the changes?",
    "course_not_found_warning": "Course not found!",
    "duplicated_deck_title_warning": "A deck with this name already exists!",
    "deck_not_found_warning": "Deck not found!",
    "no_cards_warning": "This course contains no cards!",
    "no_cards_for_filter_warning": "No cards available for the selected filter!",
    "delete_deck_warning": "Do you really want to delete the deck \"%title%\"?",
    "delete_course_warning": "Do you really want to delete the course \"%title%\"?",
    "fill_answer_question_warning": "Please fill out both fields (question and answer)!",
    "minimum_card_warning": "A deck must contain at least one card!",
    "select_course_warning": "Please choose a course",

    // main template
    "default_content": "Please log in to access your flashcards.",

    // list-view template
    "headline_course_list": "Flashcards",
    "add_deck_or_course": "Add",
    "create_deck": "Create deck",
    "import_deck": "Import deck",
    "create_course": "Create course",
    "import_course": "Import course",
    "sort_courses": "Sort",
    "sort_courses_title": "By title",
    "sort_courses_deadline": "By deadline",
    "sort_courses_cardCount": "By card count",
    "sort_courses_status": "By status",

    // empty-course-list template
    "no_courses_message": "No courses and flashcard decks available yet.",
    "no_courses_click_to_add": "Click on Add to:",
    "no_courses_create_new_deck": "create a new flashcard deck",
    "no_courses_import_existing_deck": "import an existing deck",
    "no_courses_create_new_course": "create a new course",
    "no_courses_import_existing_course": "import a course",

    // course-list-item template
    "start_course": "Learn entire course",
    "sort_decks": "Sort",
    "sort_decks_title": "By title",
    "sort_decks_deadline": "By deadline",
    "sort_decks_cardCount": "By card count",
    "sort_decks_status": "By status",
    "edit_course": "Edit",
    "export_course": "Export",
    "delete_course": "Delete",

    // deck-list-item template
    "start_deck": "Start",
    "edit_deck": "Edit",
    "export_deck": "Export",
    "delete_deck": "Delete",

    // import-deck-dialog template
    "import_deck_headline": "Import deck",
    "associated_course": "Associated course:",
    "no_courses_available": "No courses available",
    "choose_deck_file_to_import": "Choose file",

    // settings-dialog template
    "settings_headline": "Settings",
    "language_select": "Select language",
    "learning_mode_settings": "Learning mode",
    "learning_mode_standards": "Defaults",
    "skip_learning_dialog": "Skip learning mode dialog",
    "status_settings": "Show status in",
    "percent": "Percent",
    "count": "Count",

    // edit/create-course template
    "headline_create_course": "Create course",
    "headline_edit_course": "Edit course",
    "course_title_input": "Title*",
    "course_description_input": "Description",
    "course_deadline_input": "Deadline",
    "submit_course_hint": "The course can be edited anytime after saving.",

    // edit/create-deck template
    "headline_create_deck": "Create flashcard deck",
    "headline_edit_deck": "Edit flashcard deck",
    "select_course_input": "Course*",
    "deck_course_placeholder": "-- Select course --",
    "deck_cards_container": "Cards",
    "add_course": "Add course",
    "deck_title_input": "Title*",
    "deck_description_input": "Description",
    "deck_deadline_input": "Deadline",
    "add_card": "Add card",
    "submit_deck_hint": "The flashcard deck can be edited anytime after saving.",

    // add-card template
    "question_input_required": "Question*",
    "answer_input_required": "Answer*",
    "question_input": "Question",
    "answer_input": "Answer",
    "delete_card": "Delete card",

    // learning-mode template
    "learning_mode": "Select learning mode",
    "cards_order": "Order cards by",
    "cards_order_original": "Original order",
    "cards_order_random": "Random",
    "cards_order_difficulty": "Difficulty",
    "select_cards": "Select cards",
    "select_cards_all": "All cards",
    "select_cards_hard": "Only hard cards",
    "select_cards_medium_hard": "Medium and hard cards",
    "start_learning": "Start learning",
    "cancel_learning": "Cancel",

    // learning-view template
    "sub_headline_course_learning": "Entire course",
    "difficulty_hard": "Didn't know",
    "difficulty_medium": "Unsure",
    "difficulty_easy": "Knew well"
};