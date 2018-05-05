var chart4    = dc.rowChart("#test4");
var chart3    = dc.rowChart("#test3");
var chart2    = dc.rowChart("#test2");
var chart     = dc.sunburstChart("#test");
//
var barChart  = dc.barChart("#barchart");

var mes = {'0':'N.D','1':'JANEIRO','2':'FEVEREIRO','3':'MARÇO','4':'ABRIL','5':'MAIO','6':'JUNHO','7':'JULHO','8':'AGOSTO','9':'SETEMBRO','10':'OUTUBRO','11':'NOVEMBRO','12':'DEZEMBRO'};

d3.csv("sifilis.csv").then(function(experiments) {
    experiments.forEach(function(d) {
       let tmp = new Date(d.DT_TRANSSM);
       d.DT_TRANSSM  = (tmp == 'Invalid Date') ? new Date() : tmp;
       tmp = new Date(d.DT_DIAG);
       d.DT_DIAG  = (tmp == 'Invalid Date') ? new Date() : tmp;
       d.month       = d3.timeMonth(d.DT_TRANSSM).getMonth();
       d.open        = 1;
       d.close       = 12;
    });
  //experiments = experiments.slice(0, 5);
    var ndx = crossfilter(experiments);

    var sunburstDimension = ndx.dimension(function (d) {
            let date = d.DT_TRANSSM.getMonth();
            return [d.NU_ANO,d.CS_SEXO,mes[date],d.DT_TRANSSM];
    });//d.NU_NOTIFIC,d.NU_ANO,d.DT_DIAG,d.CS_SEXO,d.DT_TRANSSM
    var sunburstGroup = sunburstDimension.group().reduceSum(function (d) {
        return d.NU_ANO;
    });

    var chart2Dimension = ndx.dimension(function (d) {
        return d.CS_SEXO;
    });
    var chart2Group = chart2Dimension.group().reduceSum(function (d) {
        return d.NU_ANO;
    });

    var chart3Dimension = ndx.dimension(function (d) {
        return d.NU_ANO;
    });
    var chart3Group = chart3Dimension.group().reduceSum(function (d) {
        return d.NU_ANO;
    });

    var chart4Dimension = ndx.dimension(function (d) {
        return mes[d.DT_TRANSSM.getMonth()];
    });
    var chart4Group = chart4Dimension.group().reduceSum(function (d) {
        return d.NU_ANO;
    });

    chart4
        .width(400)
        .height(400)
        .dimension(chart4Dimension)
        .group(chart4Group);
        //.legend(dc.legend());

    chart3
        .width(500)
        .height(200)
        .dimension(chart3Dimension)
        .group(chart3Group);
        //.legend(dc.legend());

    chart2
        .width(500)
        .height(200)
        .dimension(chart2Dimension)
        .group(chart2Group);
        //.legend(dc.legend());

    chart
        .width(1000)
        .height(480)
        .innerRadius(100)
        .dimension(sunburstDimension)
        .group(sunburstGroup);
        //.legend(dc.legend());


  //BAR
  var monthlyDimension = ndx.dimension(function (d) { return +d.month; });
  var percentageGainByMonthArrayGroup = monthlyDimension.group().reduce(
      function(p,v) {
          var absGain = v.close - v.open;
          var percentageGain = v.open ? (absGain / v.open) * 100 : 0;
          //console.log('++',p + percentageGain);
          return p + percentageGain;
      },
      function(p,v) {
          var absGain = v.close - v.open;
          var percentageGain = v.open ? (absGain / v.open) * 100 : 0;
          //console.log('--',p + percentageGain);
          return p - percentageGain;
      },
      function() {
          return 0;
      }
  );

  barChart
      .dimension(monthlyDimension)
      .group(percentageGainByMonthArrayGroup)
      .width(12 * 80 + 80)
      .height(220)
      //.x(d3.scaleLinear().domain([0,12]))
      .x(d3.scaleTime().domain([new Date(1990, 12, 1), new Date(2013, 5, 31)]))
      .y(d3.scaleTime().domain([0,1]))
      .yAxisLabel("Meses")
      .xAxisLabel("Meses")
      .elasticX(true)
      .renderHorizontalGridLines(true)
      .brushOn(true)
      //.brushOn(true)
      .legend(dc.legend());
    barChart.on('filtered', function (a,b,c) {
      console.log(a,b,c);
    });

  //


    dc.renderAll();

});
