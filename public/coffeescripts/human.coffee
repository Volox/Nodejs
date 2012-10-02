$ ->
    baseAPI = 'http://lookup.dbpedia.org/api/search.asmx/KeywordSearch?QueryString='

    $text = $ '#text'
    $definitions = $ '#definitions'
    $selWord = $ '#selectedWord'
    $progress = $ '#progress'

    createDefinition = ( name, descr )->
        $html = $ "<div><dt>#{name} <i class='icon-ok'></i></dt><dd><p>#{descr}</p></dd></div>"
        $html.click ->
            $definitions.find( '.selected' ).removeClass 'selected'
            $html.addClass 'selected'
        return $html

    selectWord = ( evt )->
        word = $( evt.delegateTarget ).text()
        $progress.removeClass 'hide'
        $definitions.empty()
        $definitions.text 'Loading definitions...'
        $.ajax
            url: baseAPI+word
            dataType: 'xml'
            success: (data)->
                $progress.addClass 'hide'
                $definitions.empty()
                $.each $( data ).find( 'Result' ), (key, val)->
                    name = $( @ ).children( 'Label' ).text()
                    descr = $( @ ).children( 'Description' ).text()
                    $definitions.append createDefinition name, descr

            error: ( xhr, status, error )->
                console.error status, error
                $definitions.append error
            complete: ->
                $selWord.text word

        return
    createWord = ( word )->
        html = "<span class='label label-warning'>#{word}</span>"
        return html
    
    text = $text.text()

    words = text.match /(\w|-){1,}/ig

    $text.empty()
    $.each words, (idx, word)->
        if /[A-Z]/.test word[0]
            $html = $ createWord word
            $html.click selectWord
            $text.append $html
        else
            $text.append word
            
        $text.append ' '