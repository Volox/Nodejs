$ ->
    baseAPI = 'http://lookup.dbpedia.org/api/search.asmx/KeywordSearch?QueryString='

    $text = $ '#text'
    $definitions = $ '#definitions'
    $selWord = $ '#selectedWord'

    createDefinition = ( name, descr )->
        html = "<dt>#{name}</dt><dd><p>#{descr}</p></dd>"
        return html

    selectWord = ( evt )->
        word = $( evt.delegateTarget ).text()
        console.log baseAPI+word
        $.get
            url: baseAPI+word
            dataType: 'xml'
            success: (data)->
                $selWord.text word
                console.log 'asdasdasdadaererser'
                console.log data
                console.log $.parseXML data
            error: ( xhr, status, error )->
                console.error status, error
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