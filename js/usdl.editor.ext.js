/* 
 Document   : usdl.editor.ext
 Created on : 3 mai 2013, 17:18:57
 Author     : Marouene Boubakri <maroueneboubakri@hotmail.com>
 Description:
 Purpose of the javascript follows.
 */
$('.removableEx').livequery(function() {
    var rembtn = $("<div/>").addClass("ui-button remove").click(function() {
        var snippetframe = $(this).parents(".dataTag:first")
        var opt = snippetframe.data('options')
        var subject = opt ? encodeSubject(opt.param) : undefined
        var subj = $(this).parent().attr("data-subject")
        subj = (subj) ? subj : subject
        var prop = $(this).parent().attr("data-property")
        var invprop = $(this).parent().attr("data-inverse-property")
        var param = $(this).parent().attr("data-parameter")
        if (subj && param && (prop || invprop)) {
            if (prop)
                var triple = "<" + subj + "> " + prop + " <" + param + ">"
            else
                triple = "?s" + " " + invprop + " <" + param + ">"

            document.kb.where(triple).each(
                    function(bindings, i, triples) {
                        document.kb.remove(triples[0])
                    });


            document.kb.removeNode(param);
            $sa.store.registerModification("Service")
        }
    }).appendTo(this)
})
$('.addPropertyEx')
        .livequery(
        function() {
            $(this)
                    .click(
                    function(e) {
                        var snippetframe = $(this).parents().find(".dataTag:last")
                        var opt = snippetframe.data('options')
                        var subject = opt ? opt.param
                                : undefined
                        var targetQuery = $(this).attr(
                                "target-subject-query");
                        var targetSubject = $(this).attr(
                                "target-subject");
                        var target = $(this).attr(
                                "data-link-target")
                        var property = $(this).attr(
                                "data-property")
                        var inverseProperty = $(this).attr(
                                "data-inverse-property")
                        var template = $(this).attr(
                                "data-template")
                        var type = $(this).attr(
                                "data-resource-type")
                        var titleProperty = $(this).attr(
                                "data-title-property")
                        titleProperty = titleProperty ? titleProperty
                                : "dcterms:title"
                        //prepare queries
                        targetQuery = subject.match(/^_:.*/) ?
                                targetQuery.replace(/\?o /ig, subject + ' ') :
                                targetQuery.replace(/\?o /ig, '<' + subject + '> ')
                        // execute query and retrieve the target
                        // subject
                        Q = document.kb;
                        $
                                .each(
                                targetQuery.split('. '),
                                function(index, value) {
                                    if (value
                                            .match(/\(.*\)/))
                                        Q = Q
                                                .optional(value
                                                .replace(
                                                /[\(\)]/g,
                                                ''))
                                    else
                                        Q = Q
                                                .where(value)
                                });
                        if (Q.length)
                            // get the target subject
                            subject = Q[0][targetSubject].value.toString();
                        // encode it
                        subject = encodeSubject(subject);
                        // display selection popup first
                        var dia = $("<div/>")
                        var inner = $("<div/>").addClass(
                                "dialog").appendTo(dia)
                        var label = $("<label/>").attr("for",
                                "auto").text("Resource:")
                                .appendTo(inner)
                        var auto = $("<input/>").attr("id",
                                "auto").width("95%").appendTo(
                                inner)
                        var results = $
                                .map(
                                type.split(','),
                                function(val) {
                                    return document.kb
                                            .where("?subject rdf:type "
                                            + val)
                                })
                        var union = false
                        $.each(results, function(i, val) {
                            if (union)
                                union = union.add(val)
                            else
                                union = val
                        })
                        var result = union.where("?subject "
                                + titleProperty + " ?title")
                        var source = []
                        result
                                .each(function() {
                            source
                                    .push({
                                label: this.title.value,
                                subject: this.subject.value._string
                            })
                        })

                        auto.autocomplete({
                            minLength: 0,
                            source: source
                        })

                        dia
                                .dialog({
                            buttons: {
                                "Cancel": function() {
                                    $(this).dialog(
                                            "close")
                                },
                                "Create ...": function() {
                                    var name = auto
                                            .val()
                                    var templateText = $sa.store
                                            .getSnippetById(
                                            template)
                                            .text()
                                    var resource = "#"
                                            + Math
                                            .uuid(17)
                                    var substituted = templateText
                                            .replace(
                                            /#subject/,
                                            resource)
                                    var base = document.kb.databank.baseURI
                                    substituted = substituted
                                            .replace(
                                            /#baseurl/,
                                            base)
                                    substituted = substituted
                                            .replace(
                                            /#name/,
                                            name)
                                    var options = {
                                        jOrigin: this,
                                        param: resource
                                    }
                                    document.kb
                                            .load(substituted)
                                    if (property)
                                        document.kb
                                                .add(subject
                                                + " "
                                                + property
                                                + " <"
                                                + resource
                                                + ">")
                                    if (inverseProperty)
                                        document.kb
                                                .add("<"
                                                + resource
                                                + "> "
                                                + inverseProperty
                                                + " "
                                                + subject)
                                    document.kb.setDirty = true
                                    $sa.store
                                            .registerModification('Service')
                                    $(this).dialog(
                                            "close")
                                    $sa(target)
                                            .navigate(
                                            options)
                                }
                            },
                            title: 'Select',
                            modal: true
                        })
                    })
        })

$.editableFactory['selectEx'] = {
	
    toEditable: function($this, options) {
    	var caption = "[NEW ELEMENT]";  
        $select = $('<select/>');
        $this.append($select);

        var settings = {
            'newE': true,
            'editE': false,
            'inputColor': '#F1F1F1'
        };

        $select.prepend('<option>'+caption+'</option>');
        
        $.each(options.options, function(key, value) {
            $('<option/>').appendTo($select).html(value).attr('value', key)
        });

        if ($.inArray($this.data('editable.current'), options.options) == -1)
            $('<option/>').appendTo($select).html(
                    $this.data('editable.current')).attr('value',
                    $this.data('editable.current'));

        $select.children().each(function() {
            var opt = $(this);
            if (opt.text() == $this.data('editable.current'))
                return opt.attr('selected', 'selected').text();
        })

        var inputEl = document.createElement('input');
        inputEl.type = "text";
        var inputE = jQuery(inputEl);
        $this.append(inputE);

        inputE.css({
            "background": settings.inputColor,
            "position": "absolute",
            "display": "none",
            "right": "25px",
            "height": "22px",
            "width": $select.width() + "px"
        });
        $select.blur(function(e) {
            if ($(this).val() != caption)
                $select.trigger("changeEx");
        });

        inputE.blur(function(e) {        	
            if ($.trim($(this).val()) == "")
            	$(this).val($this.data('editable.previous')); 
                $select.children('option:selected').text($(this).val());
                $select.trigger("changeEx");
        });
      
        function resizeEls() {
            inputE.css({
                "width": $select.width() + "px"
            });
        }
        
        $select.change(function(e) {
            if ($(this).val() == caption) {
                inputE.css({
                    "display": "inline"
                });
                resizeEls();
                inputE.val("").focus();   
                $select.children('option:selected').text($this.data('editable.previous'));
                
            } else
                opts.toNonEditable($select.parent(), true);
        });

    },
    getValue: function($this, options) {
        return $('select :selected', $this).text()
    }
}
$('.textEditCust').livequery(
        function() {
            $(this).editable(
                    {
                        type: "xsdString",
                        onSubmit: function(content) {
                            var snippet = $(this)
                                    .parents(".snippetFrame:first").attr(
                                    "data-snippet-id")
                            var custom = $sa.store.getSnippetById($(this).attr(
                                    "custom-snippet"))
                            var subject = encodeSubject($(this).attr(
                                    "data-subject"))
                            var property = $(this).attr("data-property")
                            var type = $(this).attr("data-type")
                            var oldTriple, newTriple
                            var customize = false;
                            if (!$.trim(content.current)) {
                                $sa.store.registerModification(snippet)
                                return;
                            }
                            // NEW TRIPLE
                            if (validURL(content.current)) {
                                newTriple = subject + ' ' + property + ' '
                                        + encodeSubject(content.current)
                            } else {
                                newTriple = custom.text().replace(/<#subject>/,
                                        subject)
                                newTriple = newTriple.replace(newTriple
                                        .match(/"(.*?)"/)[1], content.current);
                                customize = true;
                            }
                            // REMOVE OLD TRIPLE
                            oldTriple = encodeSubject(subject) + " " + property
                                    + " " + "?v"
                            document.kb.where(oldTriple).each(
                                    function() {
                                        value = (this.v.type != "bnode") ?
                                                "<" + this.v.value.toString() + ">" :
                                                this.v.value.toString();
                                        //remove node or triple
                                        if (value.match(/^_:.*/)) // if object
                                                // is a node
                                                {
                                                    document.kb.removeNode(value);
                                                    var res = document.kb
                                                            .where("?s ?p " + value)
                                                    res.each(function() {
                                                        var triple = "<"
                                                                + this.s.value
                                                                .toString()
                                                                + "> <"
                                                                + this.p.value
                                                                .toString()
                                                                + "> " + value
                                                        document.kb.remove(triple)
                                                    })
                                                } else { // object is a litteral
                                            var triple = subject + " "
                                                    + property + " " + value
                                                    + " "
                                            document.kb.remove(triple)
                                        }

                                    })
                            // ADD NEW TRIPLE
                            document.kb = (customize == true) ? document.kb
                                    .load(newTriple) : document.kb
                                    .add(newTriple);
                            document.kb.isDirty = true
                            $sa.store.registerModification(snippet)
                        }
                    })
        })

$('.selectEditEx').livequery(
        function() {
            $(this).editable(
                    {
                        type: 'selectEx',
                        editClass: 'valueColEdit',
                        submitBy: 'changeEx',
                        options: $(this).attr("options").split(","),
                        onSubmit: function(content) {                        		                            
                            if(content.current == content.previous)
                            	return;                            
                            var optns = $(this).attr("options").split(",");
                            var snippet = $(this)
                                    .parents(".snippetFrame:first").attr(
                                    "data-snippet-id")
                            var custom = $sa.store.getSnippetById($(this).attr(
                                    "custom-snippet"))
                            var subject = encodeSubject($(this).attr(
                                    "data-subject"))
                            var property = $(this).attr("data-property")
                            var prefix = $(this).attr("data-prefix")
                            var type = $(this).attr("data-type")
                            var lang = $(this).attr("data-lang")
                            lang = (lang) ? '@' + lang : ''
                            var oldTriple, newTriple
                            var customize = false;
                            // NEW TRIPLE
                            if ($.inArray(content.current, optns) == -1
                                    && validURL(content.current))
                                newTriple = subject + ' ' + property + ' '
                                        + encodeSubject(content.current)
                            else if ($.inArray(content.current, optns) == -1) {
                                newTriple = custom.text().replace(/<#subject>/,
                                        subject)

                                newTriple = newTriple.replace(newTriple
                                        .match(/"(.*?)"/)[1], content.current);

                                customize = true;
                            } else if (prefix)
                                newTriple = subject
                                        + ' '
                                        + property
                                        + ' '
                                        + encodeSubject(prefix
                                        + content.current)
                            else
                                newTriple = subject + ' ' + property + ' "'
                                        + content.current + '"' + type + lang
                            // REMOVE OLD TRIPLE
                            oldTriple = encodeSubject(subject) + " " + property
                                    + " " + "?v"
                            document.kb.where(oldTriple).each(
                                    function() {
                                        var value = this.v.value.toString()
                                        if (value.match(/^_:.*/)) // if object
                                                // is a node
                                                {
                                                    document.kb.removeNode(value);
                                                    var res = document.kb
                                                            .where("?s ?p " + value)
                                                    res.each(function() {
                                                        var triple = "<"
                                                                + this.s.value
                                                                .toString()
                                                                + "> <"
                                                                + this.p.value
                                                                .toString()
                                                                + "> " + value
                                                        document.kb.remove(triple)
                                                    })
                                                } else { // object is a litteral
                                            var triple = subject + " "
                                                    + property + " <" + value
                                                    + ">"
                                            document.kb.remove(triple)
                                        }
                                    })
                            // ADD NEW TRIPLE
                            document.kb = (customize == true) ? document.kb
                                    .load(newTriple) : document.kb
                                    .add(newTriple);
                            document.kb.isDirty = true
                            $sa.store.registerModification(snippet)
                        }
                    })
        })

$('.textEditEx').livequery(
        function() {
            $(this).editable(
                    {
                        type: "xsdString",
                        onSubmit: function(content) {
                            var snippet = $(this).parents('.dataTag:first')
                                    .attr("data-snippet-id")
                            var subject = encodeSubject($(this).attr(
                                    "data-subject"))
                            var type = $(this).attr("data-type")
                            type = (type) ? '^^<' + type + '>' : ''
                            var lang = $(this).attr("data-lang")
                            var property = $(this).attr("data-property")
                            var match = "skos:exactMatch";

                            oldEqualTriple = subject + " " + match + " " + "?v"
                            document.kb.where(oldEqualTriple).each(
                                    function(bindings, i, triples) {
                                        document.kb.remove(triples[0])
                                    })

                            if (validURL(content.current))
                            {
                                var equalTriple = subject + " " + match + " <" + content.current + ">"
                                document.kb = document.kb.add(equalTriple)
                                content.current = content.current.split('#')[1]
                            }

                            lang = (lang) ? '@' + lang : ''
                            var oldTriple = subject + ' ' + property + ' "'
                                    + content.previous.encodeLiteral() + '"'
                                    + type + lang + ' .'
                            var newTriple = subject + ' ' + property + ' "'
                                    + content.current.encodeLiteral() + '"'
                                    + type + lang + ' .'

                            document.kb.where(oldTriple).each(
                                    function(bindings, i, triples) {
                                        document.kb.remove(triples[0])
                                    })

                            document.kb = document.kb.add(newTriple)
                            document.kb.isDirty = true
                            $sa.store.registerModification(snippet)
                        }
                    })
        })

function validURL(str) {
    var valid = str.split('#')[1] ? true : false;
    return valid;
}