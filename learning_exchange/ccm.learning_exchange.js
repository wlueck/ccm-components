/**
 * @overview ccm component for learning exchange
 * @author Wiete Lück <wiete.lueck@gmail.com>, 2025
 * @license The MIT License (MIT)
 */

ccm.files["ccm.learning_exchange.js"] = {
    name: "learning-exchange",
    ccm: "https://ccmjs.github.io/ccm/ccm.js",
    config: {
        //user_store: ["ccm.store", {url: "https://ccm2.inf.h-brs.de", name: "wlueck2s_learning_exchange_user"}],
        //materials: ["ccm.store", {url: "https://ccm2.inf.h-brs.de", name: "wlueck2s_learning_exchange_materials"}],
        //groups: ["ccm.store", {url: "https://ccm2.inf.h-brs.de", name: "wlueck2s_learning_exchange_groups"}],
        //curriculum: ["ccm.store", {url: "https://ccm2.inf.h-brs.de", name: "wlueck2s_curriculum"}],

        user_store: {
            saved_courses: [
                {
                    course_id: "course_40bd08c5-4fbf-4ebe-a19d-97a065317603"
                },
                {
                    course_id: "course_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
                }
            ]
        },

        materials: [
            {
                id: "material_a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
                course_id: "course_40bd08c5-4fbf-4ebe-a19d-97a065317603",
                title: "Klausurvorbereitung 2023",
                description: "Zusammenfassung der wichtigsten Themen für die Klausur.",
                file_url: "https://github.com/wlueck/ccm-components/blob/main/learning_exchange/resources/files/Lernunterlagen_Prog1.pdf",
                uploader: "wlueck2s",
                upload_date: "2025-05-21T10:00:00Z",
                tags: ["Klausur", "Zusammenfassung"],
                ratings: [
                    {user: "tniede2s", value: 5},
                    {user: "userrr2s", value: 4}
                ]
            },
            {
                id: "material_9f8e7d6c-5b4a-3c2d-1e0f-9a8b7c6d5e4f",
                course_id: "course_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
                title: "Klausurvorbereitung",
                description: "Alles wichtige",
                file_url: "https://github.com/wlueck/ccm-components/blob/main/learning_exchange/resources/files/Klausurvorbereitung%20Systemnahe%20Programmierung.pdf",
                uploader: "userrr2s",
                upload_date: "2025-05-21T10:00:00Z",
                tags: ["Vorlesung", "Zusammenfassung"],
                ratings: [
                    {user: "tniede2s", value: 5},
                    {user: "wlueck2s", value: 4}
                ]
            }
        ],

        groups: [
            {
                id: "group_b2a3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d",
                course_id: "course_40bd08c5-4fbf-4ebe-a19d-97a065317603",
                title: "Lerngruppe für Programmierung 1",
                members: ["wlueck2s", "tniede2s", "userrr2s"],
                messages: [
                    {user: "wlueck2s", message: "Hallo zusammen!", timestamp: "2025-05-21T10:00:00Z"},
                    {user: "tniede2s", message: "Hallo! Wie läuft's bei euch?", timestamp: "2025-05-21T10:01:00Z"}
                ]
            }
        ],

        curriculum: [
            {
                course_of_study_title: "Bachelor Informatik",
                course_of_study_abbreviation: "BI",
                semesters: 6,
                courses: [
                    {title: "Programmierung 1", semester: 1, id: "course_40bd08c5-4fbf-4ebe-a19d-97a065317603"},
                    {title: "Netze", semester: 1, id: "course_a33d93c2-3d74-4c60-b5c8-eb14a52c4a11"},
                    {title: "Techniche Informatik", semester: 1, id: "course_0f24738d-bb95-44d6-a5bf-fa7411fc9ceb"},
                    {
                        title: "Mathematische Grundlagen und Lineare Algebra",
                        semester: 1,
                        id: "course_55422f81-0470-4843-ae9b-23b466c0142c"
                    },

                    {title: "Analysis", semester: 2, id: "course_6e8f3a7d-9b2c-4e5f-a1d3-8c9b4d5e6f7a"},
                    {
                        title: "Algorithmen, Datenstrukturen und Graphentheorie",
                        semester: 2,
                        id: "course_7d9e1b2a-3c4d-4e5f-9a1b-2c3d4e5f6a7b"
                    },
                    {title: "Programmierung 2", semester: 2, id: "course_8c7d6e5f-4a3b-2c1d-9e8f-7a6b5c4d3e2f"},
                    {title: "Datenbanken", semester: 2, id: "course_9b8a7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d"},
                    {
                        title: "Systemnahe Programmierung",
                        semester: 2,
                        id: "course_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
                    },
                    {
                        title: "Überfachliche Kompetenz: Betriebswirtschaftslehre",
                        semester: 2,
                        id: "course_2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e"
                    },
                    {
                        title: "Überfachliche Kompetenz: Einführung in das IT-Recht",
                        semester: 2,
                        id: "course_3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f"
                    },
                    {
                        title: "Überfachliche Kompetenz: English for IT",
                        semester: 2,
                        id: "course_4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a"
                    },
                    {
                        title: "Überfachliche Kompetenz: Ethik",
                        semester: 2,
                        id: "course_5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b"
                    },

                    {
                        title: "Wahrscheinlichkeitstheorie und Statistik",
                        semester: 3,
                        id: "course_6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c"
                    },
                    {
                        title: "Automatentheorie und Formale Sprachen",
                        semester: 3,
                        id: "course_7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d"
                    },
                    {title: "Software Engineering 1", semester: 3, id: "course_8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e"},
                    {title: "IT-Sicherheit", semester: 3, id: "course_9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f"},
                    {title: "Betriebssysteme", semester: 3, id: "course_0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a"},
                    {title: "Informatik-Projekt", semester: 3, id: "course_1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b"},

                    {
                        title: "Berechenbarkeit und Komplexität",
                        semester: 4,
                        id: "course_2f3a4b5c-6d7e-8f9a-0b1c-2d3e4f5a6b7c"
                    },
                    {title: "Software Engineering 2", semester: 4, id: "course_3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d"},
                    {title: "", semester: 4, id: "course_4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e"},

                    {title: "", semester: 5, id: "course_5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0a"},
                    {title: "", semester: 5, id: "course_6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0a1b"},

                    {title: "Praxisprojekt", semester: 6, id: "course_7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0a1b2c"},
                    {title: "Thesis", semester: 6, id: "course_8f9a0b1c-2d3e-4f5a-6b7c-8d9e0a1b2c3d"}
                ]
            },
            {
                course_of_study_title: "Master Informatik",
                course_of_study_abbreviation: "MI",
                semesters: 4,
                courses: [
                    {title: "Advanced Programming", semester: 1, id: "course_9a0b1c2d-3e4f-5a6b-7c8d-9e0a1b2c3d4e"},
                    {
                        title: "Mathematik für Informatiker",
                        semester: 1,
                        id: "course_0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d"
                    },
                    {title: "Datenbanken II", semester: 2, id: "course_1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e"},
                    {title: "Software Engineering II", semester: 2, id: "course_2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f"},
                    {title: "IT-Sicherheit II", semester: 3, id: "course_3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a"},
                    {
                        title: "Künstliche Intelligenz II",
                        semester: 3,
                        id: "course_4e5f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b"
                    },
                    {title: "Softwareprojekt II", semester: 4, id: "course_5f6a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c"},
                    {title: "Masterarbeit", semester: 4, id: "course_6a7b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d"}
                ]
            },
            {
                course_of_study_title: "Bachelor Wirtschaftsinformatik",
                course_of_study_abbreviation: "BWI",
                semesters: 6,
                courses: [
                    {title: "Programmierung 1", semester: 1, id: "course_7b8c9d0e-1f2a-3b4c-5d6e-7f8a9b0c1d2e"},
                    {title: "Netze", semester: 1, id: "course_8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f"},
                    {title: "Techniche Informatik", semester: 1, id: "course_9d0e1f2a-3b4c-5d6e-7f8a-9b0c1d2e3f4a"},
                    {
                        title: "Mathematische Grundlagen und Lineare Algebra",
                        semester: 1,
                        id: "course_0e1f2a3b-4c5d-6e7f-8a9b-0c1d2e3f4a5b"
                    }
                ]
            },
            {
                course_of_study_title: "Bachelor Cyber Security & Privacy",
                course_of_study_abbreviation: "BCSP",
                semesters: 6,
                courses: []
            }
        ],

        tags: ['Klausur', 'Zusammenfassung', 'Vorlesung', 'übung'],

        //chat: ["ccm.component", "https://ccmjs.github.io/akless-components/chat/ccm.chat.js"],
        "css": ["ccm.load", "./resources/styles.css"],
        "helper": ["ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-7.2.0.mjs"],
        "html": ["ccm.load", "./resources/templates.html"],
        "onchange": event => console.log(event),
        "user": ["ccm.instance", "https://ccmjs.github.io/akless-components/user/ccm.user.js"],
        "text": ["ccm.load", {"url": "./resources/resources.js#de", "type": "module"}],
    },

    Instance: function () {
        let user, curriculum, $;
        let savedCourses = [];

        this.init = async () => {
            $ = Object.assign({}, this.ccm.helper, this.helper);
            $.use(this.ccm);

            if (this.user) this.user.onchange = this.start;
        };

        this.start = async () => {
            $.setContent(this.element, $.html(this.html.main, {
                headlineMain: this.text.headline_main
            }));

            if (this.user) {
                this.element.querySelector('#user').append(this.user.root);
                this.user.start();
            }

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

            // init savedCourses
            savedCourses = this.user_store.saved_courses;
            curriculum = this.curriculum;

            this.initMainView();
        };

        // event handler
        this.events = {
            onSwitchTab: (tabId) => {
                const otherTabId = tabId === 'all' ? 'saved' : 'all';
                // Update buttons
                this.element.querySelector(`#tab-${tabId}-button`).classList.add('active');
                this.element.querySelector(`#tab-${otherTabId}-button`).classList.remove('active');
                // Update content
                this.element.querySelector(`#tab-${tabId}`).classList.remove('hidden');
                this.element.querySelector(`#tab-${otherTabId}`).classList.add('hidden');
            },
            onChangeCourseOfStudy: (event) => {
                const selectedCourseOfStudy = curriculum.find(courseOfStudy => courseOfStudy.course_of_study_abbreviation === event.target.value);
                this.updateSemesterOptions(selectedCourseOfStudy);
                this.updateAccordion("all", selectedCourseOfStudy, 1);
            },
            onChangeSemester: (event) => {
                const selectedCourseOfStudy = curriculum.find(courseOfStudy => courseOfStudy.course_of_study_abbreviation === this.element.querySelector("#course-of-study").value);
                const selectedSemester = parseInt(event.target.value);
                this.updateAccordion("all", selectedCourseOfStudy, selectedSemester);
            },
            onFavorite: (event, course) => {
                event.stopPropagation();

                const isSaved = this.user_store.saved_courses.some(savedCourse => savedCourse.course_id === course.id);
                if (isSaved) {
                    this.user_store.saved_courses = this.user_store.saved_courses.filter(savedCourse => savedCourse.course_id !== course.id);
                } else {
                    this.user_store.saved_courses.push({course_id: course.id});
                }
                // update UI
                const selectedCourseOfStudy = curriculum.find(c => c.courses.some(course => course.id === course.id));
                const selectedSemester = this.element.querySelector("#semester").value ? parseInt(this.element.querySelector("#semester").value) : 1;
                this.updateAccordion("all", selectedCourseOfStudy, selectedSemester);
                this.updateAccordion("saved");
            },
            onToggleAccordionItem: (event) => {
                event.stopPropagation();
                const toggle = event.currentTarget.closest(".accordion-item-toggle");
                const content = toggle.nextElementSibling;
                if (content && content.classList.contains("accordion-item-content")) {
                    content.classList.toggle("hidden");
                }
            },
            onAddDocument: (event, course) => {
                const overlay = $.html(this.html.overlay);
                $.append(this.element.querySelector("#main"), overlay);

                const modal = $.html(this.html.upload_document_modal, {
                    headlineAddDocument: this.text.headline_add_document,
                    title: this.text.document_title,
                    description: this.text.document_description,
                    documentFile: this.text.document_file,
                    cancel: this.text.cancel,
                    submit: this.text.submit,
                    onCancelUpload: () => {
                        modal.remove();
                        overlay.remove();
                    },
                    onSubmitUpload: (event) => this.events.onSubmitUpload(event, course, modal, overlay),
                });
                $.append(this.element.querySelector('#main'), modal);
            },
            onSubmitUpload: (event, course, modal, overlay) => {
                event.preventDefault();
                event.stopPropagation();
                const form = modal.querySelector('#upload-form');
                const title = form.title.value;
                const file = form.file.value;
                const description = form.description.value;

                if (!title || !file) {
                    alert("Bitte Titel und Datei angeben!");
                    return;
                }

                this.materials.push({
                    id: "material_" + $.generateKey(),
                    course_id: course.id,
                    title: title,
                    description: description,
                    file_url: file,
                    uploader: user.key,
                    upload_date: new Date().toISOString(),
                    tags: [],
                    ratings: []
                });

                modal.remove();
                overlay.remove();
                this.updateAccordion("all", curriculum.find(c => c.courses.some(course => course.id === course.id)), parseInt(this.element.querySelector("#semester").value));
            },

        }

        this.initMainView = () => {
            $.setContent(this.element.querySelector("#content"), $.html(this.html.course_semester_select, {
                allCourses: this.text.all_courses,
                savedCourses: this.text.saved_courses,
                onTabAll: () => this.events.onSwitchTab('all'),
                onTabSaved: () => this.events.onSwitchTab('saved'),
                courseOfStudy: this.text.course_of_study,
                courseOfStudyOptions: curriculum.map(c => `<option value="${c.course_of_study_abbreviation}">${c.course_of_study_title}</option>`).join(''),
                onChangeCourseOfStudy: (event) => this.events.onChangeCourseOfStudy(event),
                semester: this.text.semester,
                onChangeSemester: (event) => this.events.onChangeSemester(event),
            }));

            this.updateSemesterOptions(curriculum[0]);
            this.updateAccordion("all", curriculum[0], 1);
            this.updateAccordion("saved");
        };

        this.updateSemesterOptions = (selectedCourseOfStudy) => {
            const semesterSelect = this.element.querySelector("#semester");
            semesterSelect.innerHTML = "";
            for (let i = 0; i < selectedCourseOfStudy.semesters; i++) {
                const option = document.createElement("option");
                option.value = (i + 1).toString();
                option.textContent = "Semester " + (i + 1);
                semesterSelect.appendChild(option);
            }
        };

        this.updateAccordion = (tabMode, selectedCourseOfStudy, selectedSemester) => {
            let courses = [];
            if (tabMode === "saved") {
                this.element.querySelector("#tab-saved .accordion").innerHTML = "";
                courses = this.user_store.saved_courses.map(savedCourse => {
                    return curriculum.flatMap(courseOfStudy => courseOfStudy.courses)
                        .find(course => course.id === savedCourse.course_id);
                }).filter(course => course);
            } else if (tabMode === "all") {
                this.element.querySelector("#tab-all .accordion").innerHTML = "";
                courses = selectedCourseOfStudy.courses.filter(c => c.semester === selectedSemester);
            }

            courses.forEach(course => {
                let courseItem = this.ccm.helper.html(this.html.course_item, {
                    courseTitle: course.title,
                    star: this.user_store.saved_courses.some(savedCourse => savedCourse.course_id === course.id) ? "★" : "☆",
                    documents: this.text.documents,
                    addDocuments: this.text.add_documents,
                    chat: this.text.chat,
                    group: this.text.group,
                    addGroup: this.text.add_group,
                    onFavorite: (event) => this.events.onFavorite(event, course),
                    onToggleAccItem: (event) => this.events.onToggleAccordionItem(event),
                    onAddDocument: (event) => this.events.onAddDocument(event, course),
                });

                if (tabMode === "saved") {
                    $.append(this.element.querySelector("#tab-saved .accordion"), courseItem);
                } else {
                    $.append(this.element.querySelector("#tab-all .accordion"), courseItem);
                }
            });
        };
    },
}
