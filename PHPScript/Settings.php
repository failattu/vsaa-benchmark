<?php
$user = "";
$pass = "";
$dbengine = "mysql"; //mssql
try 
{
    $dbh = new PDO($dbengine . ':host=localhost;dbname=kajak', $user, $pass, array(PDO::ATTR_PERSISTENT => true));
} 
catch (PDOException $e) 
{
    print "Error!: " . $e->getMessage() . "<br/>";
    die();
}


?>
