
subgraph =  {
 gcanvas : null,
 graph : null,
 graph_gl : null,


init:function(){

this.graph = new LGraph();
//module.changeGraph(this.graph);
},


changeCanvas:function(){
   
    var container = $("#layout_main_layout_panel_main div.w2ui-panel-content");
    //$("#layout_main_layout_panel_main div.w2ui-panel-content canvas").remove();

    var h = container.height();
    var w = container.width();
    
    if (!this.graph_gl) {
        this.graph_gl = GL.create({width: w, height: h - 20, alpha: false});
        this.graph_gl.canvas.id = "subgraph";
    }
    if (this.gcanvas)
    this.gcanvas.stopRendering();

     
        var html = "<canvas id='SubGraph' class='graph' width='" + w + "' height='" + h + "'></canvas>";
        container.append(html);
        this.gcanvas = new LGraphCanvas(document.getElementById("SubGraph"), this.graph);
    
    this.gcanvas.background_image = "img/grid.png";

    this.gcanvas.onClearRect = function () {
    
        gl.clearColor(0.2, 0.2, 0.2, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
         
    }
    console.log(this.gcanvas)
    this.gcanvas.onNodeSelected = function (node) {
        vik.ui.updateLeftPanel(node);
    }

    this.gcanvas.onDropFile = function (data, filename, file) {
        var ext = LGraphCanvas.getFileExtension(filename);
        if (ext == "json") {
            var obj = JSON.parse(data);
            this.graph.configure(obj);
            main_node.mesh = obj.mesh;
            vik.ui.reset();
        }
    }
   
}
}

