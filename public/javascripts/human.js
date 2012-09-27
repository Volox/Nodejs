
  $(function() {
    var $definitions, $selWord, $text, baseAPI, createDefinition, createWord, selectWord, text, words;
    baseAPI = 'http://lookup.dbpedia.org/api/search.asmx/KeywordSearch?QueryString=';
    $text = $('#text');
    $definitions = $('#definitions');
    $selWord = $('#selectedWord');
    createDefinition = function(name, descr) {
      var html;
      html = "<dt>" + name + "</dt><dd><p>" + descr + "</p></dd>";
      return html;
    };
    selectWord = function(evt) {
      var word;
      word = $(evt.delegateTarget).text();
      console.log(baseAPI + word);
      $.get({
        url: baseAPI + word,
        dataType: 'xml',
        success: function(data) {
          $selWord.text(word);
          console.log('asdasdasdadaererser');
          console.log(data);
          return console.log($.parseXML(data));
        },
        error: function(xhr, status, error) {
          return console.error(status, error);
        }
      });
    };
    createWord = function(word) {
      var html;
      html = "<span class='label label-warning'>" + word + "</span>";
      return html;
    };
    text = $text.text();
    words = text.match(/(\w|-){1,}/ig);
    $text.empty();
    return $.each(words, function(idx, word) {
      var $html;
      if (/[A-Z]/.test(word[0])) {
        $html = $(createWord(word));
        $html.click(selectWord);
        $text.append($html);
      } else {
        $text.append(word);
      }
      return $text.append(' ');
    });
  });
