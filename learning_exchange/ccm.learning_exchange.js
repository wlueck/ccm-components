/**
 * @overview ccm component for learning exchange
 * @author Wiete Lück <wiete.lueck@gmail.com>, 2025
 * @license The MIT License (MIT)
 */

ccm.files["ccm.learning_exchange.js"] = {
    name: "learning-exchange",
    ccm: "https://ccmjs.github.io/ccm/ccm.js",
    config: {
        // stores
        "curriculum": {"store": ["ccm.store", {"url": "https://ccm2.inf.h-brs.de", "name": "wlueck2s_curriculum"}], "key": "curriculum"},
        //"data": {"store": [ "ccm.store" ]},
        "data": {"store": ["ccm.store", {"url": "https://ccm2.inf.h-brs.de", "name": "wlueck2s_learning_exchange"}], "key": "learning_exchange"},

        // components
        "chat": ["ccm.component", "https://ccmjs.github.io/akless-components/chat/ccm.chat.js"],
        "documents": ["ccm.component", "https://wlueck.github.io/ccm-components/documents/ccm.documents.js"],
        "star_rating": ["ccm.component", "https://ccmjs.github.io/tkless-components/star_rating/versions/ccm.star_rating-5.0.0.js"],
        "star_rating_result": ["ccm.component", "https://ccmjs.github.io/tkless-components/star_rating_result/versions/ccm.star_rating_result-4.0.0.js"],
        "team_project": ["ccm.component", "https://ccmjs.github.io/akless-components/team_project/ccm.team_project.js"],

        "css": ["ccm.load", "./resources/styles.css"],
        "helper": ["ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-7.2.0.mjs"],
        "html": ["ccm.load", "./resources/templates.html"],
        "onchange": event => console.log(event),
        "user": ["ccm.instance", "https://ccmjs.github.io/akless-components/user/ccm.user.js"],
        "text": ["ccm.load", {"url": "./resources/resources.js#de", "type": "module"}]
    },

    Instance: function () {
        let user, curriculum, savedCourses, $;
        this.componentInstances = {
            chat: new Map(),
            documents: new Map()
        };

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

            user = await this.user.getValue();
            if (!user) {
                alert(this.text.login_warning);
                console.log('User is not logged in');
                return;
            }

            // init savedCourses and curriculum
            savedCourses = await this.data.store.get(user.key);
            if (!savedCourses) {
                console.error('Saved courses not found in store');
                await this.data.store.set({key: user.key, value: []});
                savedCourses = await this.data.store.get(user.key);
            }
            savedCourses = savedCourses.value;

            curriculum = await this.curriculum.store.get(this.curriculum.key);
            if (!curriculum) {
                console.error('Curriculum not found in store');
            }
            curriculum = curriculum.value;

            console.log(await this.data.store.get())

            await this.initMainContent();
        };

        this.getValue = () => {
            return {savedCourses: savedCourses};
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
            onChangeCourseOfStudy: async (event) => {
                const selectedCourseOfStudy = curriculum.find(courseOfStudy => courseOfStudy.course_of_study_abbreviation === event.target.value);
                this.updateSemesterOptions(selectedCourseOfStudy);
                await this.updateAccordion('all', selectedCourseOfStudy, 1);
            },
            onChangeSemester: async (event) => {
                const selectedCourseOfStudy = curriculum.find(courseOfStudy => courseOfStudy.course_of_study_abbreviation === this.element.querySelector('#course-of-study').value);
                const selectedSemester = parseInt(event.target.value);
                await this.updateAccordion('all', selectedCourseOfStudy, selectedSemester);
            },
            onFavorite: async (event, tabMode, course, courseItem) => {
                event.stopPropagation();
                const isSaved = savedCourses?.some(savedCourse => savedCourse.course_id === course.id);
                if (isSaved) {
                    savedCourses = savedCourses?.filter(savedCourse => savedCourse.course_id !== course.id);
                } else {
                    savedCourses.push({course_id: course.id});
                }
                await this.data.store.set({key: user.key, value: savedCourses});
                this.onchange && this.onchange({
                    name: isSaved ? 'removedCourseFromFavorite' : 'addedCourseToFavorite',
                    instance: this,
                    course: course
                });
                if (tabMode === 'saved') {
                    $.setContent(this.element.querySelector(`#tab-all #favorite-${course.id}`), isSaved ? '☆' : '★');
                    if (isSaved) courseItem.remove();
                } else {
                    $.setContent(this.element.querySelector(`#tab-all #favorite-${course.id}`), isSaved ? '☆' : '★');
                    if (isSaved) this.element.querySelector(`#tab-saved #course-item-${course.id}`).remove();
                    else await this.updateAccordion('saved')
                }
            },
            onToggleAccordionItem: (event) => {
                event.stopPropagation();
                const toggle = event.currentTarget.closest('.accordion-item-toggle');
                const content = toggle.nextElementSibling;
                if (content && content.classList.contains('accordion-item-content')) {
                    content.classList.toggle('hidden');
                }
            },
        };

        this.initMainContent = async () => {
            $.setContent(this.element.querySelector('#content'), $.html(this.html.main_content, {
                allCourses: this.text.all_courses,
                savedCourses: this.text.saved_courses,
                onTabAll: () => this.events.onSwitchTab('all'),
                onTabSaved: () => this.events.onSwitchTab('saved'),
                courseOfStudy: this.text.course_of_study,
                courseOfStudyOptions: curriculum.map(c => `<option value="${c.course_of_study_abbreviation}">${c.course_of_study_title}</option>`).join(''),
                onChangeCourseOfStudy: (event) => this.events.onChangeCourseOfStudy(event),
                semester: this.text.semester,
                onChangeSemester: (event) => this.events.onChangeSemester(event)
            }));

            this.updateSemesterOptions(curriculum[0]);
            await this.updateAccordion('all', curriculum[0], 1);
            await this.updateAccordion('saved');
        };

        this.updateSemesterOptions = (selectedCourseOfStudy) => {
            const semesterSelect = this.element.querySelector('#semester');
            semesterSelect.innerHTML = '';
            for (let i = 0; i < selectedCourseOfStudy.semesters; i++) {
                const option = document.createElement('option');
                option.value = (i + 1).toString();
                option.textContent = 'Semester ' + (i + 1);
                semesterSelect.appendChild(option);
            }
        };

        this.updateAccordion = async (tabMode, selectedCourseOfStudy, selectedSemester) => {
            let courses = [];
            if (tabMode === 'saved') {
                this.element.querySelector('#tab-saved .accordion').innerHTML = '';
                courses = savedCourses?.map(savedCourse => {
                    return curriculum.flatMap(courseOfStudy => courseOfStudy.courses)
                        .find(course => course.id === savedCourse.course_id);
                }).filter(course => course);
            } else if (tabMode === 'all') {
                this.element.querySelector('#tab-all .accordion').innerHTML = '';
                courses = selectedCourseOfStudy.courses.filter(c => c.semester === selectedSemester);
            }

            if (!courses || courses.length < 1) {
                if (tabMode === 'saved') {
                    $.setContent(this.element.querySelector('#tab-saved .accordion'), this.text.no_courses_available);
                } else {
                    $.setContent(this.element.querySelector('#tab-all .accordion'), this.text.no_courses_available);
                }
                return;
            }

            const container = this.element.querySelector(`#tab-${tabMode} .accordion`);
            for (const course of courses) {
                const courseItem = $.html(this.html.course_item, {
                    courseTitle: course.title,
                    courseId: course.id,
                    star: savedCourses?.some(savedCourse => savedCourse.course_id === course.id) ? '★' : '☆',
                    documents: this.text.documents,
                    addDocuments: this.text.add_documents,
                    chat: this.text.chat,
                    group: this.text.group,
                    onFavorite: (event) => this.events.onFavorite(event, tabMode, course, courseItem),
                    onToggleAccItem: (event) => this.events.onToggleAccordionItem(event),
                });
                $.append(container, courseItem);

                // Initialize documents component
                const documentsKey = `${tabMode}_${course.id}`;
                const otherDocumentsKey = tabMode === 'saved' ? `all_${course.id}` : `saved_${course.id}`;
                let documentsComponent = this.componentInstances.documents.get(documentsKey);
                if (!documentsComponent) {
                    documentsComponent = await this.documents.start({
                        "data": {"store": this.data.store, "key": this.data.key + "_documents_" + course.id},
                        "user": this.user ? ['ccm.instance', this.user.component.url, JSON.parse(this.user.config)] : '',
                        "hide_login": true,
                        "onchange": async () => {
                            if (this.componentInstances.documents.get(otherDocumentsKey)) await this.componentInstances.documents.get(otherDocumentsKey).start()
                        }
                    });
                    this.componentInstances.documents.set(documentsKey, documentsComponent);
                }
                $.setContent(courseItem.querySelector('#accordion-item-content-documents'), documentsComponent.root);

                // Initialize team-project component
                let teamProjectComponent = await this.team_project.start({
                    "data": {"store": this.data.store, "key": this.data.key + "_group_project_" + course.id},
                    "user": this.user ? ['ccm.instance', this.user.component.url, JSON.parse(this.user.config)] : '',
                    "teambuild": {
                        "title": "Gruppen",
                        "app": ["ccm.component", "https://ccmjs.github.io/akless-components/teambuild/versions/ccm.teambuild-5.2.0.js", {"text.team": "Gruppe"}]
                    },
                    "tools.1.app.2": {
                        "ignore": {
                            "card": {
                                "component": "https://ccmjs.github.io/akless-components/kanban_card/versions/ccm.kanban_card-4.1.0.js"
                            }
                        }
                    }
                });
                $.setContent(courseItem.querySelector('#accordion-item-content-group'), teamProjectComponent.root);

                // Initialize chat component
                const chatKey = `${tabMode}_${course.id}`;
                const otherChatKey = tabMode === 'saved' ? `all_${course.id}` : `saved_${course.id}`;
                let chatComponent = this.componentInstances.chat.get(chatKey);
                if (!chatComponent) {
                    chatComponent = await this.chat.start({
                        "data": {"store": this.data.store, "key": this.data.key + '_chat_' + course.id},
                        "onchange": async () => {
                            if (this.componentInstances.chat.get(otherChatKey)) await this.componentInstances.chat.get(otherChatKey).start()
                        },
                        "user": this.user ? ['ccm.instance', this.user.component.url, JSON.parse(this.user.config)] : ''
                    });
                    this.componentInstances.chat.set(chatKey, chatComponent);
                }
                $.setContent(courseItem.querySelector('#accordion-item-content-chat'), chatComponent.root);
            }
        };
    }
};