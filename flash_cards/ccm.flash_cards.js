/**
 * @overview ccm component for flash cards
 * @author Wiete Lück <wiete.lueck@gmail.com>, 2025
 * @license The MIT License (MIT)
 */

ccm.files["ccm.flash_cards.js"] = {
    name: "flash-cards",
    //ccm: "https://ccmjs.github.io/ccm/ccm.js",
    ccm: "../libs/ccm-master/ccm.js",
    config: {
        store: ["ccm.store", {url:"https://ccm2.inf.h-brs.de", name:"wlueck2s_mycollection"}],
        cardDecks: [
            {
                title: "Informatik",
                description: "Karteikarten zur Vorlesung Informatik inklusive Übungen. Zur Vorbereitung auf die Klausur.",
                cards: [
                    {
                        id: 0,
                        question: "Wie viele bit sind 1 byte",
                        answer: "8 bit"
                    },
                    {
                        id: 1,
                        question: "Was ist der Unterschied zwischen Compiler und Interpreter?",
                        answer: "Ein Compiler übersetzt den gesamten Quellcode in Maschinencode, bevor das Programm ausgeführt wird. Ein Interpreter führt den Code Zeile für Zeile aus."
                    },
                    {
                        id: 2,
                        question: "Text Text Text Text Text Text Text ",
                        answer: "Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text "
                    }
                ]
            },
            {
                title: "Elektrotechnik",
                description: "TextTextTextTextTextTextTextTextTextTex ",
                cards: [
                    {
                        id: 0,
                        question: "Was ist Spannung?",
                        answer: "Spannung ist die Differenz des elektrischen Potentials zwischen zwei Punkten."
                    },
                    {
                        id: 1,
                        question: "Was misst ein Multimeter?",
                        answer: "Ein Multimeter misst Strom, Spannung und Widerstand."
                    }
                ]
            }
        ],

        css: ["ccm.load", "../flash_cards/resources/styles.css"],
        html: ["ccm.load", "../flash_cards/resources/template.html"],

        user: ["ccm.start", "../libs/fb02user/ccm.fb02user.js"],
        //list: ["ccm.instance", "../flash_cards_list/ccm.flash_cards_list.js"],
    },

    Instance: function () {

        this.start = async () => {
            this.element.innerHTML = this.html;

            this.element.querySelector('#user').append(this.user.root);
            let user;
            /*
            try {
                user = await this.user.getValue();
                if (!user) {
                    console.log("User is not logged in");
                    return;
                }
            } catch (e) {
                console.log("User is not logged in: ", e);
                return;
            }
             */

            //const dataset = await this.store.get(user.key);
            let dataset = await this.store.get("wlueck2s");
            if (!dataset) {
                console.log("No dataset found");
                return;
            }
            dataset = dataset.value;

            const initShowQuestionButton = (currentCard) => {
                this.element.querySelector('#question_answer_text').innerHTML = currentCard.question;
                this.element.querySelector('#turn_around_button').onclick = function () {
                    initShowAnswerButton(currentCard)
                };
                this.element.querySelector('#difficulty_buttons').classList.remove('answerStyle');
                this.element.querySelector('#difficulty_buttons').classList.add('questionStyle');
            }

            const initShowAnswerButton = (currentCard) => {
                this.element.querySelector('#question_answer_text').innerHTML = currentCard.answer;
                this.element.querySelector('#turn_around_button').onclick = function () {
                    initShowQuestionButton(currentCard)
                };
                this.element.querySelector('#difficulty_buttons').classList.remove('questionStyle');
                this.element.querySelector('#difficulty_buttons').classList.add('answerStyle');
            }

            const loadCard = (cardDeck, cardIndex) => {
                const currentCard = cardDeck.cards[cardIndex];
                this.element.querySelector('#current_card_number').innerHTML = (cardIndex+ 1).toString()
                this.element.querySelector('#question_answer_text').innerHTML = currentCard.question;

                this.element.querySelector('#difficulty_buttons').classList.remove('answerStyle');
                this.element.querySelector('#difficulty_buttons').classList.add('questionStyle');

                this.element.querySelector('#turn_around_button').onclick = function () {
                    initShowAnswerButton(currentCard)
                };
                this.element.querySelector('#next_card_button').onclick = function () {
                    loadCard(cardDeck, cardIndex + 1)
                };
                this.element.querySelector('#previous_card_button').onclick = function () {
                    loadCard(cardDeck, cardIndex - 1)
                };
            };

            const loadCardDeck = (course, cardDeck) => {
                this.element.querySelector(".headline").innerHTML = cardDeck.title;
                this.element.querySelector(".sub-headline").innerHTML = "(" + course.title + ")";
                this.element.querySelector('#description').innerHTML = cardDeck.description;
                this.element.querySelector('#max_number_cards').innerHTML = cardDeck.cards.length.toString();
                loadCard(cardDeck, 0);
            };

            loadCardDeck(dataset[0], dataset[0].cardDecks[0]);
        };
    }
};
