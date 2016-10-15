
$(function(){

  //on charge une charte de base avec
  loadMyChart();

  /****************************************************************\
            OnChangesur chaque filtre
  \****************************************************************/
  // onChange sur le filtre "year"
  $("#start_date_year").on('change',function(){
    var filters = [];
    filters['yy'] = $(this).val();
    filters['mm'] = $("#start_date_month").val();
    filters['dd'] = $("#start_date_day").val();
    getDatasForMyChart(filters);
  });

  // onChange sur le filtre "month"
  $("#start_date_month").on('change',function(){
    var filters = [];
    filters['mm'] = $(this).val();
    filters['dd'] = $("#start_date_day").val();
    filters['yy'] = $("#start_date_year").val();
    getDatasForMyChart(filters);
  });

  // onChange sur le filtre "day"
  $("#start_date_day").on('change',function(){
    var filters = [];
    filters['dd'] = $(this).val();
    filters['yy'] = $("#start_date_year").val();
    filters['mm'] = $("#start_date_month").val();
    getDatasForMyChart(filters);
  });

  /****************************************************************\
          Fonction qui va récuperer les donées
  \****************************************************************/
  function getDatasForMyChart(dd,mm,yy)
  {
    var opts = {                //options pour la chart
        lines: 13 // The number of lines to draw
      , length: 28 // The length of each line
      , width: 14 // The line thickness
      , radius: 42 // The radius of the inner circle
      , scale: 1 // Scales overall size of the spinner
      , corners: 1 // Corner roundness (0..1)
      , color: '#000' // #rgb or #rrggbb or array of colors
      , opacity: 0.25 // Opacity of the lines
      , rotate: 0 // The rotation offset
      , direction: 1 // 1: clockwise, -1: counterclockwise
      , speed: 1 // Rounds per second
      , trail: 60 // Afterglow percentage
      , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
      , zIndex: 2e9 // The z-index (defaults to 2000000000)
      , className: 'spinner' // The CSS class to assign to the spinner
      , top: '50%' // Top position relative to parent
      , left: '50%' // Left position relative to parent
      , shadow: false // Whether to render a shadow
      , hwaccel: false // Whether to use hardware acceleration
      , position: 'absolute' // Element positioning
    }

    var place_name = $("#place_place_id").val();
    var datas = {
                dayFilter: dd,
                monthFilter: mm,
                yearFilter: yy,
                place_name: place_name
              };

    $("#my-spin").show();
    var target = document.getElementById('my-spin');
    var spinner = new Spinner(opts).spin(target);

    return $.ajax({
                  url: "/visits/index",
                  method: 'POST',
                  data: datas,
                  dataType: "json",
                });

  }//end of getDatasForMyChart()

  /****************************************************************\
          Chargement de la charte
  \****************************************************************/
  function loadMyChart(filters)
  {
    //label "Stat du : X"
    var date_stat = "";

    //recupere une promise qui va recuperer les infos depuis la bdd
    var request = "";

    // Chargement de base de la charte
    if(typeof filters === "undefined")
    {
      var date = new Date();
      var dd = date.getDate();
      var mm = date.getMonth()+1;
      var yy = date.getFullYear();

      console.log("Chargement de base loadMyChart()");
      request = getDatasForMyChart(dd,mm,yy);
      date_stat = dd+"/"+mm+"/"+yy;

      request.then(function(data){
        $("#my-spin").hide();
        showChart(data.labels,data.datas,date_stat);
      });
      request.fail(function(err){ $("#my-spin").hide(); console.log(err); });
    }
    else
    {
      var request = getDatasForMyChart(filters['dd'],filters['mm'],filters['yy']);
      date_stat = filters['dd']+"/"+filters['mm']+"/"+filters['yy'];

      request.then(function(data){
         $("#my-spin").hide();
         showChart(data.labels,data.datas,date_stat);
       });
      request.fail(function(err){ $("#my-spin").hide(); console.log(err);
      });
    }
  }//end Of loadMyChart()


  function showChart(labels,datas_from_db,date_stat)
  {
    var ctx = document.getElementById("myChart").getContext("2d");

    var datas = {
      labels: labels,
      datasets: [
        {
            label: " nb personne ",
            backgroundColor: "#83D6DE",
            borderColor: "#1DABB8",
            data: datas_from_db
        }
      ]
    }
    var options = {
      title: {
            display: true,
            text: 'Statistiques du ' + date_stat,
        },
      legend: false,
      scales: { yAxes: [{ ticks: { beginAtZero:true } }] }
    }

    var chartInstance = new Chart(ctx, {
        type: 'line',
        data: datas,
        options: options
    });
  }

});
