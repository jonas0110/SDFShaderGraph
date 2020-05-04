//Constant
function LGraphSmooth()
{

    this._ctor(LGraphSmooth.title);
    this.addOutput("result","",{float:1});
    this.addInput("a","", {float:1});
    this.addInput("b","", {float:1});
    this.addInput("k","", {float:1});
    this.options =  this.options || {};
    this.properties.optType = "min";
    this.options.optType = {multichoice:[ 'min','max'], reloadonchange:1}; 
    this.shader_piece = new PSmooth();
}


LGraphSmooth.title = "smooth";
LGraphSmooth.desc = "smooth";
LGraphSmooth.prototype.onExecute = function()
{
    //this.processNodePath();
}
LGraphSmooth.prototype.processInputCode = function(scope)
{
var A = this.getInputCode(0) || LiteGraph.EMPTY_CODE;
var B = this.getInputCode(1) || LiteGraph.EMPTY_CODE;
var K = this.getInputCode(2) || LiteGraph.EMPTY_CODE;
 
    if(A && B && K){
    var output_code = this.codes[0] = this.shader_piece.getCode(
        {
            out_var:"smooth_"+this.id,
            out_type: this.getOutputType(),
            a: A.getOutputVar(),
            b: B.getOutputVar(),
            k: K.getOutputVar(),
            optType:this.properties.optType,
            scope:scope,
            order:this.order
        });
    console.log("this.properties.optType",this.properties.optType);
    output_code.merge(A);
    output_code.merge(B);
    output_code.merge(K);
    }
    else {
        this.codes[0] = LiteGraph.EMPTY_CODE;}
     
}

LGraphSmooth.prototype.getOutputType = function()
{
    var obj = this.output_types ? this.output_types :  this.T_out_types;
    var string_type = LiteGraph.getOtputTypeFromMap(obj);
    return string_type;
}

LiteGraph.registerNodeType("math/"+LGraphSmooth.title , LGraphSmooth);




//Constant
function LGraphSmooth2d()
{

    this._ctor(LGraphSmooth2d.title);
    this.addOutput("result","",{vec2:1});
    this.addInput("a","", {vec2:1});
    this.addInput("b","", {vec2:1});
    this.addInput("k","", {float:1});
    this.options =  this.options || {};
    this.shader_piece = new Psmooth2d();
}


LGraphSmooth2d.title = "smooth2d";
LGraphSmooth2d.desc = "smooth2d";
LGraphSmooth2d.prototype.onExecute = function()
{
    //this.processNodePath();
}
LGraphSmooth2d.prototype.processInputCode = function(scope)
{
var A = this.getInputCode(0) || LiteGraph.EMPTY_CODE;
var B = this.getInputCode(1) || LiteGraph.EMPTY_CODE;
var K = this.getInputCode(2) || LiteGraph.EMPTY_CODE;
 
    if(A && B && K){
    var output_code = this.codes[0] = this.shader_piece.getCode(
        {
            out_var:"smooth2d_"+this.id,
            out_type: this.getOutputType(),
            a: A.getOutputVar(),
            b: B.getOutputVar(),
            k: K.getOutputVar(),
            scope:scope,
            order:this.order
        });
    
    output_code.merge(A);
    output_code.merge(B);
    output_code.merge(K);
    }
    else {
        this.codes[0] = LiteGraph.EMPTY_CODE;}
     
}

LGraphSmooth2d.prototype.getOutputType = function()
{
    var obj = this.output_types ? this.output_types :  this.T_out_types;
    var string_type = LiteGraph.getOtputTypeFromMap(obj);
    return string_type;
}

LiteGraph.registerNodeType("math/"+LGraphSmooth2d.title , LGraphSmooth2d);




function LGraphSdSphere()
{

    this._ctor(LGraphSdSphere.title);
    this.addOutput("result","",{float:1});
    this.addInput("p","", {vec3:1});
    this.addInput("s","", {float:1});
    
    this.options =  this.options || {};
    this.shader_piece = new PsdSphere();
}


LGraphSdSphere.title = "sdSphere";
LGraphSdSphere.desc = "sdSphere";
LGraphSdSphere.prototype.onExecute = function()
{
    //this.processNodePath();
}
LGraphSdSphere.prototype.processInputCode = function(scope)
{
var p = this.getInputCode(0) || LiteGraph.EMPTY_CODE;
var s = this.getInputCode(1) || LiteGraph.EMPTY_CODE;
 
 
    if(p&s){
    var output_code = this.codes[0] = this.shader_piece.getCode(
        {
            out_var:"sdSphere_"+this.id,
            out_type: this.getOutputType(),
            p: p.getOutputVar(),
            s: s.getOutputVar(),
            
            scope:scope,
            order:this.order
        });
    
    output_code.merge(p);
    output_code.merge(s);
    
    }
    else {
        this.codes[0] = LiteGraph.EMPTY_CODE;}
     
}

LGraphSdSphere.prototype.getOutputType = function()
{
    var obj = this.output_types ? this.output_types :  this.T_out_types;
    var string_type = LiteGraph.getOtputTypeFromMap(obj);
    return string_type;
}

LiteGraph.registerNodeType("math/"+LGraphSdSphere.title , LGraphSdSphere);




function LGraphSdEllipsoid()
{

    this._ctor(LGraphSdEllipsoid.title);
    this.addOutput("result","",{float:1});
    this.addInput("p","", {vec3:1});
    this.addInput("r","", {vec3:1});
    
    this.options =  this.options || {};
    this.shader_piece = new PsdSphere();
}


LGraphSdEllipsoid.title = "sdEllipsoid";
LGraphSdEllipsoid.desc = "sdEllipsoid";
LGraphSdEllipsoid.prototype.onExecute = function()
{
    //this.processNodePath();
}
LGraphSdEllipsoid.prototype.processInputCode = function(scope)
{
var p = this.getInputCode(0) || LiteGraph.EMPTY_CODE;
var s = this.getInputCode(1) || LiteGraph.EMPTY_CODE;
 
 
    if(p&s){
    var output_code = this.codes[0] = this.shader_piece.getCode(
        {
            out_var:"sdEllipsoid_"+this.id,
            out_type: this.getOutputType(),
            p: p.getOutputVar(),
            r: r.getOutputVar(),
            
            scope:scope,
            order:this.order
        });
    
    output_code.merge(p);
    output_code.merge(r);
    
    }
    else {
        this.codes[0] = LiteGraph.EMPTY_CODE;}
     
}

LGraphSdEllipsoid.prototype.getOutputType = function()
{
    var obj = this.output_types ? this.output_types :  this.T_out_types;
    var string_type = LiteGraph.getOtputTypeFromMap(obj);
    return string_type;
}

LiteGraph.registerNodeType("math/"+LGraphSdEllipsoid.title , LGraphSdEllipsoid);





function LGraphPopU()
{

    this._ctor(LGraphPopU.title);
    this.addOutput("result","",{vec4:1});
    this.addInput("d1","", {vec4:1});
    this.addInput("d2","", {vec4:1});
    
    this.options =  this.options || {};
    this.shader_piece = new PsdSphere();
}


LGraphPopU.title = "popU";
LGraphPopU.desc = "popU";
LGraphPopU.prototype.onExecute = function()
{
    //this.processNodePath();
}
LGraphPopU.prototype.processInputCode = function(scope)
{
var d1 = this.getInputCode(0) || LiteGraph.EMPTY_CODE;
var d2 = this.getInputCode(1) || LiteGraph.EMPTY_CODE;
 
 
    if(d1&d2){
    var output_code = this.codes[0] = this.shader_piece.getCode(
        {
            out_var:"popU_"+this.id,
            out_type: this.getOutputType(),
            d1: d1.getOutputVar(),
            d2: d2.getOutputVar(),
            
            scope:scope,
            order:this.order
        });
    
    output_code.merge(d1);
    output_code.merge(d2);
    
    }
    else {
        this.codes[0] = LiteGraph.EMPTY_CODE;}
     
}

LGraphPopU.prototype.getOutputType = function()
{
    var obj = this.output_types ? this.output_types :  this.T_out_types;
    var string_type = LiteGraph.getOtputTypeFromMap(obj);
    return string_type;
}

LiteGraph.registerNodeType("math/"+LGraphPopU.title , LGraphPopU);





function LGraphSdStick()
{

    this._ctor(LGraphSdStick.title);
    this.addOutput("result","",{float:1});
    this.addInput("p","", {vec3:1});
    this.addInput("a","", {vec3:1});
    this.addInput("b","", {vec3:1});
    this.addInput("r1","", {float:1});
    this.addInput("r2","", {float:1});
    this.options =  this.options || {};
    this.shader_piece = new PsdSphere();
}


LGraphSdStick.title = "sdStick";
LGraphSdStick.desc = "sdStick";
LGraphSdStick.prototype.onExecute = function()
{
    //this.processNodePath();
}
LGraphSdStick.prototype.processInputCode = function(scope)
{
var p = this.getInputCode(0) || LiteGraph.EMPTY_CODE;
var a = this.getInputCode(1) || LiteGraph.EMPTY_CODE;
var b = this.getInputCode(2) || LiteGraph.EMPTY_CODE;
var r1 = this.getInputCode(3) || LiteGraph.EMPTY_CODE;
var r2 = this.getInputCode(4) || LiteGraph.EMPTY_CODE;

    if(p&a&b&r1&r2){
    var output_code = this.codes[0] = this.shader_piece.getCode(
        {
            out_var:"sdStick_"+this.id,
            out_type: this.getOutputType(),
            p: p.getOutputVar(),
            a: a.getOutputVar(),
            b: b.getOutputVar(),
            r1: r1.getOutputVar(),
            r2: r2.getOutputVar(),
            scope:scope,
            order:this.order
        });
    
    output_code.merge(p);
    output_code.merge(a);
    output_code.merge(b);
    output_code.merge(r1);
    output_code.merge(r2);

    
    }
    else {
        this.codes[0] = LiteGraph.EMPTY_CODE;}
     
}

LGraphSdStick.prototype.getOutputType = function()
{
    var obj = this.output_types ? this.output_types :  this.T_out_types;
    var string_type = LiteGraph.getOtputTypeFromMap(obj);
    return string_type;
}

LiteGraph.registerNodeType("math/"+LGraphSdStick.title , LGraphSdStick);