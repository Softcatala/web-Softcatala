<?php
/**
 * Download count management file
 *
 * This file manages the download information whenever a user clicks on a download link in Softcatalà, it
 * inserts the user information into the DB
 *
 * @author Pau Iranzo <pau.iranzo@softcatala.org>
 * @version 1.0
 */

include("browser_detection.php");

class SC_Baixades
{
    protected $link;
    const DB_User = 'rrebost';
    const DB_Pass = 'mypasswd';
    const DB_Name = 'rebost';

    public function __construct()
    {
        //Connect to the DB
        $this->link = mysqli_connect('localhost', self::DB_User, self::DB_Pass, self::DB_Name);

        //Process
        $params = $this->getParams();
        $this->processDownloadRequest($params);
    }

    private function getParams()
    {
        $params['url'] = $_GET['url'];
        $params['extern'] = $_GET['extern'];
        $params['mirall'] = $_GET['mirall'];
        $params['idrebost'] = $_GET['id'];
        $params['wordpress_id'] =$_GET['wid'];
        $params['so'] = $_GET['so'];
        $params['versio'] = $_GET['versio'];

        return $params;
    }

    /**
     * Process the download params and prepare them for the insertion in the DB
     *
     * @param $params
     */
    private function processDownloadRequest($params)
    {
        $params = $this->checkParams($params);
        $params = $this->prepareParams($params);

        $this->insertDownloadInDB($params);
    }

    /**
     * Checks whether all necessary params are set. If not, it redirects to the Softcatalà home page
     *
     * @param $params
     * @return mixed
     */
    private function checkParams($params) {
        if ( $params['url'] == '' || $params['url'] == '' || $params['so'] == '' || $params['versio'] == '' ) {
            header( 'Location: https://www.softcatala.org' ) ;
            die();
        } else {
            if ( $params['extern'] == '') {
                $params['extern'] = 0;
            }
            if ( $params['idrebost'] == '') {
                $params['idrebost'] = 0;
            }
        }

        return $params;
    }

    /**
     * Prepare the params to be inserted in the DB
     *
     * @param $params
     * @return mixed
     */
    private function prepareParams($params) {
        //Download date
        $params['data'] = date('Y-m-d h:i:s');

        //Browser data
        $params = $this->getBrowserData($params);

        //Correspondencies
        $params['mirall'] = getcorresp('mirall.txt', $params['mirall'] );
        $params['so'] = getcorresp('so.txt', $params['so'] );
        $params['browser']['os'] = getcorresp('os.txt', $params['browser']['os'] );
        $params['browser']['type'] = getcorresp('type.txt', $params['browser']['type'] );
        $params['browser']['browser'] = getcorresp( 'browser.txt', $params['browser']['browser'] );

        return $params;
    }

    /**
     * Generate all the params related to browser information
     *
     * @param $params
     * @return mixed
     */
    private function getBrowserData($params) {
        $user_agent = $_SERVER['HTTP_USER_AGENT'];
        $params['browser']['type'] = browser_detection( 'ua_type' );
        $params['browser']['browser'] = browser_detection( 'browser' );
        $params['browser']['version'] = browser_detection( 'browser_math_number' );
        $params['browser']['os'] = browser_detection( 'os' );
        $params['browser']['os_version'] = browser_detection( 'os_number' );

        if ( $params['browser']['browser'] == 'moz' ) {
            preg_match('/\s(\S+)$/', $user_agent, $moztag);
            $moz_tags = $moztag[0];

            $moztags = preg_split('/\//', $moz_tags);

            $params['browser']['moz_name'] = $moztags[0];
            $params['browser']['moz_name_version'] = $moztags[1];
        }

        if ( $params['browser']['browser'] == 'webkit' ) {
            $moztags = browser_detection('webkit_data');
            $params['browser']['moz_name'] = ucfirst($moztags[0]);
            $params['browser']['moz_name_version'] = $moztags[1];
        }

        $codelang = preg_split("/\,/", $_SERVER["HTTP_ACCEPT_LANGUAGE"]);
        $params['browser']['locale'] = $codelang[0];

        return $params;
    }

    /**
     * Inserts the download data in the DB
     *
     * @param $params
     */
    private function insertDownloadInDB($params)
    {
        $query = sprintf("
            INSERT INTO baixades (
                `data`,
                `idrebost`,
                `wordpress_id`,
                `mirall`,
                `extern`,
                `so`,
                `versio`,
                `locale`,
                `os`,
                `os_version`,
                `type`,
                `browser`,
                `browser_version`,
                `moz_name`,
                `moz_name_version`
            )
            VALUES ('%s', %s, %s, %d, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                $params['data'],
                $params['idrebost'],
                $params['wordpress_id'],
                $params['mirall'],
                $params['extern'],
                $params['so'],
                $params['versio'],
                $params['browser']['locale'],
                $params['browser']['os'],
                $params['browser']['os_version'],
                $params['browser']['type'],
                $params['browser']['browser'],
                $params['browser']['version'],
                $params['browser']['moz_name'],
                $params['browser']['moz_name_version']
        );

        $this->do_the_query($query);
    }

    /**
     * This function executes the passed query
     *
     * @param string $query
     * @return object $result
     */
    public function do_the_query( $query )
    {
        $result = array();

        $query_result = $this->link->query($query);

        while ($row = $query_result->fetch_object()){
            $result[] = $row;
        }

        return $result;
    }
}

new SC_Baixades();


