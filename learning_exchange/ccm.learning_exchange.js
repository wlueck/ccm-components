/**
 * @overview ccm component for learning exchange
 * @author Wiete Lück <wiete.lueck@gmail.com>, 2025
 * @license The MIT License (MIT)
 */

ccm.files["ccm.learning_exchange.js"] = {
    name: "learning_exchange",
    ccm: "https://ccmjs.github.io/ccm/ccm.js",
    config: {
        // stores
        "curriculum": {"store": ["ccm.store", {"url": "https://ccm2.inf.h-brs.de", "name": "wlueck2s_curriculum"}], "key": "curriculum"},
        "data": {"store": ["ccm.store", {"url": "wss://ccm2.inf.h-brs.de", "name": "wlueck2s_learning_exchange"}], "key": "learning_exchange"},

        // components
        "chat": ["ccm.component", "https://ccmjs.github.io/akless-components/chat/ccm.chat.js"],
        "documents": ["ccm.component", "https://wlueck.github.io/ccm-components/documents/ccm.documents.js"],
        "team_project": ["ccm.component", "https://ccmjs.github.io/akless-components/team_project/ccm.team_project.js"],
        "user": ["ccm.instance", "https://ccmjs.github.io/akless-components/user/ccm.user.js"],

        "css": ["ccm.load", "https://wlueck.github.io/ccm-components/learning_exchange/resources/styles.css"],
        "helper": ["ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-7.2.0.mjs"],
        "html": ["ccm.load", "https://wlueck.github.io/ccm-components/learning_exchange/resources/templates.html"],
        "onchange": event => console.log(event),
        "text": ["ccm.load", {"url": "https://wlueck.github.io/ccm-components/learning_exchange/resources/resources.js#de", "type": "module"}]
    },

    Instance: function () {
        let user, curriculum, savedCourses, courseMap, $;

        this.init = async () => {
            $ = Object.assign({}, this.ccm.helper, this.helper);
            $.use(this.ccm);
            if (this.user) this.user.onchange = this.start;
        };

        this.start = async () => {
            $.setContent(this.element, $.html(this.html.main, {headlineMain: this.text.headline_main}));

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

            courseMap = new Map(
                curriculum.flatMap(courseOfStudy => courseOfStudy.courses)
                    .map(course => [course.id, course])
            );

            await this.initMainContent();
        };

        this.getValue = () => {
            return {savedCourses: savedCourses};
        };

        // event handler
        this.events = {
            onSwitchTab: (tabId) => {
                const otherTabId = tabId === 'all' ? 'saved' : 'all';
                this.element.querySelector(`#tab-${tabId}-button`).classList.add('active');
                this.element.querySelector(`#tab-${otherTabId}-button`).classList.remove('active');
                this.element.querySelector(`#tab-${tabId}`).classList.remove('hidden');
                this.element.querySelector(`#tab-${otherTabId}`).classList.add('hidden');
            },
            onChangeCourseOfStudy: async (event) => {
                const selectedCourseOfStudy = curriculum.find(c => c.course_of_study_abbreviation === event.target.value);
                this.updateSemesterOptions(selectedCourseOfStudy);
                await this.updateAccordion('all', selectedCourseOfStudy, 1);
            },
            onChangeSemester: async (event) => {
                const selectedCourseOfStudy = curriculum.find(c => c.course_of_study_abbreviation === this.element.querySelector('#course-of-study').value);
                await this.updateAccordion('all', selectedCourseOfStudy, parseInt(event.target.value));
            },
            onFavorite: async (event, tabMode, course, courseItem) => {
                event.stopPropagation();
                const savedCourseIndex = savedCourses.findIndex(saved => saved.course_id === course.id);
                const isSaved = savedCourseIndex !== -1;

                if (isSaved) {
                    savedCourses.splice(savedCourseIndex, 1);
                } else {
                    savedCourses.push({course_id: course.id});
                }
                await this.data.store.set({key: user.key, value: savedCourses});
                this.onchange?.({name: isSaved ? 'removedCourseFromFavorite' : 'addedCourseToFavorite', instance: this, course});

                const favoriteIcon = this.element.querySelector(`#tab-all #favorite-${course.id}`);
                if (favoriteIcon) $.setContent(favoriteIcon, isSaved ? '☆' : '★');

                if (isSaved) {
                    if (tabMode === 'saved') {
                        courseItem.remove();
                    } else {
                        this.element.querySelector(`#tab-saved #course-item-${course.id}`)?.remove();
                    }
                } else {
                    await this.renderCourseItem('saved', course);
                }
            },
            onToggleAccItemContent: (event) => {
                const content = event.currentTarget.closest('.accordion-item-toggle').nextElementSibling;
                if (content && content.classList.contains('accordion-item-content')) {
                    content.classList.toggle('hidden');
                }
            },
            onToggleAccItem: async (event, container, tabMode, course) => {
                const toggle = event.currentTarget.closest('.accordion-item-toggle');
                const content = toggle.nextElementSibling;

                if (content && content.classList.contains('accordion-item-content')) {
                    const isHidden = content.classList.contains('hidden');
                    content.classList.toggle('hidden');

                    const isLoaded = toggle.getAttribute('data-loaded') === 'true';
                    if (isHidden && !isLoaded) {
                        toggle.setAttribute('data-loaded', 'true');

                        const userConfig = this.user ? ['ccm.instance', this.user.component.url, JSON.parse(this.user.config)] : '';
                        const documentsComponent = await this.documents.start({
                            "data": {store: this.data.store, key: this.getSubComponentStoreKey("documents", course.id)},
                            "user": userConfig,
                            "hide_login": true,
                            "onchange": async (event) => {
                                console.log(event);
                                await this.renderCourseItem(tabMode === "saved" ? "all" : "saved", course);
                            }
                        });
                        const teamProjectComponent = await this.team_project.start({
                            "data": {store: this.data.store, key: this.getSubComponentStoreKey("group_project", course.id)},
                            "user": userConfig,
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
                        const chatComponent = await this.chat.start({
                            "data": {store: this.data.store, key: this.getSubComponentStoreKey("chat", course.id)},
                            "user": userConfig,
                            "onchange": async (event) => {
                                console.log(event);
                                await this.renderCourseItem( tabMode === "saved" ? "all" : "saved", course);
                            },
                        });
                        $.setContent(content.querySelector('#accordion-item-content-documents'), documentsComponent.root);
                        $.setContent(content.querySelector('#accordion-item-content-group'), teamProjectComponent.root);
                        $.setContent(content.querySelector('#accordion-item-content-chat'), chatComponent.root);
                    }
                }
            }
        };

        this.initMainContent = async () => {
            $.setContent(this.element.querySelector('#content'), $.html(this.html.main_content, {
                allCourses: this.text.all_courses,
                savedCourses: this.text.saved_courses,
                onTabAll: () => this.events.onSwitchTab('all'),
                onTabSaved: () => this.events.onSwitchTab('saved'),
                courseOfStudy: this.text.course_of_study,
                courseOfStudyOptions: curriculum.map(c => `<option value="${c.course_of_study_abbreviation}">${c.course_of_study_title}</option>`).join(''),
                onChangeCourseOfStudy: this.events.onChangeCourseOfStudy,
                semester: this.text.semester,
                onChangeSemester: this.events.onChangeSemester
            }));

            this.updateSemesterOptions(curriculum[0]);
            await this.updateAccordion('all', curriculum[0], 1);
            await this.updateAccordion('saved');
        };

        this.updateSemesterOptions = (selectedCourseOfStudy) => {
            const semesterSelect = this.element.querySelector('#semester');
            semesterSelect.innerHTML = '';
            for (let i = 1; i <= selectedCourseOfStudy.semesters; i++) {
                const option = document.createElement('option');
                option.value = i.toString();
                option.textContent = `Semester ${i}`;
                semesterSelect.appendChild(option);
            }
        };

        this.updateAccordion = async (tabMode, selectedCourseOfStudy, selectedSemester) => {
            const container = this.element.querySelector(`#tab-${tabMode} .accordion`);
            container.innerHTML = '';

            let courses = [];
            if (tabMode === 'saved') {
                courses = savedCourses?.map(savedCourse => courseMap.get(savedCourse.course_id)).filter(Boolean) ?? [];
            } else if (tabMode === 'all') {
                courses = selectedCourseOfStudy.courses.filter(c => c.semester === selectedSemester);
            }

            if (courses.length === 0) {
                $.setContent(container, this.text.no_courses_available);
                return;
            }

            for (const course of courses) {
                await this.renderCourseItem(tabMode, course);
            }
        };

        this.renderCourseItem = async (tabMode, course) => {
            let container = this.element.querySelector(`#tab-${tabMode} .accordion`);
            const isSaved = savedCourses.some(saved => saved.course_id === course.id);
            const courseItem = $.html(this.html.course_item, {
                courseTitle: course.title,
                courseId: course.id,
                star: isSaved ? this.text.filled_star : this.text.empty_star,
                documents: this.text.documents,
                chat: this.text.chat,
                group: this.text.group,
                onFavorite: (event) => this.events.onFavorite(event, tabMode, course, courseItem),
                onToggleAccItem: (event) => this.events.onToggleAccItem(event, container, tabMode, course),
                onToggleAccItemContent: this.events.onToggleAccItemContent,
            });
            const existingItem = container.querySelector(`#course-item-${course.id}`);
            if (existingItem) {
                existingItem.replaceWith(courseItem);
            } else {
                $.append(container, courseItem);
            }
        };

        // Helper method for generating store keys for subcomponents
        this.getSubComponentStoreKey = (keyPrefix, courseId) => `${this.data.key}_${keyPrefix}_${courseId}`;
    }
};