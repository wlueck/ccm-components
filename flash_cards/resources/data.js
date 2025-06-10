await this.store.set({
    key: "wlueck2s", value: {
        sortPreference: "title",
        settings: {
            language: this.defaultLanguage,
            statusDisplay: 'count',
            defaultCardOrder: 'original',
            defaultCardSelection: 'all',
            skipLearningDialog: false
        },
        courses: [
            {
                id: "d6641658-2c82-4a5e-ae56-89af97b70bba",
                title: "Einführung in die Programmierung",
                deadline: "15.12.2025",
                sortPreference: "title",
                cardDecks: [
                    {
                        id: "b5c49d19-0dc9-4b9f-b3cb-e6918400aefa",
                        title: "Variablen und Datentypen",
                        description: "Grundlagen zu Variablen und Datentypen in der Programmierung.",
                        deadline: "15.11.2025",
                        cards: [
                            {
                                id: "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
                                question: "Was ist eine Variable?",
                                answer: "Eine Variable ist ein Speicherplatz im Arbeitsspeicher, der einen Wert enthält.",
                                currentStatus: "easy",
                                status: ["easy"]
                            },
                            {
                                id: "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
                                question: "Wie viele Bit sind 1 Byte?",
                                answer: "8 Bit",
                                currentStatus: "easy",
                                status: ["easy"]
                            },
                            {
                                id: "c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
                                question: "Was ist ein Array?",
                                answer: "Ein Array ist eine Datenstruktur, die eine geordnete Sammlung von Elementen gleichen Typs enthält.",
                                currentStatus: "hard",
                                status: ["hard"]
                            }
                        ]
                    },
                    {
                        id: "d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
                        title: "Compiler und Interpreter",
                        description: "Unterschiede und Funktionsweise von Compiler und Interpreter.",
                        deadline: "15.11.2025",
                        cards: [
                            {
                                id: "e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
                                question: "Was ist der Unterschied zwischen Compiler und Interpreter?",
                                answer: "Ein Compiler übersetzt den gesamten Quellcode in Maschinencode, bevor das Programm ausgeführt wird. Ein Interpreter führt den Code Zeile für Zeile aus.",
                                currentStatus: "medium",
                                status: ["medium"]
                            },
                            {
                                id: "f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c",
                                question: "Wozu wird ein Compiler benötigt?",
                                answer: "Ein Compiler wird benötigt, um den Quellcode in Maschinencode zu übersetzen, damit das Programm ausgeführt werden kann.",
                                currentStatus: "medium",
                                status: ["medium"]
                            }
                        ]
                    },
                    {
                        id: "a7b8c9d0-e1f2-4a3b-5c6d-7e8f9a0b1c2d",
                        title: "Algorithmen",
                        description: "",
                        deadline: "",
                        cards: [
                            {
                                id: "b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e",
                                question: "Was ist ein Algorithmus?",
                                answer: "Ein Algorithmus ist eine eindeutige Handlungsvorschrift zur Lösung eines Problems oder einer Klasse von Problemen in endlich vielen Schritten.",
                                currentStatus: "hard",
                                status: ["hard"]
                            }
                        ]
                    }
                ]
            },
            {
                id: "c9d0e1f2-a3b4-4c5d-6e7f-9a0b1c2d3e4f",
                title: "Diskrete Mathematik & Lineare Algebra",
                sortPreference: "deadline",
                cardDecks: [
                    {
                        id: "d0e1f2a3-b4c5-4d6e-7f8a-0b1c2d3e4f5a",
                        title: "Vektoren",
                        description: "Grundlagen zu Vektoren und Vektorräumen.",
                        deadline: "15.01.2026",
                        cards: [
                            {
                                id: "e1f2a3b4-c5d6-4e7f-8a9b-1c2d3e4f5a6b",
                                question: "Was ist ein Vektor?",
                                answer: "Ein Vektor ist ein Element eines Vektorraums.",
                                currentStatus: "hard",
                                status: ["hard"]
                            },
                            {
                                id: "f2a3b4c5-d6e7-4f8a-9b0c-2d3e4f5a6b7c",
                                question: "Wie berechnet man das Skalarprodukt zweier Vektoren?",
                                answer: "Das Skalarprodukt zweier Vektoren ist das Produkt der Längen der Vektoren und des Kosinus des Winkels zwischen ihnen.",
                                currentStatus: "hard",
                                status: ["hard"]
                            }
                        ]
                    },
                    {
                        id: "a3b4c5d6-e7f8-4a9b-0c1d-3e4f5a6b7c8d",
                        title: "Matrizen",
                        description: "Berechnungen und Eigenschaften von Matrizen.",
                        deadline: "15.11.2025",
                        cards: [
                            {
                                id: "b4c5d6e7-f8a9-4b0c-1d2e-4f5a6b7c8d9e",
                                question: "Wie berechnet man die Determinante einer 2x2-Matrix?",
                                answer: "Die Determinante einer 2x2-Matrix ist das Produkt der Hauptdiagonale minus das Produkt der Nebendiagonale.",
                                currentStatus: "hard",
                                status: ["hard"]
                            }
                        ]
                    }
                ]
            },
            {
                id: "c5d6e7f8-a9b0-4c1d-2e3f-5a6b7c8d9e0f",
                title: "Logik",
                description: "Grundlagen der Logik und Aussagenlogik.",
                deadline: "15.10.2025",
                sortPreference: "title",
                cardDecks: [
                    {
                        id: "d6e7f8a9-b0c1-4d2e-3f4a-6b7c8d9e0f1a",
                        title: "Aussagenlogik",
                        description: "Grundlagen der Aussagenlogik.",
                        deadline: "15.11.2025",
                        cards: [
                            {
                                id: "e7f8a9b0-c1d2-4e3f-4a5b-7c8d9e0f1a2b",
                                question: "Was ist eine Aussage?",
                                answer: "Eine Aussage ist ein Satz, der wahr oder falsch sein kann.",
                                currentStatus: "hard",
                                status: ["hard"]
                            },
                            {
                                id: "f8a9b0c1-d2e3-4f4a-5b6c-8d9e0f1a2b3c",
                                question: "Was ist eine Konjunktion?",
                                answer: "Eine Konjunktion ist eine Verknüpfung von zwei Aussagen mit dem logischen Operator 'und'.",
                                currentStatus: "hard",
                                status: ["hard"]
                            }
                        ]
                    }
                ]
            }
        ]
    }
});