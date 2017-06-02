var Event = require('bcore/event');
var $ = require('jquery');
var _ = require('lodash');
var d3 = require('d3');
var style=require('./style.css');

/**
 * 马良基础类
 */
module.exports = Event.extend(function Base(container, config) {
  this.config = {
    theme: {}
  }
  this.container=d3.select(container);
  this.container1 = $(container);           //容器
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
    //this.chart.render(data, cfg);

    var dataset=data;
    var margin = {top: cfg.gstyle.gbstyle.top>30?cfg.gstyle.gbstyle.top:30, right: cfg.gstyle.gbstyle.right>50?cfg.gstyle.gbstyle.right:50, bottom: cfg.gstyle.gbstyle.bottom>50?cfg.gstyle.gbstyle.bottom:50, left: cfg.gstyle.gbstyle.left>50?cfg.gstyle.gbstyle.left:50},
      width = this.container1.width() - margin.left - margin.right,
      height = this.container1.height() - margin.top - margin.bottom;

    var x = d3.scale.linear()
      .range([0, height]);

    var y = d3.scale.ordinal()
      .rangeRoundBands([0, width],cfg.gstyle.gzstyle.gzdis);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("left")
      .tickSize(0)
      .ticks(cfg.ystyle.zhouvalue.num)
      .tickPadding(cfg.ystyle.text.weizhi);

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("bottom")
      .tickSize(0)
      .tickPadding(cfg.xstyle.text.weizhi);

    $(this.container1).find("svg").remove();
    var svg = this.container
      .append("svg")
      .attr("width", this.container1.width())
      .attr("height", this.container1.height())
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xInner = d3.svg.axis()
      .scale(y)
      .tickSize(-(height),0,0)
      .orient("bottom")
      .ticks(5);
    //添加横轴网格线

    //定义纵轴网格线
    var yInner = d3.svg.axis()
      .scale(x)
      .tickSize(-(width),0,0)
      .tickFormat("")
      .orient("left")
      .ticks(cfg.ystyle.zhouvalue.num);
    //添加纵轴网格线
    x.domain([d3.max(dataset, function(d) { return d.y; }),d3.min(dataset, function(d) { return d.y; })]).nice();
    y.domain(dataset.map(function(d) { return d.x; }));

    var zmaxValue=0;
    var fmaxValue=0;
    for(var i=0;i<dataset.length;i++){
      if(dataset[i].y>0){
        zmaxValue=Math.abs(dataset[i].y)>zmaxValue?Math.abs(dataset[i].y):zmaxValue;
      }
      else{
        fmaxValue=Math.abs(dataset[i].y)>fmaxValue?Math.abs(dataset[i].y):fmaxValue;
      }
    }
    if(cfg.ystyle.wangge.show) {
      var yBar = svg.append("g")
        .attr("class", "inner_line")
        .attr("transform", "translate(0,0)")
        .attr("stroke",cfg.ystyle.wangge.color)
        .call(yInner);
    }
    // svg.append("g")
    //   .attr("class","inner_line")
    //   .attr("transform", "translate(0,"+ x(-fmaxValue)+")")
    //   .attr("stroke","#333")
    //   .call(xInner)
    //   .selectAll("text")
    //   .text("");
    for(var j=0;j<dataset.length;j++){
      if(dataset[j].y>0) {
        svg.append("rect")
          .attr("y",x(zmaxValue))
          .attr("x",y(dataset[j].x))
          .attr("height", Math.abs(x(zmaxValue)-x(0)) )
          .attr("width", y.rangeBand())
          .attr("fill",cfg.gstyle.gzstyle.upgzbg);
      }
      else{
        svg.append("rect")
          .attr("y",x(0))
          .attr("x",y(dataset[j].x))
          .attr("height", Math.abs(x(fmaxValue)-x(0)))
          .attr("width", y.rangeBand())
          .attr("fill",cfg.gstyle.gzstyle.downgzbg);
      }
    }

    svg.selectAll(".bar")
      .data(dataset)
      .enter().append("rect")
      .attr("class", function(d) { return "bar bar--" + (d.y < 0 ? "negative" : "positive"); })
      .attr("y", function(d) { return x(Math.max(0, d.y)); })
      .attr("x", function(d) { return y(d.x); })
      .attr("height", function(d) { return Math.abs(x(d.y) - x(0)); })
      .attr("width", y.rangeBand())
      .attr("fill",function(d){
        return d.y<0 ? cfg.shuju.color.fcolor:cfg.shuju.color.zcolor;
      });
    if(cfg.xstyle.show) {
      var weizhi;
      if(cfg.xstyle.weizhi==0){
        weizhi=0;
      }
      else if(cfg.xstyle.weizhi==2){
        weizhi=zmaxValue;
      }
      else{
        weizhi=-fmaxValue;
      }
      var a = svg.append("g")
        .attr("class", "gy axis")
        .attr("transform", "translate(0," + x(weizhi) + ")")
        .style("font-size", cfg.xstyle.text.fontsize)
        .call(yAxis);
      if(!cfg.xstyle.zhouline.show){
        a.selectAll("path")
          .style("display","none");
      }
      a.selectAll("path")
        .attr("fill", cfg.xstyle.zhouline.color)
        .attr("stroke", cfg.xstyle.zhouline.color)
        .attr("stroke-width",cfg.xstyle.zhouline.lineweight);
      if(!cfg.xstyle.zhouvalue.show){
        a.selectAll("text")
          .style("display","none");
      }
      a.selectAll("text")
        .attr("fill", cfg.xstyle.text.fontcolor);

    }
  if(cfg.ystyle.show) {
    var b = svg.append("g")
      .attr("class", "gx axis")
      .attr("transform", "translate(0,0)")
      .style("font-size", cfg.ystyle.text.fontsize)
      .call(xAxis);
    if(cfg.ystyle.zhoudanwei.show) {
      b.append("text")
        .text(cfg.ystyle.zhoudanwei.danwei)
        .attr("transform", "translate(-20,-10)");
    }
    if(!cfg.ystyle.zhouline.show){
      b.selectAll("path")
        .style("display","none");
    }
    b.selectAll("path")
      .attr("fill", cfg.ystyle.zhouline.color)
      .attr("stroke", cfg.ystyle.zhouline.color)
      .attr("stroke-width",cfg.ystyle.zhouline.lineweight);
    if(!cfg.ystyle.zhouvalue.show){
      b.selectAll("text")
        .style("display","none");
    }
    b.selectAll("text")
      .attr("fill", cfg.ystyle.text.fontcolor);
  }
    if(cfg.gstyle.values.show) {
      svg.selectAll(".cztext")
        .data(dataset)
        .enter()
        .append("text")
        .attr("class", ".czzhuzhuangtu")
        .attr("x", function (d) {
          return y(d.x);
        })
        .attr("y", function (d) {
          return x(d.y);
        })
        .attr("dx", function () {
          return y.rangeBand() / 2;
        })
        .attr("dy", function (d) {
          return d.y > 0 ? Math.abs(x(d.y) - x(0)) / cfg.gstyle.values.text.fontpos : -(Math.abs(x(d.y) - x(0)) / cfg.gstyle.values.text.fontpos);
        })
        .attr("text-anchor", "middle")
        .text(function (d) {
          return d.y;
        })
        .style("font-size", cfg.gstyle.values.text.fontsize)
        .attr("fill", cfg.gstyle.values.text.fontcolor);
    }
    //图例
    if(cfg.tuli.show) {
      var xweizhi = cfg.tuli.weizhi.x - cfg.tuli.text.fontsize*1.2;
      var tweizhi = cfg.tuli.weizhi.y - cfg.tuli.text.fontsize*0.9;
      var tweizhi1=cfg.tuli.weizhi.y+cfg.tuli.text.fontsize*1.2;
      var tweizhi2=tweizhi+cfg.tuli.text.fontsize*1.2;
      var tuli = svg.append("g");
      tuli.append("text")
        .style("font-size", cfg.tuli.text.fontsize)
        .attr("fill", cfg.tuli.text.fontcolor)
        .attr("transform", "translate(" + cfg.tuli.weizhi.x + "," + cfg.tuli.weizhi.y + ")")
        .text(cfg.tuli.text.zneirong);
      tuli.append("rect")
        .attr("width", cfg.tuli.text.fontsize)
        .attr("height", cfg.tuli.text.fontsize)
        .attr("transform", "translate(" + xweizhi + "," + tweizhi + ")")
        .attr("fill", cfg.shuju.color.zcolor);
      tuli.append("text")
        .style("font-size", cfg.tuli.text.fontsize)
        .attr("fill", cfg.tuli.text.fontcolor)
        .attr("transform", "translate(" + cfg.tuli.weizhi.x + "," + tweizhi1 + ")")
        .text(cfg.tuli.text.fneirong);
      tuli.append("rect")
        .attr("width", cfg.tuli.text.fontsize)
        .attr("height", cfg.tuli.text.fontsize)
        .attr("transform", "translate(" + xweizhi + "," + tweizhi2 + ")")
        .attr("fill", cfg.shuju.color.fcolor);
    }
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
    //更新图表
    //this.chart.render(data, cfg);

    var dataset=data;
    var margin = {top: cfg.gstyle.gbstyle.top>30?cfg.gstyle.gbstyle.top:30, right: cfg.gstyle.gbstyle.right>50?cfg.gstyle.gbstyle.right:50, bottom: cfg.gstyle.gbstyle.bottom>50?cfg.gstyle.gbstyle.bottom:50, left: cfg.gstyle.gbstyle.left>50?cfg.gstyle.gbstyle.left:50},
      width = this.container1.width() - margin.left - margin.right,
      height = this.container1.height() - margin.top - margin.bottom;

    var x = d3.scale.linear()
      .range([0, height]);

    var y = d3.scale.ordinal()
      .rangeRoundBands([0, width],cfg.gstyle.gzstyle.gzdis);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("left")
      .tickSize(0)
      .ticks(cfg.ystyle.zhouvalue.num)
      .tickPadding(cfg.ystyle.text.weizhi);

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("bottom")
      .tickSize(0)
      .tickPadding(cfg.xstyle.text.weizhi);

    $(this.container1).find("svg").remove();
    var svg = this.container
      .append("svg")
      .attr("width", this.container1.width())
      .attr("height", this.container1.height())
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xInner = d3.svg.axis()
      .scale(y)
      .tickSize(-(height),0,0)
      .orient("bottom")
      .ticks(5);
    //添加横轴网格线

    //定义纵轴网格线
    var yInner = d3.svg.axis()
      .scale(x)
      .tickSize(-(width),0,0)
      .tickFormat("")
      .orient("left")
      .ticks(cfg.ystyle.zhouvalue.num);
    //添加纵轴网格线
    x.domain([d3.max(dataset, function(d) { return d.y; }),d3.min(dataset, function(d) { return d.y; })]).nice();
    y.domain(dataset.map(function(d) { return d.x; }));

    var zmaxValue=0;
    var fmaxValue=0;
    for(var i=0;i<dataset.length;i++){
      if(dataset[i].y>0){
        zmaxValue=Math.abs(dataset[i].y)>zmaxValue?Math.abs(dataset[i].y):zmaxValue;
      }
      else{
        fmaxValue=Math.abs(dataset[i].y)>fmaxValue?Math.abs(dataset[i].y):fmaxValue;
      }
    }
    if(cfg.ystyle.wangge.show) {
      var yBar = svg.append("g")
        .attr("class", "inner_line")
        .attr("transform", "translate(0,0)")
        .attr("stroke",cfg.ystyle.wangge.color)
        .call(yInner);
    }
    // svg.append("g")
    //   .attr("class","inner_line")
    //   .attr("transform", "translate(0,"+ x(-fmaxValue)+")")
    //   .attr("stroke","#333")
    //   .call(xInner)
    //   .selectAll("text")
    //   .text("");
    for(var j=0;j<dataset.length;j++){
      if(dataset[j].y>0) {
        svg.append("rect")
          .attr("y",x(zmaxValue))
          .attr("x",y(dataset[j].x))
          .attr("height", Math.abs(x(zmaxValue)-x(0)) )
          .attr("width", y.rangeBand())
          .attr("fill",cfg.gstyle.gzstyle.upgzbg);
      }
      else{
        svg.append("rect")
          .attr("y",x(0))
          .attr("x",y(dataset[j].x))
          .attr("height", Math.abs(x(fmaxValue)-x(0)))
          .attr("width", y.rangeBand())
          .attr("fill",cfg.gstyle.gzstyle.downgzbg);
      }
    }

    svg.selectAll(".bar")
      .data(dataset)
      .enter().append("rect")
      .attr("class", function(d) { return "bar bar--" + (d.y < 0 ? "negative" : "positive"); })
      .attr("y", function(d) { return x(Math.max(0, d.y)); })
      .attr("x", function(d) { return y(d.x); })
      .attr("height", function(d) { return Math.abs(x(d.y) - x(0)); })
      .attr("width", y.rangeBand())
      .attr("fill",function(d){
        return d.y<0 ? cfg.shuju.color.fcolor:cfg.shuju.color.zcolor;
      });
    if(cfg.xstyle.show) {
      var weizhi;
      if(cfg.xstyle.weizhi==0){
        weizhi=0;
      }
      else if(cfg.xstyle.weizhi==2){
        weizhi=zmaxValue;
      }
      else{
        weizhi=-fmaxValue;
      }
      var a = svg.append("g")
        .attr("class", "gy axis")
        .attr("transform", "translate(0," + x(weizhi) + ")")
        .style("font-size", cfg.xstyle.text.fontsize)
        .call(yAxis);
      if(!cfg.xstyle.zhouline.show){
        a.selectAll("path")
          .style("display","none");
      }
      a.selectAll("path")
        .attr("fill", cfg.xstyle.zhouline.color)
        .attr("stroke", cfg.xstyle.zhouline.color)
        .attr("stroke-width",cfg.xstyle.zhouline.lineweight);
      if(!cfg.xstyle.zhouvalue.show){
        a.selectAll("text")
          .style("display","none");
      }
      a.selectAll("text")
        .attr("fill", cfg.xstyle.text.fontcolor);

    }
    if(cfg.ystyle.show) {
      var b = svg.append("g")
        .attr("class", "gx axis")
        .attr("transform", "translate(0,0)")
        .style("font-size", cfg.ystyle.text.fontsize)
        .call(xAxis);
      if(cfg.ystyle.zhoudanwei.show) {
        b.append("text")
          .text(cfg.ystyle.zhoudanwei.danwei)
          .attr("transform", "translate(-20,-10)");
      }
      if(!cfg.ystyle.zhouline.show){
        b.selectAll("path")
          .style("display","none");
      }
      b.selectAll("path")
        .attr("fill", cfg.ystyle.zhouline.color)
        .attr("stroke", cfg.ystyle.zhouline.color)
        .attr("stroke-width",cfg.ystyle.zhouline.lineweight);
      if(!cfg.ystyle.zhouvalue.show){
        b.selectAll("text")
          .style("display","none");
      }
      b.selectAll("text")
        .attr("fill", cfg.ystyle.text.fontcolor);
    }
    if(cfg.gstyle.values.show) {
      svg.selectAll(".cztext")
        .data(dataset)
        .enter()
        .append("text")
        .attr("class", ".czzhuzhuangtu")
        .attr("x", function (d) {
          return y(d.x);
        })
        .attr("y", function (d) {
          return x(d.y);
        })
        .attr("dx", function () {
          return y.rangeBand() / 2;
        })
        .attr("dy", function (d) {
          return d.y > 0 ? Math.abs(x(d.y) - x(0)) / cfg.gstyle.values.text.fontpos : -(Math.abs(x(d.y) - x(0)) / cfg.gstyle.values.text.fontpos);
        })
        .attr("text-anchor", "middle")
        .text(function (d) {
          return d.y;
        })
        .style("font-size", cfg.gstyle.values.text.fontsize)
        .attr("fill", cfg.gstyle.values.text.fontcolor);
    }
    //图例
    if(cfg.tuli.show) {
      var xweizhi = cfg.tuli.weizhi.x - cfg.tuli.text.fontsize*1.2;
      var tweizhi = cfg.tuli.weizhi.y - cfg.tuli.text.fontsize*0.9;
      var tweizhi1=cfg.tuli.weizhi.y+cfg.tuli.text.fontsize*1.2;
      var tweizhi2=tweizhi+cfg.tuli.text.fontsize*1.2;
      var tuli = svg.append("g");
      tuli.append("text")
        .style("font-size", cfg.tuli.text.fontsize)
        .attr("fill", cfg.tuli.text.fontcolor)
        .attr("transform", "translate(" + cfg.tuli.weizhi.x + "," + cfg.tuli.weizhi.y + ")")
        .text(cfg.tuli.text.zneirong);
      tuli.append("rect")
        .attr("width", cfg.tuli.text.fontsize)
        .attr("height", cfg.tuli.text.fontsize)
        .attr("transform", "translate(" + xweizhi + "," + tweizhi + ")")
        .attr("fill", cfg.shuju.color.zcolor);
      tuli.append("text")
        .style("font-size", cfg.tuli.text.fontsize)
        .attr("fill", cfg.tuli.text.fontcolor)
        .attr("transform", "translate(" + cfg.tuli.weizhi.x + "," + tweizhi1 + ")")
        .text(cfg.tuli.text.fneirong);
      tuli.append("rect")
        .attr("width", cfg.tuli.text.fontsize)
        .attr("height", cfg.tuli.text.fontsize)
        .attr("transform", "translate(" + xweizhi + "," + tweizhi2 + ")")
        .attr("fill", cfg.shuju.color.fcolor);
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
    this.container1.css({

      'font-family': cfg.gstyle.gfont||'微软雅黑'
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