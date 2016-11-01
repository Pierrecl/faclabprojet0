
$(document).on('turbolinks:load', function() {

  var opts = {
      lines: 11 // The number of lines to draw
    , length: 28 // The length of each line
    , width: 7 // The line thickness
    , radius: 30 // The radius of the inner circle
    , scale: 1 // Scales overall size of the spinner
    , corners: 1 // Corner roundness (0..1)
    , color: '#888' // #rgb or #rrggbb or array of colors
    , opacity: 0.25 // Opacity of the lines
    , rotate: 0 // The rotation offset
    , direction: 1 // 1: clockwise, -1: counterclockwise
    , speed: 1 // Rounds per second
    , trail: 60 // Afterglow percentage
    , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
    , zIndex: 2e9 // The z-index (defaults to 2000000000)
    , className: 'spinner' // The CSS class to assign to the spinner
    , top: '45%' // Top position relative to parent
    , left: '50%' // Left position relative to parent
    , shadow: false // Whether to render a shadow
    , hwaccel: false // Whether to use hardware acceleration
    // , position: 'absolute' // Element positioning
  }

  var dateFormat = 'yy-mm-dd',
      start_date = $( "#start_date" )
        .datepicker({
          dateFormat: 'yy-mm-dd',
          defaultDate: "+1w",
          changeMonth: true,
          numberOfMonths: 1
        })
        .on( "change", function() {
          end_date.datepicker( "option", "minDate", getDate( this ) );
        }),
      end_date = $( "#end_date" ).datepicker({
        dateFormat: 'yy-mm-dd',
        defaultDate: "+1w",
        changeMonth: true,
        maxDate: '+0m +0w',
        numberOfMonths: 1
      })
      .on( "change", function() {
        start_date.datepicker( "option", "maxDate", getDate( this ) );
      });

  function getDate( element ) {
    var date;
    try {
      date = $.datepicker.parseDate( dateFormat, element.value );

    } catch( error ) {
      date = null;
    }
    return date;
  }

  loadMyChartData();
  var chartInstance = null;

  $("#myChart").hide();

  var target = document.getElementById('loading');
  var spinner = new Spinner(opts).spin(target);
  $(target).data('spinner', spinner);

  // onChange on the filter "place"
  $("#place_place_id").on('change',function(){
    var filters = [];
    filters['place_id'] = $(this).val();
    filters['start_date']   = start_date.val();
    filters['end_date']     = end_date.val();

    var target = document.getElementById('loading');
    var spinner = new Spinner(opts).spin(target);
    $(target).data('spinner', spinner);

    chartInstance.destroy();
    loadMyChartData(filters);
  });

  $("#chartType").on('change',function(){
    $("#chartType").trigger('typeChanged');
  });

  $("#valider").on('click',function(){
    var filters = [];
    filters['place_id'] = $("#place_place_id").val();
    filters['start_date']   = start_date.val();
    filters['end_date']     = end_date.val();

    var target = document.getElementById('loading');
    var spinner = new Spinner(opts).spin(target);
    $(target).data('spinner', spinner);

    chartInstance.destroy();
    loadMyChartData(filters);
  });

  function ajaxRequest(filters)
  {
    if (typeof filters === "undefined")
    {
      var filters = [];
      filters['start_date'] = getDateToday();
      filters['end_date'] = getDateToday();
    }
    else {
      if(filters['start_date'] === "" && filters['end_date'] === ""){
        filters['start_date'] = getDateToday();
        filters['end_date'] = getDateToday();
      }
    }

    filters['place_id'] = $("#place_place_id").val();
    var datas = {
        start_date: filters['start_date'],
        end_date: filters['end_date'],
        place_id: filters['place_id']
    };

    return $.ajax({
                  url: "/visits/index",
                  method: 'POST',
                  data: datas,
                  dataType: "json",
                });
  }

  function loadMyChartData(filters)
  {
    var request = null;

    // Chargement de base de la charte
    if(typeof filters === "undefined")
    {
      request = ajaxRequest(filters);

      request.then(function(data){ DrawMyChart(data.labels,data.datas); });
      request.fail(function(err){console.log(err); });
    }
    else
    {
      request = ajaxRequest(filters);

      request.then(function(data){ DrawMyChart(data.labels,data.datas); });
      request.fail(function(err){console.log(err); });
    }
  }

  function DrawMyChart(labels,datas_from_db)
  {
    $('#loading').data('spinner').stop();
    $("#myChart").show();

    console.log(datas_from_db);
    var infos = null;
    var ctx = document.getElementById("myChart").getContext("2d");
    ctx.canvas.width = 400;
    ctx.canvas.height = 300;

    var type = $("#chartType").val();

    infos = loadDatasForChart(type,labels,datas_from_db);
    chartInstance = new Chart(ctx, {
        type: type,
        data: infos['datas'],
        options: infos['options']
    });

    $("#chartType").bind('typeChanged',function(){
      var type = $(this).val();
      chartInstance.destroy();
      infos = loadDatasForChart(type,labels,datas_from_db);

      chartInstance = new Chart(ctx, {
          type: $(this).val(),
          data: infos['datas'],
          options: infos['options']
      });
    });

  }


  function loadDatasForChart(chartType,labels,datas_from_db)
  {
    var tabColors = [];
    var tabBorderColor = [];

    for (var i = 0; i < datas_from_db.length; i++) {
      var color = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
      tabColors[i] = color;
    }

    var datas = null;
    var options = null;
    var infos  = [];
    if (chartType === "line")
    {
      datas = {
        labels: labels,
        datasets: [
          {
              label: " nombres de personne ",
              backgroundColor: "#83D6DE",
              borderColor: "#1DABB8",
              data: datas_from_db
          }
        ]
      }
      options = {
        title: {
                display: true,
                text: 'Statistiques du ',
            },
          animation : {
            easing:'easeOutBounce',
            duration:1500,
            animateScale:true
          },
          legend: {display:true},
          scales: { yAxes: [{ ticks: { beginAtZero:true } }] }
      }
    }
    else if (chartType === "bar")
    {
      var colors = [];
      for (var i = 0; i < tabColors.length; i++)
      {
        tabBorderColor[i] = tabColors[i].replace("rgb","");
        tabBorderColor[i] = tabBorderColor[i].replace("(","");
        tabBorderColor[i] = tabBorderColor[i].replace(")","");

        colors[i] = 'rgba('+tabBorderColor[i]+',0.2)';
        tabBorderColor[i] = 'rgba('+tabBorderColor[i]+',1)';
      }

      console.log(colors);
      console.log(tabBorderColor);

      datas = {
        labels: labels,
        datasets: [
            {
                label: "My First dataset",
                backgroundColor: colors,
                borderColor: tabBorderColor,
                borderWidth: 1,
                data: datas_from_db,
            }
          ]
      };
      options = {
        title: {
                display: true,
                text: 'Statistiques du ',
            },
          legend: {display:true},
          scales: { yAxes: [{ ticks: { beginAtZero:true } }] }
      }
    }
    else if (chartType === "radar")
    {
      datas = {
        labels: labels,
        datasets: [{
              label: "My First dataset",
              backgroundColor: "rgba(179,181,198,0.2)",
              borderColor: "rgba(179,181,198,1)",
              pointBackgroundColor: "rgba(179,181,198,1)",
              pointBorderColor: "#fff",
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: "rgba(179,181,198,1)",
              data: datas_from_db
          }]
      };
      options = {
        animation : {
          easing:'easeOutBounce',
          duration:1500,
          animateScale:true
        }
      };
    }
    else if (chartType === "polarArea")
    {
      datas = {
        labels: labels,
        datasets: [{
            data: datas_from_db,
            backgroundColor: [
                "#FF6384",
                "#4BC0C0",
                "#FFCE56",
                "#E7E9ED",
                "#36A2EB"
            ],
            // label: 'My dataset' // for legend
        }]
      };
      options = {
        animation : {
          easing:'easeOutBounce',
          duration:1500,
          animateScale:true
        }
      };
    }
    else if (chartType === "pie")
    {
      datas = {
        labels: labels,
        datasets: [
            {
                data: datas_from_db,
                backgroundColor:tabColors,
                hoverBackgroundColor: tabColors
            }]
      };
      options = {
        animation : {
          easing:'easeOutBounce',
          duration:1500,
          animateScale:true
        }
      };
    }


    infos['datas'] = datas;
    infos['options'] = options;

    return infos;
  }

  function getDateToday()
  {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10)
      dd='0'+dd;
    if(mm<10)
        mm='0'+mm;
    today = yyyy+"-"+mm+"-"+dd;
    return today;
  }


  $('.hasDatepicker').click(function(){
    if($('.lightbox').css('display','none')){
      $('.lightbox').css('display','block');
      $('td').click(function(){
        $('.lightbox').css('display','none');
      });
    }
    else{
      $('.lightbox').css('display','none');
    }
  });
  $('.lightbox').click(function(){
    $('.lightbox').css('display','none');
  });




});
