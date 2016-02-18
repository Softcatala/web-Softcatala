<?php
/**
 * top_so.php file
 *
 * This file echoes a json data array containing the total download information for the programs on the website
 * classifying by Operating System
 *
 * @author Pau Iranzo <pau.iranzo@softcatala.org>
 * @version 1.0
 */
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

class SC_Generate_Top
{
    protected $link;

    const DB_User = 'rrebost';
    const Operating_Systems_Mapping = array(
        '1' => 'win32',
        '2' => 'linux',
        '3' => 'mac',
        '4' => 'java',
        '5' => 'win64',
        '6' => 'linux64',
        '7' => 'and',
        '8' => 'mob',
        '9' => 'ios',
        '10' => 'web',
        '11' => 'webapp'
    );
    const Operating_Systems = array(
        'windows' => '"1","5"',
        'linux' => '"2","6"',
        'mac' => '3',
        'android' => '7',
        'ios' => '9'
    );
    const DB_Pass = 'mypasswd';
    const DB_Name = 'rebost';
    const Max_Count = '10';
    const Lapse = '';

    public function __construct()
    {
        $this->link = mysqli_connect('localhost', self::DB_User, self::DB_Pass, self::DB_Name);
        mysqli_set_charset($this->link, 'utf8');

        if (!$this->link) {
            echo "Error: Unable to connect to MySQL." . PHP_EOL;
            echo "Debugging errno: " . mysqli_connect_errno() . PHP_EOL;
            echo "Debugging error: " . mysqli_connect_error() . PHP_EOL;
            exit;
        }
    }

    /**
     * Main execution function
     *
     * @param void
     * @return void
     */
    public function run()
    {
        $type = $_GET['type'];

        switch ( $type ) {
            case 'full':
                $this->generate_full_json();
                break;
            case 'top':
                $this->generate_top_json();
                break;
        }

        die();
    }

    /**
     * Generates the final JSON of total downloads for the current month for each operating system
     *
     * @param void
     * @return void
     */
    public function generate_full_json()
    {
        $query = $this->build_the_query( 'full' );
        $json_downloads_data = $this->do_the_query( $query );

        echo json_encode($json_downloads_data);
    }

    /**
     * Generates the final JSON of total downloads for the current month for each operating system
     *
     * @param void
     * @return void
     */
    public function generate_top_json()
    {
        $json_downloads_data = array();
        foreach ( self::Operating_Systems as $key => $os ) {
            $query = $this->build_the_query( 'top', $os );
            $json_downloads_data[$key] = $this->do_the_query( $query );
        }

        echo json_encode($json_downloads_data);
    }

    /**
     * This function generates the DB query
     *
     * @param string $type
     * @param array $os
     * @return string $query
     */
    private function build_the_query ( $type, $os = array() )
    {
        if ( $type == 'full' ) {
            $query = "SELECT
                       count(b.wordpress_id) as total,
                       b.idrebost,
                       b.wordpress_id,
                       t.title as Nom
                  FROM baixades_titles t, baixades b
                  WHERE t.wordpress_id = b.wordpress_id
                  group by b.wordpress_id";

        } else if ( $type == 'top' ) {
            $limit = self::Max_Count;

            $query = "SELECT
                       count(b.wordpress_id) as total,
                       b.idrebost,
                       b.wordpress_id,
                       t.title as Nom
                  FROM baixades_titles t, baixades b
                  WHERE
                  YEAR(b.data) = YEAR(NOW())
                  AND MONTH(b.data) = MONTH(NOW())
                  AND t.wordpress_id = b.wordpress_id
                  AND so IN ($os)
                  group by b.idrebost
                  order by total DESC
                  LIMIT $limit";
        }

        return $query;
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

$top = new SC_Generate_Top();
$top->run();
