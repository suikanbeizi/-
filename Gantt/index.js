var Event = require('bcore/event');
var $ = require('jquery');
var _ = require('lodash');
var d3 = require('d3');
var css=require('./css/Gantt.css');
 //d3.tip=require('d3-tip');
/**
 * 马良基础类
 */
var Interval = undefined;
module.exports = Event.extend(function Base(container, config) {
  this.config = {
    theme: {}
  }
  this.container = d3.select(container);
  this.container1 = $(container);//容器
  this.apis = config.apis;                 //hook一定要有
  this._data = null;                       //数据
  this.chart = null;                       //图表
  this.init(config);

}, {
  /**
   * 公有初始化
   */
  init: function (config) {
    //1.初始化,合并配置
    this.mergeConfig(config);
    //2.刷新布局,针对有子组件的组件 可有可无
    this.updateLayout();
    //3.子组件实例化
    //this.chart = new Chart(this.container[0], this.config);
    //4.如果有需要, 更新样式
    this.updateStyle();
  },
  /**
   * 绘制
   * @param data
   * @param options 不一定有
   * !!注意: 第二个参数支持config, 就不需要updateOptions这个方法了
   */
  render: function (data, config) {
    data = this.data(data);
    var cfg = this.mergeConfig(config);
    //更新图表

    var tasks=[];
    var taskNames=[];
    for(var i=0;i<data.length;i++){
      tasks.push({"startDate":new Date(data[i].startDate),"endDate":new Date(data[i].endDate),"taskName":data[i].name,"fact":{"startDate":new Date(data[i].fact.startDate),"endDate":new Date(data[i].fact.endDate)}});
      taskNames.push(data[i].name);
    }
    //console.log(taskNames);
    tasks.sort(function(a, b) {
      return a.endDate - b.endDate;
    });

//    format = "%H:%M";

    var minDate=d3.min( tasks,function(d){ return d.startDate;})<d3.min( tasks,function(d){ return d.fact.startDate;})?d3.min( tasks,function(d){ return d.startDate;}):d3.min( tasks,function(d){ return d.fact.startDate;});
    var maxDate=d3.max( tasks,function(d){ return d.endDate;})>d3.max( tasks,function(d){ return d.fact.endDate;})?d3.max( tasks,function(d){ return d.endDate;}):d3.max( tasks,function(d){ return d.fact.endDate;});

    var margin = {
      top : cfg.margin.gbstyle.top>20?cfg.margin.gbstyle.top:20,
      right : cfg.margin.gbstyle.right>60?cfg.margin.gbstyle.right:60,
      bottom : cfg.margin.gbstyle.bottom>30?cfg.margin.gbstyle.bottom:30,
      left : cfg.margin.gbstyle.left>60?cfg.margin.gbstyle.left:60
    };
    var height = $(this.container1).height();
    var width = $(this.container1).width();
    var tickFormat = cfg.xstyle.text.timeStyle;
    var keyFunction = function(d) {
      return d.startDate + d.taskName + d.endDate;
    };
    var rectTransform = function(d) {
      return "translate(" + x(d.startDate) + "," + y(d.taskName) + ")";
    };
    x = d3.time.scale().domain([minDate,maxDate ]).range([ 0, width-margin.left-margin.right ]).clamp(true);
    y = d3.scale.ordinal().domain(taskNames).rangeRoundBands([ 0, height - margin.top*2 - margin.bottom*2 ], cfg.margin.gzstyle.gzdis);
    xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat))
      .tickSize(cfg.xstyle.zhouvalue.bjlong).tickPadding(cfg.xstyle.text.weizhi).ticks(cfg.xstyle.zhouvalue.num);
    yAxis = d3.svg.axis().scale(y).orient("left").tickSize(cfg.ystyle.zhouvalue.bjlong).tickPadding(cfg.ystyle.text.weizhi);
    //定义纵轴网格线
    var yInner = d3.svg.axis()
      .scale(x)
      .tickSize(-(height - margin.top - margin.bottom),0,0)
      .tickFormat("")
      .orient("bottom")
      .ticks(cfg.xstyle.zhouvalue.num);
    $(this.container1).find('.gannt_div').remove();
    var container_div =this.container
      .append("div")
      .attr("class","gannt_div");
    //标题
    if(cfg.biaoti.show){
      var biaotiweizhi;
      if(cfg.biaoti.buju=='left'){
        biaotiweizhi='left'
      }
      else if(cfg.biaoti.buju=='middle'){
        biaotiweizhi='middle'
      }
      else if(cfg.biaoti.buju=='right'){
        biaotiweizhi='right'
      }
      $(this.container1).find('.gannt_div').children('.biaoti_div').remove();
      var bt_div='<div style="text-align:'+ biaotiweizhi+';line-height: 1;height:'+cfg.biaoti.style.fontsize+' " class="biaoti_div">' +
        '<span style="color:'+cfg.biaoti.style.color+';font-size:'+cfg.biaoti.style.fontsize+'px;">'+cfg.biaoti.ming+'</span></div>'
      $(this.container1).find('.gannt_div').append(bt_div)
    }
    else{
      $(this.container1).find('.gannt_div').children('.biaoti_div').remove();
    }

    if(cfg.tuli.show&&(cfg.tuli.weizhi.weizhi=='topM'||cfg.tuli.weizhi.weizhi=='topL'||cfg.tuli.weizhi.weizhi=='topR')) {
      var tuliweizhi;
      if(cfg.tuli.weizhi.weizhi=='topM'){
        tuliweizhi='center';
      }
      else if(cfg.tuli.weizhi.weizhi=='topL'){
        tuliweizhi='left';
      }
      else if(cfg.tuli.weizhi.weizhi=='topR'){
        tuliweizhi='right';
      }
      $(this.container1).find('.gannt_div').children('.tuLi_div').remove();
      var div = '<div style="text-align:'+tuliweizhi+';line-height: 1;" class="tuLi_div">' +
        '<span style="display:inline-block;width:' + cfg.tuli.text.fontsize + 'px;height:' + cfg.tuli.text.fontsize + 'px ;background-color: ' + cfg.margin.gzstyle.upgzbg + ';margin-left:'+cfg.tuli.weizhi.jianju.lr+'px;"></span >' +
        '<span style="font-size:' + cfg.tuli.text.fontsize + 'px;color: ' + cfg.tuli.text.fontcolor + ';margin-right:'+cfg.tuli.weizhi.jianju.lr+'px;">' + cfg.tuli.text.zneirong + '</span>' +
        '<span style="display:inline-block;width:' + cfg.tuli.text.fontsize + 'px;height:' + cfg.tuli.text.fontsize + 'px ;background-color: ' + cfg.margin.gzstyle.downgzbg + ';margin-left:'+cfg.tuli.weizhi.jianju.lr+'px;"></span >' +
        '<span style="font-size:' + cfg.tuli.text.fontsize + 'px;color: ' + cfg.tuli.text.fontcolor + ';margin-right:'+cfg.tuli.weizhi.jianju.lr+'px;">' + cfg.tuli.text.fneirong + '</span>' +
        '</div>';
      $(this.container1).find('.gannt_div').append(div);
    }
    else{
      $(this.container1).find('.gannt_div').children('.tuLi_div').remove();
    }

    $(this.container1).find('.gannt_div').find(".svg_div").remove();
    //$(this.container1).find('.gannt_div').append('<div class="svg_div"></div>');
    var svg =container_div.append("div").attr("class","svg_div")
      .append("svg")
      .attr("class", "chart")
      .attr("width", "100%" )
      .attr("height", height-margin.bottom-margin.top/2)
      .append("g")
      .attr("width", width-margin.left-margin.right )
      .attr("height", height-margin.top-margin.bottom )
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    if(cfg.ystyle.wangge.show) {
      var yBar = svg.append("g")
        .attr("class", "inner_line")
        .attr("transform", "translate(0,"+(height - margin.top*2 - margin.bottom*2)+")")
        .attr("stroke",cfg.ystyle.wangge.color)
        .call(yInner);
    }

    svg.selectAll(".chart")
      .data(tasks, keyFunction).enter()
      .append("rect")
      .attr("rx", cfg.margin.gzstyle.raduis)
      .attr("ry", cfg.margin.gzstyle.raduis)
      .attr("class","planRect")
      .attr("y", 0)
      .attr("transform", rectTransform)
      .attr("height", function(d) { return y.rangeBand(); })
      .attr("width", function(d) {
        return (x(d.endDate) - x(d.startDate));
      })
      .attr('fill',cfg.margin.gzstyle.upgzbg);
    var factchart;
    if(cfg.margin.gzstyle.sweizhi=='top'){
      factchart=0;
    }
    else if(cfg.margin.gzstyle.sweizhi=='center'){
      factchart=y.rangeBand()/4;
    }
    else if(cfg.margin.gzstyle.sweizhi=='bottom'){
      factchart=y.rangeBand();
    }
    svg.selectAll(".factChart")
      .data(tasks).enter()
      .append("rect")
      .attr("rx", cfg.margin.gzstyle.sraduis)
      .attr("ry", cfg.margin.gzstyle.sraduis)
      .attr("class", ".factChart")
      .attr("x",function(d){
        return (x(d.fact.startDate)-x(d.startDate));
      })
      .attr("y", factchart)
      .attr("transform", rectTransform)
      .attr("height", function(d) { return y.rangeBand()*(1-cfg.margin.gzstyle.sgzdis); })
      .attr("width", function(d,i) {
        return (x(d.fact.endDate) - x(d.fact.startDate));
      })
      .attr("fill",cfg.margin.gzstyle.downgzbg);
      // .on('mouseover', factTip.show)
      // .on('mouseout', factTip.hide);

    //添加文字说明
    if(cfg.margin.values.show) {
      svg.selectAll(".textValue")
        .data(tasks)
        .enter()
        .append("text")
        .attr("class", "textValue")
        .attr("x", function (d) {
          return x(d.startDate);
        })
        .attr("y", function (d) {
          return y(d.taskName);
        })
        .attr("dx", function (d) {
          if(cfg.margin.values.text.xfontpos=='left'){
            return 0;
          }
          else if(cfg.margin.values.text.xfontpos=='middle'){
            return (x(d.endDate) - x(d.startDate))/2;
          }
          else if(cfg.margin.values.text.xfontpos=='right'){
            return (x(d.endDate) - x(d.startDate));
          }

        })
        .attr("dy", cfg.margin.values.text.fontpos)
        .transition()
        .text(function (d) {
          return ((d.endDate - d.startDate) / 1000 / 60 / 60 / 24) + '-' + ((d.fact.endDate - d.fact.startDate) / 1000 / 60 / 60 / 24);
        })
        .attr("fill", cfg.margin.values.text.fontcolor)
        .style("font-size", cfg.margin.values.text.fontsize);
      if(cfg.margin.values.text.animation) {
        var j = 0;
        clearInterval(Interval);
        Interval = setInterval(function () {
          $('.textValue').css("display", "none");
          $('.textValue:eq(' + j + ')').css("display", "block");
          if (j == ($('.textValue').length - 1)) {
            j = -1;
          }
          j++;
        }, cfg.margin.values.text.animationTime);
      }else{
        clearInterval(Interval);
      }
    }
    //绘制坐标轴
    if(cfg.xstyle.show) {
      var ax=svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + (height - margin.top*2 - margin.bottom*2) + ")")
        .call(xAxis);
      if(!cfg.xstyle.zhouvalue.show){
        ax.selectAll("text")
          .style("display","none");
      }
      ax.selectAll("text")
        .attr("fill", cfg.xstyle.text.fontcolor)
        .style("font-size", cfg.xstyle.text.fontsize)
        .attr("transform", "rotate("+cfg.xstyle.zhouvalue.jiaodu+") translate("+cfg.xstyle.text.fontweizhi+")");
      if(!cfg.xstyle.zhouline.show){
        ax.selectAll("path")
          .style("display","none");
        ax.selectAll("line")
          .style("display","none")
      }
      ax.selectAll("path")
        .attr("fill", cfg.xstyle.zhouline.color)
        .attr("stroke", cfg.xstyle.zhouline.color)
        .attr("stroke-width",cfg.xstyle.zhouline.lineweight);

      ax.selectAll("line")
        .attr("fill", cfg.xstyle.zhouline.color)
        .attr("stroke", cfg.xstyle.zhouline.color);
    }
    if(cfg.ystyle.show) {
     var ay= svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
      if(!cfg.ystyle.zhouvalue.show){
        ay.selectAll("text")
          .style("display","none");
      }
      ay.selectAll("text")
        .attr("fill", cfg.ystyle.text.fontcolor)
        .style("font-size", cfg.ystyle.text.fontsize)
        .attr("transform", "rotate("+cfg.ystyle.zhouvalue.jiaodu+")");
      if(cfg.ystyle.zhoudanwei.show) {
        ay.append("text")
          .text(cfg.ystyle.zhoudanwei.danwei)
          .attr("transform", "translate("+cfg.ystyle.zhoudanwei.weizhi+")")
          .attr("text-anchor", "end")
          .style("font-size", cfg.ystyle.zhoudanwei.fontsize)
          .attr("fill",cfg.ystyle.zhoudanwei.color);
      }
      if(!cfg.ystyle.zhouline.show){
        ay.selectAll("path")
          .style("display","none");
        ay.selectAll("line")
          .style("display","none")
      }
      ay.selectAll("path")
        .attr("fill", cfg.ystyle.zhouline.color)
        .attr("stroke", cfg.ystyle.zhouline.color)
        .attr("stroke-width",cfg.ystyle.zhouline.lineweight);

      ay.selectAll("line")
        .attr("fill", cfg.ystyle.zhouline.color)
        .attr("stroke", cfg.ystyle.zhouline.color);
    }
    if(cfg.tuli.show&&(cfg.tuli.weizhi.weizhi=='bottomM'||cfg.tuli.weizhi.weizhi=='bottomL'||cfg.tuli.weizhi.weizhi=='bottomR')) {
      var tuliweizhi;
      if(cfg.tuli.weizhi.weizhi=='bottomM'){
        tuliweizhi='center';
      }
      else if(cfg.tuli.weizhi.weizhi=='bottomL'){
        tuliweizhi='left';
      }
      else if(cfg.tuli.weizhi.weizhi=='bottomR'){
        tuliweizhi='right';
      }
      $(this.container1).find('.gannt_div').children('.tuLi_div').remove();
      var div = '<div style="text-align:'+tuliweizhi+';line-height: 1;" class="tuLi_div">' +
        '<span style="display:inline-block;width:' + cfg.tuli.text.fontsize + 'px;height:' + cfg.tuli.text.fontsize + 'px ;background-color: ' + cfg.margin.gzstyle.upgzbg + ';margin-left:'+cfg.tuli.weizhi.jianju.lr+'px;"></span >' +
        '<span style="font-size:' + cfg.tuli.text.fontsize + 'px;color: ' + cfg.tuli.text.fontcolor + ';margin-right:'+cfg.tuli.weizhi.jianju.lr+'px;">' + cfg.tuli.text.zneirong + '</span>' +
        '<span style="display:inline-block;width:' + cfg.tuli.text.fontsize + 'px;height:' + cfg.tuli.text.fontsize + 'px ;background-color: ' + cfg.margin.gzstyle.downgzbg + ';margin-left:'+cfg.tuli.weizhi.jianju.lr+'px;"></span >' +
        '<span style="font-size:' + cfg.tuli.text.fontsize + 'px;color: ' + cfg.tuli.text.fontcolor + ';margin-right:'+cfg.tuli.weizhi.jianju.lr+'px;">' + cfg.tuli.text.fneirong + '</span>' +
        '</div>';
      $(this.container1).find('.gannt_div').append(div);
    }
    // else{
    //   $(gannt_div).children('.tuLi_div').remove();
    // }
    //如果有需要的话,更新样式
    this.updateStyle();
  },
  /**
   *
   * @param width
   * @param height
   */
  resize: function (width, height,data,config) {
    this.updateLayout(width, height);
    //更新图表
    data = this.data(data);
    var cfg = this.mergeConfig(config);

    var tasks=[];
    var taskNames=[];
    for(var i=0;i<data.length;i++){
      tasks.push({"startDate":new Date(data[i].startDate),"endDate":new Date(data[i].endDate),"taskName":data[i].name,"fact":{"startDate":new Date(data[i].fact.startDate),"endDate":new Date(data[i].fact.endDate)}});
      taskNames.push(data[i].name);
    }
    //console.log(taskNames);
    tasks.sort(function(a, b) {
      return a.endDate - b.endDate;
    });

//    format = "%H:%M";

    var minDate=d3.min( tasks,function(d){ return d.startDate;})<d3.min( tasks,function(d){ return d.fact.startDate;})?d3.min( tasks,function(d){ return d.startDate;}):d3.min( tasks,function(d){ return d.fact.startDate;});
    var maxDate=d3.max( tasks,function(d){ return d.endDate;})>d3.max( tasks,function(d){ return d.fact.endDate;})?d3.max( tasks,function(d){ return d.endDate;}):d3.max( tasks,function(d){ return d.fact.endDate;});

    var margin = {
      top : cfg.margin.gbstyle.top>20?cfg.margin.gbstyle.top:20,
      right : cfg.margin.gbstyle.right>60?cfg.margin.gbstyle.right:60,
      bottom : cfg.margin.gbstyle.bottom>30?cfg.margin.gbstyle.bottom:30,
      left : cfg.margin.gbstyle.left>60?cfg.margin.gbstyle.left:60
    };
    var height = $(this.container1).height();
    var width = $(this.container1).width();
    var tickFormat = cfg.xstyle.text.timeStyle;
    var keyFunction = function(d) {
      return d.startDate + d.taskName + d.endDate;
    };
    var rectTransform = function(d) {
      return "translate(" + x(d.startDate) + "," + y(d.taskName) + ")";
    };
    x = d3.time.scale().domain([minDate,maxDate ]).range([ 0, width-margin.left-margin.right ]).clamp(true);
    y = d3.scale.ordinal().domain(taskNames).rangeRoundBands([ 0, height - margin.top*2 - margin.bottom*2 ], cfg.margin.gzstyle.gzdis);
    xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat))
      .tickSize(cfg.xstyle.zhouvalue.bjlong).tickPadding(cfg.xstyle.text.weizhi).ticks(cfg.xstyle.zhouvalue.num);
    yAxis = d3.svg.axis().scale(y).orient("left").tickSize(cfg.ystyle.zhouvalue.bjlong).tickPadding(cfg.ystyle.text.weizhi);
    //定义纵轴网格线
    var yInner = d3.svg.axis()
      .scale(x)
      .tickSize(-(height - margin.top - margin.bottom),0,0)
      .tickFormat("")
      .orient("bottom")
      .ticks(cfg.xstyle.zhouvalue.num);
    $(this.container1).find('.gannt_div').remove();
    var container_div =this.container
      .append("div")
      .attr("class","gannt_div");
    //标题
    if(cfg.biaoti.show){
      var biaotiweizhi;
      if(cfg.biaoti.buju=='left'){
        biaotiweizhi='left'
      }
      else if(cfg.biaoti.buju=='middle'){
        biaotiweizhi='middle'
      }
      else if(cfg.biaoti.buju=='right'){
        biaotiweizhi='right'
      }
      $(this.container1).find('.gannt_div').children('.biaoti_div').remove();
      var bt_div='<div style="text-align:'+ biaotiweizhi+';line-height: 1;height:'+cfg.biaoti.style.fontsize+' " class="biaoti_div">' +
        '<span style="color:'+cfg.biaoti.style.color+';font-size:'+cfg.biaoti.style.fontsize+'px;">'+cfg.biaoti.ming+'</span></div>'
      $(this.container1).find('.gannt_div').append(bt_div)
    }
    else{
      $(this.container1).find('.gannt_div').children('.biaoti_div').remove();
    }

    if(cfg.tuli.show&&(cfg.tuli.weizhi.weizhi=='topM'||cfg.tuli.weizhi.weizhi=='topL'||cfg.tuli.weizhi.weizhi=='topR')) {
      var tuliweizhi;
      if(cfg.tuli.weizhi.weizhi=='topM'){
        tuliweizhi='center';
      }
      else if(cfg.tuli.weizhi.weizhi=='topL'){
        tuliweizhi='left';
      }
      else if(cfg.tuli.weizhi.weizhi=='topR'){
        tuliweizhi='right';
      }
      $(this.container1).find('.gannt_div').children('.tuLi_div').remove();
      var div = '<div style="text-align:'+tuliweizhi+';line-height: 1;" class="tuLi_div">' +
        '<span style="display:inline-block;width:' + cfg.tuli.text.fontsize + 'px;height:' + cfg.tuli.text.fontsize + 'px ;background-color: ' + cfg.margin.gzstyle.upgzbg + ';margin-left:'+cfg.tuli.weizhi.jianju.lr+'px;"></span >' +
        '<span style="font-size:' + cfg.tuli.text.fontsize + 'px;color: ' + cfg.tuli.text.fontcolor + ';margin-right:'+cfg.tuli.weizhi.jianju.lr+'px;">' + cfg.tuli.text.zneirong + '</span>' +
        '<span style="display:inline-block;width:' + cfg.tuli.text.fontsize + 'px;height:' + cfg.tuli.text.fontsize + 'px ;background-color: ' + cfg.margin.gzstyle.downgzbg + ';margin-left:'+cfg.tuli.weizhi.jianju.lr+'px;"></span >' +
        '<span style="font-size:' + cfg.tuli.text.fontsize + 'px;color: ' + cfg.tuli.text.fontcolor + ';margin-right:'+cfg.tuli.weizhi.jianju.lr+'px;">' + cfg.tuli.text.fneirong + '</span>' +
        '</div>';
      $(this.container1).find('.gannt_div').append(div);
    }
    else{
      $(this.container1).find('.gannt_div').children('.tuLi_div').remove();
    }

    $(this.container1).find('.gannt_div').find(".svg_div").remove();
    //$(this.container1).find('.gannt_div').append('<div class="svg_div"></div>');
    var svg =container_div.append("div").attr("class","svg_div")
      .append("svg")
      .attr("class", "chart")
      .attr("width", "100%" )
      .attr("height", height-margin.bottom-margin.top/2)
      .append("g")
      .attr("width", width-margin.left-margin.right )
      .attr("height", height-margin.top-margin.bottom )
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    if(cfg.ystyle.wangge.show) {
      var yBar = svg.append("g")
        .attr("class", "inner_line")
        .attr("transform", "translate(0,"+(height - margin.top*2 - margin.bottom*2)+")")
        .attr("stroke",cfg.ystyle.wangge.color)
        .call(yInner);
    }

    svg.selectAll(".chart")
      .data(tasks, keyFunction).enter()
      .append("rect")
      .attr("rx", cfg.margin.gzstyle.raduis)
      .attr("ry", cfg.margin.gzstyle.raduis)
      .attr("class","planRect")
      .attr("y", 0)
      .attr("transform", rectTransform)
      .attr("height", function(d) { return y.rangeBand(); })
      .attr("width", function(d) {
        return (x(d.endDate) - x(d.startDate));
      })
      .attr('fill',cfg.margin.gzstyle.upgzbg);
    var factchart;
    if(cfg.margin.gzstyle.sweizhi=='top'){
      factchart=0;
    }
    else if(cfg.margin.gzstyle.sweizhi=='center'){
      factchart=y.rangeBand()/4;
    }
    else if(cfg.margin.gzstyle.sweizhi=='bottom'){
      factchart=y.rangeBand();
    }
    svg.selectAll(".factChart")
      .data(tasks).enter()
      .append("rect")
      .attr("rx", cfg.margin.gzstyle.sraduis)
      .attr("ry", cfg.margin.gzstyle.sraduis)
      .attr("class", ".factChart")
      .attr("x",function(d){
        return (x(d.fact.startDate)-x(d.startDate));
      })
      .attr("y", factchart)
      .attr("transform", rectTransform)
      .attr("height", function(d) { return y.rangeBand()*(1-cfg.margin.gzstyle.sgzdis); })
      .attr("width", function(d,i) {
        return (x(d.fact.endDate) - x(d.fact.startDate));
      })
      .attr("fill",cfg.margin.gzstyle.downgzbg);
    // .on('mouseover', factTip.show)
    // .on('mouseout', factTip.hide);

    //添加文字说明
    if(cfg.margin.values.show) {
      svg.selectAll(".textValue")
        .data(tasks)
        .enter()
        .append("text")
        .attr("class", "textValue")
        .attr("x", function (d) {
          return x(d.startDate);
        })
        .attr("y", function (d) {
          return y(d.taskName);
        })
        .attr("dx", function (d) {
          if(cfg.margin.values.text.xfontpos=='left'){
            return 0;
          }
          else if(cfg.margin.values.text.xfontpos=='middle'){
            return (x(d.endDate) - x(d.startDate))/2;
          }
          else if(cfg.margin.values.text.xfontpos=='right'){
            return (x(d.endDate) - x(d.startDate));
          }

        })
        .attr("dy", cfg.margin.values.text.fontpos)
        .transition()
        .text(function (d) {
          return ((d.endDate - d.startDate) / 1000 / 60 / 60 / 24) + '-' + ((d.fact.endDate - d.fact.startDate) / 1000 / 60 / 60 / 24);
        })
        .attr("fill", cfg.margin.values.text.fontcolor)
        .style("font-size", cfg.margin.values.text.fontsize);
      if(cfg.margin.values.text.animation) {
        var j = 0;
        clearInterval(Interval);
        Interval = setInterval(function () {
          $('.textValue').css("display", "none");
          $('.textValue:eq(' + j + ')').css("display", "block");
          if (j == ($('.textValue').length - 1)) {
            j = -1;
          }
          j++;
        }, cfg.margin.values.text.animationTime);
      }else{
        clearInterval(Interval);
      }
    }
    //绘制坐标轴
    if(cfg.xstyle.show) {
      var ax=svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + (height - margin.top*2 - margin.bottom*2) + ")")
        .call(xAxis);
      if(!cfg.xstyle.zhouvalue.show){
        ax.selectAll("text")
          .style("display","none");
      }
      ax.selectAll("text")
        .attr("fill", cfg.xstyle.text.fontcolor)
        .style("font-size", cfg.xstyle.text.fontsize)
        .attr("transform", "rotate("+cfg.xstyle.zhouvalue.jiaodu+") translate("+cfg.xstyle.text.fontweizhi+")");
      if(!cfg.xstyle.zhouline.show){
        ax.selectAll("path")
          .style("display","none");
        ax.selectAll("line")
          .style("display","none")
      }
      ax.selectAll("path")
        .attr("fill", cfg.xstyle.zhouline.color)
        .attr("stroke", cfg.xstyle.zhouline.color)
        .attr("stroke-width",cfg.xstyle.zhouline.lineweight);

      ax.selectAll("line")
        .attr("fill", cfg.xstyle.zhouline.color)
        .attr("stroke", cfg.xstyle.zhouline.color);
    }
    if(cfg.ystyle.show) {
      var ay= svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
      if(!cfg.ystyle.zhouvalue.show){
        ay.selectAll("text")
          .style("display","none");
      }
      ay.selectAll("text")
        .attr("fill", cfg.ystyle.text.fontcolor)
        .style("font-size", cfg.ystyle.text.fontsize)
        .attr("transform", "rotate("+cfg.ystyle.zhouvalue.jiaodu+")");
      if(cfg.ystyle.zhoudanwei.show) {
        ay.append("text")
          .text(cfg.ystyle.zhoudanwei.danwei)
          .attr("transform", "translate("+cfg.ystyle.zhoudanwei.weizhi+")")
          .attr("text-anchor", "end")
          .style("font-size", cfg.ystyle.zhoudanwei.fontsize)
          .attr("fill",cfg.ystyle.zhoudanwei.color);
      }
      if(!cfg.ystyle.zhouline.show){
        ay.selectAll("path")
          .style("display","none");
        ay.selectAll("line")
          .style("display","none")
      }
      ay.selectAll("path")
        .attr("fill", cfg.ystyle.zhouline.color)
        .attr("stroke", cfg.ystyle.zhouline.color)
        .attr("stroke-width",cfg.ystyle.zhouline.lineweight);

      ay.selectAll("line")
        .attr("fill", cfg.ystyle.zhouline.color)
        .attr("stroke", cfg.ystyle.zhouline.color);
    }
    if(cfg.tuli.show&&(cfg.tuli.weizhi.weizhi=='bottomM'||cfg.tuli.weizhi.weizhi=='bottomL'||cfg.tuli.weizhi.weizhi=='bottomR')) {
      var tuliweizhi;
      if(cfg.tuli.weizhi.weizhi=='bottomM'){
        tuliweizhi='center';
      }
      else if(cfg.tuli.weizhi.weizhi=='bottomL'){
        tuliweizhi='left';
      }
      else if(cfg.tuli.weizhi.weizhi=='bottomR'){
        tuliweizhi='right';
      }
      $(this.container1).find('.gannt_div').children('.tuLi_div').remove();
      var div = '<div style="text-align:'+tuliweizhi+';line-height: 1;" class="tuLi_div">' +
        '<span style="display:inline-block;width:' + cfg.tuli.text.fontsize + 'px;height:' + cfg.tuli.text.fontsize + 'px ;background-color: ' + cfg.margin.gzstyle.upgzbg + ';margin-left:'+cfg.tuli.weizhi.jianju.lr+'px;"></span >' +
        '<span style="font-size:' + cfg.tuli.text.fontsize + 'px;color: ' + cfg.tuli.text.fontcolor + ';margin-right:'+cfg.tuli.weizhi.jianju.lr+'px;">' + cfg.tuli.text.zneirong + '</span>' +
        '<span style="display:inline-block;width:' + cfg.tuli.text.fontsize + 'px;height:' + cfg.tuli.text.fontsize + 'px ;background-color: ' + cfg.margin.gzstyle.downgzbg + ';margin-left:'+cfg.tuli.weizhi.jianju.lr+'px;"></span >' +
        '<span style="font-size:' + cfg.tuli.text.fontsize + 'px;color: ' + cfg.tuli.text.fontcolor + ';margin-right:'+cfg.tuli.weizhi.jianju.lr+'px;">' + cfg.tuli.text.fneirong + '</span>' +
        '</div>';
      $(this.container1).find('.gannt_div').append(div);
    }


  },
  /**
   * 每个组件根据自身需要,从主题中获取颜色 覆盖到自身配置的颜色中.
   * 暂时可以不填内容
   */
  setColors: function () {
    //比如
    //var cfg = this.config;
    //cfg.color = cfg.theme.series[0] || cfg.color;
  },
  /**
   * 数据,设置和获取数据
   * @param data
   * @returns {*|number}
   */
  data: function (data) {
    if (data) {
      this._data = data;
    }
    return this._data;
  },
  /**
   * 更新配置
   * 优先级: config.colors > config.theme > this.config.theme > this.config.colors
   * [注] 有数组的配置一定要替换
   * @param config
   * @private
   */
  mergeConfig: function (config) {
    if (!config) {return this.config}
    this.config.theme = _.defaultsDeep(config.theme || {}, this.config.theme);
    this.setColors();
    this.config = _.defaultsDeep(config || {}, this.config);
    return this.config;
  },
  /**
   * 更新布局
   * 可有可无
   */
  updateLayout: function () {},
  /**
   * 更新样式
   * 有些子组件控制不到的,但是需要控制改变的,在这里实现
   */
  updateStyle: function () {
    var cfg = this.config;
    $(this.container1).css({
      'font-family': cfg.margin.fontfamily||'微软雅黑'
    });

  },
  /**
   * 更新配置
   * !!注意:如果render支持第二个参数options, 那updateOptions不是必须的
   */
  //updateOptions: function (options) {},
  /**
   * 更新某些配置
   * 给可以增量更新配置的组件用
   */
  //updateXXX: function () {},
  /**
   * 销毁组件
   */
   destroy: function(){console.log('请实现 destroy 方法')}
});