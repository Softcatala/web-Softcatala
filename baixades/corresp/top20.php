<?php

#Parameters
#Number of applications

$lowernum = 4;
$highernum = 26;
$num = 20;
$etiqueta = "";
$lapse = "";

#Adjust parameter

if (isset($_GET['num'])) {

	if ($_GET['num']>$lowernum && $_GET['num']<$highernum) {

		$num = $_GET['num'];
	}

}


if (isset($_GET['etiqueta'])) {
	#Tag delimita
	$etiqueta = $_GET['etiqueta'];
}


if (isset($_GET['lapse'])) {
	#Tag delimita
	$lapse = $_GET['lapse'];
}


$time_lapse = get_lapse($lapse);

#echo $time_lapse, "\n";

#READ MySQL
#Generate HTML from MySQL, (in future XML)

write_html($num, $etiqueta, $time_lapse);


function write_html($num, $etiqueta, $data) {



	$link = mysql_connect('localhost', 'rrebost', 'mypasswd');


	if(!is_resource($link)) {

		die ("Failed to connect to the server\n");

	}
	else {


		$db_selected = mysql_select_db('rebost', $link);

		if (!$db_selected) {

	    	die ('Can\'t connect : ' . mysql_error());

		}

		else {

			mysql_query("SET NAMES 'utf8'");

			// Make a safe query, SELECT Nom and count

			$data = mysql_real_escape_string($data);
			$num = mysql_real_escape_string($num);

			if ($etiqueta == '') {
				$query = sprintf("SELECT w.page_title as Nom, Count(*) as Count from rebost.baixades b, wikidb.page w where b.data>$data and w.page_id = b.idrebost and page_namespace='100' group by b.idrebost order by Count desc limit $num");
			}

			else {

				$etiqueta = mysql_real_escape_string($etiqueta);
				$query = sprintf("SELECT w.page_title as Nom, Count(*) as Count from rebost.baixades b, wikidb.page w where b.data>$data and w.page_id = b.idrebost and page_namespace='100' and b.mirall='$etiqueta' group by b.idrebost order by Count desc limit $num");
			}

			#echo $query, "<br />";
			$result = mysql_query($query, $link);
			if (!$result) {
			    die('Invalid query: ' . mysql_error());
			}	
			$listprogs = array();
			$listcount = array();

			#RETRIEVE
			while ($line = mysql_fetch_array($result, MYSQL_ASSOC)) {

					$nom = $line['Nom'];

					array_push($listprogs, $nom);
					array_push($listcount, $line['Count']);

			}

			#generate!

			if (isset($_GET['xml'])) {

				process_xml($listprogs, $listcount);
			}

			else {

				process_html($listprogs, $listcount);

			}
			// Free resultset
			mysql_free_result($result);

		}

		mysql_close($link);

	}

}

function get_lapse ($lapse) {

	$data_actual = getdate();

	$any_actual = $data_actual['year'];
	$mes_actual = two_digits($data_actual['mon']);
	$dia_actual = two_digits($data_actual['mday']);
	$hora_actual = two_digits($data_actual['hours']);
	$minut_actual = two_digits($data_actual['minutes']);
	$segon_actual = two_digits($data_actual['seconds']);

	$string_data_actual = $any_actual.$mes_actual.$dia_actual.$hora_actual.$minut_actual.$segon_actual;

	if ($lapse == 'dia') {

		$string_out =  $any_actual.$mes_actual.$dia_actual."000000";

	}

	else if ($lapse == 'any') {

		$string_out =  $any_actual."0000000000";
	}

	else {

		$string_out =  $any_actual.$mes_actual."00000000";

	}

	return($string_out);

}

function two_digits($date) {

	if (strlen($date) == 1) {

	$date = "0".$date;

	}

	return($date);
}

function process_html($listname, $listcount) {

echo '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="ca">
<head>
<title>Top Softcatalà</title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link rel="stylesheet" href="http://www.softcatala.org/css/sc.css" type="text/css" />
<link rel="stylesheet" href="http://www.softcatala.org/css/sc_ie.css" type="text/css" />
<link rel="icon" type="image/png" href="http://www.softcatala.org/img/favicon.png" />
</head>
<body>
<div class="boxtopten">
<ul>
';

for  ($i=0; $i<count($listname); $i++) {

$num = $i+1;
$nom = $listname[$i];
$nom = convert_codes($nom);
$urlprog = 'Rebost:'.$nom;
$nom = strtr($nom, "_", " ");

if ($i % 2) {echo '<li>';}

else {echo '<li class="bgris">';}

echo $num.'. <a href = "https://www.softcatala.org/wiki/'.$urlprog.'" target="_parent">'.$nom.'</a> <span class="red">('.$listcount[$i].')</span></li>';

}

echo '</ul>
</div>
</body>
</html>';


}

function process_xml($listname, $listcount) {

header('Content-type: application/xml; charset="utf-8"',true);

echo '<?xml version="1.0" encoding="UTF-8" ?>';

echo '<top>';

for  ($i=0; $i<count($listname); $i++) {

$num = $i+1;
$nom = $listname[$i];
$nom = iconv("UTF-8", "ISO-8859-1", $nom);
#$nom = convert_codes($nom);
$urlprog = 'Rebost:'.$nom;
$nom = strtr($nom, "_", " ");

echo '<program>';
echo '<rank>'.$num.'</rank>';
echo '<url>http://www.softcatala.org/wiki/'.$urlprog.'</url>';
echo '<name>'.$nom.'</name>';
echo '<down>'.$listcount[$i].'</down>';
echo '</program>';

}


echo '</top>';


}



function convert_codes($text) {

$text = utf8_decode($text);

$unicode = array('à', 'À', 'è', 'È', 'é', 'É', 'í', 'Í', 'ï', 'Ï', 'ò', 'Ò', 'ó', 'Ó', 'ú', 'Ú', 'ü', 'Ü', 'ç', 'Ç' );

$letter  = array('&agrave;', '&Agrave;', '&egrave;', '&Egrave;', '&eacute;', '&Eacute;', '&iacute;', '&Iacute;', '&iuml;', '&Iuml;', '&ograve;', '&Ograve;', '&oacute;', '&Oacute;', '&uacute;', '&Uacute', '&uuml;', '&Uuml;', '&ccedil;', '&Ccedil;' );


$out = str_replace($unicode, $letter, $text);


return $out;

}


?>
