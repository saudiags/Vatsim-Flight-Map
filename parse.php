#!/usr/local/bin/php-cli
<?php
if (!(php_sapi_name() === 'cli')) die("not cli!" . PHP_EOL);

$arUrl = array(
    "http://www.pcflyer.net/DataFeed/vatsim-data.txt",
    "http://fsproshop.com/servinfo/vatsim-data.txt",
    "http://info.vroute.net/vatsim-data.txt",
    "http://data.vattastic.com/vatsim-data.txt",
    "http://vatsim.aircharts.org/vatsim-data.txt"
);

function trytoparse($url){
    $clients_container = Array();
    $data = @file_get_contents($url);
    if (!$data) {
        echo ("file_get_contents fails... ($url)" . PHP_EOL);
        return false;
    }
    @preg_match("/!CLIENTS:(.*)" . PHP_EOL . ";" . PHP_EOL . ";" . PHP_EOL . "!SERVERS:/s", $data, $clients_container);
    if (!isset($clients_container[1])) {
        echo ("can't parse data ($url)" . PHP_EOL);
        return false;
    }
    $clients = "";
    
    @preg_match_all("/(.*):" . PHP_EOL . "/", $clients_container[1], $clients);
    
    if (!isset($clients[1])) {
        echo ("cannot parse !CLIENTS container ($url)" . PHP_EOL);
        return false;
    }
    
    $clients = $clients[1];
    
    @preg_match("/!CLIENTS section -(.*):" . PHP_EOL . "; !PREFILE/", $data, $clients_tpl);
    
    if (!isset($clients_tpl[1])) {
        echo ("cannot parse clients_tpl ($url)" . PHP_EOL);
        return false;
    }
    
    $clients_final = array();
    
    foreach ($clients as $key => $item) {
        $clients_final[$key] = array_combine(explode(":", trim($clients_tpl[1])), explode(":", $item));
        foreach ($clients_final[$key] as $k => $v) {
            if ($k == "atis_message" && $clients_final[$key][$k])
                $clients_final[$key][$k] = htmlentities($clients_final[$key][$k]);
            if ($v === "" || in_array($k, array(
                //"time_logon",
                "rating",
                "protrevision",
                "server",
                "planned_destairport_lon",
                "planned_destairport_lat",
                "planned_revision",
                "planned_depairport_lon",
                "planned_depairport_lat",
                "planned_flighttype",
                "atis_message",
                "planned_actdeptime"
            ))) {
                unset($clients_final[$key][$k]);
            }
        }
    }
    
    if (!count($clients_final)) {
        echo ("count(clients_final) = 0 ($url)" . PHP_EOL);
        return false;
    }
    
    $result_json = json_encode($clients_final);
    
    if (!$result_json) {
        echo ("json_encode fails ($url)" . PHP_EOL);
        return false;
    }
    
    $res = file_put_contents("./clients.json", $result_json, LOCK_EX);
    
    if (!$res) {
        echo ("file_put_contents fails ($url)" . PHP_EOL);
        return false;
    }
    echo ("ok ($url)" . PHP_EOL);
    return true;
}

shuffle($arUrl);

foreach ($arUrl as $url) {
    if (trytoparse($url)) {
        break;
    }
}

exit(0);

?>
