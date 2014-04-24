function load_central() {

	var central = document.getElementById("mapa_planeta_central");
        central.style.cssText="display:block;";
        central.setAttribute("style", "display:block;");
	var mapacentral;
        if (GBrowserIsCompatible()) {
                mapacentral = new GMap2(document.getElementById("mapacentral"));
                mapacentral.addControl(new GSmallMapControl());
                mapacentral.addControl(new GMapTypeControl());
		mapacentral.setMapType(G_SATELLITE_MAP);
                mapacentral.setCenter(new GLatLng(50, 2), 3);

        	var SCIcon = new GIcon(G_DEFAULT_ICON);
        	SCIcon.image = "/img/logo_sc_32.png";
        	SCIcon.iconSize = new GSize(32, 32);
        	SCIcon.iconAnchor = new GPoint(20, 20);
        	SCIcon.infoWindowAnchor = new GPoint(10, 10);
        	SCIcon.imageMap = [0,23,0,4,4,0,29,0,32,3,32,22,29,26,3,26];

		var txtinfo = new Array();
		var marcador = new Array();		

	        GDownloadUrl("planeta.xml", function(data, responseCode) {
        	var xml = GXml.parse(data);
        	var markers = xml.documentElement.getElementsByTagName("blog");
        	for (var i = 0; i < markers.length; i++) {
                	var point = new GLatLng(parseFloat(markers[i].getAttribute("lat")),
                	parseFloat(markers[i].getAttribute("lng")));

			marcador[i] = new GMarker(point, SCIcon);
        		txtinfo[i] = "<div id='infoblog'><div id='txtinfo'></div><div id='foto'><img src='imgplanet/"+markers[i].getAttribute("pic")+"' alt='Img profile>' /></div></div>";

			var marcal = marcador[i];
			GEvent.addListener(marcador[i], "click", function() {
				marcal.openInfoWindowHtml(txtinfo[i]);
        		});
			
               		mapacentral.addOverlay(marcador[i]);
        	}
        	});
        }
}
