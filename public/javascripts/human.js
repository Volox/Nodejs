
  $(function() {
    var $definitions, $progress, $selWord, $text, baseAPI, createDefinition, createWord, selectWord, text, words;
    baseAPI = 'http://lookup.dbpedia.org/api/search.asmx/KeywordSearch?QueryString=';
    $text = $('#text');
    $definitions = $('#definitions');
    $selWord = $('#selectedWord');
    $progress = $('#progress');
    createDefinition = function(name, descr) {
      var $html;
      $html = $("<div><dt>" + name + " <i class='icon-ok'></i></dt><dd><p>" + descr + "</p></dd></div>");
      $html.click(function() {
        $definitions.find('.selected').removeClass('selected');
        return $html.addClass('selected');
      });
      return $html;
    };
    selectWord = function(evt) {
      var word;
      word = $(evt.delegateTarget).text();
      $progress.removeClass('hide');
      $definitions.empty();
      $definitions.text('Loading definitions...');
      $.ajax({
        url: baseAPI + word,
        dataType: 'xml',
        success: function(data) {
          $progress.addClass('hide');
          $definitions.empty();
          return $.each($(data).find('Result'), function(key, val) {
            var descr, name;
            name = $(this).children('Label').text();
            descr = $(this).children('Description').text();
            return $definitions.append(createDefinition(name, descr));
          });
        },
        error: function(xhr, status, error) {
          console.error(status, error);
          return $definitions.append(error);
        },
        complete: function() {
          return $selWord.text(word);
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
