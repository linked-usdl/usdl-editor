/* 
 Document   : jquery.rdf.ext
 Created on : 20 mai 2013, 09:10:32
 Author     : Marouene Boubakri <maroueneboubakri@hotmail.com>
 Description:
 Purpose of the javascript follows.
 */

(function($) {

    $.extend($.rdf.prototype, {
        removeNode: function(node)
        {

            for (triple = 0; triple < this.databank.tripleStore.length; triple++)
            {
                if (this.databank.tripleStore[triple].subject.value == node)
                {
                    this.databank.tripleStore.splice(
                            $.inArray(this.databank.tripleStore[triple],
                            this.databank.tripleStore), 1);
                    triple -= 1;
                }
            }

            delete this.databank.subjectIndex[node];

            return this;
        }
    });

    $.extend($.rdf.prototype, {
        removeSubject: function(subject)
        {
            var objects = [];

            for (triple = 0; triple < this.databank.tripleStore.length; triple++)
            {
                if (
                        this.databank.tripleStore[triple].subject.value == subject)
                {
                    objects.push(this.databank.tripleStore[triple].object.value);

                    this.databank.tripleStore.splice(
                            $.inArray(this.databank.tripleStore[triple],
                            this.databank.tripleStore), 1);
                    triple -= 1;
                }
            }
            delete this.databank.objectIndex[subject];
            delete this.databank.subjectIndex[subject];

            if (objects.length)
                for (object = 0; object < objects.length; object++)
                    this.removeSubject(objects[object]);

            return this;
        }
    })

})(jQuery);