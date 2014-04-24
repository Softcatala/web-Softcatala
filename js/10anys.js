function showbutton (model, fixa) {

        var imag = document.getElementById('button').getAttribute('src');
	var imagArray = imag.split("type");

	document.getElementById('button_counter').innerHTML = "<img src='"+imagArray[0]+"type="+model+" ' alt='10 anys de Softcatalà' id='button' />";

	putcode(fixa);

}


function showcodebutton (fixa) {

        putcode(fixa);

}

function putcode(fixa) {

        var imag = document.getElementById('button').getAttribute('src');

        var imagArray1 = imag.split("?");
        var imagArray2 = imagArray1[1].split("&");
        var imagArray3 = imagArray2[0].split("=");

        var terri = imagArray3[0];
        var vterri = imagArray3[1];

        var istyle = fixaho(fixa);


        if (terri == 'type') {

                document.getElementById('button_code').innerHTML = "<textarea cols=\"70\" rows=\"5\">"+
"&lt;a href='http://www.softcatala.cat'&gt;\n"+
"&lt;img src='"+imag+"' alt='10 anys de Softcatalà' style='"+istyle+"' /&gt;\n"+
"&lt;/a&gt;</textarea>";

        }


        else {

                document.getElementById('button_code').innerHTML = "<textarea cols=\"70\" rows=\"5\">"+
"&lt;a href='http://www.softcatala.cat'&gt;\n"+
"&lt;img src='"+imag+"' alt='10 anys de Softcatalà' style='"+istyle+"' /&gt;\n"+
"&lt;/a&gt;</textarea>";


        }
}


function fixaho(fixa) {

        if (fixa =='up_left') {

                var istyle="float:left;position:absolute;position:fixed;top:0;left:0;border:0;display:block;text-indent:-999em;text-decoration:none;"

        }

        else if (fixa =='up_right') {

                var istyle="float:right;position:absolute;position:fixed;top:0;right:0;border:0;display:block;text-indent:-999em;text-decoration:none;"

        }

        else if (fixa =='down_left') {

                var istyle="float:left;position:absolute;position:fixed;bottom:0;left:0;border:0;display:block;text-indent:-999em;text-decoration:none;"

        }

        else if (fixa =='down_right') {

                var istyle="float:right;position:absolute;position:fixed;bottom:0;right:0;border:0;display:block;text-indent:-999em;text-decoration:none;"

        }

        else {

                var istyle="";

        }

        return(istyle);

}
