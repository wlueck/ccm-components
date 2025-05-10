/**
 * @overview ccm component for learning exchange
 * @author Wiete Lück <wiete.lueck@gmail.com>, 2025
 * @license The MIT License (MIT)
 */

ccm.files["ccm.learning_exchange.js"] = {
    name: "learning-exchange",
    ccm: "https://ccmjs.github.io/ccm/ccm.js",
    config: {
        //store: ["ccm.store", {url: "https://ccm2.inf.h-brs.de", name: "wlueck2s_learning_exchange"}],

        dataset: [
            {
                course_of_study_title: "Bachelor Informatik",
                course_of_study_abbreviation: "BI",
                semesters: 6,
                courses: [
                    {title: "Programmierung 1", semester: 1},
                    {title: "Netze", semester: 1},
                    {title: "Techniche Informatik", semester: 1},
                    {title: "Mathematische Grundlagen und Lineare Algebra", semester: 1},

                    {title: "Analysis", semester: 2},
                    {title: "Algorithmen, Datenstrukturen und Graphentheorie", semester: 2},
                    {title: "Programmierung 2", semester: 2},
                    {title: "Datenbanken", semester: 2},
                    {title: "Systemnahe Programmierung", semester: 2},

                    {title: "Wahrscheinlichkeitstheorie und Statistik", semester: 3},
                    {title: "Automatentheorie und Formale Sprachen", semester: 3},
                    {title: "Software Engineering 1", semester: 3},
                    {title: "IT-Sicherheit", semester: 3},
                    {title: "Betriebssysteme", semester: 3},
                    {title: "Informatik-Projekt", semester: 3},

                    {title: "Berechenbarkeit und Komplexität", semester: 4},
                    {title: "Software Engineering 2", semester: 4},
                    {title: "", semester: 4},

                    {title: "", semester: 5},
                    {title: "", semester: 5},

                    {title: "Praxisprojekt", semester: 6},
                    {title: "Thesis", semester: 6}
                    ]
            },
            {
                course_of_study_title: "Master Informatik",
                course_of_study_abbreviation: "MI",
                semesters: 4,
                courses: [
                    {title: "Advanced Programming", semester: 1},
                    {title: "Mathematik für Informatiker", semester: 1},
                    {title: "Datenbanken II", semester: 2},
                    {title: "Software Engineering II", semester: 2},
                    {title: "IT-Sicherheit II", semester: 3},
                    {title: "Künstliche Intelligenz II", semester: 3},
                    {title: "Softwareprojekt II", semester: 4},
                    {title: "Masterarbeit", semester: 4}
                ]
            },
            {
                course_of_study_title: "Bachelor Wirtschaftsinformatik",
                course_of_study_abbreviation: "BWI",
                semesters: 6,
                courses: [
                    {title: "Programmierung 1", semester: 1},
                    {title: "Netze", semester: 1},
                    {title: "Techniche Informatik", semester: 1},
                    {title: "Mathematische Grundlagen und Lineare Algebra", semester: 1},
                ],
            },
            {
                course_of_study_title: "Bachelor Cyber Security & Privacy",
                course_of_study_abbreviation: "BCSP",
                semesters: 6
            },
        ],


        css: ["ccm.load", "./resources/styles.css"],
        html: {
            template: ["ccm.load", "./resources/template.html"],
        },
        accordion: [ "ccm.component", "https://ccmjs.github.io/tkless-components/accordion/versions/ccm.accordion-2.0.0.js" ],
        chat: ["ccm.component", "https://ccmjs.github.io/akless-components/chat/ccm.chat.js"],
        //user: ["ccm.start", "../libs/fb02user/ccm.fb02user.js"],
        "user": ["ccm.instance", "https://ccmjs.github.io/akless-components/user/ccm.user.js"]
    },

    Instance: function () {
        let user;

        this.init = async () => {
            if (this.user) this.user.onchange = this.start;
        }

        this.start = async () => {
            this.element.innerHTML = this.html.template;

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

            this.initMainView();
        }

        this.initMainView = () => {
            const courseOfStudySelect = this.element.querySelector("#course-of-study");
            const semesterSelect = this.element.querySelector("#semester");

            // init courseOfStudySelect
            this.dataset.forEach(courseOfStudy => {
                const option = document.createElement("option");
                option.value = courseOfStudy.course_of_study_abbreviation;
                option.textContent = courseOfStudy.course_of_study_title;
                courseOfStudySelect.appendChild(option);
            });

            // initial semesterSelect and accordion
            this.updateSemesterOptions(this.dataset[0]);
            this.updateAccordion(this.dataset[0], 1);

            courseOfStudySelect.addEventListener("change", () => {
                const selectedCourseOfStudy = this.dataset.find(courseOfStudy => courseOfStudy.course_of_study_abbreviation === courseOfStudySelect.value);
                const selectedSemester = parseInt(semesterSelect.value);
                this.updateSemesterOptions(selectedCourseOfStudy);
                this.updateAccordion(selectedCourseOfStudy, selectedSemester);
            });

            semesterSelect.addEventListener("change", () => {
                const selectedCourseOfStudy = this.dataset.find(courseOfStudy => courseOfStudy.course_of_study_abbreviation === courseOfStudySelect.value);
                const selectedSemester = parseInt(semesterSelect.value);
                this.updateAccordion(selectedCourseOfStudy, selectedSemester);
            });
        }

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

        this.updateAccordion = (selectedCourseOfStudy, selectedSemester) => {
            this.element.querySelector(".accordion").innerHTML = "";

            let config = { entries: [] };
            config.color = "#f0f0f0";

            const coursesInSemester = selectedCourseOfStudy.courses.filter(c => c.semester === selectedSemester);
            coursesInSemester.forEach(course => {
                if (course.title) {
                    const innerConfig = {
                        entries: [
                            {
                                title: '📖 Lernunterlagen',
                                content: '<div class="accordion-content-item" id="add_document">+ Unterlagen hinzufügen</div><hr>'
                            },
                            {
                                title: '💬 Chat',
                                content: '<div class="accordion-content-item" id="chat"></div>'
                            },
                            {
                                title: '👥Lerngruppen',
                                content: '<div class="accordion-content-item" id="add_group">+ Lerngruppe erstellen</div><hr>'
                            }
                        ],
                        color: "#f0f0f0"
                    };

                    const courseContent = document.createElement('div');
                    this.accordion.start({...innerConfig, root: courseContent}).then(() => {
                        const entry = {
                            title: course.title,
                            content: courseContent
                        };
                        config.entries.push(entry);
                        if (config.entries.length === coursesInSemester.length) {
                            config.root = this.element.querySelector(".accordion");
                            this.accordion.start(config);
                        }
                    });

                    /*
                    //this.element.querySelector("#chat").append(this.chat.root);
                    //this.chat.start();
                    //this.chat.start( { root: this.element.querySelector("#content") } );
                    await this.chat.start({
                        root: this.element.querySelector("#chatAcc"),
                        //data: {
                        //store: [ 'ccm.store', settings ],
                        //key: key
                        //},
                        //members: Object.keys( team_data.members ).sort(),
                        user: this.user  /*[ 'ccm.instance', this.user.component.url, JSON.parse( this.user.config ) ]
                    });
                    */
                }
            });
        };
    }
}
