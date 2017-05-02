
var Event = require('bcore/event');
var Utils = require('bcore/utils');

// 请替换这里所用到的组件
var Layer = require('dmap/layer/xxx'); 

/**
 * 马良地理子组件
 */

function Test2 (){
   var options = arguments[arguments.length - 1];
   this.options = Utils.deepMerge(Test2.options, options);
}

Test2.options = {};

Test2 = Event.extend(Test2, {
  addTo: function(map){
    if(map._map) map = map._map;
    this._map = map;
    //
    this.initCom();
  },
  /*
   马良组件的配置映射到基础组件的配置
   */
  getOptions: function(){
    var options = this.options;
    return options;
  },
  initCom: function(){
    var options = this.getOptions(this.options);
    var layer = this.layer = new Layer(options);
    layer.addTo(this._map);
  },
  updateOptions: function(options){
    options = this.options = Utils.deepMerge(this.options, options);
    options = this.getOptions(options);
    this.layer.updateOptions(options);
  },
  data: function(ds){
    if(ds) this._data = ds;
  },
  render: function(ds){
    if(!ds) return console.log('地图组件Test2未收到数据...');
    this.data(ds);
    this.layer.render();
  }
});

module.exports = Test2;

