<?php
//set true if using mongodb
$mongo = false;
if($mongo == true)
{
	require('Settings.php');

	$randomnum = rand ( 0 , 100 );
	if ($randomnum >= 50) {
		try
		{
			$query = "INSERT INTO Log (nro) VALUES (?)";
			$stm = $dbh->prepare($query);
			$stm->execute(array($randomnum));
			
		}
		catch(Expection $e)
		{
			echo $e;
		}
	}
	else
	{
		try
		{
			$query = "SELECT ID FROM Log WHERE ID = ?";
			$stm = $dbh->prepare($query);
			$stm->execute(array($randomnum));
			$result = $stm->fetchAll();
		}
		catch(Expection $e)
		{
			echo $e;
		}
	}
}
else
{
	$randomnum = rand ( 0 , 100 );
	$m = new MongoClient();
	$db = $m->vsaa;
	$collection = $db->Log;
	if ($randomnum >= 50) {
		$document = array( "nro" => $randomnum );
		$collection->insert($document);
	}
	else
	{
		$cursor = $collection->find();
	}
}

?>