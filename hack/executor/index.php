<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">


    <title>Ppl2Ppl</title>

    <!-- Bootstrap core CSS -->
    <link href="../css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../css/bootstrap-dialog.css">
    <!-- Custom styles for this template -->
    <link href="../css/style.css" rel="stylesheet">
      <!-- Pushy CSS -->
        <link rel="stylesheet" href="../css/pushy.css">


    <!-- Just for debugging purposes. Don't actually copy this line! -->
    <!--[if lt IE 9]><script src="../../assets/js/ie8-responsive-file-warning.js"></script><![endif]-->

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->

  </head>

  <body>
   <!-- Pushy Menu -->
        <nav class="pushy pushy-left" data-focus="#first-link">
            <div class="pushy-content">
              <div class="profil_img" >
                <img src="../images/Logo.png">
                <img src="../images/camera.png" class="img-circle">
                <div class="name" id="user" ></div>
              </div>
                <ul>
                    <li>
                      <a href="#">Настройки профиля</a>
                    </li>
                        <li>
                      <a href="#">Поиск заказов</a>
                </li>
                    <li>
                      <a href="#">Создание заказа</a>
                </li>
                    <li>
                      <a href="#">Кошелек</a>
                </li>
                    <li>
                      <a href="#">Мои заказы</a>
                </li>

                        <li>
                      <a href="#">Мои задания</a>
                </li>
                </ul>
            </div>
        </nav>
        <!-- Site Overlay -->
        <div class="site-overlay"></div>

  <button class="menu-btn btn" >&#9776; Меню</button>

      <div class="container-fluid">
        <div class="container">
          <div class="row">
           <div class="col-lg-5 col-md-5 ">
             <div class="actual">Актуальные задания</div>
              <div class="ex_task">
                <?php 
                   $mysqli = new mysqli("localhost","u0494820_default","5HFc8f!U","u0494820_default");
                   $result = $mysqli->query("SELECT * FROM hack");
                   $i = 0;
                   while(($row = $result->fetch_assoc() ) != false && $i < 5)
                    {
                      echo '<div class="task">';
                      echo '<div class="profil_foto"><img src="../images/camera.png" alt="" class="img-circle"></div>';
                      echo '<div class="name">'.$row["name"].'</div>';
                      echo  '<div class="wording_task">';
                      echo '<h1>Задание <span id="price" style="text-align:left;color: blue">'.$row["price"].'&#8381;</span></h1>';
                      echo  $row["task"].'</div>';
                      echo '<button id="callButton" data-name="'.$row["name"].'" class="take_task btn btn-success">Взять задание</button></div>';
                      $i++;
                    }
                        
                    $mysqli->close();
                ?>
             </div>
              
           </div> 
            <div class="col-lg-6 col-md-6 camera" >

              <div class="camera1" id="voximplant_container-remote"></div>
              <div class="camera1" id="voximplant_container-local"></div>
              
            </div> 

          </div>

        </div>

      </div>




        <!-- Bootstrap core JavaScript
    ================================================== -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
    <script src="../js/bootstrap.min.js"></script>
    <script type="text/javascript" src="../js/bootstrap-dialog.js"></script>
    <script type="text/javascript" src="//cdn.voximplant.com/edge/voximplant.min.js"></script>
    <script type="text/javascript" src="js/app-executor.js"></script> 
        
        <!-- Pushy JS -->
    <script src="../js/pushy.js"></script>
    <script type="text/javascript">
      var el = document.getElementById('user');
      el.innerText = username;
    </script>
  </body>
</html>