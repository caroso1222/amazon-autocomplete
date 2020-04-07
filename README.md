# Amazon Autocomplete JS Plugin
[![npm version](https://badge.fury.io/js/amazon-autocomplete.svg)](https://badge.fury.io/js/amazon-autocomplete)
[![size](https://img.shields.io/bundlephobia/minzip/amazon-autocomplete.svg?color=54CA2F&style=popout)](https://npmjs.org/amazon-autocomplete)

AmazonAutocomplete is a vanilla JavaScript plugin to unlock the full power of the Amazon autocompletion engine right into your search input. 

**Demo**: [http://carlosroso.com/amazon-autocomplete](http://carlosroso.com/amazon-autocomplete)

![demo gif](http://i.imgur.com/4whMwjM.gif)

## Features

- 🐣 Tiny footprint (<3K gzipped)
- 🔥 Support on all major browsers and +IE10
- 👓 Library agnostic
- ⚡️ Data fetched over JSONP
- ✨ Perf optimized. Debounce events and fetch only when necessary. 

## Installation
You can grab the minified file from `/dist` or unminified from `/src` but I highly recommend installation through npm. 

```
npm install --save amazon-autocomplete
```

Or you can install it using [yarn](https://yarnpkg.com/) as well:

```
yarn add amazon-autocomplete
```

Now add it to your html file:

```html
<html>
  <body>
    ...
    <script src="/path/to/amazon-autocomplete.min.js" type="text/javascript"></script>
  </body>
</html>
```

## Usage
Create a text input in your html file for the search field.

```html
<input type="text" id="search-input"/> 
```

Edit your main JavaScript file to create an AmazonAutocomplete instance with your search field CSS selector.

```javascript
let searchInput = new AmazonAutocomplete('#search-input');
```

Now you got a search field on steroids. Go ahead and apply some styles to make it shine.


## Styling
This is a pretty lightweight JavaScript library so it applies just a few styles to some elements to make it work. You can apply your own styles and customize the look of all the components within the widget. If you’re not that much into CSS, you can grab the following snippet and safely shot it into your stylesheet to get a decent default look. As you can see, AmazonAutocomplete goes all the way [BEM](https://en.bem.info/methodology/css/).

```css
/* Words container */
.ac__inner{
    background: #f6f6f6;
}

/* Individual word element */
.ac__word{
    margin: 0;
    padding: 5px;
}

/* Word prefix style. It’s the span containing the search keyword within the word. */
.ac__prefix{
    font-weight: bold;
}

/* Style applied to each words while navigating through the list or on hover */
.ac__word--selected, .ac__word:hover{
    background-color: #e3e3e3;
}
```

## Advanced Usage
### Configuration
You can customize the plugin behaviour by passing along a config object when instantiating AmazonAutocomplete. These are the properties you can specify:

#### `new AmazonAutocomplete([paramsObject])`

Param | Type | Required | Details
------------ | ------------- | ------------- | -------------
selector | `string` | Yes | CSS selector of the search field.
delay | `integer` | No | The keyup event on the search field is debounced. This attribute will set the fire rate limit (in milliseconds) on the keyup event callback. Default: `200`
showWords | `boolean` | No | Enable/disable revealing of the words list panel. Can be useful if you want to show the suggested words on your own custom widget. Default: `true`
hideOnblur | `boolean` | No | Indicates whether the words list panel should hide when the search field loses focus. Default: `true`

### Events
Each AmazonAutocomplete instance will fire some events. You can susbscribe to these events to, for example, save the selected word in your DB or to show suggested words in your own widget.

Event | Callback Param | Details
------------ | ------------- | -------------
onSelectedWord | `string` | This is event is fired when some of the following actions takes place: <ul><li>User clicks a word</li><li>User navigates through the words list and hits enter</li><li>User types keyword and hits enter (no suggested word selected)</li></ul>The callback function will be called with the selected word as its only argument.
onNewWords | `array` | This is event is fired when there are new suggested words available. It mostly happens when the keyup event fires on the search field. Keep in mind that the keyup is debounced to improve performance.

### Advanced usage example
The next snippet shows how to initialize a AmazonAutocomplete with a 200ms debounce limit, not showing the words panel and not hiding on input text blur. As the words won’t show in the dropdown panel we’ll have to shown them in a custom panel.

```javascript
//Create the AmazonAutocomplete with our desired properties
let searchInput = new AmazonAutocomplete({
            selector: '#search-input',
            delay: 200,
            showWords: false,
            hideOnblur: false
        });

//Log the selected word to the console
searchInput.onSelectedWord(word => console.log(`searching for ${word}...`));

//Populate your custom panel whenever there are new suggested words available
searchInput.onNewWords(words => words.forEach(word => addWordToCustomPanel(word)));
```


## Features
- **Size**: 3.9kb. Goes down to 2.8kb when gzipped.
- **Browser support**: Amazon Autocomplete is supported by all major browsers and +IE10. I don’t have any plans to ever support IE8 on any of my projects.
- **Library Agnostic**: This plugin is all about vanilla JavaScript. No jQuery required. You can use it in any of your projects whether you’re working on Angular, React, Vue, or plain JavaScript.
- **JSONP**: Yep. Amazon Autocomplete uses JSONP to fetch the data from Amazon. Requests are not being made via XHR because of the same-origin policy. Fortunately, the Amazon autocompletion endpoint is JSONP enabled so we can bypass this restriction.
- **Multiple instances**: You can have multiple search fields in the same page all of them powered with Amazon Autocomplete. Don’t worry about setting different callbacks when fetching the Amazon autocompletion endpoint. Just create a new instance for each search field and this plugin will automagically handle everything for you. How cool huh?
- **Keyup debounced**: With great power comes great responsibility. You don’t want to execute a GET request each time the user types a character and overload the Amazon autocompletion engine server. Amazon Autocomplete debounces the keyup event so that it will request new words only if some time has passed since last request. This is called [debouncing](https://davidwalsh.name/javascript-debounce-function). 


## Licence
AmazonAutocomplete is licensed under [MIT licence](https://opensource.org/licenses/mit-license.php).
