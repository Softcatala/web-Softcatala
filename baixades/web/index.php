<?php

include("browser_detection.php");

#Retrieved parameters
$url =$_GET['url'];
$extern = $_GET['extern'];
$mirall =$_GET['mirall'];
$idrebost =$_GET['id'];
$so = $_GET['so'];
$versio = $_GET['versio'];

#$url="http://download.mozilla.org/?product=firefox-2.0.0.13&os=linux&lang=ca";
#$url="ftp://ftp.softcatala.org/pub/softcatala/openoffice/2.3.1/windows/OOo_2.3.1_Win32Intel_install_ca.exe";
#$idrebost ="OpenOffice.org";
#$mirall ="softcatala";
#$so = "win32";
#$versio = "2.3.1";
#$extern = 1;

if (($url == '') or ($idrebost == '') or ($mirall == '')  or ($so == '') or ($versio == '')) {

	header( 'Location: https://www.softcatala.org' ) ;
}

if ($extern == '') {

	$extern = 0;
}

#Detection parameters
#Time
$data_actual = getdate();

$any_actual = $data_actual['year'];
$mes_actual = two_digits($data_actual['mon']);
$dia_actual = two_digits($data_actual['mday']);
$hora_actual = two_digits($data_actual['hours']);
$minut_actual = two_digits($data_actual['minutes']);
$segon_actual = two_digits($data_actual['seconds']);

$string_data_actual = $any_actual.$mes_actual.$dia_actual.$hora_actual.$minut_actual.$segon_actual;

#Client parameters

$user_agent = $_SERVER['HTTP_USER_AGENT'];

$type = browser_detection( 'ua_type' );
$browser = browser_detection( 'browser' );
$version = browser_detection( 'browser_math_number' );
$os = browser_detection( 'os' );
$os_version = browser_detection( 'os_number' );

$moz_browser ="undefined";

if ($browser == 'moz') {

	preg_match('/\s(\S+)$/', $user_agent, $moztag);
	$moz_tags = $moztag[0];

	$moztags = preg_split('/\//', $moz_tags);

	$moz_name = $moztags[0];
	$moz_name_version = $moztags[1];
}

if ($browser == 'webkit') {

        $moztags = browser_detection('webkit_data');
        $moz_name = ucfirst($moztags[0]);
        $moz_name_version = $moztags[1];

}


$codelang = preg_split("/\,/", $_SERVER["HTTP_ACCEPT_LANGUAGE"]);
$locale = $codelang[0];




#Correspondences
$mirall = getcorresp('mirall.txt', $mirall);
$so = getcorresp('so.txt', $so);
$os = getcorresp('os.txt', $os);
$type = getcorresp('type.txt', $type);
$browser = getcorresp('browser.txt', $browser);



#Insert in MySQL
insert_in_db($string_data_actual, $locale, $os, $os_version, $type, $browser, $version, $moz_name, $moz_name_version,
			$extern,$mirall, $idrebost, $so, $versio);

#header('Content-Type: text/html; charset=utf-8');

#echo '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';

#echo "\n". "<html>";

#echo "<body>\n";

#echo (
#'Version'. $version .'<br />'.
#'os_version'.$os_version .'<br />'
#);

#echo "Language:". $locale . "<br />";

#echo $string_data_actual. "<br />";

#echo "</body>\n";
#echo "</html>\n";


header( 'Location: '.$url ) ;


function two_digits($date) {

	if (strlen($date) == 1) {

	$date = "0".$date;

	}

	return($date);
}

function insert_in_db($string_data_actual, $locale, $os, $os_version, $type, $browser, $version, $moz_name, $moz_name_version,
			$extern,$mirall, $idrebost, $so, $versio) {

	$link = mysql_connect('localhost', 'rebost', 'mypasswd');


	if(!is_resource($link)) {


        die ("Failed to connect to the server\n");

    } else {

    	$db_selected = mysql_select_db('rebost', $link);

		if (!$db_selected) {
    		die ('Can\'t use foo : ' . mysql_error());
		}

		else {

			$idrebost = die_if_blank($idrebost);
			$mirall = die_if_blank($mirall);
			$so = die_if_blank($so);
			$versio = die_if_blank($versio);

			$locale = make_null($locale);
			$os = make_null($os);
			$os_version = make_null($os_version);
			$type = make_null($type);
			$browser = make_null($browser);
			$version = make_null($version);
			$moz_name = make_null($moz_name);
			$moz_name_version = make_null($moz_name_version);

			mysql_query("SET NAMES 'utf8'");

			// Make a safe query
		    $query = sprintf("INSERT INTO baixades (`data`, `idrebost`, `mirall`, `extern`, `so`, `versio`, " .
		    		"`locale`, `os`, `os_version`, `type`, `browser`, `browser_version`, `moz_name`, `moz_name_version`  ) " .
		    		"VALUES ('%s', %s, %s, %d, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
		    		$string_data_actual,
		    		$idrebost,
					$mirall,
					$extern,
					$so,
					$versio,
					$locale,
					$os,
					$os_version,
					$type,
					$browser,
					$version,
					$moz_name,
					$moz_name_version
					);

			#echo $query, "<br />";
		    mysql_query($query, $link);

		}

		mysql_close($link);

	}

}

#Quit program if key params are blank
function die_if_blank ($param) {

	if (preg_match('/^\s*$/', $param)) {

		die;
	}

	else {

		$param = "'". mysql_real_escape_string($param) . "'";
		return($param);
	}

}

#NULL if pertinent
function make_null ($param) {

	if (preg_match('/^\s*$/', $param)) {

		$param = 'NULL';
	}

	else {

		$param = "'". mysql_real_escape_string($param). "'";

	}

	return($param);

}

function getcorresp ($file, $param) {

	$lines = file("../corresp/$file");

	$out = 0;

	foreach ($lines as $line_num => $line) {

		if (rtrim($line) == rtrim($param)) {

			$out = $line_num + 1;
			#echo "Au -> $line - $param: $out<br />\n";

		}

	}

	return($out);

}


?>


