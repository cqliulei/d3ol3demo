//创建ol3Map热点地图对象
var ol3Map={
  init:function(config){
    this.obj=config.obj;//config.obj-地图显示对象
    this.lon=config.lon;//config.lon-经度
    this.lat=config.lat;//config.lat-纬度
    this.url=config.url;//config.url-数据加载地址
    this.zoom=config.zoom;//config.zoom-地图放大倍数
    return this;
  },
  vector:function(){
     var vector = new ol.layer.Heatmap({
      source: new ol.source.Vector({
        url: this.url,
        format: new ol.format.KML({
          extractStyles: false
        })
      })
    });
    vector.getSource().on('addfeature', function(event) {//解析并设置热点数据
          var name = event.feature.get('name');
          var magnitude = parseFloat(name.substr(2));
          event.feature.set('weight', magnitude - 5);
        });
    var raster = new ol.layer.Tile({
          source: new ol.source.OSM()
        });
    var map = new ol.Map({
      layers: [raster, vector],
      target: this.obj,    
      view: new ol.View({
        center: ol.proj.fromLonLat([this.lon,this.lat]),//中心坐标
        zoom: this.zoom
      })
    });
  },
  //矩形和热点地图切换函数
  cityRadioChange:function(v){//v-切换radio的当前值
    var flipContainer=document.getElementById("flipContainer");
    var topNav=document.getElementById("topNav");
    if(v==="1"){
      flipContainer.className = "flip-container hover";
      topNav.style.visibility="hidden";//隐藏    
    }else{
      flipContainer.className = "flip-container";
      topNav.style.visibility="visible";//显示
    } 
  },
  //根据name获取单选按钮组中选择的值
  getRadioVal:function(name){  
    var radio = document.getElementsByName(name);  
    for (i=0; i<radio.length; i++) {  
        if (radio[i].checked) {  
            return radio[i].value; 
        }  
    }  
  }
};

//创建d3Chart矩形图表对象
var d3Chart={
  init:function(config){ 
    this.obj=config.obj;//config.obj-加载区域对象
    this.top=config.top;//config.top-图表top距离
    this.right=config.right;//config.right-图表right距离
    this.bottom=config.bottom;//config.bottom-图表bottom距离
    this.left=config.left;//config.left-图表left距离
    this.width=config.width;//config.width-图表宽度
    this.height=config.height;//config.height-图表高度
    this.tiptxt=config.tiptxt;//config.tiptxt-数据左侧边栏文字
    this.url=config.url;//config.url-数据加载地址
    return this;
  },
  chart:function(){
    var width = this.width - this.left - this.right,
        height = this.height - this.top - this.bottom;
    var formatPercent = d3.format("");
    var x = d3.scale.ordinal()
    .rangeRoundBands([0, width],0.1,1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(formatPercent);

    var svg = d3.select(this.obj).append("svg")
        .attr("width", width + this.left + this.right)
        .attr("height", height + this.top + this.bottom)
        .append("g")
        .attr("transform", "translate(" + this.left + "," + this.top + ")");

    var tiptxt= this.tiptxt; 

    //加载xml数据
    d3.xml(this.url, function(error, data) {
        if (error) throw error;
        //将加载的数组文件转换成对象
        data = [].map.call(data.querySelectorAll("Placemark"), function(d) {
            return {
                name: d.querySelector("name").textContent,
                magnitude: +d.querySelector("magnitude").textContent
            };
        });

        x.domain(data.map(function(d) {
            return d.name; }));
        y.domain([0, d3.max(data, function(d) {
            return d.magnitude; })]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0 ," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(tiptxt);

        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) {
                return x(d.magnitude); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) {
                return y(d.magnitude); })
            .attr("height", function(d) {
                return height - y(d.magnitude); });

        d3.select("input.sortCkBtn").on("change", change);

        var sortTimeout = setTimeout(function() {
            d3.select("input.sortCkBtn").property("checked", true).each(change);
        }, 50);
         function change() {
            clearTimeout(sortTimeout);

            // Copy-on-write since tweens are evaluated after a delay.
            var x0 = x.domain(data.sort(this.checked ? function(a, b) {
                        return b.magnitude - a.magnitude; } : function(a, b) {
                        return d3.ascending(a.name, b.name); })
                    .map(function(d) {
                        return d.name; }))
                .copy();

            svg.selectAll(".bar")
                .sort(function(a, b) {
                    return x0(a.name) - x0(b.name); });

            var transition = svg.transition().duration(750),
                delay = function(d, i) {
                    return i * 50; };

            transition.selectAll(".bar")
                .delay(delay)
                .attr("x", function(d) {
                    return x0(d.name); });

            transition.select(".x.axis")
                .call(xAxis)
                .selectAll("g")
                .delay(delay);
        }    
    });
  }
};

