var chart4    = dc.pieChart("#test4");
var chart3    = dc.rowChart("#test3");
var chart2    = dc.rowChart("#test2");
var chart     = dc.sunburstChart("#test");
//
var monthChart  = dc.barChart("#barchart");

var mes = {'0':'N.D','1':'JANEIRO','2':'FEVEREIRO','3':'MARÇO','4':'ABRIL','5':'MAIO','6':'JUNHO','7':'JULHO','8':'AGOSTO','9':'SETEMBRO','10':'OUTUBRO','11':'NOVEMBRO','12':'DEZEMBRO'};

function intervalTreeGroup(tree, firstDate, lastDate) {
    return {
        all: function() {
            var begin = d3.timeMonth(firstDate), end = d3.timeMonth(lastDate);
            var i = new Date(begin);
            var ret = [], count;
            do {
                next = new Date(i);
                next.setMonth(next.getMonth()+1);
                count = 0;
                tree.queryInterval(i.getTime(), next.getTime(), function() {
                    ++count;
                });
                ret.push({key: i, value: count});
                i = next;
            }
            while(i.getTime() <= end.getTime());
            return ret;
        }
    };
}

var dateFormatSpecifier = '%x';
var dateFormatParser = d3.timeParse(dateFormatSpecifier);


d3.csv("sifilis.csv").then(function(experiments) {
    //experiments = experiments.slice(0, 5);

    experiments.forEach(function(d) {
       let tmp = new Date(new Date(d.DT_TRANSSM).getTime());
       d.DT_TRANSSM  = (tmp == 'Invalid Date') ? new Date() : tmp;
       d.month       = d3.timeMonth(d.DT_TRANSSM).getMonth();
       d.open        = d.DT_TRANSSM;

       d.min    = new Date(new Date(d.DT_TRANSSM).getTime());//-(86400000));
       d.max    = new Date(new Date(d.DT_TRANSSM).getTime());//+(86400000*30));
       d.interval = [new Date(d.DT_TRANSSM).getTime()-(86400000*30),new Date(d.DT_TRANSSM).getTime()-(86400000*30)];//+(86400000*30)
    });
    var firstDate = d3.min(experiments, function(x) { return (x != NaN) ? x['min'] :0; }),
        lastDate  = d3.max(experiments, function(x) { return (x != NaN) ? x['max'] :0; });
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
        return d.DT_TRANSSM.getMonth();
    });

    chart4
        .width(400)
        .height(400)
        .dimension(chart4Dimension)
        .group(chart4Group)
        .legend(dc.legend())
        .on('pretransition', function(chart) {
            chart.selectAll('text.pie-slice').text(function(d) {
                return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
            })
        });


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
        .height(500)
        .innerRadius(50)
        .dimension(sunburstDimension)
        .group(sunburstGroup);
        //.legend(dc.legend());


  //BAR
  var intervalDimension = ndx.dimension(function(d) {return d.interval;});
  var projectsPerMonthTree = ndx.groupAll().reduce(
      function(v, d) {
          v.insert(d.interval);
          return v;
      },
      function(v, d) {
          v.remove(d.interval);
          return v;
      },
      function() {
          return lysenkoIntervalTree(null);
      }
  );
  var projectsPerMonthGroup = intervalTreeGroup(projectsPerMonthTree.value(), firstDate, lastDate);

  monthChart
         .width(1000)
         .height(300)
         .x(d3.scaleTime())
         .y(d3.scaleLinear().domain([0,500]))
         .xUnits(d3.timeMonths)
         .gap(5)
         .elasticX(true)
         .brushOn(true)
         .yAxisLabel("Número de Casos")
         .xAxisLabel("Meses")
         .dimension(intervalDimension)
         .group(projectsPerMonthGroup)
         .controlsUseVisibility(true);
         monthChart.filterHandler(function(dim, filters) {
             if(filters && filters.length) {
                 if(filters.length !== 1)
                     throw new Error('not expecting more than one range filter');
                 var range = filters[0];
                 dim.filterFunction(function(i) {
                     console.log(i);
                     return !(i[1] < range[0].getTime() || i[0] > range[1].getTime());
                 })
             }
             else dim.filterAll();
             return filters;
         });

  //


    dc.renderAll();

});
