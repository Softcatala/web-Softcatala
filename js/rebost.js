/** Platform detection, part of Javascript taken from Mozilla sites **/

/*
 * Do platform detection
 */
var PLATFORM_OTHER    = 0;
var PLATFORM_WINDOWS  = 1;
var PLATFORM_WINDOWS_64  = 11;
var PLATFORM_LINUX    = 2;
var PLATFORM_LINUX_64 = 21;
var PLATFORM_MACOSX   = 3;
var PLATFORM_MAC      = 4;
var PLATFORM_ANDROID  = 5;
var PLATFORM_MAEMO    = 6;

var gPlatform = PLATFORM_WINDOWS;
var ustring  = navigator.userAgent.toLowerCase();

if (navigator.platform.indexOf("Win32") != -1)
  if (ustring.search("wow64") != -1)
  	gPlatform = PLATFORM_WINDOWS_64;
  else
  	gPlatform = PLATFORM_WINDOWS;
else if (navigator.platform.indexOf("Win64") != -1)
  gPlatform = PLATFORM_WINDOWS_64;
else if (navigator.platform.indexOf("Linux") != -1)
  if (navigator.platform.search("armv") != -1)
     if (ustring.search("android") != -1)
        gPlatform = PLATFORM_ANDROID;
     else if (ustring.search("maemo") != -1)
        gPlatform = PLATFORM_MAEMO;
     else
        gPlatform = PLATFORM_OTHER;
   else
     if (navigator.platform.search("x86_64") != -1)
     	gPlatform = PLATFORM_LINUX_64;
     else
        gPlatform = PLATFORM_LINUX;
else if (navigator.userAgent.indexOf("Mac OS X") != -1)
  gPlatform = PLATFORM_MACOSX;
else if (navigator.userAgent.indexOf("MSIE 5.2") != -1)
  gPlatform = PLATFORM_MACOSX;
else if (navigator.platform.indexOf("Mac") != -1)
  gPlatform = PLATFORM_MAC;
else
  gPlatform = PLATFORM_OTHER;

function detectaso() {

	var valuewin = 0;
	var valuewin64 = 0;
	var valuemac = 0;
	var valuelin = 0;
	var valuelin64 = 0;
	var valueand = 0;
	var valuemae = 0;
	var valueweb = 0;

    	if (document.getElementById('llistawin0')) {valuewin += 1;}
    	if (document.getElementById('llistalin0')) {valuelin += 1;}
    	if (document.getElementById('llistamac0')) {valuemac += 1;}
        if (document.getElementById('llistaand0')) {valueand += 1;}
        if (document.getElementById('llistamob0')) {
		/** Hack for Maemo **/
		if (document.getElementById('llistamob0').innerHTML.toLowerCase().search("maemo") != -1) {valuemae += 1;} 
	}

        if (document.getElementById('llistaweb0')) {valueweb += 1;}
        
        // JQuery retrieve class
        if ( jQuery(".llistawin").length > 0 ) { valuewin +=1; }
        if ( jQuery(".llistawin64").length > 0 ) { valuewin64 +=1; }
        if ( jQuery(".llistalin").length > 0 ) { valuelin +=1; }
        if ( jQuery(".llistalin64").length > 0 ) { valuelin64 +=1; }
        if ( jQuery(".llistamac").length > 0 ) { valuemac +=1; }
        if ( jQuery(".llistaand").length > 0 ) { valueand +=1; }  
        if ( jQuery(".llistamob").length > 0 ) { valuemob +=1; }          
        if ( jQuery(".llistaweb").length > 0 ) { valueweb +=1; }          


	var detect = 'llistanull0';
	var detectclass = 'llistanull';
	
	switch(gPlatform) {
		case PLATFORM_WINDOWS:
                	detect = 'llistawin0';
                	detectclass = 'llistawin';
			break;
		case PLATFORM_WINDOWS_64:
                	detect = 'llistawin0';
                	detectclass = 'llistawin64';
			break;
        	case PLATFORM_LINUX:
                	detect = 'llistalin0';
                	detectclass = 'llistalin';
			break;
		case PLATFORM_LINUX_64:
                	detect = 'llistalin0';
                	detectclass = 'llistalin64';
			break;
            	case PLATFORM_MACOSX:
            		detect = 'llistamac0';
            		detectclass = 'llistamac';
			break;
		case PLATFORM_MAC:
            		detect = 'llistamac0';
            		detectclass = 'llistamac';
			break;
                case PLATFORM_ANDROID:
                        detect = 'llistaand0';
                        detectclass = 'llistaand';
                        break;
                case PLATFORM_MAEMO:
                        detect = 'llistamob0';
                        detectclass = 'llistamob';
                        break;
		default:
			detect = 'llistanull0';
			detectclass = 'llistanull';
			break;
	}

	/** Només un SO - Baixada obligatòria **/

	if (valuewin > 0) {
		canviafons('llistawin0', detect);
	
		// Make it work regardless OS
		if (valuewin64 == 0 && detectclass == 'llistawin64') {
			canviafonsclass ('llistawin', 'llistawin');
		}
		else { canviafonsclass ('llistawin', detectclass); }
	}
	if (valuewin64 > 0) {
		canviafons('llistawin0', detect);
		canviafonsclass ('llistawin64', detectclass);
	}
	if (valuelin > 0) {
		canviafons('llistalin0', detect);
		
		// Make it work regardless OS
		if (valuelin64 == 0 && detectclass == 'llistalin64') {
			canviafonsclass ('llistalin', 'llistalin');
		}
		else { canviafonsclass ('llistalin', detectclass); }
		
	}
	if (valuelin64 > 0) {
		canviafons('llistalin0', detect);
		canviafonsclass ('llistalin64', detectclass);
	}
	if (valuemac > 0) {
		canviafons('llistamac0', detect);
		canviafonsclass ('llistamac', detectclass);
	}
        if (valueand > 0) {
                canviafons('llistaand0', detect);
                canviafonsclass ('llistaand', detectclass);
        }
        if (valuemae > 0) {
                canviafons('llistamob0', detect);
                canviafonsclass ('llistamob', detectclass);
        }
	if (valueweb > 0) {
		canviafons('llistaweb0', 'llistaweb0');
		canviafonsclass ('llistaweb', detectclass);
	}

}

function canviafonsclass (llista, sistema) {

	if (llista == sistema) {
	
		jQuery("."+sistema).css({'background-color': '#b0ad9c', 'color': 'ffffff'});

		jQuery("."+sistema+" .dwnimage img").css({'display' :'inline'});
		jQuery("."+sistema+" a").css({'color': '#ffffff'});
		jQuery("."+sistema+" a:hover").css({'color': '#ffffff'});	

		if (sistema === 'llistaand' ) {
			jQuery('.llistaand').each(function() {

				var link = jQuery(this).find('a').attr('href');
				link = link.replace("https%3A%2F%2Fplay.google.com%2Fstore%2Fapps", "market%3A%2F%2F");
				jQuery(this).find('a').attr('href', link);
			});

		} 
				
	}

}

function canviafons (llista, sistema) {

	if (llista == sistema) {
	    	var llistacanvi = document.getElementById(llista);
		if (llistacanvi) {
		llistacanvi.style.cssText="background-color:#b0ad9c;color:#ffffff;";
		llistacanvi.setAttribute("style", "background-color:#b0ad9c;color:#ffffff;");
		var csstxt = '#'+llista+' .dwnimage img {display: inline;}\n#'+llista+' a {color:#ffffff;}\n#'+llista+' a:hover {color:#ffffff;}';
		var cssintern = document.createElement('style');
		cssintern.setAttribute("type", "text/css");
		if(cssintern.styleSheet){// IE
			cssintern.styleSheet.cssText = csstxt;
		} else {// w3c
			var cssText = document.createTextNode(csstxt);
			cssintern.appendChild(cssText);
		}
		llistacanvi.appendChild(cssintern);
		}
	}
}
