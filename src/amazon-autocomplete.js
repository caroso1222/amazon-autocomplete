/**
 * @author Carlos Roso <ce.roso398@gmail.com>
 */

(function(window, document, undefined) {
    var numInstances = 0;
    
    /**
     * Class responsible to bind the autocompletion functionality to a given search input
     * 
     * @constructor
     */
    window.AmazonAutocomplete = function(){
        numInstances++;

        let self = this; //Helps minification: 'self' gets minified, 'this' does not.
        self._id = numInstances;
        self._input;
        self._idx; 
        self._words;
        self._container;
        self._onSelectedCB = () => {};

        //Default configuration
        self._config = {
            delay: 150,
            showWords: true,
            hideOnblur: true
        }
        let args = arguments[0];
        if (args && typeof args === 'string'){
            self._config.selector = args;
        }else if(args && typeof args === 'object'){
            Object.keys(args).forEach(key => {
                self._config[key] = args[key];
            });
        }
        self._words = [];
        self._idx = -1;
        self._keyListenerDebounced = _debounce(_getSuggestions.bind(self), self._config.delay);
        self._input = document.querySelector(self._config.selector);

        //Configures the html search input and binds the respective keyup listener
        if(self._input != null){
            self._input.setAttribute('autocomplete','off');
            _buildScriptContainer();
            if(self._config.showWords){
                self._input.addEventListener("keyup", _processOnKeyUp.bind(self), false);
                _buildWordsContainer.call(self);
                _bindClickListener.call(self);
            }else{
                self._input.addEventListener("keyup", _processOnKeyUp__noWords.bind(self), false);
            }
        }

        //Add a class to the main container to ensure it hides when the user clicks outside the 
        //search input or the words container
        if(self._config.hideOnblur){
            self._container.parentNode.classList.add('ac--hide-on-blur');
        }


        //Ensure the words container is shown when the search field is clicked
        self._input.addEventListener('click', e => {
            self._container.parentNode.style.display = 'block';
            // Store a signal in the event to indicate, on upper levels, that this element was click
            e.amazonAutocompleteClicked = true;
        });

        /**
         * Creates a callback function in the 'AmazonAutocomplete' global object that gets called when the 
         * response from Amazon is received. This plugin leverages JSONP so that the response from Amazon is a JSON
         * object wrapped around a function whose name is passed in the 'callback' query string.
         * 
         * @param {object} body - The JSON response received from Amazon with the autocompletion suggestions
         */
        window.AmazonAutocomplete['AmazonJSONPCallbackHandler_'+self._id] = body => {
            if(self._config.showWords){
                _paintWords.call(self, body[0], body[1]);
            }
            if(self._onWordsCB != null){
                self._onWordsCB(body[1]);
            }
        }    
    }

    /**
     * Hide widget when clicked outside the search field or the words container 
     */
    document.body.addEventListener('click', evt => {
        if(!evt.amazonAutocompleteClicked)
            document.querySelectorAll('.ac--container.ac--hide-on-blur').forEach( elem => elem.style.display = 'none');
        
    });

    //---------------------------------------------//
    //--------------- PUBLIC METHODS --------------//
    //---------------------------------------------//

    /**
     * Assign a callback function that gets called when a word in the
     * ui widget is selected 
     * 
     * @param {function} cb - the callback function to be called 
     */
    AmazonAutocomplete.prototype.onSelectedWord = function(cb) {
        this._onSelectedCB = cb;
    }

    /**
     * Assign a callback function that gets called when new words are received
     * from the Amazon autocompletion service
     * 
     * @param {function} cb - the callback function to be called 
     */
    AmazonAutocomplete.prototype.onNewWords = function(cb) {
        this._onWordsCB = cb;
    }
    
    //---------------------------------------------//
    //-------------- PRIVATE METHODS --------------//
    //---------------------------------------------//

    /**
     * Create a ui widget consisting of a parent and child div placed below the search input 
     * as a container to the list of words
     */
    function _buildWordsContainer() {
        let container = document.createElement('div');
        container.className = 'ac--container';
        container.style.width = this._input.offsetWidth;
        container.style.position = 'relative';
        this._input.parentNode.insertBefore(container, this._input.nextSibling);
        let inner = document.createElement('div');
        inner.className = 'ac--inner';
        inner.style.position = 'absolute';
        inner.style.top = 0;
        inner.style.left = 0;
        inner.style.width = '100%';
        container.appendChild(inner);
        this._container = inner;
    }

    /**
     * Build the suggested word by concatenating the prefix and the suffix of the DOM element
     * 
     * @param {DOM Node} wordElement - The DOM node containing the prefix and the suffix
     * @returns 
     */
    function _getStringFromWordElement(wordElement) {
        return wordElement.firstChild.innerHTML + wordElement.lastChild.textContent;
    }

    /**
     * Bind a click listener to the words container then handle the click event on each word by leveraging
     * event bubbling.
     * We bind the listener to the parent container because the words inside the ui widget gets replaced 'on each keyup event' 
     * (remember it's debounced though) so it's inefficient to bind a click listener to each element. 
     */
    function _bindClickListener() {
        this._container.addEventListener('click', e => {
            if (e.target !== e.currentTarget)
                this._onSelectedCB(_getStringFromWordElement(e.target));
            e.stopPropagation();
        })
    }

    /**
     * Remove all the words inside the ui widget
     */
    function _flushWordsContainer() {
        while (this._container.firstChild)
            this._container.removeChild(this._container.firstChild);
    }

    /**
     * A minimal implementation of a debouncer function. This is useful to avoid over-calling the Amazon
     * autocomplete service on each keyup event, but rather wait some {delay} ms before calling it again.
     * 
     * @param {function} f - Function to be debounced
     * @param {number} delay - Debounce delay in ms (miliseconds)
     * @returns {function} - A wrapper function to execute the param function
     */
    function _debounce(f, delay) {
        let flag = true;
        return function () {
            if (flag) {
                flag = false;
                setTimeout(() => {
                    f.apply(null, Array.prototype.slice.apply(arguments));
                    flag = true;
                }, delay);
            }
        }
    }

    /**
     * Remove the 'ac--selected' class from the desired element. Used when navigating through the ui widget.
     * 
     * @param {DOM Node} wordElement - The DOM Node containing the word that must be unselected (meaning it lost focus)
     */
    function _unselectWord(wordElement) {
        if (wordElement != null)
            wordElement.className = wordElement.className.split(' ').filter(obj => !/ac--selected/.test(obj)).join(' ');
    }

    /**
     * Listen to a keyup event on the search input. This function will NOT handle navigation
     * inside the words ui widget.
     *
     * @param {event} evt - Keyup event
     */
    function _processOnKeyUp__noWords(evt) {
        let key = evt.keyCode || evt.which;
        let char = String.fromCharCode(key);
        if (key == 13) {
            this._onSelectedCB(this._input.value);
        }else if (/[a-zA-Z0-9-_ ]/.test(char) || key === 8){
            let prefix = this._input.value;
            if (prefix != '')
                this._keyListenerDebounced(prefix);
        }
    }

    /**
     * Listen to a keyup event on the search input. This function will handle navigation
     * inside the words ui widget by listening to up and down arrows.
     * 
     * @param {event} evt - Keyup event
     */
    function _processOnKeyUp(evt) {
        let key = evt.keyCode || evt.which;
        let char = String.fromCharCode(key);
        let self = this;
        if (key === 38) {
            if (self._idx > 0) {
                _unselectWord(self._words[self._idx]);
                self._idx--;
            }
            self._words[self._idx].className += ' ac--selected';
        } else if (key == 40) {
            if (self._idx < self._words.length - 1) {
                _unselectWord(self._words[self._idx]);
                self._idx++;
            }
            self._words[self._idx].className += ' ac--selected';
        } else if (key == 13) {
            if (self._words.length && self._idx > -1)
                self._onSelectedCB(_getStringFromWordElement(self._words[self._idx]));
            else
                self._onSelectedCB(self._input.value);
        } else if (/[a-zA-Z0-9-_ ]/.test(char) || key === 8) {
            self._idx = -1;
            let prefix = self._input.value;
            if (prefix != '')
                self._keyListenerDebounced(prefix);
            else
                _flushWordsContainer.call(self);
        }
    }

    /**
     * Create the script tag needed to fetch the suggestions and append it to the DOM
     */
    function _buildScriptContainer(){
        let parent = document.getElementById('ac--script');
        if (parent == null){
            parent = document.createElement('div');
            parent.id = 'ac--script';
            parent.appendChild(document.createElement('script'));
            document.body.appendChild(parent);
        }
    }

    /**
     * Build the ui widget that shows the words under the search html input
     * 
     * @param {string} prefix - The letters written by the user in the html search input
     * @param {Array<string>} words - The list of words that must be painted inside the widget
     */
    function _paintWords(prefix, words){
        _flushWordsContainer.call(this);
        this._words = [];
        let docFrag = document.createDocumentFragment();
        for (let i = 0; i < words.length; i++){
            let wordElement = document.createElement('p');
            wordElement.className = 'ac--word';
            wordElement.style.cursor = 'pointer';
            let prefixElement = document.createElement('span');
            prefixElement.className = 'ac--prefix';
            prefixElement.style.pointerEvents = 'none';
            let suffix = document.createTextNode(words[i].slice(prefix.length));
            prefixElement.appendChild(document.createTextNode(prefix));
            wordElement.appendChild(prefixElement);
            wordElement.appendChild(suffix);
            docFrag.appendChild(wordElement);
            this._words.push(wordElement);
        }
        this._container.appendChild(docFrag);
    }

    /**
     * Replace the fetching script tag with a new one to get the autocompletion suggestions
     * for the desired prefix
     *
     * @param {string} prefix - The letters written by the user in the html search input
     */
    function _getSuggestions(prefix) {
        let scriptContainer = document.getElementById('ac--script');
        let newScript = document.createElement('script');
        newScript.src = 'http://completion.amazon.com/search/complete?search-alias=aps&client=amazon-search-ui&mkt=1&q='+prefix+'&callback=AmazonAutocomplete.AmazonJSONPCallbackHandler_'+this._id;
        scriptContainer.replaceChild(newScript, scriptContainer.firstChild);
    }

})(window, document);