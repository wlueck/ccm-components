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
        "chats_store": ["ccm.store", {"url": "https://ccm2.inf.h-brs.de", "name": "wlueck2s_learning_exchange_chats"}],
        "curriculum": ["ccm.store", {"url": "https://ccm2.inf.h-brs.de", "name": "wlueck2s_curriculum"}],
        "groups_store": ["ccm.store", {"url": "https://ccm2.inf.h-brs.de", "name": "wlueck2s_learning_exchange_groups"}],
        "materials_store": ["ccm.store", {"url": "https://ccm2.inf.h-brs.de", "name": "wlueck2s_learning_exchange_materials"}],
        "saved_courses_store": ["ccm.store", {"url": "https://ccm2.inf.h-brs.de", "name": "wlueck2s_learning_exchange_saved_courses"}],

        // components
        "chat": ["ccm.component", "https://ccmjs.github.io/akless-components/chat/ccm.chat.js"],
        "star_rating": ["ccm.component", "https://ccmjs.github.io/tkless-components/star_rating/versions/ccm.star_rating-5.0.0.js"],
        "star_rating_result": ["ccm.component", "https://ccmjs.github.io/tkless-components/star_rating_result/versions/ccm.star_rating_result-4.0.0.js"],
        "team_project": ["ccm.component", "https://ccmjs.github.io/akless-components/team_project/ccm.team_project.js"],

        "css": ["ccm.load", "./resources/styles.css"],
        "helper": ["ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-7.2.0.mjs"],
        "html": ["ccm.load", "./resources/templates.html"],
        "onchange": event => console.log(event),
        "user": ["ccm.instance", "https://ccmjs.github.io/akless-components/user/ccm.user.js"],
        "text": ["ccm.load", {"url": "./resources/resources.js#de", "type": "module"}],
    },

    Instance: function () {
        let user, curriculum, materials, savedCourses, $;

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

            // init savedCourses, curriculum and materials
            savedCourses = await this.saved_courses_store.get(user.key);
            if (!savedCourses) {
                console.error('Saved courses not found in store');
                await this.saved_courses_store.set({key: user.key, value: []});
                savedCourses = await this.saved_courses_store.get(user.key);
            }
            savedCourses = savedCourses.value;

            curriculum = await this.curriculum.get('curriculum');
            if (!curriculum) {
                console.error('Curriculum not found in store');
            }
            curriculum = curriculum.value

            materials = await this.materials_store.get('materials');
            if (!materials) {
                console.error('Materials not found in store');
                await this.materials_store.set({key: 'materials', value: []});
                materials = await this.materials_store.get('materials');
            }
            materials = materials.value;

            await this.initMainContent();
        };

        this.getValue = () => {
            return {savedCourses: savedCourses, materials: materials};
        }

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
                await this.saved_courses_store.set({key: user.key, value: savedCourses});
                this.onchange && this.onchange({name: isSaved? 'removedCourseFromFavorite' : 'addedCourseToFavorite', instance: this, course: course});
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
            onAddDocument: (event, course) => {
                const modal = this.element.querySelector('#upload-document-modal') || $.html(this.html.upload_document_modal, {
                    headlineAddDocument: this.text.headline_add_document,
                    title: this.text.document_title,
                    description: this.text.document_description,
                    documentFile: this.text.document_file,
                    cancel: this.text.cancel,
                    submit: this.text.submit,
                    onCancelUpload: () => modal.close(),
                    onSubmitUpload: (event) => this.events.onSubmitUpload(event, course),
                });
                if (!this.element.querySelector('#upload-document-modal')) {
                    $.append(this.element.querySelector('#main'), modal);
                } else {
                    this.element.querySelector('#upload-form').reset();
                }
                modal.showModal();
            },
            onSubmitUpload: async (event, course) => {
                event.preventDefault();
                event.stopPropagation();
                const form = this.element.querySelector('#upload-form');
                const title = form.title.value;
                const file = form.file.value;
                const description = form.description.value;

                if (!title || !file) {
                    alert('Bitte Titel und Datei angeben!');
                    return;
                }
                const newMaterial = {
                    id: 'material_' + $.generateKey(),
                    course_id: course.id,
                    title: title,
                    description: description,
                    file_url: file,
                    uploader: user.key,
                    upload_date: new Date().toISOString(),
                };
                materials.push(newMaterial);
                await this.materials_store.set({key: 'materials', value: materials});
                this.onchange && this.onchange({name: 'addedMaterial', instance: this, newMaterial: newMaterial});
                this.element.querySelector('#upload-document-modal').close();
                await this.addMaterial(newMaterial, this.element.querySelector(`#tab-all #course-item-${course.id}`));
                await this.addMaterial(newMaterial, this.element.querySelector(`#tab-saved #course-item-${course.id}`));
            },
            onDeleteDocument: async (material) => {
                materials = materials.filter(m => m.id !== material.id);
                // remove material and stars
                await this.materials_store.set({key: 'materials', value: materials});
                await this.materials_store.del(material.id);
                this.onchange && this.onchange({name: 'deletedMaterial', instance: this, deletedMaterial: material});
                this.element.querySelectorAll(`#document-item-${material.id}`).forEach(e => e.remove());
            }
        }

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
                onChangeSemester: (event) => this.events.onChangeSemester(event),
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
            for (const course of courses) {
                let courseItem = this.ccm.helper.html(this.html.course_item, {
                    courseTitle: course.title,
                    courseId: course.id,
                    star: savedCourses?.some(savedCourse => savedCourse.course_id === course.id) ? '★' : '☆',
                    documents: this.text.documents,
                    addDocuments: this.text.add_documents,
                    chat: this.text.chat,
                    group: this.text.group,
                    onFavorite: (event) => this.events.onFavorite(event, tabMode, course, courseItem),
                    onToggleAccItem: (event) => this.events.onToggleAccordionItem(event),
                    onAddDocument: (event) => this.events.onAddDocument(event, course),
                });

                if (tabMode === 'saved') {
                    $.append(this.element.querySelector('#tab-saved .accordion'), courseItem);
                } else {
                    $.append(this.element.querySelector('#tab-all .accordion'), courseItem);
                }

                // Add existing documents to the content
                const courseMaterials = materials.filter(material => material.course_id === course.id);
                for (const material of courseMaterials) {
                    await this.addMaterial(material, courseItem);
                }

                // Initialize team-project component
                const teamProjectComponent = await this.team_project.start({
                    "data": {"store": this.groups_store, "key": "group_project_" + course.id},
                    "user": this.user ? ['ccm.instance', this.user.component.url, JSON.parse(this.user.config)] : '',
                    "teambuild": {
                        "title": "Gruppen",
                        "app": ["ccm.component", "https://ccmjs.github.io/akless-components/teambuild/versions/ccm.teambuild-5.2.0.js", {"text.team": "Gruppe"}]
                    },
                    "tools.1.app.2": {
                        "ignore": {
                            "card": {
                                "component": "https://ccmjs.github.io/akless-components/kanban_card/versions/ccm.kanban_card-4.1.0.js",
                            }
                        }
                    }
                });
                $.setContent(courseItem.querySelector('#accordion-item-content-group'), teamProjectComponent.root);

                // Initialize chat component
                const chatComponent = await this.chat.start({
                    "data": {"store": this.chats_store, "key": 'chat_' + course.id},
                    "user": this.user ? ['ccm.instance', this.user.component.url, JSON.parse(this.user.config)] : '',
                });
                $.setContent(courseItem.querySelector('#accordion-item-content-chat'), chatComponent.root);
            }
        };

        this.addMaterial = async (material, courseItem) => {
            const documentItem = $.html(this.html.document_item, {
                documentId: material.id,
                title: material.title,
                description: material.description || '',
                uploadDate: new Date(material.upload_date).toLocaleDateString('de-DE'),
                fileUrl: material.file_url,
                deleteDocumentClass: material.uploader === user.key ? 'delete-document' : 'unseen',
                onDeleteDocument: () => this.events.onDeleteDocument(material)
            });
            $.append(courseItem.querySelector('#accordion-item-content-documents'), documentItem);

            // Initialize star-rating components
            const result = await this.star_rating_result.start({
                "data": {"store": this.materials_store, "key": material.id},
                "detailed": false,
                "user": this.user ? ['ccm.instance', this.user.component.url, JSON.parse(this.user.config)] : '',
            });
            const star = await this.star_rating.start({
                "data": {"store": this.materials_store, "key": material.id},
                "onchange": result.start,
                "user": this.user ? ['ccm.instance', this.user.component.url, JSON.parse(this.user.config)] : '',
            });
            $.setContent(documentItem.querySelector('.star-rating'), star.root);
            $.prepend(documentItem.querySelector('.star-rating-result'), result.root);
        }
    },
}
