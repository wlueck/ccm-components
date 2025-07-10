/**
 * local app configuration
 * @type {Object}
 */
export const config = {
    // stores
    "curriculum": {"store": ["ccm.store", {"url": "https://ccm2.inf.h-brs.de", "name": "wlueck2s_curriculum"}], "key": "curriculum"},
    "data": {"store": ["ccm.store", {"url": "wss://ccm2.inf.h-brs.de", "name": "wlueck2s_learning_exchange"}], "key": "learning_exchange"},

    // components
    "chat": ["ccm.component", "https://ccmjs.github.io/akless-components/chat/ccm.chat.js"],
    "documents": ["ccm.component", "https://wlueck.github.io/ccm-components/documents/ccm.documents.js"],
    //"documents": ["ccm.component", "../documents/ccm.documents.js"],
    "team_project": ["ccm.component", "https://ccmjs.github.io/akless-components/team_project/ccm.team_project.js"],

    "css": ["ccm.load", "./resources/styles.css"],
    "helper": ["ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-7.2.0.mjs"],
    "html": ["ccm.load", "./resources/templates.html"],
    "onchange": event => console.log(event),
    "user": ["ccm.instance", "https://ccmjs.github.io/akless-components/user/ccm.user.js"],
    "text": ["ccm.load", {"url": "./resources/resources.js#de", "type": "module"}]
}

/**
 * german texts and labels
 * @type {Object}
 */
export const de = {
    // warning messages
    "login_warning": "Bitte loggen Sie sich ein um fortzufahren!",

    // main template
    "headline_main": "Lernaustausch",
    "all_courses": "Alle Lehrveranstaltungen",
    "saved_courses": "Meine Lehrveranstaltungen",
    "course_of_study": "Studiengang:",
    "semester": "Semester:",
    "no_courses_available": "Keine Lehrveranstaltungen vorhanden",

    // course-item template
    "empty_star": "☆",
    "filled_star": "★",
    "documents": "📖 Lernunterlagen",
    "chat": "💬 Chat",
    "group": "👥 Lerngruppen",
    "group_label": "Lerngruppe",
};

/**
 * english texts and labels
 * @type {Object}
 */
export const en = {
    // warning messages
    "login_warning": "Please login to continue!",

    // main template
    "headline_main": "Learning Exchange",
    "all_courses": "All Courses",
    "saved_courses": "My Courses",
    "course_of_study": "Course of Study:",
    "semester": "Semester:",
    "no_courses_available": "No courses available",

    // course-item template
    "empty_star": "☆",
    "filled_star": "★",
    "documents": "📖 Learning Materials",
    "chat": "💬 Chat",
    "group": "👥 Study Groups",
    "group_label": "Study Group",
};