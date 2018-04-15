<?php
  $mysqli = new mysqli("localhost","u0494820_default","5HFc8f!U","u0494820_default");
  // инициировать сессию
 session_start();
$_SESSION['nick'] = $_POST['name'];
  //ДОБАВЛЕНИЕ ЗАПИСЕЙ
if(isset($_POST['task']) AND isset($_POST['price']) AND isset($_POST['name']))
{
	$mysqli->query("INSERT INTO `hack` (`name`,`task`,`price`) VALUES ('$_POST[name]','$_POST[task]','$_POST[price]') ");
$mysqli->close();
	header("location: index.php");
exit;
}
  
?>