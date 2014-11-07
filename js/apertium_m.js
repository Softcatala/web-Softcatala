// softcatala

jQuery.fn.limitMaxlength = function(options){

	var settings = jQuery.extend({
		attribute: "maxlength",
		onLimit: function(){},
		onEdit: function(){}
	}, options);

	// Event handler to limit the textarea
	var onEdit = function(){
		var textarea = jQuery(this);
		var maxlength = parseInt(textarea.attr(settings.attribute));

		if(textarea.val().length > maxlength){
			textarea.val(textarea.val().substr(0, maxlength));

			// Call the onlimit handler within the scope of the textarea
			jQuery.proxy(settings.onLimit, this)();
		}

		// Call the onEdit handler within the scope of the textarea
		jQuery.proxy(settings.onEdit, this)(maxlength - textarea.val().length);
	}

	this.each(onEdit);

	return this.keyup(onEdit)
				.keydown(onEdit)
				.focus(onEdit);
}

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
    } else if (jQuery.browser.webkit || jQuery.browser.safari ) {
        var selection = window.getSelection();
        selection.setBaseAndExtent(text, 0, text, 1);
    }
}


function nl2br(text){
	text=escape(text);
	return unescape(text.replace(/(%5Cr%5Cn)|(%5Cn%5Cr)|%0A|%5Cr|%5Cn/g,'<br />'));
}

setTimeout(avisSoftvalencia,10000);
document.apertium_loaded = false;
function avisSoftvalencia() {

	avis = 'Estem experimentant problemes tècnics.<br />Proveu d\'utilitzar <a href="http://www.softvalencia.org/traductor/">el traductor disponible a la web de Softvalencià</a> mentre els resolem.';

	// if(!document.apertium_loaded)
		jQuery('#avis_softvalencia').html(avis);
}

jQuery(document).ready(function(){
	// document.apertium_loaded = true;

	jQuery('#avis_softvalencia').hide();
	jQuery('#botons_traductor').show();
	if(typeof jQuery.proxy != 'undefined')
		jQuery('#sl').limitMaxlength();

	//localStorage.clear();
	getLocalStorage();

	jQuery("#ftraductor").submit(function(){
			var langpair = jQuery('#langpair option:selected').val().replace('-','|');

			if((langpair=='es|ca')&&(jQuery('#valencia:checked').length))langpair=langpair+'_valencia';
			var muk = (jQuery('#unknown:checked').length)?'yes':'no';
			var txt = jQuery('#sl').val();

			if(!txt.length) return false;

                        var checkurl = "/m/online.json" + "?" + Math.random();
                        jQuery.ajax({
                                url:checkurl,
                                type:"HEAD",
                                dataType:"json",
                                timeout:2000,
                                async:true,
                                success:function(data, status){
					jQuery.ajax({
						url:"/apertium/json/translate",
						type:"POST",
						data : {'langpair':langpair,'q':txt,'markUnknown':muk,'key':'M2ZhZTlmZTQ4OGY2ODkyYTBlNGY'},
						dataType: 'json',
						success : trad_ok,
						failure : trad_ko
					});
				},
				error:function(x, t, m){
			                $('#warninternet').append('<p>No hi ha connexió!</p>');
                                        $('#warninternet').show('slow');
                                        $('#warninternet').hide(5000, function() {
                                                $('#warninternet').empty();
                                        });
				}
			});

			return false;
	});

	jQuery('#form_proposta').submit(function(){
		var langpair = jQuery('#langpair option:selected').val();
		var orig = jQuery('#sl').val();
		
		var trad = jQuery('#traduccio').html();
		var prop = jQuery('#proposta').val();

		jQuery.ajax({
			url:"/nova_proposta.php",
			type:"POST",
			success: prop_ok,
			error: prop_ko,
			data: {'langpair':langpair,'original':orig,'traduccio':trad,'proposta':prop}
		});
		return false;
	});

	jQuery('#lk_proposta').click(function(){
		jQuery('#lk_proposta').hide(200);
		jQuery('#dv_proposta').show(200);
	});


	function trad_ko() {
							jQuery('#trad_info').html(': <span style="font-size:0.8em;color:red;font-weight:bold">ERROR EN LA TRADUCCIÓ</span>');
							jQuery('#traduccio').hide();
	}

	function trad_ok(dt) {
			if(dt.responseStatus==200) {
							//jQuery('#traduccio').html('<pre style"white-space: pre-wrap; word-wrap: break-word;">'+dt.responseData.translatedText+'</pre>');
							//jQuery('#traduccio').html(nl2br(dt.responseData.translatedText));
							jQuery('#traduccio').html(dt.responseData.translatedText);
							jQuery('#traduccio').show();
							jQuery('#trad_info').html('');
							jQuery('#dv_traduccio').show(500);

				                        //Store locally last langpair
				                        if (localStorage) {
								var prefix = "tradm";
                                				var msec = new Date().getTime();
                                				localStorage.setItem(prefix+"-"+msec+'-langpair', jQuery('#langpair option:selected').val());
                                				localStorage.setItem(prefix+"-"+msec+'-valencia', 'false');
                                				localStorage.setItem(prefix+"-"+msec+'-unknown', 'false');
                                				localStorage.setItem(prefix+"-"+msec+'-txt', '');
								localStorage.setItem(prefix+"-"+msec+'-traduccio', '');							
	
								var txt = jQuery('#sl').val();
								var traduccio = jQuery('#traduccio').val();

                                				if (jQuery('#valencia:checked').length) {
                                        				localStorage.setItem(prefix+"-"+msec+'-valencia', 'true');
                                				}
                                				if (jQuery('#unknown:checked').length) {
                                        				localStorage.setItem(prefix+"-"+msec+'-unknown', 'true');
                                				}
                                				if (txt.length >0) {
                                        				localStorage.setItem(prefix+"-"+msec+'-txt', txt);
                                				}
								if (traduccio.length >0) {
									localStorage.setItem(prefix+"-"+msec+'-traduccio', traduccio);
								}
                        				}

							//Reset localStorage
							getLocalStorage();
							// Reset clear all if was enabled
							if (jQuery('.list').is(':visible')) {
                        					if (jQuery('.list').children().length > 0) {
                                					jQuery('#netejahistorial').show();
                        					}
                					}


							var target_offset = jQuery("#traduccio").offset();
							var target_top = target_offset.top;
							jQuery('html, body').animate({scrollTop:target_top}, 500);

							jQuery('.link_select span').click(function(){ SelectText('traduccio'); });
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

	jQuery('#langpair').change(function(){
			if(jQuery('#langpair option:selected').val()=='es-ca') {
					jQuery('#sp_valencia').show();
			} else {
					jQuery('#sp_valencia').hide();
			}
	});
	
	jQuery('#neteja').click(function(){
		jQuery('#sl').val('');
		jQuery('#dv_traduccio').hide(500);
		jQuery('#traduccio').html('');
	});

	jQuery('#sl').focus();

        jQuery(".select").live('click', function() {
		var prefix = "tradm";
                var splitkey = jQuery(this).attr('id').split('-', 2);
                var langpair = prefix+"-"+splitkey[1]+"-langpair";
                var valencia = prefix+"-"+splitkey[1]+"-valencia"
                var unknown = prefix+"-"+splitkey[1]+"-unknown";
                var txt = prefix+"-"+splitkey[1]+"-txt";
                var traduccio = prefix+"-"+splitkey[1]+"-traduccio";

                //Put used params
                if (localStorage[langpair]) {
                        jQuery('#langpair').val(localStorage[langpair]);
                }
                if (localStorage[valencia] == 'true') {
                        jQuery('#valencia').attr('checked', true);
                }
                if (localStorage[unknown] == 'true') {
                        jQuery('#unknown').attr('checked', true);
                }
                if (localStorage[txt]) {
                        jQuery('#sl').val(localStorage[txt]);
                }
                if (localStorage[traduccio]) {
                        jQuery('#traduccio').html(localStorage[traduccio]);
                        jQuery('#traduccio').show();
                        jQuery('#trad_info').html('');
                        jQuery('#dv_traduccio').show(500);
                }
        });

        jQuery(".remove").live('click', function() {
		var prefix = "tradm";
                var splitkey = jQuery(this).attr('id').split('-', 2);
                var langpair = prefix+"-"+splitkey[1]+"-langpair";
                var valencia = prefix+"-"+splitkey[1]+"-valencia"
                var unknown = prefix+"-"+splitkey[1]+"-unknown";
                var txt = prefix+"-"+splitkey[1]+"-txt";
                var traduccio = prefix+"-"+splitkey[1]+"-traduccio";

                localStorage.removeItem(langpair);
                localStorage.removeItem(valencia);
                localStorage.removeItem(unknown);
                localStorage.removeItem(txt);
                localStorage.removeItem(traduccio);

                jQuery(this).parent().parent().remove();
        });

	jQuery("#netejahistorial").live('click', function() {
		//Remove storage with certain prefix
		clearStorage("tradm");
		jQuery('.list').hide();
		$('.list > *').remove();
		jQuery('#netejahistorial').hide();
	});

	jQuery("#mostrahistorial").live('click', function() {
                //Careful, it might affect all domain
                jQuery('.list').toggle();
		
		if (jQuery('.list').is(':visible')) {
			if (jQuery('.list').children().length > 0) {
				jQuery('#netejahistorial').show();
			}
		}
		else {
			jQuery('#netejahistorial').hide();
		}
        });

});

function sortObj(arr){
	// Setup Arrays
	var sortedKeys = new Array();
	var sortedObj = {};

	// Separate keys and sort them
	for (var i in arr){
		sortedKeys.push(i);
	}
	sortedKeys.sort();

	// Reconstruct sorted obj based on keys
	for (var i in sortedKeys){
		sortedObj[sortedKeys[i]] = arr[sortedKeys[i]];
	}
	return sortedObj;
}

function clearStorage(cprefix) {

	var toRemove = new Array();
	//Assumes there is prefix - separated;
	for (i=0; i<=localStorage.length-1; i++)  {
		// get the key
                key = localStorage.key(i);
                // split the key
                var splitkey = key.split('-', 3);
                var prefix = splitkey[0];
                if (prefix == cprefix) { //Only remove if prefix
			toRemove.push(key);
		}
	}

	// Remove actual values
	for (a=0; a<=toRemove.length-1; a++) {
		localStorage.removeItem(toRemove[a]);
	}
}

function clearStorageSet(cprefix, cbase) {

	var toRemove = new Array();
        //Assumes there is prefix - separated;
        for (i=0; i<=localStorage.length-1; i++)  {
                // get the key
                key = localStorage.key(i);
                // split the key
                var splitkey = key.split('-', 3);
                var prefix = splitkey[0];
		var base = splitkey[1];
                if ((prefix == cprefix) && (base == cbase)) { //Only remove if prefix
                        toRemove.push(key);
                }
        }

        // Remove actual values
        for (a=0; a<=toRemove.length-1; a++) {
                localStorage.removeItem(toRemove[a]);
        }
}


function getLocalStorage() {

        var localSaved = new Array();
	var cprefix = "tradm"; //Used for restricting;

	if (localStorage.length > 0) {

        //First get all localstore into in array
        for (i=0; i<=localStorage.length-1; i++)  {
                // get the key
                key = localStorage.key(i);
                // split the key
                var splitkey = key.split('-', 3);
		var prefix = splitkey[0];
		if (prefix == cprefix) { //Only save if prefix
                	var base = splitkey[1];
                	var attr = splitkey[2];
                	if (!localSaved[base]) {localSaved[base] = new Array();}

                	localSaved[base][attr] = localStorage.getItem(key);
                	localSaved[base]['id'] = base;
		}
        }

        //Now act in array

        var numeric_array = new Array();
        for (var item in sortObj(localSaved)){
                numeric_array.push( localSaved[item] );
        }
        var lastSaved = numeric_array[(numeric_array.length -1)];

	if (lastSaved) {
        //Put last used language
        if (lastSaved['langpair']) {
                        jQuery('#langpair').val(lastSaved['langpair']);
        }
        if (lastSaved['valencia'] == 'true') {
                        jQuery('#valencia').attr('checked', true);
        }
        if (lastSaved['unknown'] == 'true') {
                        jQuery('#unknown').attr('checked', true);
        }
        //if (lastSaved['txt']) {
        //                jQuery('#sl').val(lastSaved['txt']);
        //}
	//Not available in reload
	//if (lastSaved['traduccio']) {
	//		jQuery('#traduccio').html(lastSaved['traduccio']);
	//		jQuery('#traduccio').show();
        //              jQuery('#trad_info').html('');
        //              jQuery('#dv_traduccio').show(500);
	//}
	}

	//Remove previous
	$('.list > *').remove();
	
	//Clean repeated
	var testclean = 0;	
	var indexremoved;

	for (var item in numeric_array.reverse()){

		var pos = numeric_array.length - item -1;
		if (numeric_array[pos-1]) {
			var counter = 0;
	
			if (numeric_array[pos]['txt'] == numeric_array[pos-1]['txt']) {
				counter++;
			}
			if (numeric_array[pos]['langpair'] == numeric_array[pos-1]['langpair']) {
				counter++;
			}
			
			if (counter > 1) {
				testclean = 1;
				indexremoved = pos-1;
				break;					
			}
		}
	}

	if (testclean == 1) {
		//Clean repeated
		numeric_array.splice(indexremoved, 1);
		clearStorageSet('tradm', numeric_array[indexremoved]['id']);
	}

	
	//Here remove any value higher in the stack
	//TODO -> limit 25?
	var limitarray = 25;
	if (numeric_array.length > limitarray) {
		clearStorageSet('tradm', numeric_array[limitarray]['id']);
		numeric_array.pop();
	}

        //Fill history div
        for (var item in numeric_array){
                //Limit size of string

                var txt2show = numeric_array[item]['txt'].substr(0, 25) + "...";
                //var txt2show = numeric_array[item]['txt'];

                var string = '<p class="histitem"><a href="#" class="select" id="select-'+numeric_array[item]['id']+'"><img src="/m/select.png" alt="Select" title="Select" /></a><span class="txt"><a href="#" class="select" id="selecta-'+numeric_array[item]['id']+'">'+txt2show+'</a></span><a href="#history" class="remove" id="remove-'+numeric_array[item]['id']+'"><img class="remove" id="remove-'+numeric_array[item]['id']+'" src="/m/remove.gif" alt="Remove" title="Remove" /></a></p>';
                jQuery('.list').append(string);

        }
	}
}

