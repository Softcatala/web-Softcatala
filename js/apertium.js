// softcatala
jQuery.fn.limitMaxlength = function(options) {

    var settings = jQuery.extend({
        attribute: "maxlength",
        onLimit: function() {},
        onEdit: function() {}
    }, options);

    // Event handler to limit the textarea
    var onEdit = function() {
        var textarea = jQuery(this);
        var maxlength = parseInt(textarea.attr(settings.attribute));

        if (textarea.val().length > maxlength) {
            textarea.val(textarea.val().substr(0, maxlength));

            // Call the onlimit handler within the scope of the textarea
            jQuery.proxy(settings.onLimit, this)();
        }

        // Call the onEdit handler within the scope of the textarea
        jQuery.proxy(settings.onEdit, this)(maxlength - textarea.val().length);
    };

    this.each(onEdit);

    return this.keyup(onEdit)
        .keydown(onEdit)
        .focus(onEdit);
};

function SelectText(element) {
    var text = document.getElementById(element);
    if (jQuery.browser.msie) {
        var range = document.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if (jQuery.browser.mozilla || jQuery.browser.opera) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    } else if (jQuery.browser.webkit || jQuery.browser.safari) {
        var selection = window.getSelection();
        selection.setBaseAndExtent(text, 0, text, 1);
    }
}


function nl2br(text) {
    text = escape(text);
    return unescape(text.replace(/(%5Cr%5Cn)|(%5Cn%5Cr)|%0A|%5Cr|%5Cn/g, '<br />'));
}

setTimeout(avisSoftvalencia, 10000);

function avisSoftvalencia() {

    avis = 'Estem experimentant problemes tècnics.<br />Proveu d\'utilitzar <a href="http://www.softvalencia.org/traductor/">'
         + 'el traductor disponible a la web de Softvalencià</a> mentre els resolem.';

    jQuery('#avis_softvalencia').html(avis);
}

jQuery(document).ready(function() {
    jQuery('#avis_softvalencia').hide();
   
    jQuery('#botons_traductor').show();
    if (typeof jQuery.proxy != 'undefined'){
        jQuery('#sl').limitMaxlength();
    }

    jQuery("#ftraductor").submit(function() {
        var langpair = jQuery('#langpair option:selected').val().replace('-', '|');
        
        if ((langpair == 'es|ca') && (jQuery('#valencia:checked').length)) {
            langpair = langpair + '_valencia';
        }
        
        var muk = (jQuery('#unknown:checked').length) ? 'yes' : 'no';
        var txt = jQuery('#sl').val();
        if (!txt.length) return false;
        jQuery.ajax({
            url: "/apertium/json/translate",
            type: "POST",
            data: {
                'langpair': langpair,
                'q': txt,
                'markUnknown': muk,
                'key': 'NmQ3NmMyNThmM2JjNWQxMjkxN2N'
            },
            dataType: 'json',
            success: trad_ok,
            failure: trad_ko
        });
        return false;
    });

    jQuery('#form_proposta').submit(function() {
        var langpair = jQuery('#langpair option:selected').val();
        var orig = jQuery('#sl').val();

        var trad = jQuery('#traduccio').html();
        var prop = jQuery('#proposta').val();

        jQuery.ajax({
            url: "/nova_proposta.php",
            type: "POST",
            success: prop_ok,
            error: prop_ko,
            data: {
                'langpair': langpair,
                'original': orig,
                'traduccio': trad,
                'proposta': prop
            }
        });
        return false;
    });

    jQuery('#lk_proposta').click(function() {
        jQuery('#lk_proposta').hide(200);
        jQuery('#dv_proposta').show(200);
    });
    
    function trad_ko() {
        jQuery('#trad_info').html(': <span style="font-size:0.8em;color:red;font-weight:bold">ERROR EN LA TRADUCCIÓ</span>');
        jQuery('#traduccio').hide();
    }

    function trad_ok(dt) {
        if (dt.responseStatus == 200) {
            //jQuery('#traduccio').html('<pre style"white-space: pre-wrap; word-wrap: break-word;">'+dt.responseData.translatedText+'</pre>');
            jQuery('#traduccio').html(nl2br(dt.responseData.translatedText));
            jQuery('#traduccio').show();
            jQuery('#trad_info').html('');
            jQuery('#dv_traduccio').show(500);
            jQuery('.link_select span').click(function() {
                SelectText('traduccio');
            });
        } else {
            trad_ko();
        }
    }

    function prop_ok() {
        alert('Gracies pel vostre suggeriment');
    }

    function prop_ko() {
        alert('Hi ha hagut un error enviant la vostra proposta. Si voleu, torneu a intentar-ho.');
    }

    jQuery('#langpair').change(function() {
        if (jQuery('#langpair option:selected').val() == 'es-ca') {
            jQuery('#sp_valencia').show();
        } else {
            jQuery('#sp_valencia').hide();
        }
    });

    jQuery('#neteja').click(function() {
        jQuery('#sl').val('');
        jQuery('#dv_traduccio').hide(500);
        jQuery('#traduccio').html('');
    });

    jQuery('#sl').focus();
});