(function(window, document, $, undefined){

  var eddm = {};

  eddm.init = function() {
    eddm.doCal();
  }

  eddm.doCal = function() {

    var dd = new Calendar({
      element: $('.metrics-datepicker'),
      earliest_date: 'January 1, 2006',
      latest_date: moment(),
      start_date: moment().subtract(29, 'days'),
      end_date: moment(),
      callback: eddm.callback
    });

    // run it with defaults
    dd.calendarSaveDates();

  }

  eddm.callback = function() {

    var start = moment(this.start_date).format('ll'),
        end = moment(this.end_date).format('ll');

    console.debug('Start Date: '+ start +'\nEnd Date: '+ end);

    var data = {
      'action': 'edd_metrics_change_date',
      'start': start,
      'end' : end
    };

    var compareTemp = '% over the last ';

    $('.edd-metrics-box h2').html('<div id="circleG"><div id="circleG_1" class="circleG"></div><div id="circleG_2" class="circleG"></div><div id="circleG_3" class="circleG"></div></div>');

    $('.edd-metrics-box .bottom-text span').html('').removeClass();

    if( $(this.element[0]).hasClass('metrics-detail') ) {
      $.post( window.ajaxurl, data, eddm.detailResponse );
    } else {
      $.post( window.ajaxurl, data, eddm.dashResponse );
    }

  }

  eddm.dashResponse = function(response) {

    console.log( response );

    var data = JSON.parse(response);

    var compareTemp = '% over previous ' + data.dates.num_days + ' days';

    $('#revenue').text( '$' + data.earnings.total );
    $('#revenue-compare span').text( data.earnings.compare.percentage + compareTemp ).removeClass().addClass( data.earnings.compare.classes );

    $('#sales').text( data.sales.count );
    $('#sales-compare span').text( data.sales.compare.percentage + compareTemp ).removeClass().addClass( data.sales.compare.classes );

    $('#yearly').text( '$' + data.earnings.avgyearly.total );
    $('#avgyearly-compare span').text( data.earnings.avgyearly.compare.percentage + compareTemp ).removeClass().addClass( data.earnings.avgyearly.compare.classes );

    $('#avgpercust').text( '$' + data.earnings.avgpercust.total );
    $('#avgpercust-compare span').text( data.earnings.avgpercust.compare.percentage + compareTemp ).removeClass().addClass( data.earnings.avgpercust.compare.classes );

    $('#renewals').text( data.renewals.count );
    $('#renewal-amount').text( '$' + data.renewals.earnings );
    $('#renewals-compare span').text( data.renewals.compare.percentage + compareTemp ).removeClass().addClass( data.renewals.compare.classes );

    $('#refunds').text( data.refunds.count );
    $('#refund-amount').text( '$' + data.refunds.losses );
    $('#refunds-compare span').text( data.refunds.compare.percentage + compareTemp ).removeClass().addClass( data.refunds.compare.classes );

    // Charts
    $('.detail-compare-first').text( '$' + data.earnings.compare.total );
    $('#box-4 .bottom-text span').text( data.earnings.compare.percentage + '%' );

    $('#box-5 .bottom-text span').text( data.earnings.detail.sixmoago.compare + '%' );
    $('.detail-compare-second').text( '$' + data.earnings.detail.sixmoago.total );

    $('.detail-compare-third').text( '$' + data.earnings.detail.twelvemoago.total );

    eddm.doChart( data.chart );
    
  }

  eddm.detailResponse = function(response) {

    console.log( 'detailResponse', response );

    var data = JSON.parse(response);
    
    var metric = eddm.getQueryVariable('metric');

    switch( metric ) {
      case 'revenue':
          // do revenue

          $('.detail-compare-first').text( '$' + data.earnings.compare.total );
          $('#box-4 .bottom-text span').text( data.earnings.compare.percentage + '%' );

          $('#box-5 .bottom-text span').text( data.earnings.detail.sixmoago.compare + '%' );
          $('.detail-compare-second').text( '$' + data.earnings.detail.sixmoago.total );

          $('.detail-compare-third').text( '$' + data.earnings.detail.twelvemoago.total );
          break;
      case 'renewals':
          // ...
          break;
      default:
          // ...
    }

    eddm.doChart( data.chart );
    
  }

  eddm.getQueryVariable = function (variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
           var pair = vars[i].split("=");
           if(pair[0] == variable){return pair[1];}
    }
    return(false);
  }

  eddm.doChart = function( chart ) {

    console.log( chart.daily );

    var data = {
        labels: chart.labels,
        datasets: [
            {
                label: "Revenue",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "#fafafa",
                borderColor: "#0073aa",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "#0073aa",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 2,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "#0073aa",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 4,
                pointHitRadius: 10,
                data: chart.earnings,
                spanGaps: false
            },

            {
              label: "Sales",
              data: chart.sales
            }
        ]
    };

    var ctx = document.getElementById("metrics-chart");

    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            scales: {
                xAxes: [{
                    display: false,
                    stacked: true
                }],
            }
        }
    });
  }

  jQuery(document).ready( eddm.init );

})(window, document, jQuery);