/**
 * @overview ccm component for documents
 * @author Wiete Lück <wiete.lueck@gmail.com>, 2025
 * @license The MIT License (MIT)
 */

ccm.files["ccm.documents.js"] = {
    name: "documents",
    ccm: "https://ccmjs.github.io/ccm/ccm.js",
    config: {
        "css": ["ccm.load", "https://wlueck.github.io/ccm-components/documents/resources/styles.css"],
        "data": {"store": ["ccm.store", {"url": "wss://ccm2.inf.h-brs.de", "name": "wlueck2s_documents"}], "key": "documents"},
        "helper": ["ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-7.2.0.mjs"],
        "hide_login": false,
        "html": ["ccm.load", "https://wlueck.github.io/ccm-components/documents/resources/templates.html"],
        "onchange": event => console.log(event),
        "user": ["ccm.instance", "https://ccmjs.github.io/akless-components/user/ccm.user.js"],
        "star_rating": ["ccm.component", "https://ccmjs.github.io/tkless-components/star_rating/versions/ccm.star_rating-5.0.0.js"],
        "star_rating_result": ["ccm.component", "https://ccmjs.github.io/tkless-components/star_rating_result/versions/ccm.star_rating_result-4.0.0.js"],
        "text": ["ccm.load", {"url": "https://wlueck.github.io/ccm-components/documents/resources/resources.js#de", "type": "module"}],
    },

    Instance: function () {
        let user, documents, $;

        this.init = async () => {
            $ = Object.assign({}, this.ccm.helper, this.helper);
            $.use(this.ccm);
            if (this.user) this.user.onchange = this.start;
        };

        this.start = async () => {
            $.setContent(this.element, $.html(this.html.main));

            if (this.user && !this.hide_login) {
                $.append(this.element.querySelector('#top'), this.user.root);
                this.user.start();
            }

            user = await this.user.getValue();
            if (!user) {
                console.log('User is not logged in');
            }

            // init documents
            documents = await this.data.store.get(this.data.key);
            if (!documents) {
                console.error('Documents not found in store');
                await this.data.store.set({key: this.data.key, value: []});
                documents = await this.data.store.get(this.data.key);
            }
            documents = documents.value;

            for (const document of documents) {
                await this.renderDocument(document);
            }
            if (this.user && this.user.isLoggedIn()) {
                $.setContent(this.element.querySelector('#add-document'), $.html(this.html.upload_button, {
                    addDocument: this.text.add_document,
                    onAddDocument: this.events.onAddDocument
                }));
            }
        };

        this.getValue = () => {
            return documents;
        }

        // event handler
        this.events = {
            onAddDocument: () => {
                const modal = this.element.querySelector('#upload-document-modal') || $.html(this.html.upload_document_modal, {
                    headlineAddDocument: this.text.headline_add_document,
                    title: this.text.document_title,
                    description: this.text.document_description,
                    documentFile: this.text.document_file,
                    cancel: this.text.cancel,
                    submit: this.text.submit,
                    onCancelUpload: () => modal.close(),
                    onSubmitUpload: () => this.events.onSubmitUpload(),
                });
                if (!this.element.querySelector('#upload-document-modal')) {
                    $.append(this.element.querySelector('#main'), modal);
                } else {
                    this.element.querySelector('#upload-form').reset();
                }
                modal.showModal();
            },
            onSubmitUpload: async () => {
                const form = this.element.querySelector('#upload-form');
                const title = form.title.value;
                const file = form.file.value;

                if (!title || !file) {
                    alert(this.text.missing_fields_warning);
                    return;
                }
                const newDocument = {
                    id: 'document_' + $.generateKey(),
                    title: title,
                    description: form.description.value,
                    file_url: file,
                    uploader: user.key,
                    upload_date: new Date().toISOString(),
                };
                documents.push(newDocument);
                await this.data.store.set({key: this.data.key, value: documents});
                this.onchange && this.onchange({name: 'addedDocument', instance: this, newDocument: newDocument});
                this.element.querySelector('#upload-document-modal').close();
                await this.renderDocument(newDocument);
            },
            onDeleteDocument: async (document, documentItem) => {
                if (confirm(this.text.confirm_delete_document)) {
                    documents = documents.filter(m => m.id !== document.id);
                    // remove document and stars from db
                    await this.data.store.set({key: this.data.key, value: documents});
                    await this.data.store.del(this.data.key + document.id);
                    this.onchange && this.onchange({name: 'deletedDocument', instance: this, deletedDocument: document});
                    documentItem.remove();
                }
            }
        }

        this.renderDocument = async (document) => {
            const documentItem = $.html(this.html.document_item, {
                documentId: document.id,
                title: document.title,
                description: document.description || '',
                uploadDate: new Date(document.upload_date).toLocaleDateString('de-DE'),
                fileUrl: document.file_url,
                deleteDocumentClass: document.uploader === user?.key ? '' : 'unseen',
                deleteDocumentIcon: this.text.deleteDocumentIcon,
                onDeleteDocument: () => this.events.onDeleteDocument(document, documentItem)
            });
            $.append(this.element.querySelector('#document-list'), documentItem);

            // Initialize star-rating components
            const result = await this.star_rating_result.start({
                "data": {"store": this.data.store, "key": this.data.key + document.id},
                "detailed": false,
                "user": this.user ? ['ccm.instance', this.user.component.url, JSON.parse(this.user.config)] : '',
            });
            const star = await this.star_rating.start({
                "data": {"store": this.data.store, "key": this.data.key + document.id},
                "onchange": (event) => {
                    result.start();
                    this.onchange && this.onchange({name: 'addNewRatingForDocument', instance: this, newRating: event, document: document});
                },
                "user": this.user ? ['ccm.instance', this.user.component.url, JSON.parse(this.user.config)] : '',
            });
            $.setContent(documentItem.querySelector('.star-rating'), star.root);
            $.prepend(documentItem.querySelector('.star-rating-result'), result.root);
        }
    },
}
