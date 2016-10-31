(function () {
    document.addEventListener('DOMContentLoaded', function(){
        var amazonAutocomplete1 = new AmazonAutocomplete('#amazon-search-1');
        var amazonAutocomplete2 = new AmazonAutocomplete({
            selector: '#amazon-search-2',
            delay: 200,
            showWords: true
        });
        amazonAutocomplete1.onSelectedWord(function(word){
            console.log(word);
        });
        amazonAutocomplete2.onNewWords(function(words){
            console.log(words);
        });
        amazonAutocomplete2.onSelectedWord(function(word){
            console.log(word);
        });
    }, false);
})(this);