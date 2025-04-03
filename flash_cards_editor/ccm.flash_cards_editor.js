/**
 * @overview ccm component for flash cards editor
 * @author Wiete Lück <wiete.lueck@gmail.com>, 2025
 * @license The MIT License (MIT)
 */

ccm.files["ccm.flash_cards_editor.js"] = {
    name: "flash-cards-editor",
    //ccm: "https://ccmjs.github.io/ccm/ccm.js",
    ccm: "../libs/ccm-master/ccm.js",
    config: {
        store: ["ccm.store", {url:"https://ccm2.inf.h-brs.de", name:"wlueck2s_mycollection"}],

        css: ["ccm.load", "./resources/styles.css"],
        html: ["ccm.load", "./resources/template.html"],

        user: ["ccm.start", "../libs/fb02user/ccm.fb02user.js"],
    },

    Instance: function () {

        this.start = async () => {

            this.element.querySelector("#add_card").addEventListener("click", (event) => {
                event.preventDefault();
                addCard();
            });

            const checkbox = this.element.querySelector('#deadline');
            const textFieldContainer = this.element.querySelector('#deadlineInput');

            checkbox.addEventListener('change', function (event) {
                if (event.currentTarget.checked) {
                    textFieldContainer.classList.remove('hidden');
                } else {
                    textFieldContainer.classList.add('hidden');
                }
            });

            const courseSelect = this.element.querySelector("#course");

            dataset.forEach(course => {
                const option = document.createElement("option");
                option.value = course.title;
                option.textContent = course.title;
                courseSelect.append(option);
            });

            const addCourseBtn = this.element.querySelector("#add-course-btn");
            const addCourseContainer = this.element.querySelector("#add-course-container");
            addCourseBtn.addEventListener("click", async (event) => {
                event.preventDefault();
                addCourseContainer.classList.remove("hidden");
            });

            const submitCourseBtn = this.element.querySelector("#submit-course");
            submitCourseBtn.addEventListener("click", async (event) => {
                event.preventDefault();
                let courseInput = this.element.querySelector("#add-course-input");

                if (courseInput.value === "") {
                    alert("Bitte geben Sie einen Kursnamen ein");
                    return;
                } else if (Array.from(courseSelect.options).filter(option => option.value === courseInput.value).length > 0) {
                    alert("Bitte geben Sie einen neuen Kursnamen ein!");
                    return;
                }
                const option = document.createElement("option");
                option.value = courseInput.value;
                option.textContent = courseInput.value;
                courseSelect.append(option);

                courseInput.value = "";
                addCourseContainer.classList.add("hidden");
            });



            const submitButton = this.element.querySelector("#submit-deck");
            submitButton.addEventListener("click", async (event) => {
                await saveDeck(event);
            });

            const saveDeck = async (event) => {
                const form = this.element.querySelector("#add-card-deck-form");
                if (!form.checkValidity()) {
                    event.preventDefault();
                    alert('Bitte fülle alle erforderlichen Felder aus.');
                    return;
                }
                event.preventDefault();

                const course = form.course.value;

                let newDeck = {id: "", title: form.name.value, description: form.description.value, deadline: form.deadlineInput.value, cards: []};

                const decks = dataset.filter(deck => deck.title === course)[0];
                if (decks && decks.cardDecks.filter(deck => deck.title === newDeck.title).length > 0) {
                    alert("Ein Stapel mit dem Namen existiert bereits! Wählen Sie Bitte einen anderen Namen.");
                    return;
                }

                const cards = this.element.querySelectorAll("#card");
                let valid = true;
                cards.forEach(card => {
                    let question = card.querySelector("#question").value;
                    let answer = card.querySelector("#answer").value;

                    if (question !== "" && answer !== "") {
                        newDeck.cards.push({question: question, answer: answer, status: "hard"});
                    } else if (question !== "" && answer === "" || question === "" && answer !== "") {
                        alert("Bitte füllen Sie alle Felder aus!");
                        valid = false;
                    }

                });

                if (valid) {
                    const isNewCourse = dataset.filter(coursel => coursel.title === course).length === 0;
                    if (isNewCourse) {
                        this.store.set({key: user, value: [...dataset, {title: course, cardDecks: [newDeck]}]});
                    } else {
                        let coursell = dataset.filter(coursel => coursel.title === course)[0];
                        coursell.cardDecks.push(newDeck);
                        this.store.set({key: user, value: dataset});
                    }
                }
            }

            const addCard = () => {
                const htmlCard = `
                    <div id="card">
                        <div class="input-group">
                            <label for="question">Frage:</label>
                            <textarea id="question" name="question" cols="10" rows="3"></textarea>
                        </div>
                        <div class="input-group">
                            <label for="answer">Antwort:</label>
                            <textarea id="answer" name="answer" cols="10" rows="3"></textarea>
                        </div>
                    </div>`;
                this.element.querySelector("#cards").insertAdjacentHTML("beforeend", htmlCard);
            }

        };


    }
};
