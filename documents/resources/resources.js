/**
 * local app configuration
 * @type {Object}
 */
export const config = {
    "css": ["ccm.load", "./resources/styles.css"],
    "data": {
        "store": ["ccm.store", {"url": "wss://ccm2.inf.h-brs.de", "name": "wlueck2s_documents"}],
        "key": "documents"
    },
    "helper": ["ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-7.2.0.mjs"],
    "hide_login": false,
    "html": ["ccm.load", "./resources/templates.html"],
    "onchange": event => console.log(event),
    "user": ["ccm.instance", "https://ccmjs.github.io/akless-components/user/ccm.user.js"],
    "star_rating": ["ccm.component", "https://ccmjs.github.io/tkless-components/star_rating/versions/ccm.star_rating-5.0.0.js"],
    "star_rating_result": ["ccm.component", "https://ccmjs.github.io/tkless-components/star_rating_result/versions/ccm.star_rating_result-4.0.0.js"],
    "text": ["ccm.load", {"url": "./resources/resources.js#de", "type": "module"}],
};

/**
 * german texts and labels
 * @type {Object}
 */
export const de = {
    // general
    "cancel": "Abbrechen",
    "submit": "Speichern",

    // warning messages
    "login_warning": "Bitte loggen Sie sich ein um fortzufahren!",
    "missing_fields_warning": "Bitte Titel und Datei-URL angeben!",
    "confirm_delete_document": "Möchten Sie dieses Dokument wirklich löschen?",

    // main template
    "add_document": "+ Dokument hinzufügen",
    "deleteDocumentIcon": "X",

    // document-upload-modal template
    "headline_add_document": "Dokument hinzufügen",
    "document_title": "Titel",
    "document_description": "Beschreibung",
    "document_file": "Datei URL",
};

/**
 * english texts and labels
 * @type {Object}
 */
export const en = {
    // general
    "cancel": "Cancel",
    "submit": "Save",

    // warning messages
    "login_warning": "Please log in to continue!",
    "missing_fields_warning": "Please provide a title and file URL!",
    "confirm_delete_document": "Do you really want to delete this document?",

    // main template
    "add_document": "+ Add Document",
    "deleteDocumentIcon": "X",

    // document-upload-modal template
    "headline_add_document": "Add Document",
    "document_title": "Title",
    "document_description": "Description",
    "document_file": "File URL",
};