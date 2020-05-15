
//*********************************************************************************
// LGraph CLASS                                  
//*********************************************************************************


// *************************************************************
//   LiteGraph CLASS                                     *******
// *************************************************************


/**
 * The Global Scope. It contains all the registered node classes.
 *
 * @class LiteGraph
 * @constructor
 */

var LiteGraph = {

    NODE_TITLE_HEIGHT: 16,
    NODE_SLOT_HEIGHT: 15,
    NODE_WIDTH: 140,
    NODE_MIN_WIDTH: 50,
    NODE_COLLAPSED_RADIUS: 10,
    NODE_COLLAPSED_WIDTH: 80,
    CANVAS_GRID_SIZE: 10,
    NODE_TITLE_COLOR: "#222",
    NODE_DEFAULT_COLOR: "#999",
    NODE_DEFAULT_BGCOLOR: "#444",
    NODE_DEFAULT_BOXCOLOR: "#AEF",
    NODE_SELECTED_COLOR: "#FFF",
    NODE_DEFAULT_SHAPE: "box", // round circle box
    MAX_NUMBER_OF_NODES: 1000, //avoid infinite loops
    DEFAULT_POSITION: [100,100],//default node position
    node_images_path: "",

    proxy: null, //used to redirect calls

    debug: false,
    throw_errors: true,
    showcode:true,
    registered_node_types: {},

    graph_max_steps:0,

    CANVAS_WEBGL: 1,
    CANVAS_2D: 2,
    current_ctx: 0,

    COLOR_MAP:0,
    NORMAL_MAP:1,
    TANGENT_MAP:2,
    SPECULAR_MAP:3,
    BUMP_MAP:4,
/**
     * Register a node class so it can be listed when the user wants to create a new one
     * @method registerNodeType
     * @param {String} type name of the node and path
     * @param {Class} base_class class containing the structure of a node
     */

    registerNodeType: function(type, base_class)
    {
        if(!base_class.prototype)
            throw("Cannot register a simple object, it must be a class with a prototype");
        base_class.type = type;

        if(LiteGraph.debug)
            console.log("Node registered: " + type);

        var categories = type.split("/");

        var pos = type.lastIndexOf("/");
        base_class.category = type.substr(0,pos);
        //info.name = name.substr(pos+1,name.length - pos);

        //extend class
        if(base_class.prototype) //is a class
            for(var i in LGraphNode.prototype)
                if(!base_class.prototype[i])
                    base_class.prototype[i] = LGraphNode.prototype[i];

        this.registered_node_types[ type ] = base_class;
    },

    /**
     * Create a node of a given type with a name. The node is not attached to any graph yet.
     * @method createNode
     * @param {String} type full name of the node class. p.e. "math/sin"
     * @param {String} name a name to distinguish from other nodes
     * @param {Object} options to set options
     */

    createNode: function(type, title, options)
    {
        var base_class = this.registered_node_types[type];
        if (!base_class)
        {
            if(LiteGraph.debug)
                console.log("GraphNode type \"" + type + "\" not registered.");
            return null;
        }

        var prototype = base_class.prototype || base_class;

        title = title || base_class.title || type;

        var node = new base_class( title );

        node.type = type;
        if(!node.title) node.title = title;
        if(!node.properties) node.properties = {};
        if(!node.options) node.options = {};
        if(!node.flags) node.flags = {};
        if(!node.size) node.size = node.computeSize();
        if(!node.pos) node.pos = LiteGraph.DEFAULT_POSITION.concat();
        if(!node.shader_piece) node.shader_piece = null;
        if(!node.codes) node.codes = [];
        if(!node.node_path) node.node_path = [];
        if(!node.T_in_types) node.T_in_types = {};
        if(!node.T_out_types) node.T_out_types = {};
        if(!node.in_using_T) node.in_using_T = 0;
        if(!node.in_conected_using_T) node.in_conected_using_T = 0;


        if(node.extraproperties)
            for(var i in node.extraproperties)
                node.properties[i] = node.extraproperties[i];
        //extra options
        if(options)
        {
            for(var i in options)
                node[i] = options[i];
        }

        if(node.inputs)
            this.graph_max_steps += node.inputs.length;

        node.addBasicProperties();

        return node;
    },


    extendNodeTypeProperties: function(base_class, method_name, proto_method)
    {
        if(!base_class.prototype)
            throw("Cannot register a simple object, it must be a class with a prototype");

        //extend class
        base_class.prototype.extraproperties = base_class.prototype.extraproperties || {};
        base_class.prototype.extraproperties[method_name] = proto_method;

    },

    /**
     * Returns a registered node type with a given name
     * @method getNodeType
     * @param {String} type full name of the node class. p.e. "math/sin"
     * @return {Class} the node class
     */

    getNodeType: function(type)
    {
        return this.registered_node_types[type];
    },


    /**
     * Returns a list of node types matching one category
     * @method getNodeType
     * @param {String} category category name
     * @return {Array} array with all the node classes
     */

    getNodeTypesInCategory: function(category)
    {
        var r = [];
        for(var i in this.registered_node_types)
            if(category == "")
            {
                if (this.registered_node_types[i].category == null)
                    r.push(this.registered_node_types[i]);
            }
            else if (this.registered_node_types[i].category == category)
                r.push(this.registered_node_types[i]);

        return r;
    },

    /**
     * Returns a list with all the node type categories
     * @method getNodeTypesCategories
     * @return {Array} array with all the names of the categories
     */

    getNodeTypesCategories: function()
    {
        var categories = {"":1};
        for(var i in this.registered_node_types)
            if(this.registered_node_types[i].category && !this.registered_node_types[i].skip_list)
                categories[ this.registered_node_types[i].category ] = 1;
        var result = [];
        for(var i in categories)
           if(i != "core")
                result.push(i);
        return result;
    },

    //debug purposes: reloads all the js scripts that matches a wilcard
    reloadNodes: function (folder_wildcard)
    {
        var tmp = document.getElementsByTagName("script");
        //weird, this array changes by its own, so we use a copy
        var script_files = [];
        for(var i in tmp)
            script_files.push(tmp[i]);


        var docHeadObj = document.getElementsByTagName("head")[0];
        folder_wildcard = document.location.href + folder_wildcard;

        for(var i in script_files)
        {
            var src = script_files[i].src;
            if( !src || src.substr(0,folder_wildcard.length ) != folder_wildcard)
                continue;

            try
            {
                if(LiteGraph.debug)
                    console.log("Reloading: " + src);
                var dynamicScript = document.createElement("script");
                dynamicScript.type = "text/javascript";
                dynamicScript.src = src;
                docHeadObj.appendChild(dynamicScript);
                docHeadObj.removeChild(script_files[i]);
            }
            catch (err)
            {
                if(LiteGraph.throw_errors)
                    throw err;
                if(LiteGraph.debug)
                    console.log("Error while reloading " + src);
            }
        }

        if(LiteGraph.debug)
            console.log("Nodes reloaded");
    },

    //separated just to improve if it doesnt work
    cloneObject: function(obj, target)
    {
        if(obj == null) return null;
        var r = JSON.parse( JSON.stringify( obj ) );
        if(!target) return r;

        for(var i in r)
            target[i] = r[i];
        return target;
    }
};

if(typeof(performance) != "undefined")
    LiteGraph.getTime = function getTime() { return performance.now(); }
else
    LiteGraph.getTime = function getTime() { return Date.now(); }



//API *************************************************
//function roundRect(ctx, x, y, width, height, radius, radius_low) {
CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius, radius_low) {

    // http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
    // then it works with the stroke
    if(  radius_low === undefined || radius === radius_low){
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        this.beginPath();
        this.moveTo(x+radius, y);
        this.arcTo(x+width, y,   x+width, y+height, radius);
        this.arcTo(x+width, y+height, x,   y+height, radius);
        this.arcTo(x,   y+height, x,   y,   radius);
        this.arcTo(x,   y,   x+width, y,   radius);
        this.closePath();
        return this;
    }
    if ( radius === undefined ) {
        radius = 5;
    }

    if(radius_low === undefined)
        radius_low  = radius;

    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);

    this.lineTo(x + width, y + height - radius_low);
    this.quadraticCurveTo(x + width, y + height, x + width - radius_low, y + height);
    this.lineTo(x + radius_low, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius_low);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    return this;
}

function compareObjects(a,b)
{
    for(var i in a)
        if(a[i] != b[i])
            return false;
    return true;
}

function distance(a,b)
{
    return Math.sqrt( (b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]) );
}

function colorToString(c)
{
    return "rgba(" + Math.round(c[0] * 255).toFixed() + "," + Math.round(c[1] * 255).toFixed() + "," + Math.round(c[2] * 255).toFixed() + "," + (c.length == 4 ? c[3].toFixed(2) : "1.0") + ")";
}

function isInsideRectangle(x,y, left, top, width, height)
{
    if (left < x && (left + width) > x &&
        top < y && (top + height) > y)
        return true;
    return false;
}

//[minx,miny,maxx,maxy]
function growBounding(bounding, x,y)
{
    if(x < bounding[0])
        bounding[0] = x;
    else if(x > bounding[2])
        bounding[2] = x;

    if(y < bounding[1])
        bounding[1] = y;
    else if(y > bounding[3])
        bounding[3] = y;
}

//point inside boundin box
function isInsideBounding(p,bb)
{
    if (p[0] < bb[0][0] ||
        p[1] < bb[0][1] ||
        p[0] > bb[1][0] ||
        p[1] > bb[1][1])
        return false;
    return true;
}

//boundings overlap, format: [start,end]
function overlapBounding(a,b)
{
    if ( a[0] > b[2] ||
        a[1] > b[3] ||
        a[2] < b[0] ||
        a[3] < b[1])
        return false;
    return true;
}

//Convert a hex value to its decimal value - the inputted hex must be in the
//	format of a hex triplet - the kind we use for HTML colours. The function
//	will return an array with three values.
function hex2num(hex) {
    if(hex.charAt(0) == "#") hex = hex.slice(1); //Remove the '#' char - if there is one.
    hex = hex.toUpperCase();
    var hex_alphabets = "0123456789ABCDEF";
    var value = new Array(3);
    var k = 0;
    var int1,int2;
    for(var i=0;i<6;i+=2) {
        int1 = hex_alphabets.indexOf(hex.charAt(i));
        int2 = hex_alphabets.indexOf(hex.charAt(i+1));
        value[k] = (int1 * 16) + int2;
        k++;
    }
    return(value);
}
//Give a array with three values as the argument and the function will return
//	the corresponding hex triplet.
function num2hex(triplet) {
    var hex_alphabets = "0123456789ABCDEF";
    var hex = "#";
    var int1,int2;
    for(var i=0;i<3;i++) {
        int1 = triplet[i] / 16;
        int2 = triplet[i] % 16;

        hex += hex_alphabets.charAt(int1) + hex_alphabets.charAt(int2);
    }
    return(hex);
}

/* LiteGraph GUI elements *************************************/

LiteGraph.createContextualMenu = function(values,options, ref_window)
{
    options = options || {};
    this.options = options;

    //allows to create graph canvas in separate window
    ref_window = ref_window || window;

    if(!options.from)
        LiteGraph.closeAllContextualMenus();

    var root = ref_window.document.createElement("div");
    root.className = "litecontextualmenu litemenubar-panel";
    this.root = root;
    var style = root.style;

    style.minWidth = "100px";
    style.minHeight = "20px";

    style.position = "fixed";
    style.top = "100px";
    style.left = "100px";
    style.color = "#AAF";
    style.padding = "2px";
    style.borderBottom = "2px solid #AAF";
    style.backgroundColor = "#444";

    //avoid a context menu in a context menu
    root.addEventListener("contextmenu", function(e) { e.preventDefault(); return false; });

    for(var i in values)
    {
        var item = values[i];
        var element = ref_window.document.createElement("div");
        element.className = "litemenu-entry";

        if(item == null)
        {
            element.className = "litemenu-entry separator";
            root.appendChild(element);
            continue;
        }

        if(item.is_menu)
            element.className += " submenu";

        if(item.disabled)
            element.className += " disabled";

        element.style.cursor = "pointer";
        element.dataset["value"] = typeof(item) == "string" ? item : item.value;
        element.data = item;
        if(typeof(item) == "string")
            element.innerHTML = values.constructor == Array ? values[i] : i;
        else
            element.innerHTML = item.content ? item.content : i;

        element.addEventListener("click", on_click );
        root.appendChild(element);
    }

    root.addEventListener("mouseover", function(e) {
        this.mouse_inside = true;
    });
    
    root.addEventListener("mouseout", function(e) {
        console.log("OUT!");
        var aux = e.toElement;
        console.log(e)
        if(aux != null){
        while(aux != this && aux != ref_window.document)
            aux = aux.parentNode;

        if(aux == this) return;
        }
        this.mouse_inside = false;
        if(!this.block_close)
            this.closeMenu();
    });
    
    //insert before checking position
    ref_window.document.body.appendChild(root);

    var root_rect = root.getClientRects()[0];
     
    //link menus
    if(options.from)
    {
        options.from.block_close = true;
    }

    var left = options.left || 0;
    var top = options.top || 0;
    
    if(options.event)
    {
        left = (options.event.pageX - 10);
        top = (options.event.pageY - 10);
        
        if(options.left)
            left = options.left;

        var rect = ref_window.document.body.getClientRects()[0];
       console.log(root_rect.width,root_rect.height)
        if(options.from)
        {
            var parent_rect = options.from.getClientRects()[0];
            left = parent_rect.left + parent_rect.width;
        }

        
        if(left > (rect.width - root_rect.width - 10))
            left = (rect.width - root_rect.width - 10);
        if(top > (rect.height - root_rect.height - 10))
            top = (rect.height - root_rect.height - 10);
            console.log(left,top)
            
    }

    root.style.left = left + "px";
    root.style.top = top  + "px";

    function on_click(e) {
        var value = this.dataset["value"];
        var close = true;
        if(options.callback)
        {
            var ret = options.callback.call(root, this.data, e );
            if( ret != undefined ) close = ret;
        }

        if(close)
            LiteGraph.closeAllContextualMenus();
        //root.closeMenu();
    }

    root.closeMenu = function()
    {
        if(options.from)
        {
            options.from.block_close = false;
            if(!options.from.mouse_inside)
                options.from.closeMenu();
        }
        if(this.parentNode)
            ref_window.document.body.removeChild(this);
    };

    return root;
}

LiteGraph.closeAllContextualMenus = function()
{
    var elements = document.querySelectorAll(".litecontextualmenu");
    if(!elements.length) return;

    var result = [];
    for(var i = 0; i < elements.length; i++)
        result.push(elements[i]);

    for(var i in result)
        if(result[i].parentNode)
            result[i].parentNode.removeChild( result[i] );
}

LiteGraph.extendClass = function ( target, origin )
{
    for(var i in origin) //copy class properties
    {
        if(target.hasOwnProperty(i))
            continue;
        target[i] = origin[i];
    }

    if(origin.prototype) //copy prototype properties
        for(var i in origin.prototype) //only enumerables
        {
            if(!origin.prototype.hasOwnProperty(i))
                continue;

            if(target.prototype.hasOwnProperty(i)) //avoid overwritting existing ones
                continue;

            //copy getters
            if(origin.prototype.__lookupGetter__(i))
                target.prototype.__defineGetter__(i, origin.prototype.__lookupGetter__(i));
            else
                target.prototype[i] = origin.prototype[i];

            //and setters
            if(origin.prototype.__lookupSetter__(i))
                target.prototype.__defineSetter__(i, origin.prototype.__lookupSetter__(i));
        }
}

LiteGraph.compareNodeTypes = function(output,input)
{
    var out_types = Object.keys(output.types).length ? output.types : output.types_list;
    var in_types = Object.keys(input.types).length ? input.types : input.types_list;
    if(!out_types || !in_types )
        return false;
    for (key in out_types) {
        if (in_types.hasOwnProperty(key)) {
            return true;
        }
    }
    return false;
}

LiteGraph.dispatchEvent = function(name, obj, element)
{
    var event;
    if (document.createEvent) {
        event = document.createEvent("HTMLEvents");
        event.initEvent(name, true, true);
    } else {
        event = document.createEventObject();
        event.eventType = name;
    }

    event.eventName = name;
    event.data = obj;
    if(!element)
        element = document
    // for other browser
    if (document.createEvent) {
        element.dispatchEvent(event);
    } else {// for IE
        element.fireEvent("on" + event.eventType, event);
    }
}

// to improve a lot
LiteGraph.removeExtension = function(name){
    var no_ext_name = name.split('.')[0];
    return no_ext_name;
}

LiteGraph.hexToColor = function( color_hex, array)
{
    // http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    };
    var color = hexToRgb(color_hex);
    if(!array)
        return "vec4("+(color[0]/255).toFixed(3)+","+(color[1]/255).toFixed(3)+","+(color[2]/255).toFixed(3)+", 1.0)";
    else
        return [(color[0]/255).toFixed(3),(color[1]/255).toFixed(3),(color[2]/255).toFixed(3), 1.0];
}

LiteGraph.getOtputTypeFromMap = function( map)
{
    for(var key in map){
        if(key != "float")
            return key;
    }
    return "float";

}

/*
 LiteGraph.createNodetypeWrapper = function( class_object )
 {
 //create Nodetype object
 }
 //LiteGraph.registerNodeType("scene/global", LGraphGlobal );
 */

if( !window["requestAnimationFrame"] )
{
    window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        (function( callback ){
            window.setTimeout(callback, 1000 / 60);
        });
}




/**
 * LGraph is the class that contain a full graph. We instantiate one and add nodes to it, and then we can run the execution loop.
 *
 * @class LGraph
 * @constructor
 */

function LGraph()
{
    if (LiteGraph.debug)
        console.log("Graph created");
    this.list_of_graphcanvas = null;
    this.clear();
}

//default supported types
LGraph.supported_types = ["number","string","boolean"];

//used to know which types of connections support this graph (some graphs do not allow certain types)
LGraph.prototype.getSupportedTypes = function() { return this.supported_types || LGraph.supported_types; }

LGraph.STATUS_STOPPED = 1;
LGraph.STATUS_RUNNING = 2;

/**
 * Removes all nodes from this graph
 * @method clear
 */

LGraph.prototype.clear = function()
{
    this.stop();
    this.status = LGraph.STATUS_STOPPED;
    this.last_node_id = 0;

    //nodes
    this._nodes = [];
    this._nodes_by_id = {};
    this._nodes_in_order = [];

    this.globals = {}; // for the global vars in shaders

    //links
    this.last_link_id = 1; // u need to start by 1 otherwise it fails some if's
    this.links = {}; //container with all the links

    //iterations
    this.iteration = 0;

    this.config = {
    };

    //timing
    this.globaltime = 0;
    this.runningtime = 0;
    this.fixedtime =  0;
    this.fixedtime_lapse = 0.01;
    this.elapsed_time = 0.01;
    this.starttime = 0;

    //globals
    this.global_inputs = {};
    this.global_outputs = {};

    //this.graph = {};
    this.debug = true;

    // flag controllig if we are configuring a graph
    // useful to not call change() on the set up
    this.configuring = false;

    this.shader_output = null;

    //this.scene_properties = null;

    LiteGraph.graph_max_steps = 0;

    this.change();

    this.sendActionToCanvas("clear");
}

/**
 * Attach Canvas to this graph
 * @method attachCanvas
 * @param {GraphCanvas} graph_canvas
 */

LGraph.prototype.attachCanvas = function(graphcanvas)
{
    if(graphcanvas.constructor != LGraphCanvas)
        throw("attachCanvas expects a LGraphCanvas instance");
    if(graphcanvas.graph && graphcanvas.graph != this)
        graphcanvas.graph.detachCanvas( graphcanvas );

    graphcanvas.graph = this;
    if(!this.list_of_graphcanvas)
        this.list_of_graphcanvas = [];
    this.list_of_graphcanvas.push(graphcanvas);
}

/**
 * Detach Canvas from this graph
 * @method detachCanvas
 * @param {GraphCanvas} graph_canvas
 */

LGraph.prototype.detachCanvas = function(graphcanvas)
{
    var pos = this.list_of_graphcanvas.indexOf(graphcanvas);
    if(pos == -1) return;
    graphcanvas.graph = null;
    this.list_of_graphcanvas.splice(pos,1);
}

/**
 * Starts running this graph every interval milliseconds.
 * @method start
 * @param {number} interval amount of milliseconds between executions, default is 1
 */

LGraph.prototype.start = function(interval)
{
    if(this.status == LGraph.STATUS_RUNNING) return;
    this.status = LGraph.STATUS_RUNNING;

    if(this.onPlayEvent)
        this.onPlayEvent();

    this.sendEventToAllNodes("onStart");

    //launch
    this.starttime = LiteGraph.getTime();
    interval = interval || 1;
    var that = this;

    this.execution_timer_id = setInterval( function() {
        //execute
        that.runStep(1);
    },interval);
}

/**
 * Stops the execution loop of the graph
 * @method stop execution
 */

LGraph.prototype.stop = function()
{
    if(this.status == LGraph.STATUS_STOPPED)
        return;

    this.status = LGraph.STATUS_STOPPED;

    if(this.onStopEvent)
        this.onStopEvent();

    if(this.execution_timer_id != null)
        clearInterval(this.execution_timer_id);
    this.execution_timer_id = null;

    this.sendEventToAllNodes("onStop");
}

/**
 * Run N steps (cycles) of the graph
 * @method runStep
 * @param {number} num number of steps to run, default is 1
 */

LGraph.prototype.runStep = function(num)
{
    num = num || 1;

    var start = LiteGraph.getTime();
    this.globaltime = 0.001 * (start - this.starttime);

    try
    {
        for(var i = 0; i < num; i++)
        {
            this.sendEventToAllNodes("onExecute");
            this.fixedtime += this.fixedtime_lapse;
            if( this.onExecuteStep )
                this.onExecuteStep();
        }

        if( this.onAfterExecute )
            this.onAfterExecute();
        this.errors_in_execution = false;
    }
    catch (err)
    {
        this.errors_in_execution = true;
        if(LiteGraph.throw_errors)
            throw err;
        if(LiteGraph.debug)
            console.log("Error during execution: " + err);
        this.stop();
    }

    var elapsed = LiteGraph.getTime() - start;
    if (elapsed == 0) elapsed = 1;
    this.elapsed_time = 0.001 * elapsed;
    this.globaltime += 0.001 * elapsed;
    this.iteration += 1;
}

/**
 * Updates the graph execution order according to relevance of the nodes (nodes with only outputs have more relevance than
 * nodes with only inputs.
 * @method updateExecutionOrder
 */

LGraph.prototype.updateExecutionOrder = function()
{
    if(!this.removing){

        if(LiteGraph.BFS)
            this._nodes_in_order = this.computeExecutionBFS();
        else
            this._nodes_in_order = this.computeExecutionOrder();


        this.checkLinksIntegrity();
        LiteGraph.dispatchEvent("contentChange", null, null);



    }
}

/**
 * Checks if all links have the correct vars in each side
 * @method checkLinksIntegrity
 */
LGraph.prototype.checkLinksIntegrity = function() {

    for (var id in this._nodes_in_order) {
        var node = this._nodes_in_order[id];
        if(node.in_conected_using_T > 0){
            node.in_conected_using_T = 0;
            node.resetTypes();
        }
        for (var i = 0; node.inputs != undefined && i <  node.inputs.length; i++) {
            if(node.inputs[i].use_t){
                var link_id = node.inputs[i].link;
                if(!link_id) continue;
                var link = this.links[link_id];
                if (link) {
                    var input_node = this.getNodeById(link.origin_id);
                    node.infereTypes(input_node.outputs[link.origin_slot], link.target_slot, input_node); // skip_autoinc
                }
            }
        }
    }

    for (var i in this.links) {
        var link = this.links[i];
        var input_node = this.getNodeById( link.origin_id );
        var output_node = this.getNodeById( link.target_id );

        if(output_node && input_node && !output_node.compareNodeTypes(input_node, input_node.outputs[link.origin_slot], link.target_slot)){
            link.color = "#FF0000";
        } else {
            link.color = null;
        }
    }

}

//This is more internal, it computes the order and returns it
LGraph.prototype.computeExecutionBFS = function()
{

    var L = [];
    var M = {};
    var visited_links = {}; //to avoid repeating links
    var visited_nodes = {}; //to avoid repeating links
    var remaining_links = {}; //to a
    var node_output = this.findNodesByType("core/Output")[0]; // our main output
    var nodes_ordered = [node_output];
    var i = 0;
    while( nodes_ordered.length > 0) {
        var n = nodes_ordered.shift();
        visited_nodes[n.id] = i++; //visited in step i for last time
        if(n.inputs){
            for (var j = 0; j < n.inputs.length; j++) {
                var input = n.inputs[j];
                //not connected
                if (input == null || input.link == null )
                    continue;


                var link_id = input.link;
                var link = this.links[link_id];
                if (!link) continue;

                //already visited link (ignore it)
//                if (visited_links[ link.id ])
//                    continue;

                var origin_node = this.getNodeById(link.origin_id);
                if (origin_node == null) {
                    visited_links[ link.id ] = true;
                    continue;
                }

                visited_links[link.id] = true; //mark as visited
                nodes_ordered.push(origin_node); //if no more links, then add to Starters array

            }
        }
    }
    var sortable = [];
    for (var node_id in visited_nodes)
        sortable.push([this.getNodeById( node_id ), visited_nodes[node_id]])
    sortable.sort(function(a, b) {return a[1] - b[1]})

    var nodes_ordered = [];
    for(var l = sortable.length, i = l - 1 ; i>=0; --i ){
        var n = sortable[i][0];
        n.order = l -i;
        nodes_ordered.push(n);
        n.processNodePath();
    }

    return nodes_ordered;

}

//This is more internal, it computes the order and returns it
LGraph.prototype.computeExecutionOrderTopological = function()
{
    var L = [];
    var S = [];
    var M = {};
    var visited_links = {}; //to avoid repeating links
    var remaining_links = {}; //to a
    var node_output = this.findNodesByType("core/Output")[0]; // our main output

    //search for the nodes without inputs (starting nodes)
    for (var i in this._nodes)
    {
        var n = this._nodes[i];
        M[n.id] = n; //add to pending nodes

        var num = 0; //num of input connections
        if(n.outputs)
            for(var j = 0, l = n.outputs.length; j < l; j++)
                if(n.outputs[j] && n.outputs[j].links  != null && n.outputs[j].links.length > 0 )
                    num += n.outputs[j].links.length;

        if(num == 0) //is a starting node
            S.push(n);
        else //num of input links
            remaining_links[n.id] = num;

    }
    S.push(node_output);

    var counter = 0;
    while(true)
    {
        counter++;
        if(S.length == 0)
            break;

        //get an starting node
        var n = S.shift();
        L.unshift(n); //add to ordered list
        delete M[n.id]; //remove from the pending nodes

        //for every output
        if(n.inputs)
            for(var i = 0; i < n.inputs.length; i++)
            {
                var input = n.inputs[i];
                //not connected
                if(input == null || input.link == null)
                    continue;


                var link_id = input.link;
                var link = this.links[link_id];
                if(!link) continue;

                //already visited link (ignore it)
                if(visited_links[ link.id ])
                    continue;

                var origin_node = this.getNodeById( link.origin_id );
                if(origin_node == null)
                {
                    visited_links[ link.id ] = true;
                    continue;
                }

                visited_links[link.id] = true; //mark as visited
                remaining_links[origin_node.id] -= 1; //reduce the number of links remaining
                if (remaining_links[origin_node.id] == 0)
                    S.push(origin_node); //if no more links, then add to Starters array

            }
    }

    //the remaining ones (loops)
    for(var i in M)
        L.unshift(M[i]);

    if(L.length != this._nodes.length && LiteGraph.debug)
        console.log("something went wrong, nodes missing");

    //save order number in the node
    for(var i in L){
        L[i].order = parseInt(i);
        L[i].processNodePath();
    }

    return L;
}


//This is more internal, it computes the order and returns it
LGraph.prototype.computeExecutionOrder = function()
{
    var L = [];
    var S = [];
    var M = {};
    var visited_links = {}; //to avoid repeating links
    var remaining_links = {}; //to a

    //search for the nodes without inputs (starting nodes)
    for (var i in this._nodes)
    {
        var n = this._nodes[i];
        M[n.id] = n; //add to pending nodes

        var num = 0; //num of input connections
        if(n.inputs)
            for(var j = 0, l = n.inputs.length; j < l; j++)
                if(n.inputs[j] && n.inputs[j].link != null)
                    num += 1;

        if(num == 0) //is a starting node
            S.push(n);
        else //num of input links
            remaining_links[n.id] = num;
    }
    var counter = 0;
    while(true)
    {
        counter++;
        if(S.length == 0)
            break;

        //get an starting node
        var n = S.shift();
        L.push(n); //add to ordered list
        delete M[n.id]; //remove from the pending nodes

        //for every output
        if(n.outputs)
            for(var i = 0; i < n.outputs.length; i++)
            {
                var output = n.outputs[i];
                //not connected
                if(output == null || output.links == null || output.links.length == 0)
                    continue;

                //for every connection
                for(var j = 0; j < output.links.length; j++)
                {
                    var link_id = output.links[j];
                    var link = this.links[link_id];
                    if(!link) continue;

                    //already visited link (ignore it)
                    if(visited_links[ link.id ])
                        continue;

                    var target_node = this.getNodeById( link.target_id );
                    if(target_node == null)
                    {
                        visited_links[ link.id ] = true;
                        continue;
                    }

                    visited_links[link.id] = true; //mark as visited
                    remaining_links[target_node.id] -= 1; //reduce the number of links remaining
                    if (remaining_links[target_node.id] == 0)
                        S.push(target_node); //if no more links, then add to Starters array
                }
            }
    }

    //the remaining ones (loops)
    for(var i in M)
        L.push(M[i]);

    if(L.length != this._nodes.length && LiteGraph.debug)
        console.log("something went wrong, nodes missing");

    //save order number in the node
    for(var i in L){
        L[i].order = parseInt(i);
        L[i].processNodePath();
    }

    return L;
}


/**
 * Returns the amount of time the graph has been running in milliseconds
 * @method getTime
 * @return {number} number of milliseconds the graph has been running
 */

LGraph.prototype.getTime = function()
{
    return this.globaltime;
}

/**
 * Returns the amount of time accumulated using the fixedtime_lapse var. This is used in context where the time increments should be constant
 * @method getFixedTime
 * @return {number} number of milliseconds the graph has been running
 */

LGraph.prototype.getFixedTime = function()
{
    return this.fixedtime;
}

/**
 * Returns the amount of time it took to compute the latest iteration. Take into account that this number could be not correct
 * if the nodes are using graphical actions
 * @method getElapsedTime
 * @return {number} number of milliseconds it took the last cycle
 */

LGraph.prototype.getElapsedTime = function()
{
    return this.elapsed_time;
}

/**
 * Sends an event to all the nodes, useful to trigger stuff
 * @method sendEventToAllNodes
 * @param {String} eventname the name of the event
 * @param {Object} param an object containing the info
 */

LGraph.prototype.sendEventToAllNodes = function(eventname, param)
{
    var M = this._nodes_in_order ? this._nodes_in_order : this._nodes;
    for(var j in M)
        if(M[j][eventname])
            M[j][eventname](param);
}

LGraph.prototype.sendActionToCanvas = function(action, params)
{
    if(!this.list_of_graphcanvas)
        return;

    for(var i in this.list_of_graphcanvas)
    {
        var c = this.list_of_graphcanvas[i];
        if( c[action] )
            c[action].apply(c, params);
    }
}

/**
 * Adds a new node instasnce to this graph
 * @method add
 * @param {LGraphNode} node the instance of the node
 */

LGraph.prototype.add = function(node, skip_compute_order)
{
    if(!node || (node.id != -1 && this._nodes_by_id[node.id] != null))
        return; //already added

    if(this._nodes.length >= LiteGraph.MAX_NUMBER_OF_NODES)
        throw("LiteGraph: max number of nodes in a graph reached");

    //give him an id
    if(node.id == null || node.id == -1)
        node.id = this.last_node_id++;


    node.graph = this;

    this._nodes.push(node);
    this._nodes_by_id[node.id] = node;

    /*
     // rendering stuf...
     if(node.bgImageUrl)
     node.bgImage = node.loadImage(node.bgImageUrl);
     */

    if(node.onAdded)
        node.onAdded();

    if(this.config.align_to_grid)
        node.alignToGrid();

    if(!skip_compute_order)
        this.updateExecutionOrder();

    if(this.onNodeAdded)
        this.onNodeAdded(node);


    this.setDirtyCanvas(true);

    if(!this.configuring)
        this.change();

    return node; //to chain actions
}

/**
 * Removes a node from the graph
 * @method remove
 * @param {LGraphNode} node the instance of the node
 */

LGraph.prototype.remove = function(node)
{
    if(this._nodes_by_id[node.id] == null)
        return; //not found


    if(node.ignore_remove)
        return; //cannot be removed

    //disconnect inputs
    if(node.inputs){
        for(var i = 0; i < node.inputs.length; i++)
        {
            var slot = node.inputs[i];
            if(slot.link != null)
                node.disconnectInput(i);
        }
        LiteGraph.graph_max_steps -= node.inputs.length;
    }


    //disconnect outputs
    if(node.outputs)
        for(var i = 0; i < node.outputs.length; i++)
        {
            var slot = node.outputs[i];
            if(slot.links != null && slot.links.length)
                node.disconnectOutput(i);
        }

    if(this.onNodeRemove)
        this.onNodeRemove(node);

    //callback
    if(node.onRemoved)
        node.onRemoved();


    node.id = -1;
    node.graph = null;

    //remove from canvas render
    for(var i in this.list_of_graphcanvas)
    {
        var canvas = this.list_of_graphcanvas[i];
        if(canvas.selected_nodes[node.id])
            delete canvas.selected_nodes[node.id];
        if(canvas.node_dragged == node)
            canvas.node_dragged = null;
    }

    //remove from containers
    var pos = this._nodes.indexOf(node);
    if(pos != -1)
        this._nodes.splice(pos,1);
    delete this._nodes_by_id[node.id];

    if(this.onNodeRemoved)
        this.onNodeRemoved(node);

    this.setDirtyCanvas(true,true);

    this.change();

    this.updateExecutionOrder();


}

/**
 * Returns a node by its id.
 * @method getNodeById
 * @param {String} id
 */

LGraph.prototype.getNodeById = function(id)
{
    if(id==null) return null;
    return this._nodes_by_id[id];
}


/**
 * Returns a list of nodes that matches a type
 * @method findNodesByType
 * @param {String} type the name of the node type
 * @return {Array} a list with all the nodes of this type
 */

LGraph.prototype.findNodesByType = function(type)
{
    var r = [];
    for(var i in this._nodes)
        if(this._nodes[i].type == type)
            r.push(this._nodes[i]);
    return r;
}

/**
 * Returns a list of nodes that matches a name
 * @method findNodesByName
 * @param {String} name the name of the node to search
 * @return {Array} a list with all the nodes with this name
 */

LGraph.prototype.findNodesByTitle = function(title)
{
    var result = [];
    for (var i in this._nodes)
        if(this._nodes[i].title == title)
            result.push(this._nodes[i]);
    return result;
}

/**
 * Returns the top-most node in this position of the canvas
 * @method getNodeOnPos
 * @param {number} x the x coordinate in canvas space
 * @param {number} y the y coordinate in canvas space
 * @param {Array} nodes_list a list with all the nodes to search from, by default is all the nodes in the graph
 * @return {Array} a list with all the nodes that intersect this coordinate
 */

LGraph.prototype.getNodeOnPos = function(x,y, nodes_list)
{
    nodes_list = nodes_list || this._nodes;
    for (var i = nodes_list.length - 1; i >= 0; i--)
    {
        var n = nodes_list[i];
        if(n.isPointInsideNode(x,y))
            return n;
    }
    return null;
}

// ********** GLOBALS *****************

//Tell this graph has a global input of this type
LGraph.prototype.addGlobalInput = function(name, type, value)
{
    this.global_inputs[name] = { name: name, type: type, value: value };

    if(this.onGlobalInputAdded)
        this.onGlobalInputAdded(name, type);

    if(this.onGlobalsChange)
        this.onGlobalsChange();
}

//assign a data to the global input
LGraph.prototype.setGlobalInputData = function(name, data)
{
    var input = this.global_inputs[name];
    if (!input)
        return;
    input.value = data;
}

//assign a data to the global input
LGraph.prototype.getGlobalInputData = function(name)
{
    var input = this.global_inputs[name];
    if (!input)
        return null;
    return input.value;
}

//rename the global input
LGraph.prototype.renameGlobalInput = function(old_name, name)
{
    if(name == old_name)
        return;

    if(!this.global_inputs[old_name])
        return false;

    if(this.global_inputs[name])
    {
        console.error("there is already one input with that name");
        return false;
    }

    this.global_inputs[name] = this.global_inputs[old_name];
    delete this.global_inputs[old_name];

    if(this.onGlobalInputRenamed)
        this.onGlobalInputRenamed(old_name, name);

    if(this.onGlobalsChange)
        this.onGlobalsChange();
}

LGraph.prototype.changeGlobalInputType = function(name, type)
{
    if(!this.global_inputs[name])
        return false;

    if(this.global_inputs[name].type == type)
        return;

    this.global_inputs[name].type = type;
    if(this.onGlobalInputTypeChanged)
        this.onGlobalInputTypeChanged(name, type);
}

LGraph.prototype.removeGlobalInput = function(name)
{
    if(!this.global_inputs[name])
        return false;

    delete this.global_inputs[name];

    if(this.onGlobalInputRemoved)
        this.onGlobalInputRemoved(name);

    if(this.onGlobalsChange)
        this.onGlobalsChange();
    return true;
}


LGraph.prototype.addGlobalOutput = function(name, type, value)
{
    this.global_outputs[name] = { name: name, type: type, value: value };

    if(this.onGlobalOutputAdded)
        this.onGlobalOutputAdded(name, type);

    if(this.onGlobalsChange)
        this.onGlobalsChange();
}

//assign a data to the global output
LGraph.prototype.setGlobalOutputData = function(name, value)
{
    var output = this.global_outputs[ name ];
    if (!output)
        return;
    output.value = value;
}

//assign a data to the global input
LGraph.prototype.getGlobalOutputData = function(name)
{
    var output = this.global_outputs[name];
    if (!output)
        return null;
    return output.value;
}


//rename the global output
LGraph.prototype.renameGlobalOutput = function(old_name, name)
{
    if(!this.global_outputs[old_name])
        return false;

    if(this.global_outputs[name])
    {
        console.error("there is already one output with that name");
        return false;
    }

    this.global_outputs[name] = this.global_outputs[old_name];
    delete this.global_outputs[old_name];

    if(this.onGlobalOutputRenamed)
        this.onGlobalOutputRenamed(old_name, name);

    if(this.onGlobalsChange)
        this.onGlobalsChange();
}

LGraph.prototype.changeGlobalOutputType = function(name, type)
{
    if(!this.global_outputs[name])
        return false;

    if(this.global_outputs[name].type == type)
        return;

    this.global_outputs[name].type = type;
    if(this.onGlobalOutputTypeChanged)
        this.onGlobalOutputTypeChanged(name, type);
}

LGraph.prototype.removeGlobalOutput = function(name)
{
    if(!this.global_outputs[name])
        return false;
    delete this.global_outputs[name];

    if(this.onGlobalOutputRemoved)
        this.onGlobalOutputRemoved(name);

    if(this.onGlobalsChange)
        this.onGlobalsChange();
    return true;
}


/**
 * Assigns a value to all the nodes that matches this name. This is used to create global variables of the node that
 * can be easily accesed from the outside of the graph
 * @method setInputData
 * @param {String} name the name of the node
 * @param {*} value value to assign to this node
 */

LGraph.prototype.setInputData = function(name,value)
{
    var m = this.findNodesByName(name);
    for(var i in m)
        m[i].setValue(value);
}

/**
 * Returns the value of the first node with this name. This is used to access global variables of the graph from the outside
 * @method setInputData
 * @param {String} name the name of the node
 * @return {*} value of the node
 */

LGraph.prototype.getOutputData = function(name)
{
    var n = this.findNodesByName(name);
    if(n.length)
        return m[0].getValue();
    return null;
}

//This feature is not finished yet, is to create graphs where nodes are not executed unless a trigger message is received

LGraph.prototype.triggerInput = function(name,value)
{
    var m = this.findNodesByName(name);
    for(var i in m)
        m[i].onTrigger(value);
}

LGraph.prototype.setCallback = function(name,func)
{
    var m = this.findNodesByName(name);
    for(var i in m)
        m[i].setTrigger(func);
}


LGraph.prototype.onConnectionChange = function()
{
    this.updateExecutionOrder();
}

/**
 * returns if the graph is in live mode
 * @method isLive
 */

LGraph.prototype.isLive = function()
{
    for(var i in this.list_of_graphcanvas)
    {
        var c = this.list_of_graphcanvas[i];
        if(c.live_mode) return true;
    }
    return false;
}

/* Called when something visually changed */
LGraph.prototype.change = function()
{
    if(LiteGraph.debug)
        console.log("Graph changed");

    this.sendActionToCanvas("setDirty",[true,true]);

    if(this.on_change)
        this.on_change(this);
}

LGraph.prototype.setDirtyCanvas = function(fg,bg)
{
    this.sendActionToCanvas("setDirty",[fg,bg]);
}

//save and recover app state ***************************************
/**
 * Creates a Object containing all the info about this graph, it can be serialized
 * @method serialize
 * @return {Object} value of the node
 */
LGraph.prototype.serialize = function()
{
    var nodes_info = [];
    for (var i in this._nodes)
        nodes_info.push( this._nodes[i].serialize() );

    //remove data from links, we dont want to store it
    for (var i in this.links)
        this.links[i].data = null;


    var data = {
//		graph: this.graph,
        shader_textures: this.shader_textures,

        //shader_output: this.shader_output, this creates a cycle

        iteration: this.iteration,
        frame: this.frame,
        last_node_id: this.last_node_id,
        last_link_id: this.last_link_id,
        links: LiteGraph.cloneObject( this.links ),

        config: this.config,
        nodes: nodes_info
    };

    return data;
}


/**
 * Loads a graph from a url and calls configure
 * @method loadFromURL
 * @param {String} url configure a graph from a JSON string
 * @param {Function} on_complete callback
 */
LGraph.prototype.loadFromURL = function (url, on_pre_configure, on_complete, params){

    var that = this;
    HttpRequest( url, null, function(data) {
        var obj = JSON.parse(data);
        if(on_pre_configure)
            on_pre_configure(obj);
        that.configure(obj);
        if(on_complete)
            on_complete(obj);
    }, function(err){
        if(on_complete)
            on_complete(null);
    });
}

/**
 * Configure a graph from a JSON string
 * @method configure
 * @param {String} str configure a graph from a JSON string
 */
LGraph.prototype.configure = function(data, keep_old)
{
    if(!keep_old)
        this.clear();

    this.configuring = true;
    var nodes = data.nodes;

    //copy all stored fields
    for (var i in data)
        if(i != "nodes")
            this[i] = data[i];

    var error = false;

    //create nodes
    this._nodes = [];
    for (var i in nodes)
    {
        var n_info = nodes[i]; //stored info
        var node = LiteGraph.createNode( n_info.type, n_info.title );
        if(!node)
        {
            if(LiteGraph.debug)
                console.log("Node not found: " + n_info.type);
            error = true;
            continue;
        }

        node.id = n_info.id; //id it or it will create a new id
        this.add(node, true); //add before configure, otherwise configure cannot create links
        node.configure(n_info);
    }
    this.configuring = false;
    this.updateExecutionOrder();
    this.setDirtyCanvas(true,true);
    this.change();
    return error;
}

LGraph.prototype.onNodeTrace = function(node, msg, color)
{
    //TODO
}


//*********************************************************************************
// LGraphCanvas: LGraph renderer CLASS                                  
//*********************************************************************************



// *************************************************************
//   Node CLASS                                          *******
// *************************************************************

/* flags:
 + skip_title_render
 + clip_area
 + unsafe_execution: not allowed for safe execution

 supported callbacks:
 + onAdded: when added to graph
 + onRemoved: when removed from graph
 + onStart:	when starts playing
 + onStop:	when stops playing
 + onDrawForeground: render the inside widgets inside the node
 + onDrawBackground: render the background area inside the node (only in edit mode)
 + onMouseDown
 + onMouseMove
 + onMouseUp
 + onMouseEnter
 + onMouseLeave
 + onExecute: execute the node
 + onPropertyChange: when a property is changed in the panel (return true to skip default behaviour)
 + onGetInputs: returns an array of possible inputs
 + onGetOutputs: returns an array of possible outputs
 + onDblClick
 + onSerialize
 + onSelected
 + onDeselected
 + onDropFile
 */



/**
 * Base Class for all the node type classes
 * @class LGraphNode
 * @param {String} name a name for the node
 */

function LGraphNode(title)
{
    this._ctor();
}

LGraphNode.prototype._ctor = function( title )
{
    this.title = title || "Unnamed";
    this.title_width = LiteGraph.NODE_MIN_WIDTH;
    this.size = [LiteGraph.NODE_WIDTH,60];
    this.graph = null;

    this.pos = [10,10];
    this.id = -1; //not know till not added
    this.types = null;

    //inputs available: array of inputs
    this.inputs = [];
    this.outputs = [];
    this.connections = [];

    //local data
    this.properties =  {};
    this.options = {};
    this.addBasicProperties();

    this.data = null; //persistent local data
    this.flags = {
        //skip_title_render: true,
        //unsafe_execution: false,
    };


    this.shader_piece = null;
    this.codes = []; //output codes in each output link channel
    this.node_path = []; //this var stores the different functions that have to be executed in one graph path

    this.T_in_types = {}; // template types
    this.T_out_types = {}; // template types
    this.in_using_T = 0; // number of inputs using T types
    this.in_conected_using_T = 0; // number of connected inputs  using T types
}


LGraphNode.prototype.addBasicProperties = function(  )
{
    var that = this;
    this.properties.is_global = false;
    this.properties.global_name = this.title;
    this.options =  this.options || {};
    this.options.is_global =  this.options.is_global || {};
    this.options.is_global.reloadonchange = 1;
    this.options.is_global.callback  = "callbackIsGlobal";
    this.options.is_global.hidden = this.options.is_global.hasOwnProperty("hidden") ? this.options.is_global.hidden  : true;
    this.options.global_name = {hidden:!this.properties.is_global};

}

LGraphNode.prototype.callbackIsGlobal = function(  )
{
    this.setGlobalColor();
    this.options.global_name.hidden = !this.options.global_name.hidden
}

/**
 * configure a node from an object containing the serialized info
 * @method configure
 */
LGraphNode.prototype.configure = function(info)
{
    for (var j in info)
    {
        if(j == "console") continue;

        if(j == "properties")
        {
            //i dont want to clone properties, I want to reuse the old container
            for(var k in info.properties)
                this.properties[k] = info.properties[k];
            continue;
        }

        if(j == "options")
        {
            //i dont want to clone properties, I want to reuse the old container
            for(var k in info.options)
                this.options[k] = info.options[k];
            continue;
        }

        if(info[j] == null)
            continue;
        else if (typeof(info[j]) == 'object') //object
        {
            if(this[j] && this[j].configure)
                this[j].configure( info[j] );
            else
                this[j] = LiteGraph.cloneObject(info[j], this[j]);
        }
        else //value
            this[j] = info[j];
    }

    //FOR LEGACY, PLEASE REMOVE ON NEXT VERSION
    for(var i in this.inputs)
    {
        var input = this.inputs[i];
        if(!input.link || !input.link.length )
            continue;
        var link = input.link;
        if(typeof(link) != "object")
            continue;
        input.link = link[0];
        this.graph.links[ link[0] ] = { id: link[0], origin_id: link[1], origin_slot: link[2], target_id: link[3], target_slot: link[4] };
    }
    for(var i in this.outputs)
    {
        var output = this.outputs[i];
        if(!output.links || output.links.length == 0)
            continue;
        for(var j in output.links)
        {
            var link = output.links[j];
            if(typeof(link) != "object")
                continue;
            output.links[j] = link[0];
        }
    }

}

/**
 * serialize the content
 * @method serialize
 */

LGraphNode.prototype.serialize = function()
{
    var o = {
        id: this.id,
        title: this.title,
        type: this.type,
        pos: this.pos,
        size: this.size,
        data: this.data,
        flags: LiteGraph.cloneObject(this.flags),
        inputs: LiteGraph.cloneObject(this.inputs),
        outputs: LiteGraph.cloneObject(this.outputs),
        shader_piece: this.shader_piece,
        codes: this.codes,
        T_out_types: this.T_out_types,
        T_in_types: this.T_in_types,
        in_conected_using_T: this.in_conected_using_T
    };

    if(this.properties)
        o.properties = LiteGraph.cloneObject(this.properties);

    if(this.options)
        o.options = LiteGraph.cloneObject(this.options);

    if(!o.type)
        o.type = this.constructor.type;

    if(this.color)
        o.color = this.color;
    if(this.bgcolor)
        o.bgcolor = this.bgcolor;
    if(this.boxcolor)
        o.boxcolor = this.boxcolor;
    if(this.shape)
        o.shape = this.shape;

    if(this.onSerialize)
        this.onSerialize(o);

    return o;
}


/* Creates a clone of this node */
LGraphNode.prototype.clone = function()
{
    var node = LiteGraph.createNode(this.type);

    var data = this.serialize();
    delete data["id"];
    node.configure(data);
    for(var j in data.inputs){
        var link_id = node.inputs[j].link;
        var link = this.graph.links[ link_id ];
        if(link){
            var new_id = this.graph.last_link_id++;
            node.inputs[j].link = new_id;
            this.graph.links[ new_id ] = { id: new_id, origin_id: link.origin_id, origin_slot: link.origin_slot, target_id: link.target_id, target_slot: link.target_slot };
        }

    }
    for(var j in data.outputs){
        var links = data.outputs[j].links;
        node.outputs[j].links = [];

    }
    node.properties.is_global = false;

    return node;
}


/**
 * serialize and stringify
 * @method toString
 */

LGraphNode.prototype.toString = function()
{
    return JSON.stringify( this.serialize() );
}
//LGraphNode.prototype.unserialize = function(info) {} //this cannot be done from within, must be done in LiteGraph


/**
 * get the title string
 * @method getTitle
 */

LGraphNode.prototype.getTitle = function()
{
    return this.title || this.constructor.title;
}

/**
 * get the title width string
 * @param {ctx, font} the context to calculate the width
 * @method getTitle
 */

LGraphNode.prototype.getTitleWidth = function(ctx, font)
{
    return this.title_width;
}

/**
 * get the title width string
 * @param {ctx, font} the context to calculate the width
 * @method getTitle
 */

LGraphNode.prototype.computeTitleWidth = function(ctx, font)
{
    ctx.font = font;
    this.title_width = this.title ? ctx.measureText(this.title ).width + LiteGraph.NODE_TITLE_HEIGHT + 5: 0; // 5 it's the padding
    if(this.size[0] < this.title_width)
        this.size[0] = this.title_width;
    return this.title_width;
}

// Execution *************************
/**
 * sets the output data
 * @method setOutputData
 * @param {number} slot
 * @param {*} data
 */
LGraphNode.prototype.setOutputData = function(slot,data)
{
    if(!this.outputs) return;
    if(slot > -1 && slot < this.outputs.length && this.outputs[slot] && this.outputs[slot].links != null)
    {
        for(var i = 0; i < this.outputs[slot].links.length; i++)
        {
            var link_id = this.outputs[slot].links[i];
            this.graph.links[ link_id ].data = data;
        }
    }
}

/**
 * retrieves the input data from one slot
 * @method getInputData
 * @param {number} slot
 * @return {*} data
 */
LGraphNode.prototype.getInputData = function(slot)
{
    if(!this.inputs) return null;
    if(slot < this.inputs.length && this.inputs[slot].link != null)
        return this.graph.links[ this.inputs[slot].link ].data;
    return null;
}

/**
 * tells you if there is a connection in one input slot
 * @method isInputConnected
 * @param {number} slot
 * @return {boolean}
 */
LGraphNode.prototype.isInputConnected = function(slot)
{
    if(!this.inputs) return null;
    return (slot < this.inputs.length && this.inputs[slot].link != null);
}

/**
 * tells you info about an input connection (which node, type, etc)
 * @method getInputInfo
 * @param {number} slot
 * @return {Object}
 */
LGraphNode.prototype.getInputInfo = function(slot)
{
    if(!this.inputs) return null;
    if(slot < this.inputs.length)
        return this.inputs[slot];
    return null;
}


/**
 * tells you info about an output connection (which node, type, etc)
 * @method getOutputInfo
 * @param {number} slot
 * @return {Object}
 */
LGraphNode.prototype.getOutputInfo = function(slot)
{
    if(!this.outputs) return null;
    if(slot < this.outputs.length)
        return this.outputs[slot];
    return null;
}


/**
 * tells you if there is a connection in one output slot
 * @method isOutputConnected
 * @param {number} slot
 * @return {boolean}
 */
LGraphNode.prototype.isOutputConnected = function(slot)
{
    if(!this.outputs) return null;
    return (slot < this.outputs.length && this.outputs[slot].links && this.outputs[slot].links.length);
}

/**
 * retrieves all the nodes connected to this output slot
 * @method getOutputNodes
 * @param {number} slot
 * @return {array}
 */
LGraphNode.prototype.getOutputNodes = function(slot)
{
    if(!this.outputs || this.outputs.length == 0) return null;
    if(slot < this.outputs.length)
    {
        var output = this.outputs[slot];
        var r = [];
        for(var i = 0; i < output.length; i++)
            r.push( this.graph.getNodeById( output.links[i].target_id ));
        return r;
    }
    return null;
}

LGraphNode.prototype.triggerOutput = function(slot,param)
{
    var n = this.getOutputNode(slot);
    if(n && n.onTrigger)
        n.onTrigger(param);
}

//connections

/**
 * add a new output slot to use in this node
 * @method addOutput
 * @param {string} name
 * @param {string} type string defining the output type ("vec3","number",...)
 * @param {Object} extra_info this can be used to have special properties of an output (special color, position, etc)
 */
LGraphNode.prototype.addOutput = function(name,type,types, extra_info)
{
    types = types ||{};
    var o = {name:name,type:type,types:types,links:null};
    if(extra_info)
        for(var i in extra_info)
            o[i] = extra_info[i];

    if(!this.outputs) this.outputs = [];
    this.outputs.push(o);
    if(this.onOutputAdded)
        this.onOutputAdded(o);
    this.size = this.computeSize();
}

/**
 * add a new output slot to use in this node
 * @method addOutputs
 * @param {Array} array of triplets like [[name,type,extra_info],[...]]
 */
LGraphNode.prototype.addOutputs = function(array)
{
    for(var i in array)
    {
        var info = array[i];
        var o = {name:info[0],type:info[1],link:null};
        if(array[2])
            for(var j in info[2])
                o[j] = info[2][j];

        if(!this.outputs)
            this.outputs = [];
        this.outputs.push(o);
        if(this.onOutputAdded)
            this.onOutputAdded(o);
    }

    this.size = this.computeSize();
}

/**
 * remove an existing output slot
 * @method removeOutput
 * @param {number} slot
 */
LGraphNode.prototype.removeOutput = function(slot)
{
    this.disconnectOutput(slot);
    this.outputs.splice(slot,1);
    this.size = this.computeSize();
    if(this.onOutputRemoved)
        this.onOutputRemoved(slot);
}


/**
 * add a new input slot to use in this node
 * @method addInput
 * @param {string} name
 * @param {string} type string defining the input type ("vec3","number",...)
 * @param {Object} extra_info this can be used to have special properties of an input (label, color, position, etc)
 */
LGraphNode.prototype.addInput = function(name,type,types,extra_info)
{
    types = types ||{};
    var o = {name:name,type:type,link:null, types:types};
    if(extra_info){
        for(var i in extra_info)
            o[i] = extra_info[i];
        if(extra_info.use_t){
            this.in_using_T++;
        }
    }


    if(!this.inputs) this.inputs = [];
    this.inputs.push(o);
    this.size = this.computeSize();
    if(this.onInputAdded)
        this.onInputAdded(o);
}

/**
 * add several new input slots in this node
 * @method addInputs
 * @param {Array} array of triplets like [[name,type,extra_info],[...]]
 */
LGraphNode.prototype.addInputs = function(array)
{
    for(var i in array)
    {
        var info = array[i];
        var o = {name:info[0], type:info[1], link:null};
        if(array[2])
            for(var j in info[2])
                o[j] = info[2][j];

        if(!this.inputs)
            this.inputs = [];
        this.inputs.push(o);
        if(this.onInputAdded)
            this.onInputAdded(o);
    }

    this.size = this.computeSize();
}

/**
 * remove an existing input slot
 * @method removeInput
 * @param {number} slot
 */
LGraphNode.prototype.removeInput = function(slot)
{
    this.disconnectInput(slot);
    this.inputs.splice(slot,1);
    this.size = this.computeSize();
    if(this.onInputRemoved)
        this.onInputRemoved(slot);

}

/**
 * add an special connection to this node (used for special kinds of graphs)
 * @method addConnection
 * @param {string} name
 * @param {string} type string defining the input type ("vec3","number",...)
 * @param {[x,y]} pos position of the connection inside the node
 * @param {string} direction if is input or output
 */
LGraphNode.prototype.addConnection = function(name,type,pos,direction)
{
    this.connections.push( {name:name,type:type,pos:pos,direction:direction,links:null});
}

/**
 * computes the size of a node according to its inputs and output slots
 * @method computeSize
 * @param {number} minHeight
 * @return {number} the total size
 */
LGraphNode.prototype.computeSize = function(minHeight)
{
    var rows = Math.max( this.inputs ? this.inputs.length : 1, this.outputs ? this.outputs.length : 1);
    var size = new Float32Array([0,0]);
    size[1] = rows * 14 + 6;
    if(!this.inputs || this.inputs.length == 0 || !this.outputs || this.outputs.length == 0)
        size[0] = LiteGraph.NODE_WIDTH * 0.5;
    else
        size[0] = LiteGraph.NODE_WIDTH;
    return size;
}

/**
 * returns the bounding of the object, used for rendering purposes
 * @method getBounding
 * @return {Float32Array[4]} the total size
 */
LGraphNode.prototype.getBounding = function()
{
    return new Float32Array([this.pos[0] - 4, this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT, this.pos[0] + this.size[0] + 4, this.pos[1] + this.size[1] + LGraph.NODE_TITLE_HEIGHT]);
}

/**
 * checks if a point is inside the shape of a node
 * @method isPointInsideNode
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
LGraphNode.prototype.isPointInsideNode = function(x,y)
{
    var margin_top = this.graph && this.graph.isLive() ? 0 : 20;
    if(this.flags.collapsed)
    {
        //if ( distance([x,y], [this.pos[0] + this.size[0]*0.5, this.pos[1] + this.size[1]*0.5]) < LiteGraph.NODE_COLLAPSED_RADIUS)
        if( isInsideRectangle(x,y, this.pos[0], this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT, this.getTitleWidth(), LiteGraph.NODE_TITLE_HEIGHT) )
            return true;
    }
    else if (this.pos[0] - 4 < x && (this.pos[0] + this.size[0] + 4) > x
        && (this.pos[1] - margin_top) < y && (this.pos[1] + this.size[1]) > y)
        return true;
    return false;
}

/**
 * returns the input slot with a given name (used for dynamic slots), -1 if not found
 * @method findInputSlot
 * @param {string} name the name of the slot
 * @return {number} the slot (-1 if not found)
 */
LGraphNode.prototype.findInputSlot = function(name)
{
    if(!this.inputs) return -1;
    for(var i = 0, l = this.inputs.length; i < l; ++i)
        if(name == this.inputs[i].name)
            return i;
    return -1;
}

/**
 * returns the output slot with a given name (used for dynamic slots), -1 if not found
 * @method findOutputSlot
 * @param {string} name the name of the slot
 * @return {number} the slot (-1 if not found)
 */
LGraphNode.prototype.findOutputSlot = function(name)
{
    if(!this.outputs) return -1;
    for(var i = 0, l = this.outputs.length; i < l; ++i)
        if(name == this.outputs[i].name)
            return i;
    return -1;
}

/**
 * connect this node output to the input of another node
 * @method connect
 * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
 * @param {LGraphNode} node the target node
 * @param {number_or_string} target_slot the input slot of the target node (could be the number of the slot or the string with the name of the slot)
 * @return {boolean} if it was connected succesfully
 */
LGraphNode.prototype.connect = function(slot, node, target_slot)
{
    target_slot = target_slot || 0;

    //seek for the output slot
    if( slot.constructor === String )
    {
        slot = this.findOutputSlot(slot);
        if(slot == -1)
        {
            if(LiteGraph.debug)
                console.log("Connect: Error, no slot of name " + slot);
            return false;
        }
    }
    else if(!this.outputs || slot >= this.outputs.length)
    {
        if(LiteGraph.debug)
            console.log("Connect: Error, slot number not found");
        return false;
    }

    //avoid loopback
    if(node == this) return false;
    //if( node.constructor != LGraphNode ) throw ("LGraphNode.connect: node is not of type LGraphNode");

    if(target_slot.constructor === String)
    {
        target_slot = node.findInputSlot(target_slot);
        if(target_slot == -1)
        {
            if(LiteGraph.debug)
                console.log("Connect: Error, no slot of name " + target_slot);
            return false;
        }
    }
    else if(!node.inputs || target_slot >= node.inputs.length)
    {
        if(LiteGraph.debug)
            console.log("Connect: Error, slot number not found");
        return false;
    }

    //if there is something already plugged there, disconnect
    if(target_slot != -1 && node.inputs[target_slot].link != null)
        node.disconnectInput(target_slot);

    //special case: -1 means node-connection, used for triggers
    var output = this.outputs[slot];
    if(target_slot == -1)
    {
        if( output.links == null )
            output.links = [];
        output.links.push({id:node.id, slot: -1});
    }
    else if( //!output.type ||  //generic output
        //!node.inputs[target_slot].type || //generic input
        ((output.type !=  "" &&   node.inputs[target_slot].type != "") &&
        output.type == node.inputs[target_slot].type) || //same type
        node.compareNodeTypes(this,output,target_slot)) //compare with multiple types
    {
        //info: link structure => [ 0:link_id, 1:start_node_id, 2:start_slot, 3:end_node_id, 4:end_slot ]
        //var link = [ this.graph.last_link_id++, this.id, slot, node.id, target_slot ];
        var link = { id: this.graph.last_link_id++, origin_id: this.id, origin_slot: slot, target_id: node.id, target_slot: target_slot };
        this.graph.links[ link.id ] = link;

        //connect
        if( output.links == null )	output.links = [];
        output.links.push( link.id );
        node.inputs[target_slot].link = link.id;

        if( node.inputs[target_slot].use_t){ // use Template type
            node.infereTypes( output, target_slot, this);
        }

        this.setDirtyCanvas(false,true);
        this.graph.onConnectionChange();
    }
    if(node.onInputConnect)
        node.onInputConnect();

    return true;
}

/**
 * disconnect one output to an specific node
 * @method disconnectOutput
 * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
 * @param {LGraphNode} target_node the target node to which this slot is connected [Optional, if not target_node is specified all nodes will be disconnected]
 * @return {boolean} if it was disconnected succesfully
 */
LGraphNode.prototype.disconnectOutput = function(slot, target_node)
{
    if( slot.constructor === String )
    {
        slot = this.findOutputSlot(slot);
        if(slot == -1)
        {
            if(LiteGraph.debug)
                console.log("Connect: Error, no slot of name " + slot);
            return false;
        }
    }
    else if(!this.outputs || slot >= this.outputs.length)
    {
        if(LiteGraph.debug)
            console.log("Connect: Error, slot number not found");
        return false;
    }

    //get output slot
    var output = this.outputs[slot];
    if(!output.links || output.links.length == 0)
        return false;

    if(target_node)
    {
        for(var i = 0, l = output.links.length; i < l; i++)
        {
            var link_id = output.links[i];
            var link_info = this.graph.links[ link_id ];
            //is the link we are searching for...
            if( link_info.target_id == target_node.id )
            {
                output.links.splice(i,1); //remove here
                var input_slot = target_node.inputs[ link_info.target_slot ];
                input_slot.link = null; //remove there

                if(input_slot.use_t){
                    target_node.disconnectTemplateSlot(i);
                }

                delete this.graph.links[ link_id ]; //remove the link from the links pool
                break;
            }
        }
    }
    else
    {
        for(var i = 0, l = output.links.length; i < l; i++)
        {
            var link_id = output.links[i];
            var link_info = this.graph.links[ link_id ];

            var target_node = this.graph.getNodeById( link_info.target_id );
            if(target_node){
                var input_slot = target_node.inputs[ link_info.target_slot ];
                input_slot.link = null; //remove other side link
                if(input_slot.use_t){
                    target_node.disconnectTemplateSlot(i);
                }
            }

        }
        output.links = null;
    }

    //this.resetTypes();
    this.setDirtyCanvas(false,true);
    this.graph.onConnectionChange();
    return true;
}



/**
 * disconnect one input
 * @method disconnectInput
 * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
 * @return {boolean} if it was disconnected succesfully
 */
LGraphNode.prototype.disconnectInput = function(slot)
{
    //seek for the output slot
    if( slot.constructor === String )
    {
        slot = this.findInputSlot(slot);
        if(slot == -1)
        {
            if(LiteGraph.debug)
                console.log("Connect: Error, no slot of name " + slot);
            return false;
        }
    }
    else if(!this.inputs || slot >= this.inputs.length)
    {
        if(LiteGraph.debug)
            console.log("Connect: Error, slot number not found");
        return false;
    }

    var input = this.inputs[slot];
    if(!input) return false;
    if(input.use_t){
        this.disconnectTemplateSlot(slot);
    }
    var link_id = this.inputs[slot].link;
    this.inputs[slot].link = null;



    //remove other side
    var link_info = this.graph.links[ link_id ];
    var node = this.graph.getNodeById( link_info.origin_id );
    if(!node) return false;

    var output = node.outputs[ link_info.origin_slot ];
    if(!output || !output.links || output.links.length == 0)
        return false;

    //check outputs
    for(var i = 0, l = output.links.length; i < l; i++)
    {
        var link_id = output.links[i];
        var link_info = this.graph.links[ link_id ];
        if( link_info.target_id == this.id )
        {
            output.links.splice(i,1);
            break;
        }
    }

    if(this.onInputDisconnect)
        this.onInputDisconnect();

    this.setDirtyCanvas(false,true);
    this.graph.onConnectionChange();
    return true;
}

/**
 * returns the center of a connection point in canvas coords
 * @method getConnectionPos
 * @param {boolean} is_input true if if a input slot, false if it is an output
 * @param {number_or_string} slot (could be the number of the slot or the string with the name of the slot)
 * @return {[x,y]} the position
 **/
LGraphNode.prototype.getConnectionPos = function(is_input,slot_number)
{
    if(this.flags.collapsed)
    {
        if(is_input)
            return [this.pos[0], this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT * 0.5];
        else
            return [this.pos[0] + this.getTitleWidth(), this.pos[1] - LiteGraph.NODE_TITLE_HEIGHT * 0.5];
        //return [this.pos[0] + this.size[0] * 0.5, this.pos[1] + this.size[1] * 0.5];
    }

    if(is_input && slot_number == -1)
    {
        return [this.pos[0] + 10, this.pos[1] + 10];
    }

    if(is_input && this.inputs.length > slot_number && this.inputs[slot_number].pos)
        return [this.pos[0] + this.inputs[slot_number].pos[0],this.pos[1] + this.inputs[slot_number].pos[1]];
    else if(!is_input && this.outputs.length > slot_number && this.outputs[slot_number].pos)
        return [this.pos[0] + this.outputs[slot_number].pos[0],this.pos[1] + this.outputs[slot_number].pos[1]];

    if(!is_input) //output
        return [this.pos[0] + this.size[0] + 1, this.pos[1] + 10 + slot_number * LiteGraph.NODE_SLOT_HEIGHT];
    return [this.pos[0] , this.pos[1] + 10 + slot_number * LiteGraph.NODE_SLOT_HEIGHT];
}

/* Force align to grid */
LGraphNode.prototype.alignToGrid = function()
{
    this.pos[0] = LiteGraph.CANVAS_GRID_SIZE * Math.round(this.pos[0] / LiteGraph.CANVAS_GRID_SIZE);
    this.pos[1] = LiteGraph.CANVAS_GRID_SIZE * Math.round(this.pos[1] / LiteGraph.CANVAS_GRID_SIZE);
}


/* Console output */
LGraphNode.prototype.trace = function(msg)
{
    if(!this.console)
        this.console = [];
    this.console.push(msg);
    if(this.console.length > LGraphNode.MAX_CONSOLE)
        this.console.shift();

    this.graph.onNodeTrace(this,msg);
}

/* Forces to redraw or the main canvas (LGraphNode) or the bg canvas (links) */
LGraphNode.prototype.setDirtyCanvas = function(dirty_foreground, dirty_background)
{
    if(!this.graph)
        return;
    this.graph.sendActionToCanvas("setDirty",[dirty_foreground, dirty_background]);
}

LGraphNode.prototype.loadImage = function(url)
{
    var img = new Image();
    img.src = LiteGraph.node_images_path + url;
    img.ready = false;

    var that = this;
    img.onload = function() {
        this.ready = true;
        that.setDirtyCanvas(true);
    }
    return img;
}

//safe LGraphNode action execution (not sure if safe)
LGraphNode.prototype.executeAction = function(action)
{
    if(action == "") return false;

    if( action.indexOf(";") != -1 || action.indexOf("}") != -1)
    {
        this.trace("Error: Action contains unsafe characters");
        return false;
    }

    var tokens = action.split("(");
    var func_name = tokens[0];
    if( typeof(this[func_name]) != "function")
    {
        this.trace("Error: Action not found on node: " + func_name);
        return false;
    }

    var code = action;

    try
    {
        var _foo = eval;
        eval = null;
        (new Function("with(this) { " + code + "}")).call(this);
        eval = _foo;
    }
    catch (err)
    {
        this.trace("Error executing action {" + action + "} :" + err);
        return false;
    }

    return true;
}

/* Allows to get onMouseMove and onMouseUp events even if the mouse is out of focus */
LGraphNode.prototype.captureInput = function(v)
{
    if(!this.graph || !this.graph.list_of_graphcanvas)
        return;

    var list = this.graph.list_of_graphcanvas;

    for(var i in list)
    {
        var c = list[i];
        //releasing somebody elses capture?!
        if(!v && c.node_capturing_input != this)
            continue;

        //change
        c.node_capturing_input = v ? this : null;
        if(this.graph.debug)
            console.log(this.title + ": Capturing input " + (v?"ON":"OFF"));
    }
}

/**
 * Collapse the node to make it smaller on the canvas
 * @method collapse
 **/
LGraphNode.prototype.collapse = function()
{
    if(!this.flags.collapsed)
        this.flags.collapsed = true;
    else
        this.flags.collapsed = false;
    this.setDirtyCanvas(true,true);
}

/**
 * Forces the node to do not move or realign on Z
 * @method pin
 **/
LGraphNode.prototype.pin = function(v)
{
    if(v === undefined)
        this.flags.pinned = !this.flags.pinned;
    else
        this.flags.pinned = v;
}

LGraphNode.prototype.localToScreen = function(x,y, graphcanvas)
{
    return [(x + this.pos[0]) * graphcanvas.scale + graphcanvas.offset[0],
            (y + this.pos[1]) * graphcanvas.scale + graphcanvas.offset[1]];
}

LGraphNode.prototype.getInputNodes = function()
{
    var r = [];
    if(!this.inputs || this.inputs.length == 0) return r;
    for(var i = 0; i < this.inputs.length; i++){
        var link_id = this.inputs[i].link;
        var link = this.graph.links[link_id];
        if(link)
            r[i] =  this.graph.getNodeById( link.origin_id );// we knot it's 0 cause inputs only can have one link
    }
    return r;
}

LGraphNode.prototype.getInputCode = function(slot)
{
    var link_id = this.inputs[slot].link;
    var link = this.graph.links[link_id];
    if(link)
        return this.graph.getNodeById( link.origin_id ).codes[link.origin_slot];
    return null;
}

LGraphNode.prototype.getInputNodePath = function(slot)
{
    var link_id = this.inputs[slot].link;
    var link = this.graph.links[link_id];
    if(link)
        return this.graph.getNodeById( link.origin_id ).node_path[link.origin_slot];
    return {};
}

LGraphNode.prototype.getOutputNodePath = function(slot)
{
    var link_id = this.outputs[slot].link;
    var link = this.graph.links[link_id];
    if(link)
        return this.graph.getNodeById( link.target_id ).node_path[link.target_slot];
    return {};
}

LGraphNode.prototype.insertIntoPath = function(path)
{
    if(!path.hasOwnProperty((this.id)))
        path[this.id] = this;
}

LGraphNode.prototype.mergePaths = function(path_target, path_to_merge)
{
    var objKeys = Object.keys(path_to_merge);
    var id;
    for (var i = 0, l = objKeys.length; i < l; i++) {
        id = objKeys[i];
        path_target[id] = path_to_merge[id];
    }
}

LGraphNode.prototype.processNodePath = function()
{
    var last_path = {};
    for(var i in this.inputs){
        var output_path = this.getInputNodePath(i);
        if(i > 0){
            this.mergePaths(last_path,output_path);
        } else
            last_path = output_path;
    }
    this.insertIntoPath(last_path);

    for(var i in this.outputs)
        this.node_path[i] = last_path;

}

LGraphNode.prototype.onGetNullCode = function(slot)
{

}

/**
 * increments the counter of the inputs using template vars
 * and then updates the inputs type with the output given
 * @method infereTypes
 **/
LGraphNode.prototype.infereTypes = function( output, target_slot)
{
    this.in_conected_using_T++;
    var input = this.inputs[target_slot];
    if(input.use_t && this.in_conected_using_T == 1){
        var out_types = this.getTypesFromOutputSlot(output);
        for(var k in out_types){
            this.T_in_types[k] = out_types[k];
            this.T_out_types[k] = out_types[k];
        }
    }
}

/**
 * @method recomputeTypes
 **/
LGraphNode.prototype.recomputeTypes = function( output, target_slot)
{
    if(this.id == 13 || this.id == 11)
   console.log("hola");
    var input = this.inputs[target_slot];
    if(input.use_t && this.in_conected_using_T == 1){
        this.resetTypes(target_slot);
        var out_types = this.getTypesFromOutputSlot(output);
        for(var k in out_types){
            this.T_in_types[k] = out_types[k];
            this.T_out_types[k] = out_types[k];
        }
    }
}

LGraphNode.prototype.resetTypes = function( slot )
{

    if( !this.in_conected_using_T ){
        for(var k in this.T_in_types)
            delete this.T_in_types[k];
        for(var k in this.T_out_types)
            delete this.T_out_types[k];
    }
}

/** Compares the
 * @param connecting_node the node that we are connection
 * @param connection_slot the slot from the connectiing node
 * @param slot_id the id of the slot where we are connecting our input node
 * @method compareNodeTypes
 **/
LGraphNode.prototype.compareNodeTypes = function(input_node, connection_slot, slot_id)
{
    var input_slot = this.inputs[slot_id];
    var out_types = null;
    var in_types = null;
    var ret = false;
    if(connection_slot.use_t){
        out_types = Object.keys(input_node.T_out_types) == 0 ? null : input_node.T_out_types;
    }

    if(out_types === null) {
        out_types = Object.keys(connection_slot.types).length ? connection_slot.types : connection_slot.types_list;
    }

    if(input_slot.use_t){
        in_types = Object.keys(this.T_in_types) == 0 ? null : this.T_in_types;
        ret = true;
    }  else if (Object.keys(input_slot.types).length)
        in_types = input_slot.types;
    else
        in_types = input_slot.types_list;

    if(!out_types || !in_types )
        return ret;
    for (key in out_types) {
        if (in_types.hasOwnProperty(key)) {
            return true;
        }
    }
    return false;
}


LGraphNode.prototype.getTypesFromOutputSlot = function(output_slot){
    var out_types = null;
    if(output_slot.use_t){
        out_types = Object.keys(this.T_out_types) == 0 ? null : this.T_out_types;
    }
    if (out_types === null) {
        out_types = Object.keys(output_slot.types).length ? output_slot.types : output_slot.types_list;
    }
    return out_types;
}

LGraphNode.prototype.disconnectTemplateSlot = function(slot){

    if(this.in_conected_using_T > 0)
        this.in_conected_using_T--;
    this.resetTypes(slot);
}

LGraphNode.prototype.connectTemplateSlot = function(){
    this.in_conected_using_T++;
}

LGraphNode.prototype.setGlobalColor = function() {
    if(this.properties.is_global){
        this.color = "#AFA";
    } else {
        delete this.color ;
    }

}








/**
 * The Global Scope. It contains all the registered node classes.
 *
 * @class LGraphCanvas
 * @constructor
 * @param {HTMLCanvas} canvas the canvas where you want to render (it accepts a selector in string format or the canvas itself)
 * @param {LGraph} graph [optional]
 */
function LGraphCanvas(canvas, graph, skip_render) {
    //if(graph === undefined)
    //	throw ("No graph assigned");

    if (typeof(canvas) == "string")
        canvas = document.querySelector(canvas);

    if (!canvas)
        throw("no canvas found");

    this.max_zoom = 10;
    this.min_zoom = 0.1;

    //link canvas and graph
    if (graph)
        graph.attachCanvas(this);

    this.setCanvas(canvas);
    this.clear();

    if (!skip_render)
        this.startRendering();
}

LGraphCanvas.link_type_colors = {'number': "#AAC", 'node': "#DCA"};


/**
 * clears all the data inside
 *
 * @method clear
 */
LGraphCanvas.prototype.clear = function () {
    this.frame = 0;
    this.last_draw_time = 0;
    this.render_time = 0;
    this.fps = 0;

    this.scale = 1;
    this.offset = [0, 0];

    this.selected_nodes = {};
    this.node_dragged = null;
    this.node_over = null;
    this.node_capturing_input = null;
    this.connecting_node = null;

    this.highquality_render = true;
    this.editor_alpha = 1; //used for transition
    this.pause_rendering = false;
    this.render_shadows = true;
    this.dirty_canvas = true;
    this.dirty_bgcanvas = true;
    this.dirty_area = null;

    this.render_only_selected = true;
    this.live_mode = false;
    this.show_info = true;
    this.allow_dragcanvas = true;
    this.allow_dragnodes = true;

    this.node_in_panel = null;

    this.last_mouse = [0, 0];
    this.last_mouseclick = 0;

    this.title_text_font = "bold 14px Arial";
    this.inner_text_font = "normal 12px Arial";

    this.render_connections_shadows = false; //too much cpu
    this.render_connections_border = true;
    this.render_curved_connections = true;
    this.render_connection_arrows = true;

    this.connections_width = 4;

    //this.is_rendering = false;

    if (this.onClear) this.onClear();
    //this.UIinit();
}

/**
 * assigns a graph, you can reasign graphs to the same canvas
 *
 * @method setGraph
 * @param {LGraph} graph
 */
LGraphCanvas.prototype.setGraph = function (graph) {
    if (this.graph == graph) return;
    this.clear();

    if (!graph && this.graph) {
        this.graph.detachCanvas(this);
        return;
    }

    /*
     if(this.graph)
     this.graph.canvas = null; //remove old graph link to the canvas
     this.graph = graph;
     if(this.graph)
     this.graph.canvas = this;
     */
    graph.attachCanvas(this);
    this.setDirty(true, true);
}

/**
 * opens a graph contained inside a node in the current graph
 *
 * @method openSubgraph
 * @param {LGraph} graph
 */
LGraphCanvas.prototype.openSubgraph = function (graph) {
    if (!graph)
        throw("graph cannot be null");

    if (this.graph == graph)
        throw("graph cannot be the same");

    this.clear();

    if (this.graph) {
        if (!this._graph_stack)
            this._graph_stack = [];
        this._graph_stack.push(this.graph);
    }

    graph.attachCanvas(this);
    this.setDirty(true, true);
}

/**
 * closes a subgraph contained inside a node
 *
 * @method closeSubgraph
 * @param {LGraph} assigns a graph
 */
LGraphCanvas.prototype.closeSubgraph = function () {
    if (!this._graph_stack || this._graph_stack.length == 0)
        return;
    var graph = this._graph_stack.pop();
    graph.attachCanvas(this);
    this.setDirty(true, true);
}

/**
 * assigns a canvas
 *
 * @method setCanvas
 * @param {Canvas} assigns a canvas
 */
LGraphCanvas.prototype.setCanvas = function (canvas) {
    var that = this;

    //Canvas association
    if (typeof(canvas) == "string")
        canvas = document.getElementById(canvas);

    if (canvas == null)
        throw("Error creating LiteGraph canvas: Canvas not found");
    if (canvas == this.canvas) return;

    this.canvas = canvas;
    //this.canvas.tabindex = "1000";
    canvas.className += " lgraphcanvas";
    canvas.data = this;

    //bg canvas: used for non changing stuff
    this.bgcanvas = null;
    if (!this.bgcanvas) {
        this.bgcanvas = document.createElement("canvas");
        this.bgcanvas.width = this.canvas.width;
        this.bgcanvas.height = this.canvas.height;
    }

    if (canvas.getContext == null) {
        throw("This browser doesnt support Canvas");
    }

    var ctx = this.ctx = canvas.getContext("2d");
    if (ctx == null)
    {
        console.warn("This canvas seems to be WebGL, enabling WebGL renderer");
        this.enableWebGL();
    }

    //input:  (move and up could be unbinded)
    this._mousemove_callback = this.processMouseMove.bind(this);
    this._mouseup_callback = this.processMouseUp.bind(this);

    canvas.addEventListener("mousedown", this.processMouseDown.bind(this), true); //down do not need to store the binded
    canvas.addEventListener("mousemove", this._mousemove_callback);

    canvas.addEventListener("contextmenu", function (e) {
        canvas.focus();
        e.preventDefault();
        return false;
    });

    canvas.addEventListener("mousewheel", this.processMouseWheel.bind(this), false);
    canvas.addEventListener("DOMMouseScroll", this.processMouseWheel.bind(this), false);

    //touch events
    //if( 'touchstart' in document.documentElement )
//    {
//        //alert("doo");
       canvas.addEventListener("touchstart", this.touchHandler.bind(this), true);
       canvas.addEventListener("touchmove", this.touchHandler.bind(this), true);
       canvas.addEventListener("touchend", this.touchHandler.bind(this), true);
       canvas.addEventListener("touchcancel", this.touchHandler.bind(this), true);
//    }

    //this.canvas.onselectstart = function () { return false; };
    canvas.tabIndex = 1000;
    canvas.style.outline = "none";
    canvas.addEventListener("keydown", function (e) {
        e.preventDefault();
        that.processKeyDown(e);
    });

    canvas.addEventListener("keyup", function (e) {
        that.processKeyUp(e);
    });

    //droping files
    canvas.ondragover = function () { /*console.log('hover');*/
        return false;
    };
    canvas.ondragend = function () {
        console.log('out');
        return false;
    };
    canvas.ondrop = function (e) {
        canvas.focus();
        e.preventDefault();
        that.adjustMouseEvent(e);

        var pos = [e.canvasX, e.canvasY];
        var node = that.graph.getNodeOnPos(pos[0], pos[1]);

        // if the dropEvenet has a node name like "math/sin" it will
        // create a node on that position
        var node_name = e.dataTransfer.getData('text');
        if(node_name) {
            var n = LiteGraph.createNode(node_name);
            n.pos = pos;
            that.graph.add(n);
            return;
        }

        // we want to throw graphs in the canvas
//        if (!node)
//            return;
//
//        if (!node.onDropFile)
//            return;

        var file = e.dataTransfer.files[0];
        var filename = file.name;
        var ext = LGraphCanvas.getFileExtension(filename);
        //console.log(file);

        //prepare reader
        var reader = new FileReader();
        reader.onload = function (event) {
            //console.log(event.target);
            var data = event.target.result;
            if(node && node.onDropFile)
                node.onDropFile(data, filename, file, null, gl);
            if(that.onDropFile)
                that.onDropFile(data, filename, file);
            LiteGraph.dispatchEvent("contentChange", null, null);


        };

        //read data
        var type = file.type.split("/")[0];
        if (type == "text" || ext == "json")
            reader.readAsText(file);
        else if (type == "image")
            reader.readAsDataURL(file);
        else
            reader.readAsArrayBuffer(file);


        return false;
    };
}

LGraphCanvas.getFileExtension = function (url) {
    var question = url.indexOf("?");
    if (question != -1)
        url = url.substr(0, question);
    var point = url.lastIndexOf(".");
    if (point == -1)
        return "";
    return url.substr(point + 1).toLowerCase();
}

//this file allows to render the canvas using WebGL instead of Canvas2D
//this is useful if you plant to render 3D objects inside your nodes
LGraphCanvas.prototype.enableWebGL = function () {
    if (typeof(GL) === undefined)
        throw("litegl.js must be included to use a WebGL canvas");
    if (typeof(enableWebGLCanvas) === undefined)
        throw("webglCanvas.js must be included to use this feature");

    this.gl = this.ctx = enableWebGLCanvas(this.canvas);
    this.ctx.webgl = true;
    this.bgcanvas = this.canvas;
    this.bgctx = this.gl;

    /*
     GL.create({ canvas: this.bgcanvas });
     this.bgctx = enableWebGLCanvas( this.bgcanvas );
     window.gl = this.gl;
     */
}


/*
 LGraphCanvas.prototype.UIinit = function()
 {
 var that = this;
 $("#node-console input").change(function(e)
 {
 if(e.target.value == "")
 return;

 var node = that.node_in_panel;
 if(!node)
 return;

 node.trace("] " + e.target.value, "#333");
 if(node.onConsoleCommand)
 {
 if(!node.onConsoleCommand(e.target.value))
 node.trace("command not found", "#A33");
 }
 else if (e.target.value == "info")
 {
 node.trace("Special methods:");
 for(var i in node)
 {
 if(typeof(node[i]) == "function" && LGraphNode.prototype[i] == null && i.substr(0,2) != "on" && i[0] != "_")
 node.trace(" + " + i);
 }
 }
 else
 {
 try
 {
 eval("var _foo = function() { return ("+e.target.value+"); }");
 var result = _foo.call(node);
 if(result)
 node.trace(result.toString());
 delete window._foo;
 }
 catch(err)
 {
 node.trace("error: " + err, "#A33");
 }
 }

 this.value = "";
 });
 }
 */

/**
 * marks as dirty the canvas, this way it will be rendered again
 *
 * @class LGraphCanvas
 * @method setDirty
 * @param {bool} fgcanvas if the foreground canvas is dirty (the one containing the nodes)
 * @param {bool} bgcanvas if the background canvas is dirty (the one containing the wires)
 */
LGraphCanvas.prototype.setDirty = function (fgcanvas, bgcanvas) {
    if (fgcanvas)
        this.dirty_canvas = true;
    if (bgcanvas)
        this.dirty_bgcanvas = true;
}

/**
 * Used to attach the canvas in a popup
 *
 * @method getCanvasWindow
 * @return {window} returns the window where the canvas is attached (the DOM root node)
 */
LGraphCanvas.prototype.getCanvasWindow = function () {
    var doc = this.canvas.ownerDocument;
    return doc.defaultView || doc.parentWindow;
}

/**
 * starts rendering the content of the canvas when needed
 *
 * @method startRendering
 */
LGraphCanvas.prototype.startRendering = function () {
    if (this.is_rendering) return; //already rendering

    this.is_rendering = true;
    renderFrame.call(this);

    function renderFrame() {
        if (!this.pause_rendering){
//            if(this.ctx && this.ctx.webgl)
//                this.ctx.makeCurrent();
            this.draw();
        }


        var window = this.getCanvasWindow();
        if (this.is_rendering)
            window.requestAnimationFrame(renderFrame.bind(this));
    }
}

/**
 * stops rendering the content of the canvas (to save resources)
 *
 * @method stopRendering
 */
LGraphCanvas.prototype.stopRendering = function () {
    this.is_rendering = false;
    /*
     if(this.rendering_timer_id)
     {
     clearInterval(this.rendering_timer_id);
     this.rendering_timer_id = null;
     }
     */
}

/* LiteGraphCanvas input */

LGraphCanvas.prototype.processMouseDown = function (e) {
    if (!this.graph) return;
    this.adjustMouseEvent(e);
    this.canvas.focus();
     

    var ref_window = this.getCanvasWindow();
    var document = ref_window.document;

    this.canvas.removeEventListener("mousemove", this._mousemove_callback);
    ref_window.document.addEventListener("mousemove", this._mousemove_callback, true); //catch for the entire window
    ref_window.document.addEventListener("mouseup", this._mouseup_callback, true);

    var n = this.graph.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes);
     
    var skip_dragging = false;

    if (e.which == 1) //left button mouse
    {
        //another node selected
        if (!e.shiftKey) //REFACTOR: integrate with function
        {
            var todeselect = [];
            for (var i in this.selected_nodes)
                if (this.selected_nodes[i] != n)
                    todeselect.push(this.selected_nodes[i]);
            //two passes to avoid problems modifying the container
            for (var i in todeselect)
                this.processNodeDeselected(todeselect[i]);
        }
        var clicking_canvas_bg = false;

        //when clicked on top of a node
        //and it is not interactive
        if (n) {
            if (!this.live_mode && !n.flags.pinned)
                this.bringToFront(n); //if it wasnt selected?
            var skip_action = false;

            //not dragging mouse to connect two slots
            if (!this.connecting_node && !n.flags.collapsed && !this.live_mode) {
                //search for outputs
                if (n.outputs)
                    for (var i = 0, l = n.outputs.length; i < l; ++i) {
                        var output = n.outputs[i];
                        var link_pos = n.getConnectionPos(false, i);
                        if (isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 10, link_pos[1] - 5, 20, 10)) {
                            this.connecting_node = n;
                            this.connecting_output = output;
                            this.connecting_pos = n.getConnectionPos(false, i);
                            this.connecting_slot = i;

                            skip_action = true;
                            break;
                        }
                    }

                //search for inputs
                if (n.inputs)
                    for (var i = 0, l = n.inputs.length; i < l; ++i) {
                        var input = n.inputs[i];
                        var link_pos = n.getConnectionPos(true, i);
                        if (isInsideRectangle(e.canvasX, e.canvasY, link_pos[0] - 10, link_pos[1] - 5, 20, 10)) {
                            if (input.link) {
                                n.disconnectInput(i);
                                this.dirty_bgcanvas = true;
                                skip_action = true;
                            }
                        }
                    }

                //Search for corner
                if (!skip_action && isInsideRectangle(e.canvasX, e.canvasY, n.pos[0] + n.size[0] - 5, n.pos[1] + n.size[1] - 5, 5, 5)) {
                    this.resizing_node = n;
                    this.canvas.style.cursor = "se-resize";
                    skip_action = true;
                }
            }

            //Search for corner
            if (!skip_action && isInsideRectangle(e.canvasX, e.canvasY, n.pos[0], n.pos[1] - LiteGraph.NODE_TITLE_HEIGHT, LiteGraph.NODE_TITLE_HEIGHT, LiteGraph.NODE_TITLE_HEIGHT)) {
                n.collapse();
                skip_action = true;
            }

            //it wasnt clicked on the links boxes
            if (!skip_action) {
                var block_drag_node = false;

                //double clicking
                var now = LiteGraph.getTime();
                if ((now - this.last_mouseclick) < 300 && this.selected_nodes[n.id]) {
                    //double click node
                    if (n.onDblClick)
                        n.onDblClick(e);
                    this.processNodeDblClicked(n);
                    block_drag_node = true;
                }

                //if do not capture mouse

                if (n.onMouseDown && n.onMouseDown(e))
                    block_drag_node = true;
                else if (this.live_mode) {
                    clicking_canvas_bg = true;
                    block_drag_node = true;
                }

                if (!block_drag_node) {
                    if (this.allow_dragnodes)
                        this.node_dragged = n;

                    if (!this.selected_nodes[n.id])
                        this.processNodeSelected(n, e);
                }

                this.dirty_canvas = true;
            }
        }
        else
            clicking_canvas_bg = true;

        if (clicking_canvas_bg && this.allow_dragcanvas) {
            this.dragging_canvas = true;
        }
    }
    else if (e.which == 2) //middle button
    {

    }
    else if (e.which == 3) //right button
    {
         
    
        this.processContextualMenu(n, e);
    }

    //TODO
    //if(this.node_selected != prev_selected)
    //	this.onNodeSelectionChange(this.node_selected);

    this.last_mouse[0] = e.localX;
    this.last_mouse[1] = e.localY;
    this.last_mouseclick = LiteGraph.getTime();
    this.canvas_mouse = [e.canvasX, e.canvasY];

    
    //  if( (this.dirty_canvas || this.dirty_bgcanvas) && this.rendering_timer_id == null)
    //  this.draw();
     

    this.graph.change();


    //this is to ensure to defocus(blur) if a text input element is on focus
    if (!ref_window.document.activeElement || (ref_window.document.activeElement.nodeName.toLowerCase() != "input" && ref_window.document.activeElement.nodeName.toLowerCase() != "textarea"))
        e.preventDefault();
    e.stopPropagation();
    return false;
}

LGraphCanvas.prototype.processMouseMove = function (e) {
    if (!this.graph) return;

    this.adjustMouseEvent(e);
    var mouse = [e.localX, e.localY];
    var delta = [mouse[0] - this.last_mouse[0], mouse[1] - this.last_mouse[1]];
    this.last_mouse = mouse;
    this.canvas_mouse = [e.canvasX, e.canvasY];

    if (this.dragging_canvas) {
        this.offset[0] += delta[0] / this.scale;
        this.offset[1] += delta[1] / this.scale;
        this.dirty_canvas = true;
        this.dirty_bgcanvas = true;
    }
    else {
        if (this.connecting_node)
            this.dirty_canvas = true;

        //get node over
        var n = this.graph.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes);

        //remove mouseover flag
        for (var i in this.graph._nodes) {
            if (this.graph._nodes[i].mouseOver && n != this.graph._nodes[i]) {
                //mouse leave
                this.graph._nodes[i].mouseOver = false;
                if (this.node_over && this.node_over.onMouseLeave)
                    this.node_over.onMouseLeave(e);
                this.node_over = null;
                this.dirty_canvas = true;
            }
        }

        //mouse over a node
        if (n) {
            //this.canvas.style.cursor = "move";
            if (!n.mouseOver) {
                //mouse enter
                n.mouseOver = true;
                this.node_over = n;
                this.dirty_canvas = true;

                if (n.onMouseEnter) n.onMouseEnter(e);
            }

            if (n.onMouseMove) n.onMouseMove(e);

            //ontop of input
            if (this.connecting_node) {
                var pos = this._highlight_input || [0, 0];
                var slot = this.isOverNodeInput(n, e.canvasX, e.canvasY, pos);
                if (slot != -1 && n.inputs[slot]) {
                    var slot_type = n.inputs[slot].type;
                    //if (slot_type == this.connecting_output.type || !slot_type || !this.connecting_output.type)
                     if(this.connecting_node != null &&
                        (this.connecting_output.type == n.inputs[slot].type ||
                        n.compareNodeTypes(this.connecting_node, this.connecting_output,  slot)))
                            this._highlight_input = pos;


                }
                else
                    this._highlight_input = null;
            }

            //Search for corner
            if (isInsideRectangle(e.canvasX, e.canvasY, n.pos[0] + n.size[0] - 5, n.pos[1] + n.size[1] - 5, 5, 5))
                this.canvas.style.cursor = "se-resize";
            else
                this.canvas.style.cursor = null;
        }
        else
            this.canvas.style.cursor = null;

        if (this.node_capturing_input && this.node_capturing_input != n && this.node_capturing_input.onMouseMove) {
            this.node_capturing_input.onMouseMove(e);
        }


        if (this.node_dragged && !this.live_mode) {
            /*
             this.node_dragged.pos[0] += delta[0] / this.scale;
             this.node_dragged.pos[1] += delta[1] / this.scale;
             this.node_dragged.pos[0] = Math.round(this.node_dragged.pos[0]);
             this.node_dragged.pos[1] = Math.round(this.node_dragged.pos[1]);
             */

            for (var i in this.selected_nodes) {
                var n = this.selected_nodes[i];

                n.pos[0] += delta[0] / this.scale;
                n.pos[1] += delta[1] / this.scale;
                //n.pos[0] = Math.round(n.pos[0]);
                //n.pos[1] = Math.round(n.pos[1]);
            }

            this.dirty_canvas = true;
            this.dirty_bgcanvas = true;
        }

        if (this.resizing_node && !this.live_mode) {
            this.resizing_node.size[0] += delta[0] / this.scale;
            this.resizing_node.size[1] += delta[1] / this.scale;
            var max_slots = Math.max(this.resizing_node.inputs ? this.resizing_node.inputs.length : 0, this.resizing_node.outputs ? this.resizing_node.outputs.length : 0);
            if (this.resizing_node.size[1] < max_slots * LiteGraph.NODE_SLOT_HEIGHT + 4)
                this.resizing_node.size[1] = max_slots * LiteGraph.NODE_SLOT_HEIGHT + 4;
            if (this.resizing_node.size[0] < this.resizing_node.title_width)
                this.resizing_node.size[0] = this.resizing_node.title_width;

            this.canvas.style.cursor = "se-resize";
            this.dirty_canvas = true;
            this.dirty_bgcanvas = true;
        }
    }

    /*
     if((this.dirty_canvas || this.dirty_bgcanvas) && this.rendering_timer_id == null)
     this.draw();
     */

    e.preventDefault();
    //e.stopPropagation();     // removed the stopPropagation so the editor works fine
    return false;
    //this is not really optimal
    //this.graph.change();
}

LGraphCanvas.prototype.processMouseUp = function (e) {
    if (!this.graph) return;

    var window = this.getCanvasWindow();
    var document = window.document;

    document.removeEventListener("mousemove", this._mousemove_callback, true);
    this.canvas.addEventListener("mousemove", this._mousemove_callback, true);
    document.removeEventListener("mouseup", this._mouseup_callback, true);

    this.adjustMouseEvent(e);

    if (e.which == 1) //left button
    {
        //dragging a connection
        if (this.connecting_node) {
            this.dirty_canvas = true;
            this.dirty_bgcanvas = true;

            var node = this.graph.getNodeOnPos(e.canvasX, e.canvasY, this.visible_nodes);

            //node below mouse
            if (node) {

                if (this.connecting_output.type == 'node') {
                    this.connecting_node.connect(this.connecting_slot, node, -1);
                }
                else {
                    //slot below mouse? connect
                    var slot = this.isOverNodeInput(node, e.canvasX, e.canvasY);
                    if (slot != -1) {
                        this.connecting_node.connect(this.connecting_slot, node, slot);
                    }
                    else { //not on top of an input
                        var input = node.getInputInfo(0);
                        //simple connect
                        if (input && !input.link && input.type == this.connecting_output.type)
                            this.connecting_node.connect(this.connecting_slot, node, 0);
                    }
                }
            }

            this.connecting_output = null;
            this.connecting_pos = null;
            this.connecting_node = null;
            this.connecting_slot = -1;

        }//not dragging connection
        else if (this.resizing_node) {
            this.dirty_canvas = true;
            this.dirty_bgcanvas = true;
            this.resizing_node = null;
        }
        else if (this.node_dragged) //node being dragged?
        {
            this.dirty_canvas = true;
            this.dirty_bgcanvas = true;
            this.node_dragged.pos[0] = Math.round(this.node_dragged.pos[0]);
            this.node_dragged.pos[1] = Math.round(this.node_dragged.pos[1]);
            if (this.graph.config.align_to_grid)
                this.node_dragged.alignToGrid();
            this.node_dragged = null;
        }
        else //no node being dragged
        {
            this.dirty_canvas = true;
            this.dragging_canvas = false;

            if (this.node_over && this.node_over.onMouseUp)
                this.node_over.onMouseUp(e);
            if (this.node_capturing_input && this.node_capturing_input.onMouseUp)
                this.node_capturing_input.onMouseUp(e);
        }
    }
    else if (e.which == 2) //middle button
    {
        //trace("middle");
        this.dirty_canvas = true;
        this.dragging_canvas = false;
    }
    else if (e.which == 3) //right button
    {
        //trace("right");
        this.dirty_canvas = true;
        this.dragging_canvas = false;
    }

    /*
     if((this.dirty_canvas || this.dirty_bgcanvas) && this.rendering_timer_id == null)
     this.draw();
     */

    this.graph.change();
    e.stopPropagation();
    e.preventDefault();
    return false;
}

LGraphCanvas.prototype.isOverNodeInput = function (node, canvasx, canvasy, slot_pos) {
    if (node.inputs)
        for (var i = 0, l = node.inputs.length; i < l; ++i) {
            var input = node.inputs[i];
            var link_pos = node.getConnectionPos(true, i);
            if (isInsideRectangle(canvasx, canvasy, link_pos[0] - 10, link_pos[1] - 5, 20, 10)) {
                if (slot_pos) {
                    slot_pos[0] = link_pos[0];
                    slot_pos[1] = link_pos[1]
                }
                ;
                return i;
            }
        }
    return -1;
}

LGraphCanvas.prototype.processKeyDown = function (e) {
    if (!this.graph) return;
    var block_default = false;

    //select all Control A
    if (e.keyCode == 65 && e.ctrlKey) {
        this.selectAllNodes();
        block_default = true;
    }

    //delete or backspace
    if (e.keyCode == 46 || e.keyCode == 8) {
        this.deleteSelectedNodes();
    }

    //collapse
    //...

    //TODO
    if (this.selected_nodes)
        for (var i in this.selected_nodes)
            if (this.selected_nodes[i].onKeyDown)
                this.selected_nodes[i].onKeyDown(e);

    this.graph.change();

    if (block_default) {
        e.preventDefault();
        return false;
    }
}

LGraphCanvas.prototype.processKeyUp = function (e) {
    if (!this.graph) return;
    //TODO
    if (this.selected_nodes)
        for (var i in this.selected_nodes)
            if (this.selected_nodes[i].onKeyUp)
                this.selected_nodes[i].onKeyUp(e);

    this.graph.change();
}

LGraphCanvas.prototype.processMouseWheel = function (e) {

    if (!this.graph) return;
    if (!this.allow_dragcanvas) return;
    var delta = (e.wheelDelta != null ? e.wheelDelta : e.detail * -60);

    this.adjustMouseEvent(e);

    var zoom = this.scale;

    if (delta > 0)
        zoom *= 1.1;
    else if (delta < 0)
        zoom *= 1 / (1.1);

    this.setZoom(zoom, [ e.localX, e.localY ]);

    /*
     if(this.rendering_timer_id == null)
     this.draw();
     */

    this.graph.change();

    e.preventDefault();
    return false; // prevent default
}



LGraphCanvas.prototype.onNodeSelected = function (n) {

}

LGraphCanvas.prototype.processNodeSelected = function (n, e) {
    if(LiteGraph.debug){
        console.log(n);
    }

    n.selected = true;
    if (n.onSelected)
        n.onSelected();

    if (e && e.shiftKey) //add to selection
        this.selected_nodes[n.id] = n;
    else {
        this.selected_nodes = {};
        this.selected_nodes[ n.id ] = n;
    }

    this.dirty_canvas = true;

    if (this.onNodeSelected)
        this.onNodeSelected(n);

    //console.log(n);
    //console.log(this.graph);
    //if(this.node_in_panel) this.showNodePanel(n);
}

LGraphCanvas.prototype.processNodeDeselected = function (n) {
    n.selected = false;
    if (n.onDeselected)
        n.onDeselected();

    delete this.selected_nodes[n.id];

    if (this.onNodeDeselected)
        this.onNodeDeselected();

    this.dirty_canvas = true;

    //this.showNodePanel(null);
}

LGraphCanvas.prototype.processNodeDblClicked = function (n) {
    if (this.onShowNodePanel)
        this.onShowNodePanel(n);

    if (this.onNodeDblClicked)
        this.onNodeDblClicked(n);

    this.setDirty(true);
}

LGraphCanvas.prototype.selectNode = function (node) {
    this.deselectAllNodes();

    if (!node)
        return;

    if (!node.selected && node.onSelected)
        node.onSelected();
    node.selected = true;
    this.selected_nodes[ node.id ] = node;
    this.setDirty(true);
}

LGraphCanvas.prototype.selectAllNodes = function () {
    for (var i in this.graph._nodes) {
        var n = this.graph._nodes[i];
        if (!n.selected && n.onSelected)
            n.onSelected();
        n.selected = true;
        this.selected_nodes[this.graph._nodes[i].id] = n;
    }

    this.setDirty(true);
}

LGraphCanvas.prototype.deselectAllNodes = function () {
    for (var i in this.selected_nodes) {
        var n = this.selected_nodes;
        if (n.onDeselected)
            n.onDeselected();
        n.selected = false;
    }
    this.selected_nodes = {};
    this.setDirty(true);
}

LGraphCanvas.prototype.deleteSelectedNodes = function () {
    this.graph.removing = true;
    for (var i in this.selected_nodes) {
        var m = this.selected_nodes[i];
        //if(m == this.node_in_panel) this.showNodePanel(null);
        this.graph.remove(m);
    }
    this.selected_nodes = {};
    this.setDirty(true);
    this.graph.removing = false;
    this.graph.updateExecutionOrder();
}

LGraphCanvas.prototype.centerOnNode = function (node) {
    this.offset[0] = -node.pos[0] - node.size[0] * 0.5 + (this.canvas.width * 0.5 / this.scale);
    this.offset[1] = -node.pos[1] - node.size[1] * 0.5 + (this.canvas.height * 0.5 / this.scale);
    this.setDirty(true, true);
}

LGraphCanvas.prototype.adjustMouseEvent = function (e) {
    var b = this.canvas.getBoundingClientRect();
    e.localX = e.pageX - b.left;
    e.localY = e.pageY - b.top;

    e.canvasX = e.localX / this.scale - this.offset[0];
    e.canvasY = e.localY / this.scale - this.offset[1];
}

LGraphCanvas.prototype.setZoom = function (value, zooming_center) {
    if (!zooming_center)
        zooming_center = [this.canvas.width * 0.5, this.canvas.height * 0.5];

    var center = this.convertOffsetToCanvas(zooming_center);

    this.scale = value;

    if (this.scale > this.max_zoom)
        this.scale = this.max_zoom;
    else if (this.scale < this.min_zoom)
        this.scale = this.min_zoom;

    var new_center = this.convertOffsetToCanvas(zooming_center);
    var delta_offset = [new_center[0] - center[0], new_center[1] - center[1]];

    this.offset[0] += delta_offset[0];
    this.offset[1] += delta_offset[1];

    this.dirty_canvas = true;
    this.dirty_bgcanvas = true;
}

LGraphCanvas.prototype.convertOffsetToCanvas = function (pos) {
    return [pos[0] / this.scale - this.offset[0], pos[1] / this.scale - this.offset[1]];
}

LGraphCanvas.prototype.convertCanvasToOffset = function (pos) {
    return [(pos[0] + this.offset[0]) * this.scale,
            (pos[1] + this.offset[1]) * this.scale ];
}

LGraphCanvas.prototype.convertEventToCanvas = function (e) {
    var rect = this.canvas.getClientRects()[0];
    return this.convertOffsetToCanvas([e.pageX - rect.left, e.pageY - rect.top]);
}

LGraphCanvas.prototype.bringToFront = function (n) {
    var i = this.graph._nodes.indexOf(n);
    if (i == -1) return;

    this.graph._nodes.splice(i, 1);
    this.graph._nodes.push(n);
}

LGraphCanvas.prototype.sendToBack = function (n) {
    var i = this.graph._nodes.indexOf(n);
    if (i == -1) return;

    this.graph._nodes.splice(i, 1);
    this.graph._nodes.unshift(n);
}

/* Interaction */



/* LGraphCanvas render */

LGraphCanvas.prototype.computeVisibleNodes = function () {
    var visible_nodes = [];
    for (var i = this.graph._nodes.length -1; i >= 0; --i) {
        var n = this.graph._nodes[i];

        //skip rendering nodes in live mode
        if (this.live_mode && !n.onDrawBackground && !n.onDrawForeground)
            continue;

        if (!overlapBounding(this.visible_area, n.getBounding()))
            continue; //out of the visible area

        visible_nodes.push(n);
    }
    return visible_nodes;
}

LGraphCanvas.prototype.draw = function (force_canvas, force_bgcanvas) {
    if(this.ctx.canvas.width == 0 || this.ctx.canvas.height == 0)
        return;
    //fps counting
    var now = LiteGraph.getTime();
    this.render_time = (now - this.last_draw_time) * 0.001;
    this.last_draw_time = now;

    if (this.graph) {
        var start = [-this.offset[0], -this.offset[1] ];
        var end = [start[0] + this.canvas.width / this.scale, start[1] + this.canvas.height / this.scale];
        this.visible_area = new Float32Array([start[0], start[1], end[0], end[1]]);
    }

    if (this.dirty_bgcanvas || force_bgcanvas)
        this.drawBackCanvas();

    if (this.dirty_canvas || force_canvas)
        this.drawFrontCanvas();

    this.fps = this.render_time ? (1.0 / this.render_time) : 0;
    this.frame += 1;
}

LGraphCanvas.prototype.drawFrontCanvas = function () {
    if (!this.ctx)
        this.ctx = this.bgcanvas.getContext("2d");
    var ctx = this.ctx;
    if (!ctx) //maybe is using webgl...
        return;

    if (ctx.start)
        ctx.start();

    var canvas = this.canvas;

    //reset in case of error
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    //clip dirty area if there is one, otherwise work in full canvas
    if (this.dirty_area) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.dirty_area[0], this.dirty_area[1], this.dirty_area[2], this.dirty_area[3]);
        ctx.clip();
    }

    //clear
    //canvas.width = canvas.width;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //draw bg canvas
    if (this.bgcanvas == this.canvas)
        this.drawBackCanvas();
    else
        ctx.drawImage(this.bgcanvas, 0, 0);

    //rendering
    if (this.onRender)
        this.onRender(canvas, ctx);

    //info widget
    if (this.show_info) {
        ctx.font = "10px Arial";
        ctx.fillStyle = "#888";
        if (this.graph) {
            ctx.fillText("T: " + this.graph.globaltime.toFixed(2) + "s", 5, 13 * 1);
            ctx.fillText("I: " + this.graph.iteration, 5, 13 * 2);
            ctx.fillText("F: " + this.frame, 5, 13 * 3);
            ctx.fillText("FPS:" + this.fps.toFixed(2), 5, 13 * 4);
        
        }
        else
            ctx.fillText("No graph selected", 5, 13 * 1);
    }

    if (this.graph) {
        //apply transformations
        ctx.save();
        ctx.scale(this.scale, this.scale);
        ctx.translate(this.offset[0], this.offset[1]);

        //draw nodes
        var drawn_nodes = 0;
        var visible_nodes = this.computeVisibleNodes();
        this.visible_nodes = visible_nodes;

        for (var i = visible_nodes.length-1; i >= 0 ; --i) {
            var node = visible_nodes[i];

            //transform coords system
            ctx.save();
            ctx.translate(node.pos[0], node.pos[1]);

            //Draw
            this.drawNode(node, ctx);
            drawn_nodes += 1;
            
            //Restore
            ctx.restore();
        }

        //connections ontop?
        if (this.graph.config.links_ontop)
            if (!this.live_mode)
                this.drawConnections(ctx);

        //current connection
        if (this.connecting_pos != null) {
            ctx.lineWidth = this.connections_width;
            var link_color = this.connecting_output.type == 'node' ? "#F85" : "#AFA";
            this.renderLink(ctx, this.connecting_pos, [this.canvas_mouse[0], this.canvas_mouse[1]], link_color);

            ctx.beginPath();
            ctx.arc(this.connecting_pos[0], this.connecting_pos[1], 4, 0, Math.PI * 2);
            /*
             if( this.connecting_output.round)
             ctx.arc( this.connecting_pos[0], this.connecting_pos[1],4,0,Math.PI*2);
             else
             ctx.rect( this.connecting_pos[0], this.connecting_pos[1],12,6);
             */
            ctx.fill();

            ctx.fillStyle = "#ffcc00";
            if (this._highlight_input) {
                ctx.beginPath();
                ctx.arc(this._highlight_input[0], this._highlight_input[1], 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }

    if (this.dirty_area) {
        ctx.restore();
        //this.dirty_area = null;
    }

    if (ctx.finish) //this is a function I use in webgl renderer
        ctx.finish();

    this.dirty_canvas = false;
}

LGraphCanvas.prototype.drawBackCanvas = function () {
    var canvas = this.bgcanvas;
    if (!this.bgctx)
        this.bgctx = this.bgcanvas.getContext("2d");
    var ctx = this.bgctx;
    if (ctx.start)
        ctx.start();

    //clear
    if(this.onClearRect)
        this.onClearRect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //reset in case of error
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (this.graph) {
        //apply transformations
        ctx.save();
        ctx.scale(this.scale, this.scale);
        ctx.translate(this.offset[0], this.offset[1]);

        //render BG
        if (this.background_image && this.scale > 0.5) {
            ctx.globalAlpha = (1.0 - 0.5 / this.scale) * this.editor_alpha;
            ctx.webkitImageSmoothingEnabled = ctx.mozImageSmoothingEnabled = ctx.imageSmoothingEnabled = false;
            if (!this._bg_img || this._bg_img.name != this.background_image) {
                this._bg_img = new Image();
                this._bg_img.name = this.background_image;
                this._bg_img.src = this.background_image;
                var that = this;
                this._bg_img.onload = function () {
                    that.draw(true, true);
                }
            }

            var pattern = null;
            if (this._bg_img != this._pattern_img && this._bg_img.width > 0) {
                pattern = ctx.createPattern(this._bg_img, 'repeat');
                this._pattern_img = this._bg_img;
                this._pattern = pattern;
            }
            else
                pattern = this._pattern;
            if (pattern) {
                ctx.fillStyle = pattern;
                ctx.fillRect(this.visible_area[0], this.visible_area[1], this.visible_area[2] - this.visible_area[0], this.visible_area[3] - this.visible_area[1]);
                ctx.fillStyle = "transparent";
            }

            ctx.globalAlpha = 1.0;
            ctx.webkitImageSmoothingEnabled = ctx.mozImageSmoothingEnabled = ctx.imageSmoothingEnabled = true;
        }

        if (this.onBackgroundRender)
            this.onBackgroundRender(canvas, ctx);

        //DEBUG: show clipping area
        //ctx.fillStyle = "red";
        //ctx.fillRect( this.visible_area[0] + 10, this.visible_area[1] + 10, this.visible_area[2] - this.visible_area[0] - 20, this.visible_area[3] - this.visible_area[1] - 20);

        //bg
        ctx.strokeStyle = "#235";
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        if (this.render_connections_shadows) {
            ctx.shadowColor = "#000";
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 6;
        }
        else
            ctx.shadowColor = "rgba(0,0,0,0)";

        //draw connections
        if (!this.live_mode)
            this.drawConnections(ctx);

        ctx.shadowColor = "rgba(0,0,0,0)";

        //restore state
        ctx.restore();
    }

    if (ctx.finish)
        ctx.finish();

    this.dirty_bgcanvas = false;
    this.dirty_canvas = true; //to force to repaint the front canvas with the bgcanvas
}

/* Renders the LGraphNode on the canvas */
LGraphCanvas.prototype.drawNode = function (node, ctx) {
    var glow = false;

    var color = node.color || LiteGraph.NODE_DEFAULT_COLOR;
    //if (this.selected) color = "#88F";

    var title_width = node.getTitleWidth() || node.computeTitleWidth(ctx, this.title_text_font);

    var render_title = true;
    if (node.flags.skip_title_render || node.graph.isLive())
        render_title = false;
    if (node.mouseOver)
        render_title = true;

    //shadow and glow
    if (node.mouseOver) glow = true;

    if (node.selected) {
        /*
         ctx.shadowColor = "#EEEEFF";//glow ? "#AAF" : "#000";
         ctx.shadowOffsetX = 0;
         ctx.shadowOffsetY = 0;
         ctx.shadowBlur = 1;
         */
    }
    else if (this.render_shadows) {
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 3;
    }
    else
        ctx.shadowColor = "transparent";

    //only render if it forces it to do it
    if (this.live_mode) {
        if (!node.flags.collapsed) {
            ctx.shadowColor = "transparent";
            //if(node.onDrawBackground)
            //	node.onDrawBackground(ctx);
            if (node.onDrawForeground)
                node.onDrawForeground(ctx);
        }

        return;
    }

    //draw in collapsed form
    /*
     if(node.flags.collapsed)
     {
     if(!node.onDrawCollapsed || node.onDrawCollapsed(ctx) == false)
     this.drawNodeCollapsed(node, ctx, color, node.bgcolor);
     return;
     }
     */

    var editor_alpha = this.editor_alpha;
    ctx.globalAlpha = editor_alpha;

    //clip if required (mask)
    var shape = node.shape || LiteGraph.NODE_DEFAULT_SHAPE;
    var size = new Float32Array(node.size);
    if (node.flags.collapsed) {

        size[0] = title_width;
        size[1] = 0;
    }

    //Start clipping
    if (node.flags.clip_area) {
        ctx.save();
        if (shape == "box") {
            ctx.beginPath();
            ctx.rect(0, 0, size[0], size[1]);
        }
        else if (shape == "round") {
            ctx.roundRect(0, 0, size[0], size[1], 10);
        }
        else if (shape == "circle") {
            ctx.beginPath();
            ctx.arc(size[0] * 0.5, size[1] * 0.5, size[0] * 0.5, 0, Math.PI * 2);
        }
        ctx.clip();
    }

    //draw shape
    this.drawNodeShape(node, ctx, size, color, node.bgcolor, !render_title, node.selected);
    ctx.shadowColor = "transparent";

    //connection slots
    ctx.textAlign = "left";
    ctx.font = this.inner_text_font;

    var render_text = this.scale > 0.6;

    //render inputs and outputs
    if (!node.flags.collapsed) {
        //input connection slots
        if (node.inputs)
            for (var i = 0; i < node.inputs.length; i++) {
                var slot = node.inputs[i];
                if(node.title == "If" && this.connecting_node != null)
                    var a = 0;
                ctx.globalAlpha = editor_alpha;
                if (this.connecting_node != null  &&
                    ( (this.connecting_output.type != node.inputs[i].type ||
                        (this.connecting_output.type ==  "" ||   node.inputs[i].type == ""))  &&
                    !node.compareNodeTypes(this.connecting_node, this.connecting_output, i)))
                        ctx.globalAlpha = 0.4 * editor_alpha;

                ctx.fillStyle = slot.link != null ? "#7F7" : "#AAA";

                var pos = node.getConnectionPos(true, i);
                pos[0] -= node.pos[0];
                pos[1] -= node.pos[1];

                ctx.beginPath();

                if (1 || slot.round)
                    ctx.arc(pos[0], pos[1], 4, 0, Math.PI * 2);
                //else
                //	ctx.rect((pos[0] - 6) + 0.5, (pos[1] - 5) + 0.5,14,10);

                ctx.fill();

                //render name
                if (render_text) {
                    var text = slot.label != null ? slot.label : slot.name;
                    if (text) {
                        ctx.fillStyle = color;
                        ctx.fillText(text, pos[0] + 10, pos[1] + 5);
                    }
                }
            }

        //output connection slots
        if (this.connecting_node)
            ctx.globalAlpha = 0.4 * editor_alpha;

        ctx.lineWidth = 1;

        ctx.textAlign = "right";
        ctx.strokeStyle = "black";
        if (node.outputs)
            for (var i = 0; i < node.outputs.length; i++) {
                var slot = node.outputs[i];

                var pos = node.getConnectionPos(false, i);
                pos[0] -= node.pos[0];
                pos[1] -= node.pos[1];

                ctx.fillStyle = slot.links && slot.links.length ? "#7F7" : "#AAA";
                ctx.beginPath();
                //ctx.rect( node.size[0] - 14,i*14,10,10);

                if (1 || slot.round)
                    ctx.arc(pos[0], pos[1], 4, 0, Math.PI * 2);
                //else
                //	ctx.rect((pos[0] - 6) + 0.5,(pos[1] - 5) + 0.5,14,10);

                //trigger
                //if(slot.node_id != null && slot.slot == -1)
                //	ctx.fillStyle = "#F85";

                //if(slot.links != null && slot.links.length)
                ctx.fill();
                ctx.stroke();

                //render output name
                if (render_text) {
                    var text = slot.label != null ? slot.label : slot.name;
                    if (text) {
                        ctx.fillStyle = color;
                        ctx.fillText(text, pos[0] - 10, pos[1] + 5);
                    }
                }
            }

        ctx.textAlign = "left";
        ctx.globalAlpha = 1;

        if (node.onDrawForeground)
            node.onDrawForeground(ctx);
    }//!collapsed

    if (node.flags.clip_area)
        ctx.restore();

    ctx.globalAlpha = 1.0;
}

/* Renders the node shape */
LGraphCanvas.prototype.drawNodeShape = function (node, ctx, size, fgcolor, bgcolor, no_title, selected) {
    //bg rect
    ctx.strokeStyle = fgcolor || LiteGraph.NODE_DEFAULT_COLOR;
    ctx.fillStyle = bgcolor || LiteGraph.NODE_DEFAULT_BGCOLOR;

    /* gradient test
     var grad = ctx.createLinearGradient(0,0,0,node.size[1]);
     grad.addColorStop(0, "#AAA");
     grad.addColorStop(0.5, fgcolor || LiteGraph.NODE_DEFAULT_COLOR);
     grad.addColorStop(1, bgcolor || LiteGraph.NODE_DEFAULT_BGCOLOR);
     ctx.fillStyle = grad;
     //*/

    var title_height = LiteGraph.NODE_TITLE_HEIGHT;

    //render depending on shape
    var shape = node.shape || LiteGraph.NODE_DEFAULT_SHAPE;
    if (shape == "box") {
        ctx.beginPath();
        ctx.rect(0, no_title ? 0 : -title_height, size[0] + 1, no_title ? size[1] : size[1] + title_height);
        ctx.fill();
        ctx.shadowColor = "transparent";

        if (selected) {
            ctx.strokeStyle = LiteGraph.NODE_SELECTED_COLOR;
            ctx.strokeRect(-0.5, no_title ? -0.5 : -title_height + -0.5, size[0] + 2, no_title ? (size[1] + 2) : (size[1] + title_height + 2) - 1);
            ctx.strokeStyle = fgcolor;
        }
    }
    else if (shape == "round") {
        var rr = ctx.roundRect(0, no_title ? 0 : -title_height, size[0], no_title ? size[1] : size[1] + title_height, 10);
        ctx.fill();

        if (selected) {
            ctx.strokeStyle = LiteGraph.NODE_SELECTED_COLOR;
            rr.stroke();
            ctx.strokeStyle = fgcolor;
        }
    }
    else if (shape == "circle") {
        ctx.beginPath();
        ctx.arc(size[0] * 0.5, size[1] * 0.5, size[0] * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.shadowColor = "transparent";

    //ctx.stroke();

    //image
    if (node.bgImage && node.bgImage.width)
        ctx.drawImage(node.bgImage, (size[0] - node.bgImage.width) * 0.5, (size[1] - node.bgImage.height) * 0.5);

    if (node.bgImageUrl && !node.bgImage)
        node.bgImage = node.loadImage(node.bgImageUrl);

    if (node.onDrawBackground)
        node.onDrawBackground(ctx);

    //title bg
    if (!no_title) {
        ctx.fillStyle = fgcolor || LiteGraph.NODE_DEFAULT_COLOR;
        var old_alpha = ctx.globalAlpha;
        ctx.globalAlpha = 0.5 * old_alpha;
        if (shape == "box") {
            ctx.beginPath();
            ctx.rect(0, -title_height, size[0] + 1, title_height);
            ctx.fill()
            //ctx.stroke();
        }
        else if (shape == "round") {
            //ctx.beginPath();
            if (!node.flags.collapsed)
                ctx.roundRect(0, -title_height, size[0], title_height, 10, 0);
            else
                ctx.roundRect(0, -title_height, size[0], title_height, LiteGraph.NODE_COLLAPSED_RADIUS, LiteGraph.NODE_COLLAPSED_RADIUS);
            //CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius, radius_low) {
            //ctx.fillRect(0,8,size[0],NODE_TITLE_HEIGHT - 12);
            ctx.fill();
        }

        //box
        ctx.fillStyle = node.boxcolor || LiteGraph.NODE_DEFAULT_BOXCOLOR;
        ctx.beginPath();
        if (shape == "round")
            ctx.arc(title_height * 0.5, title_height * -0.5, (title_height - 6) * 0.5, 0, Math.PI * 2);
        else
            ctx.rect(3, -title_height + 3, title_height - 6, title_height - 6);
        ctx.fill();
        ctx.globalAlpha = old_alpha;

        //title text
        ctx.font = this.title_text_font;
        var title = node.getTitle();
        if (title && this.scale > 0.5) {
            ctx.fillStyle = LiteGraph.NODE_TITLE_COLOR;
            ctx.fillText(title, 16, 13 - title_height);
        }
    }
}

/* Renders the node when collapsed */
LGraphCanvas.prototype.drawNodeCollapsed = function (node, ctx, fgcolor, bgcolor) {
    //draw default collapsed shape
    ctx.strokeStyle = fgcolor || LiteGraph.NODE_DEFAULT_COLOR;
    ctx.fillStyle = bgcolor || LiteGraph.NODE_DEFAULT_BGCOLOR;

    var collapsed_radius = LiteGraph.NODE_COLLAPSED_RADIUS;

    //circle shape
    var shape = node.shape || LiteGraph.NODE_DEFAULT_SHAPE;
    if (shape == "circle") {
        ctx.beginPath();
        ctx.arc(node.size[0] * 0.5, node.size[1] * 0.5, collapsed_radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = "rgba(0,0,0,0)";
        ctx.stroke();

        ctx.fillStyle = node.boxcolor || LiteGraph.NODE_DEFAULT_BOXCOLOR;
        ctx.beginPath();
        ctx.arc(node.size[0] * 0.5, node.size[1] * 0.5, collapsed_radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (shape == "round") //rounded box
    {
        ctx.beginPath();
        ctx.roundRect(node.size[0] * 0.5 - collapsed_radius, node.size[1] * 0.5 - collapsed_radius, 2 * collapsed_radius, 2 * collapsed_radius, 5);
        ctx.fill();
        ctx.shadowColor = "rgba(0,0,0,0)";
        ctx.stroke();

        ctx.fillStyle = node.boxcolor || LiteGraph.NODE_DEFAULT_BOXCOLOR;
        ctx.beginPath();
        ctx.roundRect(node.size[0] * 0.5 - collapsed_radius * 0.5, node.size[1] * 0.5 - collapsed_radius * 0.5, collapsed_radius, collapsed_radius, 2);
        ctx.fill();
    }
    else //flat box
    {
        ctx.beginPath();
        //ctx.rect(node.size[0] * 0.5 - collapsed_radius, node.size[1] * 0.5 - collapsed_radius, 2*collapsed_radius, 2*collapsed_radius);
        ctx.rect(0, 0, node.size[0], collapsed_radius * 2);
        ctx.fill();
        ctx.shadowColor = "rgba(0,0,0,0)";
        ctx.stroke();

        ctx.fillStyle = node.boxcolor || LiteGraph.NODE_DEFAULT_BOXCOLOR;
        ctx.beginPath();
        //ctx.rect(node.size[0] * 0.5 - collapsed_radius*0.5, node.size[1] * 0.5 - collapsed_radius*0.5, collapsed_radius,collapsed_radius);
        ctx.rect(collapsed_radius * 0.5, collapsed_radius * 0.5, collapsed_radius, collapsed_radius);
        ctx.fill();
    }
}

LGraphCanvas.link_colors = ["#AAC", "#ACA", "#CAA"];

LGraphCanvas.prototype.drawConnections = function (ctx) {
    //draw connections
    ctx.lineWidth = this.connections_width;

    ctx.fillStyle = "#AAA";
    ctx.strokeStyle = "#AAA";
    ctx.globalAlpha = this.editor_alpha;
    //for every node
    for (var n = this.graph._nodes.length-1; n >= 0 ; --n) {
        var node = this.graph._nodes[n];
        //for every input (we render just inputs because it is easier as every slot can only have one input)
        if (node.inputs && node.inputs.length)
            for (var i = node.inputs.length-1; i >= 0; --i) {
                var input = node.inputs[i];
                if (!input || input.link == null)
                    continue;
                var link_id = input.link;
                var link = this.graph.links[ link_id ];
                if (!link) continue;

                var start_node = this.graph.getNodeById(link.origin_id);
                if (start_node == null) continue;
                var start_node_slot = link.origin_slot;
                var start_node_slotpos = null;

                if (start_node_slot == -1)
                    start_node_slotpos = [start_node.pos[0] + 10, start_node.pos[1] + 10];
                else
                    start_node_slotpos = start_node.getConnectionPos(false, start_node_slot);

                var color = LGraphCanvas.link_type_colors[node.inputs[i].type];
                if (color == null)
                    color = LGraphCanvas.link_colors[node.id % LGraphCanvas.link_colors.length];
                if(link.color != null)
                    color = link.color;
                this.renderLink(ctx, start_node_slotpos, node.getConnectionPos(true, i), color);
            }
    }
    ctx.globalAlpha = 1;
}

LGraphCanvas.prototype.renderLink = function (ctx, a, b, color) {
    if (!this.highquality_render) {
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
        return;
    }

    var dist = distance(a, b);

    if (this.render_connections_border && this.scale > 0.6)
        ctx.lineWidth = this.connections_width + 4;

    ctx.beginPath();

    if (this.render_curved_connections) //splines
    {
        ctx.moveTo(a[0], a[1]);
        ctx.bezierCurveTo(a[0] + dist * 0.25, a[1],
                b[0] - dist * 0.25, b[1],
            b[0], b[1]);
    }
    else //lines
    {
        ctx.moveTo(a[0] + 10, a[1]);
        ctx.lineTo(((a[0] + 10) + (b[0] - 10)) * 0.5, a[1]);
        ctx.lineTo(((a[0] + 10) + (b[0] - 10)) * 0.5, b[1]);
        ctx.lineTo(b[0] - 10, b[1]);
    }

    if (this.render_connections_border && this.scale > 0.6) {
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.stroke();
    }

    ctx.lineWidth = this.connections_width;
    ctx.fillStyle = ctx.strokeStyle = color;
    ctx.stroke();

    //render arrow
    if (this.render_connection_arrows && this.scale > 0.6) {
        //get two points in the bezier curve
        var pos = this.computeConnectionPoint(a, b, 0.5);
        var pos2 = this.computeConnectionPoint(a, b, 0.51);
        var angle = 0;
        if (this.render_curved_connections)
            angle = -Math.atan2(pos2[0] - pos[0], pos2[1] - pos[1]);
        else
            angle = b[1] > a[1] ? 0 : Math.PI;

        ctx.save();
        ctx.translate(pos[0], pos[1]);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(-5, -5);
        ctx.lineTo(0, +5);
        ctx.lineTo(+5, -5);
        ctx.fill();
        ctx.restore();
    }
}

LGraphCanvas.prototype.computeConnectionPoint = function (a, b, t) {
    var dist = distance(a, b);
    var p0 = a;
    var p1 = [ a[0] + dist * 0.25, a[1] ];
    var p2 = [ b[0] - dist * 0.25, b[1] ];
    var p3 = b;

    var c1 = (1 - t) * (1 - t) * (1 - t);
    var c2 = 3 * ((1 - t) * (1 - t)) * t;
    var c3 = 3 * (1 - t) * (t * t);
    var c4 = t * t * t;

    var x = c1 * p0[0] + c2 * p1[0] + c3 * p2[0] + c4 * p3[0];
    var y = c1 * p0[1] + c2 * p1[1] + c3 * p2[1] + c4 * p3[1];
    return [x, y];
}

/*
 LGraphCanvas.prototype.resizeCanvas = function(width,height)
 {
 this.canvas.width = width;
 if(height)
 this.canvas.height = height;

 this.bgcanvas.width = this.canvas.width;
 this.bgcanvas.height = this.canvas.height;
 this.draw(true,true);
 }
 */

LGraphCanvas.prototype.resize = function (width, height) {
    if (!width && !height) {
        var parent = this.canvas.parentNode;
        width = parent.offsetWidth;
        height = parent.offsetHeight;
    }

    if (this.canvas.width == width && this.canvas.height == height)
        return;

    if(this.ctx && this.ctx.webgl){
        this.ctx.makeCurrent();
        gl.canvas.width = width;
        gl.canvas.height = height;
        gl.viewport(0, 0, width, height);
    }
    this.canvas.width = width;
    this.canvas.height = height;
    this.bgcanvas.width = this.canvas.width;
    this.bgcanvas.height = this.canvas.height;
    this.setDirty(true, true);
}


LGraphCanvas.prototype.switchLiveMode = function (transition) {
    if (!transition) {
        this.live_mode = !this.live_mode;
        this.dirty_canvas = true;
        this.dirty_bgcanvas = true;
        return;
    }

    var self = this;
    var delta = this.live_mode ? 1.1 : 0.9;
    if (this.live_mode) {
        this.live_mode = false;
        this.editor_alpha = 0.1;
    }

    var t = setInterval(function () {
        self.editor_alpha *= delta;
        self.dirty_canvas = true;
        self.dirty_bgcanvas = true;

        if (delta < 1 && self.editor_alpha < 0.01) {
            clearInterval(t);
            if (delta < 1)
                self.live_mode = true;
        }
        if (delta > 1 && self.editor_alpha > 0.99) {
            clearInterval(t);
            self.editor_alpha = 1;
        }
    }, 1);
}

LGraphCanvas.prototype.onNodeSelectionChange = function (node) {
    return; //disabled
    //if(this.node_in_panel) this.showNodePanel(node);
}

LGraphCanvas.prototype.touchHandler = function (event) {
    //alert("foo");
    var touches = event.changedTouches,
        first = touches[0],
        type = "";

    switch (event.type) {
        case "touchstart":
            type = "mousedown";
            break;
        case "touchmove":
            type = "mousemove";
            break;
        case "touchend":
            type = "mouseup";
            break;
        default:
            return;
    }

    //initMouseEvent(type, canBubble, cancelable, view, clickCount,
    //           screenX, screenY, clientX, clientY, ctrlKey,
    //           altKey, shiftKey, metaKey, button, relatedTarget);

    var window = this.getCanvasWindow();
    var document = window.document;

    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1,
        first.screenX, first.screenY,
        first.clientX, first.clientY, false,
        false, false, false, 0/*left*/, null);
    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}

/* CONTEXT MENU ********************/
LGraphCanvas.onMenuAddGrp = function (node, e, prev_menu, canvas, first_event) {

}
LGraphCanvas.onMenuAdd = function (node, e, prev_menu, canvas, first_event) {
    var window = canvas.getCanvasWindow();

    var values = LiteGraph.getNodeTypesCategories();
    var entries = {};
    for (var i in values)
        if (values[i])
            entries[ i ] = { value: values[i], content: values[i], is_menu: true };

    var menu = LiteGraph.createContextualMenu(entries, {event: e, callback: inner_clicked, from: prev_menu}, window);

    function inner_clicked(v, e) {
        var category = v.value;
        var node_types = LiteGraph.getNodeTypesInCategory(category);
        var values = [];
        for (var i in node_types)
            values.push({ content: node_types[i].title, value: node_types[i].type });

        LiteGraph.createContextualMenu(values, {event: e, callback: inner_create, from: menu}, window);
        return false;
    }

    function inner_create(v, e) {
        var node = LiteGraph.createNode(v.value);
        if (node) {
            node.pos = canvas.convertEventToCanvas(first_event);
            canvas.graph.add(node);
        }
    }

    return false;
}

LGraphCanvas.onMenuCollapseAll = function () {

}


LGraphCanvas.onMenuNodeEdit = function () {

}

LGraphCanvas.onMenuNodeInputs = function (node, e, prev_menu) {
    if (!node) return;

    var options = node.optional_inputs;
    if (node.onGetInputs)
        options = node.onGetInputs();
    if (options) {
        var entries = [];
        for (var i in options) {
            var option = options[i];
            var label = option[0];
            if (option[2] && option[2].label)
                label = option[2].label;
            entries.push({content: label, value: option});
        }
        var menu = LiteGraph.createContextualMenu(entries, {event: e, callback: inner_clicked, from: prev_menu});
    }

    function inner_clicked(v) {
        if (!node) return;
        node.addInput(v.value[0], v.value[1], v.value[2]);
    }

    return false;
}

LGraphCanvas.onMenuNodeOutputs = function (node, e, prev_menu) {
    if (!node) return;

    var options = node.optional_outputs;
    if (node.onGetOutputs)
        options = node.onGetOutputs();
    if (options) {
        var entries = [];
        for (var i in options) {
            if (node.findOutputSlot(options[i][0]) != -1)
                continue; //skip the ones already on
            entries.push({content: options[i][0], value: options[i]});
        }
        if (entries.length)
            var menu = LiteGraph.createContextualMenu(entries, {event: e, callback: inner_clicked, from: prev_menu});
    }

    function inner_clicked(v) {
        if (!node) return;

        var value = v.value[1];

        if (value && (value.constructor === Object || value.constructor === Array)) //submenu
        {
            var entries = [];
            for (var i in value)
                entries.push({content: i, value: value[i]});
            LiteGraph.createContextualMenu(entries, {event: e, callback: inner_clicked, from: prev_menu});
            return false;
        }
        else
            node.addOutput(v.value[0], v.value[1]);
    }

    return false;
}

LGraphCanvas.onMenuNodeCollapse = function (node) {
    node.flags.collapsed = !node.flags.collapsed;
    node.setDirtyCanvas(true, true);
}

LGraphCanvas.onMenuNodePin = function (node) {
    node.pin();
}

LGraphCanvas.onMenuNodeColors = function (node, e, prev_menu) {
    var values = [];
    for (var i in LGraphCanvas.node_colors) {
        var color = LGraphCanvas.node_colors[i];
        var value = {value: i, content: "<span style='display: block; color:" + color.color + "; background-color:" + color.bgcolor + "'>" + i + "</span>"};
        values.push(value);
    }
    LiteGraph.createContextualMenu(values, {event: e, callback: inner_clicked, from: prev_menu});

    function inner_clicked(v) {
        if (!node) return;
        var color = LGraphCanvas.node_colors[v.value];
        if (color) {
            node.color = color.color;
            node.bgcolor = color.bgcolor;
            node.setDirtyCanvas(true);
        }
    }

    return false;
}

LGraphCanvas.onMenuNodeShapes = function (node, e) {
    LiteGraph.createContextualMenu(["box", "round"], {event: e, callback: inner_clicked});

    function inner_clicked(v) {
        if (!node) return;
        node.shape = v;
        node.setDirtyCanvas(true);
    }

    return false;
}

LGraphCanvas.onMenuNodeRemove = function (node) {
    if (node.removable == false) return;
    node.graph.remove(node);
    node.setDirtyCanvas(true, true);
}

LGraphCanvas.onMenuNodeClone = function (node, e, menu, that) {
//    var last_id = node.graph.last_node_id;
//    var last_link_id = node.graph.last_link_id;
//    var max_id = last_id;
//    var max_link_id = last_link_id;
    var cloned = [];
    var map_oldid_newid = {};
    for(var i in that.selected_nodes){
        var n = that.selected_nodes[i];
        if (n.clonable == false) continue;
        var newnode = n.clone();
        if (!newnode) return;
        newnode.pos = [n.pos[0] + 15, n.pos[1] + 15];
        cloned.push(newnode);
        n.graph.add(newnode);
        map_oldid_newid[n.id] = newnode.id;
        n.setDirtyCanvas(true, true);
    }
    for(var i in cloned){
        var n = cloned[i];
        for(var j in n.inputs){
            var link_id = n.inputs[j].link;
            var link = node.graph.links[ link_id ];
            if(link){
                var new_origin_node_id = map_oldid_newid[link.origin_id];
                var origin_node = node.graph.getNodeById( new_origin_node_id );
                if(origin_node){
                    link.origin_id = origin_node.id;
                } else {
                    origin_node = node.graph.getNodeById( link.origin_id );
                }
                origin_node.outputs[link.origin_slot].links.push(link.id);
                link.target_id = n.id;
            }
        }
//        for(var j in n.outputs){
//            var links = n.outputs[j].links;
//            for(var k in links){
//                var link_id = links[k];
//                var link = node.graph.links[ link_id ];
//                if(link){
//                    var new_target_node_id = map_oldid_newid[link.target_id];
//                    var target_node = node.graph.getNodeById( new_target_node_id);
//                    if(!target_node){
//                        links.splice(k, 1);
//                    }
//                }
//            }
//        }
    }
//    node.graph.last_node_id = max_id;
}

LGraphCanvas.node_colors = {
    "red": { color: "#FAA", bgcolor: "#A44" },
    "green": { color: "#AFA", bgcolor: "#4A4" },
    "blue": { color: "#AAF", bgcolor: "#44A" },
    "white": { color: "#FFF", bgcolor: "#AAA" }
};

LGraphCanvas.prototype.getCanvasMenuOptions = function () {
    var options = null;
    if (this.getMenuOptions)
        options = this.getMenuOptions();
    else {
        console.log(Object.keys(this.selected_nodes).length)
        if(Object.keys(this.selected_nodes).length>1){
            console.log(this.selected_nodes)
        options = [
            {content: "Add Node", is_menu: true, callback: LGraphCanvas.onMenuAdd },
           // {content:"Collapse All", callback: LGraphCanvas.onMenuCollapseAll }
           {content:"Add Node Group", callback: LGraphCanvas.onMenuAddGrp }
        ];}
        else{
        options = [
            {content: "Add Node", is_menu: true, callback: LGraphCanvas.onMenuAdd }]}

        if (this._graph_stack && this._graph_stack.length > 0)
            options = [
                {content: "Close subgraph", callback: this.closeSubgraph.bind(this) },
                null
            ].concat(options);
    }

    if (this.getExtraMenuOptions) {
        var extra = this.getExtraMenuOptions(this);
        if (extra) {
            extra.push(null);
            options = extra.concat(options);
        }
    }

    return options;
}

LGraphCanvas.prototype.getNodeMenuOptions = function (node) {
    var options = null;

    if (node.getMenuOptions)
        options = node.getMenuOptions(this);
    else
        options = [
            {content: "Inputs", is_menu: true, disabled: true, callback: LGraphCanvas.onMenuNodeInputs },
            {content: "Outputs", is_menu: true, disabled: true, callback: LGraphCanvas.onMenuNodeOutputs },
            null,
            {content: "Collapse", callback: LGraphCanvas.onMenuNodeCollapse },
            {content: "Pin", callback: LGraphCanvas.onMenuNodePin },
            {content: "Colors", is_menu: true, callback: LGraphCanvas.onMenuNodeColors },
            {content: "Shapes", is_menu: true, callback: LGraphCanvas.onMenuNodeShapes },
            null
        ];

    if (node.getExtraMenuOptions) {
        var extra = node.getExtraMenuOptions(this);
        if (extra) {
            extra.push(null);
            options = extra.concat(options);
        }
    }

    if (node.clonable !== false)
        options.push({content: "Clone", callback: LGraphCanvas.onMenuNodeClone });
    if (node.removable !== false)
        options.push(null, {content: "Remove", callback: LGraphCanvas.onMenuNodeRemove });

    if (node.onGetInputs) {
        var inputs = node.onGetInputs();
        if (inputs && inputs.length)
            options[0].disabled = false;
    }

    if (node.onGetOutputs) {
        var outputs = node.onGetOutputs();
        if (outputs && outputs.length)
            options[1].disabled = false;
    }

    return options;
}

LGraphCanvas.prototype.processContextualMenu = function (node, event) {
    var that = this;
    var win = this.getCanvasWindow();

    var menu = LiteGraph.createContextualMenu(node ? this.getNodeMenuOptions(node) : this.getCanvasMenuOptions(), {event: event, callback: inner_option_clicked}, win);

    function inner_option_clicked(v, e) {
        if (!v) return;

        if (v.callback)
            return v.callback(node, e, menu, that, event);
    }
}


/**
 * Created by vik on 26/01/2015.
 */


CodePiece.VERTEX = 1;
CodePiece.FRAGMENT = 2;
CodePiece.BOTH = 3;
CodePiece.ORDER_MODIFIER = 0;
function CodePiece(order)
{
    this.header = {}; // map for custom uniforms or variants
    this.body_hash = {}; // body hashmap
    //this.body_ids = []; // body ids sorted  by insert order
    this.includes = {}; // map for standard uniforms
    this.scope = "";
    this.order = typeof order !== 'undefined' ? order : Number.MAX_VALUE;
    this.order -= CodePiece.ORDER_MODIFIER;
}

//CodePiece.prototype.getBodyIds = function()
//{
//    return this.body_ids;
//};

CodePiece.prototype.getBody = function()
{
    return this.body_hash;
};


CodePiece.prototype.setPartialBody = function(s, other_order, id)
{
    s = s || "";
    if(s != ""){
        id = id || s.hashCode();
        var new_order = typeof other_order !== 'undefined' ? other_order : this.order;
        if(this.body_hash[id] !== undefined) {
            if(this.body_hash[id].order > new_order){
                return [s, other_order];
            }
        }  else {
            return [s, other_order];
        }
    }
    return null;
};


CodePiece.prototype.setBody = function(s, other_order , id)
{
    var body_item;
    s = s || "";
    if(s !== ""){
        id = id || s.hashCode();
        body_item = this.body_hash[id];
        other_order = typeof other_order !== 'undefined' ? other_order : this.order;
        if(body_item !== undefined){
            if(body_item.order > other_order){
                body_item.order = other_order;
            }
        }  else {
            this.body_hash[id] = {"str":s, order:other_order}; // we save the order
            //this.body_ids.unshift(id);
        }
       // console.log("str:"+ s + " new_order:"+this.body_hash[id].order+" old_order:"+old_order);
    }
};

CodePiece.prototype.getHeader = function()
{
    return this.header;
};

CodePiece.prototype.setHeaderFromHashMap = function(map)
{
    var objKeys = Object.keys(map);
    var id;
    for (var i = 0, l = objKeys.length; i < l; i++) {
        id = objKeys[i];
        this.header[id] = map[id];
    }
};

CodePiece.prototype.setHeaderFromMap = function(map)
{
    var objKeys = Object.keys(map);
    var s;
    for (var i = 0, l = objKeys.length; i < l; i++) {
        s = objKeys[i];
        this.header[s.hashCode()] = s;
    }

};

CodePiece.prototype.addHeaderLine = function(s)
{
    var k = s.hashCode();
    this.header[k] = s;
};


// format needs to be {a:smth , b: smth};
CodePiece.prototype.setIncludesFromHashMap = function(map)
{
    var objKeys = Object.keys(map);
    var id;
    for (var i = 0, l = objKeys.length; i < l; i++) {
        id = objKeys[i];
        this.includes[id] = map[id];
    }


};

// format needs to be {a:smth , b: smth};
CodePiece.prototype.setIncludesFromMap = function(map)
{
    var objKeys = Object.keys(map);
    var s;
    for (var i = 0, l = objKeys.length; i < l; i++) {
        s = objKeys[i];
        this.includes[s.hashCode()] = s;
    }

};

CodePiece.prototype.isLineIncluded = function(s)
{
    var id = ""+s.hashCode();
    return this.includes.hasOwnProperty(id);
};

// fragment or vertex
CodePiece.prototype.setScope = function(scope)
{
   this.scope = scope;
};

CodePiece.prototype.merge = function (input_code)
{

    var body_hash = input_code.getBody();
    var objKeys = Object.keys(body_hash);
    var id;
    var order;
    for (var i = 0, l = objKeys.length; i < l; i++) {
        id = objKeys[i];
        order = body_hash[id].order;
        order = typeof order !== 'undefined' ? order : input_code.order;
        this.setBody( body_hash[id].str, order, id);
    }

    this.setHeaderFromHashMap(input_code.getHeader());
    this.setIncludesFromHashMap(input_code.includes);

};

CodePiece.prototype.partialMerge = function (input_code)
{
    //this.setBody( input_code.getBody().concat(this.body) );


    var body_hash = input_code.getBody();
    var map = {};
    var objKeys = Object.keys(body_hash);
    var id;
    var order;
    for (var i = 0, l = objKeys.length; i < l; i++) {
        id = objKeys[i];
        order = body_hash[id].order;
        order = typeof order !== 'undefined' ? order : input_code.order;
        var arr = this.setPartialBody(body_hash[id].str, order, id);
        if(arr !== null){
            map[arr[0]] = arr[1];
        }
    }

    this.setHeaderFromHashMap(input_code.getHeader());
    this.setIncludesFromHashMap(input_code.includes);

    return map;
};

CodePiece.prototype.clone = function()
{
//    var cloned = new CodePiece();
//    cloned.header = JSON.parse(JSON.stringify(this.header)); // map for custom uniforms or variants
//    cloned.body_hash = JSON.parse(JSON.stringify(this.body_hash)); // body hashmap
//    //cloned.body_ids =  this.body_ids.slice(0);; // body ids sorted  by insert order
//    cloned.includes = JSON.parse(JSON.stringify(this.includes)); // map for standard uniforms
//    cloned.scope = this.scope;
//    return cloned;
    return this;
};


CodePiece.prototype.isCodeUsed = function() {
    return Object.keys(this.getBody()).length  > 0 || Object.keys(this.getHeader()).length  > 0;
}

LiteGraph.CodeLib = {};

/**
 * Created by vik on 26/01/2015.
 */





function ShaderCode(vertex, fragment, out_var)
{
    this.vertex = vertex || new CodePiece();
    this.fragment = fragment || new CodePiece();
    this.output_var = out_var || "";
}

ShaderCode.prototype.getOutputVar = function()
{
    return this.output_var;
};

ShaderCode.prototype.setOrder = function(order)
{
    this.order = order;
    this.vertex.order = this.order;
    this.fragment.order = this.order;
};


ShaderCode.prototype.merge = function (other_code)
{
    if(other_code === LiteGraph.EMPTY_CODE || this === LiteGraph.EMPTY_CODE)
        return;
    this.vertex.merge(other_code.vertex);
    this.fragment.merge(other_code.fragment);

};

ShaderCode.prototype.partialMerge = function (other_code)
{
    if(other_code === LiteGraph.EMPTY_CODE || this === LiteGraph.EMPTY_CODE)
        return ["", ""];
    var vertex_remainder_map = this.vertex.partialMerge(other_code.vertex);
    var fragment_remainder_map = this.fragment.partialMerge(other_code.fragment);

    var vertex_str = this.getCodeStringFromMap(vertex_remainder_map);
    var frag_str = this.getCodeStringFromMap(fragment_remainder_map);
    return [vertex_str, frag_str];

};



ShaderCode.prototype.clone = function ()
{
    var vertex = this.vertex.clone();
    var fragment = this.fragment.clone();
    var cloned = new ShaderCode(vertex,fragment,this.output_var);
    cloned.order = this.order;
    return cloned;
};


ShaderCode.prototype.sortMapByValue = function (map)
{
    var tupleArray = [];
    for (var key in map) tupleArray.push([key, map[key]]);
    tupleArray.sort(function (a, b) { return a[1] - b[1] });
    return tupleArray;
}

ShaderCode.prototype.getCodeStringFromMap = function (map)
{
    var r = "";
    var sorted_map = this.sortMapByValue(map);
    for(var i in sorted_map)
        r += "         "+sorted_map[i][0];
    return r;
}


LiteGraph.EMPTY_CODE = new ShaderCode();

var ShaderConstructor = {};

function sortMapByValue(map)
{
    var tupleArray = [];
    for (var key in map) tupleArray.push([key, map[key]]);
    tupleArray.sort(function (a, b) { return a[1].order - b[1].order });
    return tupleArray;
}

// codes it's [vertex, fragment]
ShaderConstructor.createShader = function (properties , albedo,normal,emission,specular,gloss,alpha,alphaclip, refraction, offset,sdfProc,sdfMaterialProc) {
    
    // albedo.merge(normal);
    // albedo.merge(emission);
    // albedo.merge(specular);
    // albedo.merge(gloss);
    // albedo.merge(alpha);
    // albedo.merge(alphaclip);
    // albedo.merge(refraction);
    // albedo.merge(offset);
    //albedo.merge(sdfProc);
    //albedo.merge(sdfMaterialProc);
    
    var vertex_code = this.createVertexCode(properties ,albedo,normal,emission,specular,gloss,alpha,alphaclip, refraction, offset);
    var fragment_code = this.createFragmentCode(properties ,albedo,normal,emission,specular,gloss,alpha,alphaclip, refraction, offset,sdfProc,sdfMaterialProc);

    var shader = {};
    shader.vertex_code = vertex_code;
    shader.fragment_code = fragment_code;
    return shader;
}

ShaderConstructor.createVertexCode = function (properties ,albedo,normal,emission,specular,gloss,alpha,alphaclip, refraction, offset) {

    // header
    var r = 
    "precision mediump float;\n"+
        "attribute vec3 a_vertex;\n"+
        "attribute vec3 a_normal;\n"+
        "attribute vec2 a_coord;\n";
    if (albedo.vertex.isLineIncluded("v_coord"))
        r += "varying vec2 v_coord;\n";
    //if (includes["v_normal"] || normal != LiteGraph.EMPTY_CODE)
        r += "varying vec3 v_normal;\n";

    r += "varying vec3 v_pos;\n";
    //if (albedo.vertex.isLineIncluded("u_time"))
        r += "uniform float u_time;\n";
    if (albedo.vertex.isLineIncluded("u_frame_time"))
        r += "uniform float u_frame_time;\n";
    //if (includes["u_eye"])
        r += "uniform vec3 u_eye;\n";
    r += "uniform mat4 u_mvp;\n"+
         "uniform mat4 u_model;\n" +
        "uniform mat4 u_viewprojection;\n";
    r += "uniform vec3 u_light_dir;\n";
    r += "uniform vec4 u_light_color;\n";
    r += "uniform float u_alpha_threshold;\n";
    

    var h = albedo.vertex.getHeader();
    for(var id in h)
        r += h[id];


    // body
    r += "void main() {\n";
    if (albedo.vertex.isLineIncluded("v_coord"))
        r += "      v_coord = a_coord;\n";
    r += "      v_normal = (u_model * vec4(a_normal, 0.0)).xyz;\n";
    r += "      vec3 pos = a_vertex;\n";
    if (albedo.vertex.isLineIncluded("depth")){
        r += "      vec4 pos4 = (u_model * vec4(pos,1.0));\n";
        r += "      float depth = pos4.z / pos4.w;\n";
    }

    if (albedo.vertex.isLineIncluded("view_dir"))
        r += "      vec3 view_dir = normalize(v_pos - u_eye);\n" +
             "      vec3 light_dir = normalize(u_light_dir);\n" +
            "      vec3 half_dir = normalize(view_dir + light_dir);\n";

    var body_hash = albedo.vertex.getBody();
    var sorted_map = sortMapByValue(body_hash);
    for(var i in sorted_map){
        r += "      "+sorted_map[i][1].str;
        //console.log(sorted_map[i][1].str +" "+    sorted_map[i][1].order);
    }

    if(offset.getOutputVar()){
        r += "      pos += a_normal * "+offset.getOutputVar()+";\n";
    }



    //if (includes["v_pos"])
    r += "      v_pos = (u_model * vec4(pos,1.0)).xyz;\n";
    r += "      gl_Position = u_mvp * vec4(pos,1.0);\n"+
        "}\n";
 
    return r;
}

ShaderConstructor.createFragmentCode = function (properties, albedo,normal,emission,specular,gloss,alpha,alphaclip, refraction, offset,sdfProc,sdfMaterialProc) {

    console.log("sdfProc code:",sdfProc.fragment)
    var has_gloss = gloss.fragment.isCodeUsed();
    var has_albedo = albedo.fragment.isCodeUsed();
    var has_normal = normal.fragment.isCodeUsed();
    var has_specular = specular.fragment.isCodeUsed();
    var has_emission = emission.fragment.isCodeUsed();
 
    var has_alpha = alpha.fragment.isCodeUsed();
    var has_alphaclip = alphaclip.fragment.isCodeUsed();
    var has_refraction = refraction.fragment.isCodeUsed();
    var has_sdfProc = sdfProc.fragment.isCodeUsed();
//    var includes = albedo.fragment.includes;
//    for (var line in albedo.fragment.includes) { includes[line] = 1; }
//    for (var line in normal.fragment.includes) { includes[line] = 1; }
//    for (var line in emission.fragment.includes) { includes[line] = 1; }
//    for (var line in specular.fragment.includes) { includes[line] = 1; }
//    for (var line in gloss.fragment.includes) { includes[line] = 1; }
//    for (var line in alpha.fragment.includes) { includes[line] = 1; }
//    for (var line in offset.fragment.includes) { includes[line] = 1; }
    if(albedo.fragment !== LiteGraph.EMPTY_CODE.fragment)
        albedo.fragment.addHeaderLine("uniform samplerCube u_cube_default_texture;\n");

    
    // header
    var r = "#extension GL_OES_standard_derivatives : enable\n"+
     "precision mediump float;\n";
    if (albedo.fragment.isLineIncluded("v_coord"))
        r += "varying vec2 v_coord;\n";
    //if (includes["v_normal"] || normal != LiteGraph.EMPTY_CODE )
        r += "varying vec3 v_normal;\n";
    //if (includes["v_pos"])
        r += "varying vec3 v_pos;\n";
    //if (albedo.fragment.isLineIncluded("u_time"))
        r += "uniform float u_time;\n";
    if (albedo.fragment.isLineIncluded("u_frame_time"))
        r += "uniform float u_frame_time;\n";
    //if (includes["u_eye"])
        r += "uniform vec3 u_eye;\n";
        r += "uniform vec4 u_color;\n";
        r += "uniform vec3 u_light_dir;\n";
        r += "uniform vec4 u_light_color;\n";
        r += "uniform float u_alpha_threshold;\n";
        r += "uniform vec3 u_camera_target;\n"; 
        r += "uniform vec3 u_camera_pos;\n"; 
        r += "uniform vec2 iResolution;\n";

    var h = albedo.fragment.getHeader();
    for(var id in h)
        r += h[id];

    // http://www.thetenthplanet.de/archives/1180
    if(albedo.fragment.isLineIncluded("TBN")) {
        r+= "\nmat3 computeTBN(){\n" +
            "      vec3 dp1 = dFdx( v_pos );\n" +
            "      vec3 dp2 = dFdy( v_pos );\n" +
            "      vec2 duv1 = dFdx( v_coord );\n" +
            "      vec2 duv2 = dFdy( v_coord );\n" +
            "      vec3 dp2perp = cross( dp2, v_normal );\n" +
            "      vec3 dp1perp = cross( v_normal, dp1 );\n" +
            "      vec3 tangent = dp2perp * duv1.x + dp1perp * duv2.x;\n" +
            "      vec3 binormal = dp2perp * duv1.y + dp1perp * duv2.y;\n" +
            "      float invmax = inversesqrt( max( dot(tangent,tangent), dot(binormal,binormal) ) );\n" +
            "      return mat3( tangent * invmax, binormal * invmax, v_normal );\n" +
            "}\n\n";
    }
    
    r+=`
#define AA 1
mat3 setCamera( in vec3 ro, in vec3 ta, float cr )
{     
    
//vec3 cw = normalize(ta-ro);
//vec3 cp = vec3(sin(cr), cos(cr),0.0);
//vec3 cu = normalize( cross(cw,cp) );
//vec3 cv =          ( cross(cu,cw) );
//return mat3( cu, cv, cw );
float fl = 2.45;
vec3 w = normalize(ta-ro);
float k = inversesqrt(1.0-w.y*w.y);
return  mat3( vec3(-w.z,0.0,w.x)*k, 
                vec3(-w.x*w.y,1.0-w.y*w.y,-w.y*w.z)*k,
                -w);

}
vec4 opU(vec4 d1,vec4 d2){return (d1.x < d2.x)?d1:d2;}
 
float smin( float a, float b, float k )
{
    float h = max(k-abs(a-b),0.0);
    return min(a, b) - h*h*0.25/k;
}

// http://iquilezles.org/www/articles/smin/smin.htm
vec2 smin2( vec2 a, vec2 b, float k )
{
    float h = clamp( 0.5+0.5*(b.x-a.x)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

// http://iquilezles.org/www/articles/smin/smin.htm
float smax( float a, float b, float k )
{
    float h = max(k-abs(a-b),0.0);
    return max(a, b) + h*h*0.25/k;
}

// http://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
float sdSphere( vec3 p, float s )
{
    return length(p)-s;
}
// http://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
float sdEllipsoid( in vec3 p, in vec3 r ) // approximated
{
    float k0 = length(p/r);
    float k1 = length(p/(r*r));
    return k0*(k0-1.0)/k1;
}
vec2 sdStick(vec3 p, vec3 a, vec3 b, float r1, float r2) // approximated
{
    vec3 pa = p-a, ba = b-a;
	float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
	return vec2( length( pa - ba*h ) - mix(r1,r2,h*h*(3.0-2.0*h)), h );
}



float href;
float hsha;
vec4 map( in vec3 pos, float atime )
{
 
    hsha = 1.0;
    float t1 = fract(atime);
    float t4 = abs(fract(atime*0.5)-0.5)/0.5;

    float p = 4.0*t1*(1.0-t1);
    float pp = 4.0*(1.0-2.0*t1); // derivative of p

    vec3 cen = vec3( 0.0,
                     //0.5*(-1.0 + 2.0*t4),
                     //pow(p,2.0-p) + 0.1,
                     0.3,
                     0);
                     //floor(atime) + pow(t1,0.7) -1.0 );

    // body
    vec2 uu = normalize(vec2( 1.0, -pp ));
    vec2 vv = vec2(-uu.y, uu.x);
    
    float sy = 0.5 + 0.5*p;
    float compress = 1.0-smoothstep(0.0,0.4,p);
    sy = sy*(1.0-compress) + compress;
    float sz = 1.0/sy;
    
    //弹球
    vec3 q = pos - cen;
    float rot = -0.25*(-1.0 + 2.0*t4);
    float rc = cos(rot);
    float rs = sin(rot);
    //q.xy =mat2(rc,rs,-rs,rc)*q.xy;
    vec3 r = q;
    href = q.y;
    //q.yz = vec2( dot(uu,q.yz), dot(vv,q.yz) );
    `

    var rr = ""
    varsdfbodyhash = sdfProc.fragment.getBody()
    var varsdfbodyhashmap = sortMapByValue(varsdfbodyhash);
    for(var i in varsdfbodyhashmap){
        rr += "      "+varsdfbodyhashmap[i][1].str;
    }
    console.log(rr)
    r+=rr;
    r+="vec4 res =" + sdfProc.getOutputVar() +";\n";
    r+=`
    /*
    vec4 res = vec4( sdEllipsoid( q, vec3(0.25, 
        0.25,
        //0.25*sy,
        0.25 
        //0.25*sz
        ) ), 2.0, 0.0, 1.0 );
        */
    // head
    vec3 h = r;
    float hr = sin(0.791*atime);
    hr = 0.7*sign(hr)*smoothstep(0.5,0.7,abs(hr));
    h.xz = mat2(cos(hr),sin(hr),-sin(hr),cos(hr))*h.xz;
    vec3 hq = vec3( abs(h.x), h.yz );
    float d  = sdEllipsoid( h-vec3(0.0,0.20,0.02), vec3(0.08,0.2,0.15) );
    float d2 = sdEllipsoid( h-vec3(0.0,0.21,-0.1), vec3(0.20,0.2,0.20) );
    d = smin( d, d2, 0.1 );
    //res.x = smin( res.x, d, 0.1 );
    /*
    // ears
    {
    float t3 = fract(atime+0.9);
    float p3 = 4.0*t3*(1.0-t3);
    vec2 ear = sdStick( hq, vec3(0.15,0.32,-0.05), vec3(0.2+0.05*p3,0.2+0.2*p3,-0.07), 0.01, 0.04 );
    res.xz = smin2( res.xz, ear, 0.01 );
    }
    
    // mouth
    {
    d = sdEllipsoid( h-vec3(0.0,0.15+4.0*hq.x*hq.x,0.15), vec3(0.1,0.04,0.2) );
    res.w = 0.3+0.7*clamp( d*150.0,0.0,1.0);
    res.x = smax( res.x, -d, 0.03 );
    }
    
    // eye
    {
    float blink = pow(0.5+0.5*sin(2.1*atime),20.0);
    float eyeball = sdSphere(hq-vec3(0.08,0.27,0.06),0.065+0.02*blink);
    res.x = smin( res.x, eyeball, 0.03 );
    
    vec3 cq = hq-vec3(0.1,0.34,0.08);
    cq.xy = mat2(0.8,0.6,-0.6,0.8)*cq.xy;
    d = sdEllipsoid( cq, vec3(0.06,0.03,0.03) );
    res.x = smin( res.x, d, 0.03 );

    float eo = 1.0-0.5*smoothstep(0.01,0.04,length((hq.xy-vec2(0.095,0.285))*vec2(1.0,1.1)));
    res = opU( res, vec4(sdSphere(hq-vec3(0.08,0.28,0.08),0.060),3.0,0.0,eo));
    res = opU( res, vec4(sdSphere(hq-vec3(0.075,0.28,0.102),0.0395),4.0,0.0,1.0));
    }
    */
    // ground
    float fh = -0.1 - 0.05*(sin(pos.x*2.0)+sin(pos.z*2.0));
    float t5f = fract(atime+0.05);
    float t5i = floor(atime+0.05); 
    float bt4 = abs(fract(t5i*0.5)-0.5)/0.5;
    //wave center
    vec2  bcen = vec2(0.5*(-1.0+2.0*bt4),0);//vec2( 0.5*(-1.0+2.0*bt4),t5i+pow(t5f,0.7)-1.0 );
    
    float k = length(pos.xz-bcen);
    float tt = t5f*15.0-6.2831 - k*3.0;
    //wave 
    fh -= 0.1*exp(-k*k)*sin(tt)*exp(-max(tt,0.0)/2.0)*smoothstep(0.0,0.01,t5f);
    d = pos.y;// - fh;

    //x as depth
     
    // bubbles
    {
    vec3 vp = vec3( mod(abs(pos.x),3.0)-1.5,pos.y,mod(pos.z+1.5,3.0)-1.5);
    vec2 id = vec2( floor(pos.x/3.0), floor((pos.z+1.5)/3.0) );
    float fid = id.x*11.1 + id.y*31.7;
    //bubbly height
    float fy = fract(fid*1.312+atime*0.1);
    float y = -1.0+4.0*fy;
    vec3  rad = vec3(0.7,1.0+0.5*sin(fid),0.7);
    rad -= 0.1*(sin(pos.x*3.0)+sin(pos.y*4.0)+sin(pos.z*5.0));    
    float siz = 4.0*fy*(1.0-fy);
    float d2 = sdEllipsoid( vp-vec3(0.5,y,0.0), siz*rad );
    
    d2 -= 0.03*smoothstep(-1.0,1.0,sin(18.0*pos.x)+sin(18.0*pos.y)+sin(18.0*pos.z));
    d2 *= 0.6;
    d2 = min(d2,2.0);
    d = smin( d, d2, 0.32 );
    if( d<res.x ) { res = vec4(d,1.0,0.0,1.0); hsha=sqrt(siz); }
    }
    
    return res;
}


vec4 castRay( in vec3 ro, in vec3 rd, float time )
{
    vec4 res = vec4(-1.0,-1.0,0.0,1.0);

    float tmin = 0.5;
    float tmax = 20.0;
    
	#if 1
    // raytrace bounding plane
    float tp = (3.5-ro.y)/rd.y;
    if( tp>0.0 ) tmax = min( tmax, tp );
	#endif    
    
    float t = tmin;
    for( int i=0; i<256; i++ )
    {
        vec4 h = map( ro+rd*t, time );
        if( abs(h.x)<(0.0005*t) )
        { 
            res = vec4(t,h.yzw); 
            break;
        }
        t += h.x;
    }
    
    return res;
}

float calcSoftshadow( in vec3 ro, in vec3 rd, float time )
{
    float res = 1.0;

    float tmax = 12.0;
    #if 1
    float tp = (3.5-ro.y)/rd.y; // raytrace bounding plane
    if( tp>0.0 ) tmax = min( tmax, tp );
	#endif    
    
    float t = 0.02;
    for( int i=0; i<50; i++ )
    {
		float h = map( ro + rd*t, time ).x;
        res = min( res, mix(1.0,16.0*h/t, hsha) );
        t += clamp( h, 0.05, 0.40 );
        if( res<0.005 || t>tmax ) break;
    }
    return clamp( res, 0.0, 1.0 );
}
 

// http://iquilezles.org/www/articles/normalsSDF/normalsSDF.htm
vec3 calcNormal( in vec3 pos, float time )
{
    
#if 1
    vec2 e = vec2(1.0,-1.0)*0.5773*0.001;
    return normalize( e.xyy*map( pos + e.xyy, time ).x + 
					  e.yyx*map( pos + e.yyx, time ).x + 
					  e.yxy*map( pos + e.yxy, time ).x + 
					  e.xxx*map( pos + e.xxx, time ).x );
#else
    // inspired by tdhooper and klems - a way to prevent the compiler from inlining map() 4 times
    vec3 n = vec3(0.0);
    for( int i=0; i<4; i++ )
    {
        vec3 e = 0.5773*(2.0*vec3((((i+3)>>1)&1),((i>>1)&1),(i&1))-1.0);
        n += e*map(pos+0.001*e,time).x;
    }
    return normalize(n);
#endif    
}

float calcOcclusion( in vec3 pos, in vec3 nor, float time )
{
	float occ = 0.0;
    float sca = 1.0;
    for( int i=0; i<5; i++ )
    {
        float h = 0.01 + 0.11*float(i)/4.0;
        vec3 opos = pos + h*nor;
        float d = map( opos, time ).x;
        occ += (h-d)*sca;
        sca *= 0.95;
    }
    return clamp( 1.0 - 2.0*occ, 0.0, 1.0 );
}

vec3 render( in vec3 ro, in vec3 rd, float time )
{ 
    // sky dome
    vec3 col = vec3(0.5, 0.8, 0.9) - max(rd.y,0.0)*0.5;
    // sky clouds
    vec2 uv = 1.5*rd.xz/rd.y;
    float cl  = 1.0*(sin(uv.x)+sin(uv.y)); uv *= mat2(0.8,0.6,-0.6,0.8)*2.1;
    cl += 0.5*(sin(uv.x)+sin(uv.y));
    col += 0.1*(-1.0+2.0*smoothstep(-0.1,0.1,cl-0.4));
    // sky horizon
    col = mix( col, vec3(0.5, 0.7, .9), exp(-10.0*max(rd.y,0.0)) );    
    // scene geometry
    vec4 res = castRay(ro,rd, time);
    
    if( res.y>-0.5)
    {
        float t = res.x;
        vec3 pos = ro + t*rd;
        vec3 nor = calcNormal( pos, time );
        vec3 ref = reflect( rd, nor );
        float focc = res.w;
        
        // material        
		col = vec3(0.2);
        float ks = 1.0;

        if( res.y>3.5 ) // eyeball
        { 
            col = vec3(0.0);
        } 
        else if( res.y>2.5 ) // iris
        { 
            col = vec3(0.4);
        } 
        else if( res.y>1.5 ) // body
        { 
            col = mix(vec3(0.144,0.09,0.0036),vec3(0.36,0.1,0.04),res.z*res.z);
            col = mix(col,vec3(0.14,0.09,0.06)*2.0, (1.0-res.z)*smoothstep(-0.15, 0.15, -href));
        }

        
        else{
        // terrain
        
        // base green            
        
        col = vec3(0.05,0.09,0.02);
        float f = 0.2*(-1.0+2.0*smoothstep(-0.2,0.2,sin(18.0*pos.x)+sin(18.0*pos.y)+sin(18.0*pos.z)));
        col += f*vec3(0.06,0.06,0.02);
        ks = 0.5 + pos.y*0.15;
        
        }
    // lighting (sun, sky, bounce, back, sss)
    float occ = calcOcclusion( pos, nor, time )*focc;
    float fre = clamp(1.0+dot(nor,rd),0.0,1.0);
    
    vec3  sun_lig = normalize( vec3(0.6, 0.35, 0.5) );
    float sun_dif = clamp(dot( nor, sun_lig ), 0.0, 1.0 );
    vec3  sun_hal = normalize( sun_lig-rd );
    float sun_sha = calcSoftshadow( pos, sun_lig, time );
    float sun_spe = ks*pow(clamp(dot(nor,sun_hal),0.0,1.0),8.0)*sun_dif*(0.04+0.96*pow(clamp(1.0+dot(sun_hal,rd),0.0,1.0),5.0));
    float sky_dif = sqrt(clamp( 0.5+0.5*nor.y, 0.0, 1.0 ));
    float sky_spe = ks*smoothstep( 0.0, 0.5, ref.y )*(0.04+0.96*pow(fre,4.0));
    float bou_dif = sqrt(clamp( 0.1-0.9*nor.y, 0.0, 1.0 ))*clamp(1.0-0.1*pos.y,0.0,1.0);
    float bac_dif = clamp(0.1+0.9*dot( nor, normalize(vec3(-sun_lig.x,0.0,-sun_lig.z))), 0.0, 1.0 );
    float sss_dif = fre*sky_dif*(0.25+0.75*sun_dif*sun_sha);

    vec3 lin = vec3(0.0);
    lin += sun_dif*vec3(8.10,6.00,4.20)*vec3(sun_sha,sun_sha*sun_sha*0.5+0.5*sun_sha,sun_sha*sun_sha);
    lin += sky_dif*vec3(0.50,0.70,1.00)*occ;
    lin += bou_dif*vec3(0.20,0.70,0.10)*occ;
    lin += bac_dif*vec3(0.45,0.35,0.25)*occ;
    lin += sss_dif*vec3(3.25,2.75,2.50)*occ;
    col = col*lin;
    col += sun_spe*vec3(9.90,8.10,6.30)*sun_sha;
    col += sky_spe*vec3(0.20,0.30,0.65)*occ*occ;
    
    col = pow(col,vec3(0.8,0.9,1.0) );
    
    // fog
    col = mix( col, vec3(0.5,0.7,0.9), 1.0-exp( -0.0001*t*t*t ) );
        
        
    }
    
    return col;

    

}
 
    `;
    r += "void main() {\n";
    /*
    r += "      vec3 normal = normalize(v_normal);\n";

    if (albedo.fragment.isLineIncluded("depth"))
        r += "      float depth = gl_FragCoord.z / gl_FragCoord.w;\n";


    //if (albedo.fragment.isLineIncluded("view_dir"))
    r += "      vec3 view_dir = normalize(v_pos - u_eye);\n";
    // constans for light
    r +="      vec3 light_dir = normalize(u_light_dir);\n" +
        "      vec3 half_dir = normalize(view_dir + light_dir);\n";



    if(albedo.fragment.isLineIncluded("TBN")){
        // http://www.thetenthplanet.de/archives/1180
        r+= "      mat3 TBN = computeTBN();\n";
    }

    */
    //包括
    var rr = "albedo:\n"
    var body_hash = albedo.fragment.getBody();
    var sorted_map = sortMapByValue(body_hash);
    for(var i in sorted_map){
        rr += "      "+sorted_map[i][1].str;
    }
    console.log(rr)
     
    /*
    if(has_alphaclip) {
        r += "       if ("+alphaclip.getOutputVar()+" < u_alpha_threshold)\n" +
            "      {\n" +
            "           discard;\n" +
            "      }\n";
    }


    if(!has_specular) {
        r += "      float specular_intensity = 1.0;\n";
    } else {
        r +="      float specular_intensity = "+specular.getOutputVar()+";\n";
    }

    if( !has_gloss) {
        r += "      float gloss = 1.0;\n";
    } else{
        r +="      float gloss = "+gloss.getOutputVar()+";\n";
    }


    // diffuse light
    r +="      vec3 diffuse_color = "+albedo.getOutputVar()+".xyz;\n" +
        "      float lambertian = max(dot(light_dir,normal), 0.0);\n" +
        "      vec3 diffuse_light = lambertian * vec3(1.0);\n"; // vec3(1.0) is the light color

    //ambient light
    r +="      float ambient_intensity = 0.2;\n" +
        "      vec3 ambient_light =  vec3(1.0) * ambient_intensity;\n";


    //specular color
    r +="      vec3 reflect_dir = reflect(light_dir, normal);\n" +
        "      float spec_angle = max(dot(reflect_dir, view_dir), 0.0);\n" +
        "      float specular_light = pow(spec_angle, gloss) * specular_intensity;\n" +
        "      vec3 specular_color = u_light_color.xyz * specular_light;\n"; // vec3(1.0) is the light color

//    // reflections
//    r +="      vec3 reflected_vector2 = reflect(view_dir,normal);\n" +
//        "      float fresnel_dot = dot(normal, -view_dir);\n" +
//        "      vec4 env_color = textureCube(u_cube_default_texture, reflected_vector2);\n" +
//        "      float w = pow( 1.0 - clamp(0.0,fresnel_dot,1.0), 5.0);\n" +
//        "      vec4 reflection_color = env_color * w;\n";

    if(has_refraction){
        r += "      vec3 refraction_vec = refract(view_dir,normal, 1.0 / "+refraction.getOutputVar()+");\n" +
             "      vec3 refraction_color = textureCube(u_cube_default_texture, refraction_vec).xyz;\n";
    } else {
        r += "      vec3 refraction_color = vec3(0.0);\n";
    }
    // emission color
    if( !has_emission){
        r += "      vec3 emission = vec3(0.0);\n";
    } else {
        r +="      vec3 emission = "+emission.getOutputVar()+".xyz;\n";

    }
 
    
   
//    // specular light
//    r +="      vec3 pixel_normal_ws = normal;\n" +
//        "      vec3 reflected_vector = reflect(view_dir,pixel_normal_ws);\n" +
//        "      vec4 specular_color = textureCube(u_cube_default_texture, reflected_vector);\n" +
//        "      float w = pow( 1.0 - max(0.0, dot(normal, -view_dir)), 2.0);\n" +
//
//        "      vec3 ambient_light = ambient_color * ("+albedo.getOutputVar()+").xyz;\n" +
//        "      vec3 diffuse_reflection = lambertian *("+albedo.getOutputVar()+").xyz;\n" +
//        "      vec3 specular_reflection =   mix( diffuse_reflection, vec3(1.0), w) ;\n"; // vec3(1.0 is the light color)
    //specular_color * specular * specular_intensity

    var alpha_value = has_alpha ? alpha.getOutputVar() : "1.0";

    */

    r += `
    
    vec3 tot = vec3(0.0);
     
    vec2 p = (-iResolution.xy + 2.0*(gl_FragCoord.xy-0.5))/iResolution.y;
    float time = u_time;
    
    time += -2.6;
    time *= 0.9;
    
    // camera	
    /*
    float cl = sin(0.5*time);
    float an = 1.57 + 0.7*sin(0.15*time);
    vec3  ta = vec3( 0.0, 0.65, -0.6+time*1.0 - 0.4*cl);
    vec3  ro = ta + vec3( 1.3*cos(an), -0.250, 1.3*sin(an) );
    float ti = fract(time-0.15);
    ti = 4.0*ti*(1.0-ti);        
    ta.y += 0.15*ti*ti*(3.0-2.0*ti)*smoothstep(0.4,0.9,cl);
    
    // camera bounce
    
    float t4 = abs(fract(time*0.5)-0.5)/0.5;
    float bou = -1.0 + 2.0*t4;
    ro += 0.06*sin(time*12.0+vec3(0.0,2.0,4.0))*smoothstep( 0.85, 1.0, abs(bou) );
    */
    // camera-to-world rotation
    //vec3 ro = vec3(-0.045+0.05,-0.04,1.3);
    //vec3 ta = vec3(-0.19,-0.08,0.0);
    `;
    
    r+=`
    vec3 ro = u_camera_pos;
    vec3 ta = u_camera_target;
    mat3 ca = setCamera( ta,ro, 0.0 );

    // ray direction
    //5是fov 2020.5.3
    vec3 rd = ca * normalize( vec3(p,2.2) );
    
    // render	
    vec3 col = render( ro, rd, time );
        
    // color grading
    col = col*vec3(1.11,0.89,0.79);

    // compress        
    col = 1.35*col/(1.0+col);
    
    // gamma
    col = pow( col, vec3(0.4545));

    tot += col;


    // s-surve    
    tot = clamp(tot,0.0,1.0);
    tot = tot*tot*(3.0-2.0*tot);

    // vignetting        
    //vec2 q = fragCoord/iResolution.xy;
    //tot *= 0.5 + 0.5*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.25);

    // output    
 
    gl_FragColor = vec4( tot, 1.0 );
    
    `;
    //r +="      gl_FragColor = vec4( emission + refraction_color +"+ /*reflection_color.xyz +*/ " specular_color + (ambient_light + diffuse_light) * //diffuse_color, "+ alpha_value +" );\n" +
    r+=    "}";
 
    return r;
}





var PFrameTime = {};

PFrameTime.id = "frame_time";
PFrameTime.includes = {u_frame_time:1};


PFrameTime.getVertexCode = function () {
    return "";
}

PFrameTime.getFragmentCode = function () {
    return "";
}


PFrameTime.getCode = function (params) {
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var fragment = new CodePiece(order);
    fragment.setIncludesFromMap(PFrameTime.includes);

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode());
    vertex.setIncludesFromMap(PFrameTime.includes);

    return new ShaderCode(vertex, fragment, "u_frame_time");
}







function P1ParamFunc (type, name) {
    this.type = type;
    this.name = name;
    this.id = "1paramfunc";
    this.includes = {};
}

P1ParamFunc.prototype.getVertexCode = function (out_var, a, scope, out_type) {
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        var code = (out_type || this.type)+" " +out_var+" = "+this.name+"("+a+");\n";
        return code;
    }
    return "";
}

P1ParamFunc.prototype.getFragmentCode = function (out_var, a, scope, out_type) {
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        var code = (out_type || this.type)+" " +out_var+" = "+this.name+"("+a+");\n";
        return code;
    }
    return "";
}


/**
 * @param {out_var} name of the output var
 *  @param {a} value a in the function
 *  @param {b} value a in the function
 *  @param {scope} either CodePiece.BOTH CodePiece.FRAGMENT CodePiece.VERTEX
 *  @param {out_type} in case the output var type has to be defined in run time example "vec3"
 */
P1ParamFunc.prototype.getCode = function (params) {
    var out_var = params.out_var;
    var a = params.a;
    var scope = params.scope;
    var out_type = params.out_type;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_var, a, scope, out_type));
    vertex.setIncludesFromMap(this.includes);

    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_var, a, scope, out_type));
    fragment.setIncludesFromMap(this.includes );

    return new ShaderCode(vertex, fragment, out_var);
}

// https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf
// undefined means T
LiteGraph.CodeLib["length"] = new P1ParamFunc ("float", "length");
LiteGraph.CodeLib["exp2"] = new P1ParamFunc (undefined, "exp2");
LiteGraph.CodeLib["sin"] = new P1ParamFunc (undefined, "sin");
LiteGraph.CodeLib["normalize"] = new P1ParamFunc (undefined, "normalize");
LiteGraph.CodeLib["cos"] = new P1ParamFunc (undefined, "cos");
LiteGraph.CodeLib["tan"] = new P1ParamFunc (undefined, "tan");
LiteGraph.CodeLib["asin"] = new P1ParamFunc (undefined, "asin");
LiteGraph.CodeLib["acos"] = new P1ParamFunc (undefined, "acos");
LiteGraph.CodeLib["atan"] = new P1ParamFunc (undefined, "atan");
LiteGraph.CodeLib["abs"] = new P1ParamFunc (undefined, "abs");
LiteGraph.CodeLib["sign"] = new P1ParamFunc (undefined, "sign");
LiteGraph.CodeLib["floor"] = new P1ParamFunc (undefined, "floor");
LiteGraph.CodeLib["ceil"] = new P1ParamFunc (undefined, "ceil");
LiteGraph.CodeLib["fract"] = new P1ParamFunc (undefined, "fract");






// object representing glsl 2 param function
function P2ParamFunc (type, name) {
    this.type = type;
    this.name = name;
    this.id = "2paramfunc";
    this.includes = {};
}

P2ParamFunc.prototype.getVertexCode = function (out_var, a, b, scope, out_type) {
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        var code = (out_type || this.type)+" " +out_var+" = "+this.name+"("+a+","+b+");\n";
        return code;
    }
    return "";
}

P2ParamFunc.prototype.getFragmentCode = function (out_var, a, b, scope, out_type) {
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        var code = (out_type || this.type)+" " +out_var+" = "+this.name+"("+a+","+b+");\n";
        return code;
    }
    return "";
}

/**
 * Run N steps (cycles) of the graph
 * @param {out_var} name of the output var
 *  @param {a} value a in the function
 *  @param {b} value a in the function
 *  @param {scope} either CodePiece.BOTH CodePiece.FRAGMENT CodePiece.VERTEX
 *  @param {out_type} in case the output var type has to be defined in run time example "vec3"
 */
P2ParamFunc.prototype.getCode = function (params) {
    var out_var = params.out_var;
    var a = params.a;
    var b = params.b;
    var scope = params.scope;
    var out_type = params.out_type;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_var, a, b, scope, out_type));
    vertex.setIncludesFromMap(this.includes);

    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_var, a, b, scope, out_type));
    fragment.setIncludesFromMap(this.includes );

    return new ShaderCode(vertex, fragment, out_var);
}

// https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf
// undefined means T
LiteGraph.CodeLib["distance"] = new P2ParamFunc ("float", "distance");
LiteGraph.CodeLib["dot"] = new P2ParamFunc ("float", "dot");
LiteGraph.CodeLib["cross"] = new P2ParamFunc ("vec3", "cross");
LiteGraph.CodeLib["reflect"] = new P2ParamFunc (undefined, "reflect");
LiteGraph.CodeLib["mod"] = new P2ParamFunc (undefined, "mod");
LiteGraph.CodeLib["min"] = new P2ParamFunc (undefined, "min");
LiteGraph.CodeLib["max"] = new P2ParamFunc (undefined, "max");
LiteGraph.CodeLib["step"] = new P2ParamFunc (undefined, "step");
LiteGraph.CodeLib["pow"] = new P2ParamFunc (undefined, "pow");







// object representing glsl 2 param function
function P3ParamFunc (type, name) {
    this.type = type;
    this.name = name;
    this.id = "3paramfunc";
    this.includes = {};
}

P3ParamFunc.prototype.getVertexCode = function (out_var, a, b, c, scope, out_type) {
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        var code = (out_type || this.type)+" " +out_var+" = "+this.name+"("+a+","+b+","+c+");\n";
        return code;
    }
    return "";
}

P3ParamFunc.prototype.getFragmentCode = function (out_var, a, b, c, scope, out_type) {
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        var code = (out_type || this.type)+" " +out_var+" = "+this.name+"("+a+","+b+","+c+");\n";
        return code;
    }
    return "";
}

/**
 * Run N steps (cycles) of the graph
 * @param {out_var} name of the output var
 *  @param {a} value a in the function
 *  @param {b} value a in the function
 *  @param {scope} either CodePiece.BOTH CodePiece.FRAGMENT CodePiece.VERTEX
 *  @param {out_type} in case the output var type has to be defined in run time example "vec3"
 */
P3ParamFunc.prototype.getCode = function (params) {
    var out_var = params.out_var;
    var a = params.a;
    var b = params.b;
    var c = params.c;
    var scope = params.scope;
    var out_type = params.out_type;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_var, a, b, c, scope, out_type));
    vertex.setIncludesFromMap(this.includes);

    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_var, a, b, c, scope, out_type));
    fragment.setIncludesFromMap(this.includes );

    return new ShaderCode(vertex, fragment, out_var);
}

// https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf
// undefined means T
LiteGraph.CodeLib["distance"] = new P3ParamFunc ("float", "distance");
LiteGraph.CodeLib["refract"] = new P3ParamFunc (undefined, "refract");
LiteGraph.CodeLib["mix"] = new P3ParamFunc (undefined, "mix");
LiteGraph.CodeLib["smoothstep"] = new P3ParamFunc (undefined, "smoothstep");
LiteGraph.CodeLib["clamp"] = new P3ParamFunc (undefined, "clamp");










function PConstant (type, name) {
    this.type = type;
    this.name = name;
    this.id = "constant";
    this.includes = {u_model: 1, a_normal: 1, v_normal: 1};
}

PConstant.prototype.getVertexCode = function (output_var, value, scope) {
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        var code = this.type+" " +output_var+" = "+value+";\n";
        return code;
    }
    return "";
}

PConstant.prototype.getFragmentCode = function (output_var, value, scope) {
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        var code = this.type+" " +output_var+" = "+value+";\n";
        return code;
    }
    return "";
}


PConstant.prototype.getCode = function (params) {
    var out_var = params.out_var;
    var a = params.a;
    var is_global = params.hasOwnProperty("is_global") ? params.is_global : false;
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var vertex = new CodePiece(order);
    var fragment = new CodePiece(order);
    if(!is_global){
        vertex.setBody(this.getVertexCode(out_var, a, scope));
        fragment.setBody(this.getFragmentCode(out_var, a, scope));
    } else {
        var id = {};
        var s = "uniform "+this.type+" " +out_var+";\n";
        id[s] = 1;
        vertex.setHeaderFromMap(id);
        fragment.setHeaderFromMap(id);
    }
    fragment.setIncludesFromMap(this.includes );
    vertex.setIncludesFromMap(this.includes);

    return new ShaderCode(vertex, fragment, out_var);
}

PConstant.prototype.setType = function (t) {
    this.type = t;
}







var PCameraToPixelWS = {};

PCameraToPixelWS.id = "view_dir";
PCameraToPixelWS.includes = {v_pos:1, u_eye: 1, camera_to_pixel_ws:1};

PCameraToPixelWS.getVertexCode = function (order) {
    var vertex = new CodePiece(order);
    vertex.setIncludesFromMap(PCameraToPixelWS.includes);
    return vertex;
}

PCameraToPixelWS.getFragmentCode = function (order) {
    var fragment = new CodePiece(order);
    fragment.setBody("");
    fragment.setIncludesFromMap(PCameraToPixelWS.includes);
    return fragment;
}


PCameraToPixelWS.getCode = function (params) {
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;
    var fragment = this.getFragmentCode(order);
    var vertex = this.getVertexCode(order);

    return new ShaderCode(vertex, fragment, "view_dir");
}






var PDepth = {};

PDepth.id = "depth";
PDepth.includes = {depth:1, v_pos:1};
PDepth.already_included = false; // TODO add multiple times same line

PDepth.getVertexCode = function (order) {
    var vertex = new CodePiece(order);
    vertex.setIncludesFromMap(PDepth.includes);
    return vertex;
}

PDepth.getFragmentCode = function (order) {
    var fragment = new CodePiece(order);
    fragment.setIncludesFromMap(PDepth.includes);
    return fragment;
}

PDepth.getCode = function (params) {
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;
    var fragment = this.getFragmentCode(order);
    var vertex = this.getVertexCode(order);
    return new ShaderCode(vertex, fragment, "depth");
}






var PPixelNormalWS = {};

PPixelNormalWS.id = "pixel_normal_ws";
PPixelNormalWS.includes = {u_model: 1, a_normal: 1, v_normal: 1};

PPixelNormalWS.getVertexCode = function () {
    return "";
}

PPixelNormalWS.getFragmentCode = function () {
    var code = "vec3 pixel_normal_ws = normal;\n";
    return code;
}


PPixelNormalWS.getCode = function (params) {
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;
    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode());
    vertex.setIncludesFromMap(PPixelNormalWS.includes);

    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode());
    fragment.setIncludesFromMap(PPixelNormalWS.includes);

    return new ShaderCode(vertex, fragment, "pixel_normal_ws");
}






// object representing glsl 2 param function
function PReflected () {
    this.id = "reflected_vector";
    this.includes = {v_pos:1, v_normal:1, u_eye: 1, v_coord:1, camera_to_pixel_ws:1};
}

PReflected.prototype.getVertexCode = function () {
    return "";
}

PReflected.prototype.getFragmentCode = function () {
    return  "vec3 pixel_normal_ws = normal;\n" +
            "      vec3 reflected_vector = reflect(view_dir,pixel_normal_ws);\n";
}

/**
 * @param {out_var} name of the output var
 *  @param {a} value a in the function
 *  @param {b} value a in the function
 *  @param {scope} either CodePiece.BOTH CodePiece.FRAGMENT CodePiece.VERTEX
 *  @param {out_type} in case the output var type has to be defined in run time example "vec3"
 */
PReflected.prototype.getCode = function (params) {
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;
    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode());
    vertex.setIncludesFromMap(this.includes);

    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode());
    fragment.setIncludesFromMap(this.includes );

    return new ShaderCode(vertex, fragment, "reflected_vector");
}










var PUVs = {};

PUVs.id = "uvs";
PUVs.includes = { v_coord: 1};
PUVs.already_included = false; // TODO add multiple times same line

PUVs.getVertexCode = function (out_var, utiling, vtiling, scope) {
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH) {
        return "vec2 " + out_var + " = v_coord * vec2(" + utiling + "," + vtiling + ");\n";
    }
    return "";
}

PUVs.getFragmentCode = function (out_var, utiling, vtiling, scope) {
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH) {
        return "vec2 " + out_var + " = v_coord * vec2(" + utiling + "," + vtiling + ");\n";
    }
    return "";
}


PUVs.getCode = function (params) {
    var out_var = params.out_var;
    var utiling = params.utiling || "1.000";
    var vtiling = params.vtiling || "1.000";
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var uvs_modified = (utiling !== "1.000" ||  vtiling !== "1.000");

    var fragment = new CodePiece(order);
    if(uvs_modified)
        fragment.setBody(this.getFragmentCode(out_var, utiling, vtiling, scope));
    fragment.setIncludesFromMap(PUVs.includes);

    var vertex = new CodePiece(order);
    if(uvs_modified)
        vertex.setBody(this.getVertexCode(out_var, utiling, vtiling, scope));
    vertex.setIncludesFromMap(PUVs.includes);


    return new ShaderCode(vertex, fragment, uvs_modified ? out_var : "v_coord");
}







function PVecToVec () {
    this.id = "vec_to_vec";
    this.includes = {};
}


PVecToVec.prototype.getCastedVar = function(output_var, out_type, in_type, value) {


    var out_vec =parseInt(out_type.slice(-1));
    var in_vec = parseInt(in_type.slice(-1));
    if( isNaN(out_vec))
        out_vec = 1;
    if( isNaN(in_vec))
        in_vec = 1;

    if(in_vec > out_vec){
        if(out_type == "float")
            return value +".x;\n";
        if(out_type == "vec2")
            return value +".xy;\n";
        if(out_type == "vec3")
            return value +".xyz;\n";
        if(out_type == "vec4")
            return value +".xyzw;\n";
    } else {
        var r = out_type +"("+value;
        for(var i = 0; i < (out_vec - in_vec); ++i){
            r +=", 0.0";
        }
        r +=");\n";
        return r;
    }



}

PVecToVec.prototype.getVertexCode = function (output_var, out_type, in_type, value, scope) {
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        var code = out_type+" " +output_var+" = " + this.getCastedVar(output_var, out_type, in_type, value);
        return code;
    }
    return "";
}

PVecToVec.prototype.getFragmentCode = function (output_var, out_type, in_type, value, scope) {
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        var code = out_type+" " +output_var+" = " + this.getCastedVar(output_var, out_type, in_type, value);
        return code;
    }
    return "";
}


PVecToVec.prototype.getCode = function (params) {
    var out_var = params.out_var;
    var in_type = params.in_type;
    var out_type = params.out_type;
    var a = params.a;
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;


    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_var, out_type, in_type, a, scope));
    vertex.setIncludesFromMap(this.includes);

    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_var, out_type, in_type, a, scope));
    fragment.setIncludesFromMap(this.includes );

    return new ShaderCode(vertex, fragment, out_var);
}









var PVertexPosWS = {};

PVertexPosWS.id = "cameratopixelws";
PVertexPosWS.includes = {v_pos:1, u_eye: 1};
PVertexPosWS.already_included = false; // TODO add multiple times same line

PVertexPosWS.getVertexCode = function (order) {
    var vertex = new CodePiece(order);
    vertex.setIncludesFromMap(PVertexPosWS.includes);
    return vertex;
}

PVertexPosWS.getFragmentCode = function (order) {
    var fragment = new CodePiece(order);
    fragment.setIncludesFromMap(PVertexPosWS.includes);
    return fragment;
}

PVertexPosWS.getCode = function (params) {
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;
    var fragment = this.getFragmentCode(order);
    var vertex = this.getVertexCode(order);
    return new ShaderCode(vertex, fragment, "v_pos");
}






function PIf () {
    this.id = "if";
    this.includes = {};
}

PIf.prototype.getVertexCode = function (out_type, out_var, a,b,gt,lt,eq,gt_out,lt_out,eq_out,scope) {
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        gt = gt ? gt +"" : "";
        lt = lt ? lt +"" : "";
        eq = eq ? eq +"" : "";
        gt_out = gt_out ? "         "+out_var+" = " + gt_out +";\n" : "";
        lt_out = lt_out ? "         "+out_var+" = " + lt_out +";\n" : "";
        eq_out = eq_out ? "         "+out_var+" = " + eq_out +";\n" : "";
        var code = out_type+" " +out_var+";\n" +
            "      if("+ a+" > "+ b+")\n" +
            "      {\n" +
            ""+gt+"" +
            gt_out  +
            "      } else if ("+ a+" < "+ b+"){\n" +
            ""+lt+"" +
            lt_out  +
            "      } else {\n" +
            ""+eq+"" +
            eq_out  +
            "      }\n";
        return code;
    }
    return "";
}

PIf.prototype.getFragmentCode = function (out_type, out_var, a,b,gt,lt,eq,gt_out,lt_out,eq_out,scope) {
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        gt = gt ? gt +"" : "";
        lt = lt ? lt +"" : "";
        eq = eq ? eq +"" : "";
        gt_out = gt_out ? "         "+out_var+" = " + gt_out +";\n" : "";
        lt_out = lt_out ? "         "+out_var+" = " + lt_out +";\n" : "";
        eq_out = eq_out ? "         "+out_var+" = " + eq_out +";\n" : "";
        var code = out_type+" " +out_var+";\n" +
            "      if("+ a+" > "+ b+")\n" +
            "      {\n" +
            ""+gt+"" +
            gt_out  +
            "      } else if ("+ a+" < "+ b+"){\n" +
            ""+lt+"" +
            lt_out  +
            "      } else {\n" +
            ""+eq+"" +
            eq_out  +
            "      }\n";
        return code;
    }
    return "";
}


PIf.prototype.getCode = function (params) {
    var out_var = params.out_var;
    var out_type = params.out_type;
    var a = params.a;
    var b = params.b;
    var gt = params.gt;
    var lt = params.lt;
    var eq = params.eq;
    var gt_out = params.gt_out;
    var lt_out = params.lt_out;
    var eq_out = params.eq_out;
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_type, out_var, a,b,gt,lt,eq,gt_out,lt_out,eq_out, scope));
    vertex.setIncludesFromMap(this.includes);

    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_type, out_var, a,b,gt,lt,eq,gt_out,lt_out,eq_out,scope));
    fragment.setIncludesFromMap(this.includes );

    return new ShaderCode(vertex, fragment, out_var);
}









// object representing glsl 2 param function
function POperation (type, op) {
    this.type = type;
    this.op = op;
    this.id = "operation";
    this.includes = {};
}

POperation.prototype.getVertexCode = function (out_var, a, b, scope, out_type) {
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        var code = (out_type || this.type)+" " +out_var+" = "+a+" "+this.op+" "+b+";\n";
        return code;
    }
    return "";
}

POperation.prototype.getFragmentCode = function (out_var, a, b, scope, out_type) {
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        var code = (out_type || this.type)+" " +out_var+" = "+a+" "+this.op+" "+b+";\n";
        return code;
    }
    return "";
}

/**
 * @param {out_var} name of the output var
 *  @param {a} value a in the function
 *  @param {b} value a in the function
 *  @param {scope} either CodePiece.BOTH CodePiece.FRAGMENT CodePiece.VERTEX
 *  @param {out_type} in case the output var type has to be defined in run time example "vec3"
 */
POperation.prototype.getCode = function (params) {
    var out_var = params.out_var;
    var a = params.a;
    var b = params.b;
    var scope = params.scope;
    var out_type = params.out_type;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_var, a, b, scope, out_type));
    vertex.setIncludesFromMap(this.includes);

    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_var, a, b, scope, out_type));
    fragment.setIncludesFromMap(this.includes );

    return new ShaderCode(vertex, fragment, out_var);
}

// https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf
// undefined means T
LiteGraph.CodeLib["add"] = new POperation (undefined, "+");
LiteGraph.CodeLib["sub"] = new POperation (undefined, "-");
LiteGraph.CodeLib["mul"] = new POperation (undefined, "*");
LiteGraph.CodeLib["div"] = new POperation (undefined, "/");











function PFresnel () {
    this.id = "fresnel";
    this.includes = {u_model: 1, a_normal: 1, v_normal: 1, view_dir:1};
}

PFresnel.prototype.getVertexCode = function (output_var,  normal, exp, scope) {
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        var normal = normal || "v_normal";
        var code = "float fresnel_"+output_var+" = dot("+normal+", -view_dir);\n" +
        "      float "+output_var+" = pow( 1.0 - clamp(fresnel_"+output_var+",0.0,1.0), "+exp+");\n";
        return code;
    }
    return "";
}

PFresnel.prototype.getFragmentCode = function (output_var,  normal, exp, scope) {
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        var normal = normal || "normal";
        var code = "float fresnel_"+output_var+" = dot("+normal+", -view_dir);\n" +
            "      float "+output_var+" = pow( 1.0 - clamp(fresnel_"+output_var+",0.0,1.0), "+exp+");\n";
        return code;
    }
    return "";
}


PFresnel.prototype.getCode = function (params) {
    var out_var = params.out_var;
    var exp = params.exp || "1.0";
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;
    var normal = params.normal;

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_var,  normal, exp, scope));
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH)
        vertex.setIncludesFromMap(this.includes);

    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_var,  normal, exp, scope));
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH)
        fragment.setIncludesFromMap(this.includes );

    return new ShaderCode(vertex, fragment, out_var);
}







function PPanner () {
    this.id = "panner";
    this.includes = {u_time:1};
}

PPanner.prototype.getVertexCode = function (out_var, input, time, dx, dy, scope, out_type) {
    var time = time == "" ? "u_time" : time;
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        var code = out_type+" " +out_var+" = "+input+";\n" +
            "      "+out_var+".x += "+dx+" * "+time+";\n" +
            "      "+out_var+".y += "+dy+" * "+time+";\n";// +
            //"      "+out_var+" = fract("+out_var+");\n";
        return code;
    }
    return "";
}

PPanner.prototype.getFragmentCode = function (out_var, input, time, dx, dy, scope, out_type) {
    var time = time == "" ? "u_time" : time;
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        var code = out_type+" " +out_var+" = "+input+";\n" +
            "      "+out_var+".x += "+dx+" * "+time+";\n" +
            "      "+out_var+".y += "+dy+" * "+time+";\n";// +
            //"      "+out_var+" = fract("+out_var+");\n";
        return code;
    }
    return "";
}



PPanner.prototype.getCode = function ( params) {
    //out_var, input, time, dx, dy, scope, out_type
    var out_var = params.out_var;
    var input = params.input;
    var time = params.time;
    var dx = params.dx;
    var dy = params.dy;
    var scope = params.scope;
    var out_type = params.out_type;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_var, input, time, dx, dy, scope, out_type));
    vertex.setIncludesFromMap(this.includes);

    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_var, input, time, dx, dy, scope, out_type));
    fragment.setIncludesFromMap(this.includes );

    return new ShaderCode(vertex, fragment, out_var);
}






var PTextureSampleCube = {};

PTextureSampleCube.id = "texture_sample_cube";
PTextureSampleCube.includes = {};

PTextureSampleCube.getVertexCode = function (output, input, texture_id) {
    return "";
}

PTextureSampleCube.getFragmentCode = function (output, input, texture_id) {
    if(!input)
        throw("input for sample cube not defined")
    var code = "vec4 " + output + " = textureCube(" + texture_id + ", " + input + ");\n";
    return code;
}


PTextureSampleCube.getCode = function (params) {
    var out_var = params.out_var;
    var input = params.input;
    var texture_id = params.texture_id;
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;
    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_var, input, texture_id, scope));
    vertex.setIncludesFromMap(PTextureSampleCube.includes);

    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_var, input, texture_id, scope));
    fragment.addHeaderLine("uniform samplerCube "+texture_id+";\n");
    fragment.setIncludesFromMap(PTextureSampleCube.includes);

    return new ShaderCode(vertex, fragment, out_var);
}








var PTextureSample = {};

PTextureSample.id = "texture_sample";
PTextureSample.includes = {v_pos:1, v_coord:1, camera_to_pixel_ws:1, u_eye:1};

PTextureSample.getVertexCode = function (output, input, texture_id, texture_type, scope, order) {
    var code = new CodePiece(order);
    var code_str = "";
    code.setIncludesFromMap(PTextureSample.includes);
    if(scope == CodePiece.VERTEX) {
        code_str = "vec4 " + output + " = texture2D(" + texture_id + ", " + input + ");\n";
        code.addHeaderLine("uniform sampler2D "+texture_id+";\n");
    }
    code.setBody(code_str);
    return code;
}

PTextureSample.getFragmentCode = function (output, input, texture_id, texture_type, scope, order) {
    input = input || "v_coord";
    var code = new CodePiece(order);

    var code_str = "";
    if(scope == CodePiece.FRAGMENT) {
        code.addHeaderLine("uniform sampler2D " + texture_id + ";\n");
        //if( texture_type == LiteGraph.COLOR_MAP || texture_type == LiteGraph.SPECULAR_MAP) {
        code_str = "vec4 " + output + " = texture2D(" + texture_id + ", " + input + ");\n";
        if (texture_type == LiteGraph.NORMAL_MAP) {
            code_str += "      " + output + " = (2.0 * " + output + " )-1.0;\n";
        }
        else if( texture_type == LiteGraph.TANGENT_MAP){
            PTextureSample.includes.TBN = 1;
            code_str += "      " + output + " = (2.0 * " + output + " )-1.0;\n";
            code_str += "      "+output+" = vec4(TBN * "+output+".xyz, 1.0);\n";
        } else if( texture_type == LiteGraph.TANGENT_MAP){
            PTextureSample.includes.TBN = 1;
            code_str += "      " + output + " = (2.0 * " + output + " )-1.0;\n";
            code_str += "      "+output+" = vec4(TBN * "+output+".xyz, 1.0);\n";
        }
    }
//    else if( texture_type == LiteGraph.BUMP_MAP){
//        code_str += "      const vec2 size = vec2(2.0,0.0);\n" +
//                    "      const ivec3 off = ivec3(-1,0,1);\n" +
//                    "      float s11 = "+output+".x;\n" +
//                    "      float s01 = textureOffset("+texture_id+", v_coord, off.xy).x;\n" +
//                    "      float s21 = textureOffset("+texture_id+", v_coord, off.zy).x;\n" +
//                    "      float s10 = textureOffset("+texture_id+", v_coord, off.yx).x;\n" +
//                    "      float s12 = textureOffset("+texture_id+", v_coord, off.yz).x;\n" +
//                    "      vec3 va = normalize(vec3(size.xy,s21-s01));\n" +
//                    "      vec3 vb = normalize(vec3(size.yx,s12-s10));\n" +
//                    "      "+output+" = vec4( cross(va,vb), s11 );\n";
//
//        code.setIncludesFromMap(PTextureSample.includes);
//    }

    code.setIncludesFromMap(PTextureSample.includes);
    code.setBody(code_str);

    return code;
}


PTextureSample.getCode = function (params) {
    //output, input, texture_id, texture_type, scope
    var out_var = params.out_var;
    var input = params.input;
    var texture_id = params.texture_id;
    var texture_type = params.texture_type;
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    PTextureSample.includes.TBN = 0;
    var vertex = this.getVertexCode(out_var, input, texture_id, texture_type, scope , order);

    var fragment = this.getFragmentCode(out_var, input, texture_id, texture_type, scope, order);

    return new ShaderCode(vertex, fragment, out_var);
}









var PTime = {};

PTime.id = "time";
PTime.includes = {u_time:1};


PTime.getVertexCode = function () {
    return "";
}

PTime.getFragmentCode = function () {
    return "";
}


PTime.getCode = function (params) {
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var fragment = new CodePiece(order);
    fragment.setIncludesFromMap(PTime.includes);

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode());
    vertex.setIncludesFromMap(PTime.includes);

    return new ShaderCode(vertex, fragment, "u_time");
}
