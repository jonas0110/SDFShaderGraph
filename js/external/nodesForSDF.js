//Constant
function LGraphSmooth()
{

    this._ctor(LGraphSmooth.title);
    this.addOutput("result","",{float:1});
    this.addInput("a","", {float:1});
    this.addInput("b","", {float:1});
    this.addInput("k","", {float:1});
    this.properties.name = "";
    this.options =  this.options || {};
    this.properties.optType = "min";
    this.options.optType = {multichoice:[ 'min','max'], reloadonchange:1}; 
    this.shader_piece = new Psmooth();
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
    this.outputs[0].name = this.properties.name == "" ? "result": this.properties.name
    var output_code = this.codes[0] = this.shader_piece.getCode(
        {
            out_var:this.properties.name == "" ? "smooth_"+this.id: this.properties.name,
            
            out_type: this.getOutputType(),
            a: A.getOutputVar(),
            b: B.getOutputVar(),
            k: K.getOutputVar(),
            optType:this.properties.optType,
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
    this.properties = {name:""};
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
    this.outputs[0].name = this.properties.name == "" ? "result": this.properties.name
    var output_code = this.codes[0] = this.shader_piece.getCode(
        {
            out_var:this.properties.name == "" ? "smooth2d_"+this.id: this.properties.name,
             
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
    this.properties = {name:""};
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
 
 
    if(p&&s){
    this.outputs[0].name = this.properties.name == "" ? "result": this.properties.name
    var output_code = this.codes[0] = this.shader_piece.getCode(
        {
            out_var:this.properties.name == "" ? "sdSphere_"+this.id: this.properties.name,
         
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
    this.properties = {name:""};
    this.options =  this.options || {};
    this.shader_piece = new PsdEllipsoid();
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
var r = this.getInputCode(1) || LiteGraph.EMPTY_CODE;
     
    if(p&&r){
    this.outputs[0].name = this.properties.name == "" ? "result": this.properties.name
    var output_code = this.codes[0] = this.shader_piece.getCode(
        {
            out_var:this.properties.name == "" ? "sdEllipsoid_"+this.id: this.properties.name,
             
            out_type: this.getOutputType(),
            p: p.getOutputVar(),
            r: r.getOutputVar(),
            
            scope:scope,
            order:this.order
        });
   // console.log("cal_output",output_code)
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
    this.properties = {name:""};
    this.options =  this.options || {};
    this.shader_piece = new PopU();
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
 
 
    if(d1&&d2){
    this.outputs[0].name = this.properties.name == "" ? "result": this.properties.name
    var output_code = this.codes[0] = this.shader_piece.getCode(
        {
            out_var:this.properties.name == "" ? "popU_"+this.id: this.properties.name,
           
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
    this.shader_piece = new PsdStick();
    this.properties = {name:""};
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

    if(p&&a&&b&&r1&&r2){
    this.outputs[0].name = this.properties.name == "" ? "result": this.properties.name
    var output_code = this.codes[0] = this.shader_piece.getCode(
        {
            out_var:this.properties.name == "" ? "sdStick_"+this.id: this.properties.name,
            
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



function LGraphSign()
{

    this._ctor(LGraphSign.title);
    this.addOutput("result","",{float:1});
    this.addInput("p","", {float:1});
   
    this.options =  this.options || {};
    this.properties = {name:""};
    this.shader_piece = new PsdSphere();
}


LGraphSign.title = "sign";
LGraphSign.desc = "sign";
LGraphSign.prototype.onExecute = function()
{
    //this.processNodePath();
}
LGraphSign.prototype.processInputCode = function(scope)
{
var p = this.getInputCode(0) || LiteGraph.EMPTY_CODE;
 
    if(p){
    this.outputs[0].name = this.properties.name == "" ? "result": this.properties.name
    var output_code = this.codes[0] = this.shader_piece.getCode(
        {
            out_var:this.properties.name == "" ? "sign_"+this.id: this.properties.name,
            
            out_type: this.getOutputType(),
            p: p.getOutputVar(),
            scope:scope,
            order:this.order
        });
    output_code.merge(p);
    }
    else {
        this.codes[0] = LiteGraph.EMPTY_CODE;}
     
}

LGraphSign.prototype.getOutputType = function()
{
    var obj = this.output_types ? this.output_types :  this.T_out_types;
    var string_type = LiteGraph.getOtputTypeFromMap(obj);
    return string_type;
}

LiteGraph.registerNodeType("math/"+LGraphSign.title , LGraphSign);



function LGraphMat2()
{

    this._ctor(LGraphMat2.title);
    this.addOutput("result","",{float:1});
    this.addInput("r1","", {float:1});
    this.addInput("r2","", {float:1});
    this.addInput("r3","", {float:1});
    this.addInput("r4","", {float:1});
    
    this.options =  this.options || {};
    this.properties = {name:""};
    this.shader_piece = new PsdSphere();
}

LGraphMat2.title = "mat2";
LGraphMat2.desc = "mat2";
LGraphMat2.prototype.onExecute = function()
{
    //this.processNodePath();
}
LGraphMat2.prototype.processInputCode = function(scope)
{
this.outputs[0].name = this.properties.name == "" ? "result": this.properties.name
var r1 = this.getInputCode(0) || LiteGraph.EMPTY_CODE;
var r2 = this.getInputCode(1) || LiteGraph.EMPTY_CODE;
var r3 = this.getInputCode(2) || LiteGraph.EMPTY_CODE;
var r4 = this.getInputCode(3) || LiteGraph.EMPTY_CODE;

    if(r1&&r2&&r3&&r4){
    this.outputs[0].name = this.properties.name == "" ? "result": this.properties.name
    var output_code = this.codes[0] = this.shader_piece.getCode(
        {
            out_var:this.properties.name == "" ? "mat2_"+this.id: this.properties.name,
            out_type: this.getOutputType(),
            r1: r1.getOutputVar(),
            r2: r2.getOutputVar(),
            r3: r3.getOutputVar(),
            r4: r4.getOutputVar(),
            is_global:true,
            scope:scope,
            order:this.order
        });
    output_code.merge(p);
    }
    else {
        this.codes[0] = LiteGraph.EMPTY_CODE;}
     
}

LGraphMat2.prototype.getOutputType = function()
{
    var obj = this.output_types ? this.output_types :  this.T_out_types;
    var string_type = LiteGraph.getOtputTypeFromMap(obj);
    return string_type;
}

LiteGraph.registerNodeType("math/"+LGraphMat2.title , LGraphMat2);


function LGraphPos()
{
     
    this._ctor(LGraphPos.title);
    this.addOutput("result","",{vec3:1});
    this.output_types = {vec3:1};
    
    this.options =  this.options || {};
    this.properties = {name:""};
    this.shader_piece = new PPos();
}

LGraphPos.title = "pos";
LGraphPos.desc = "pos";
LGraphPos.prototype.onExecute = function()
{
    //this.processNodePath();
}
LGraphPos.prototype.processInputCode = function(scope)
{
    this.outputs[0].name = this.properties.name == "" ? "result": this.properties.name
    this.codes[0] = this.shader_piece.getCode(
        {
            
            out_var:this.properties.name == "" ? "pos_"+this.id: this.properties.name,
            out_type: this.getOutputType(),
            scope:scope,
            order:this.order
        });
 
}

LGraphPos.prototype.getOutputType = function()
{
    var obj = this.output_types ? this.output_types :  this.T_out_types;
    var string_type = LiteGraph.getOtputTypeFromMap(obj);
    
    return string_type;
}
LiteGraph.registerNodeType("constants/"+LGraphPos.title , LGraphPos);





function LGraphAtime()
{

    this._ctor(LGraphAtime.title);
    this.addOutput("result","",{float:1});
    this.output_types = {float:1};
   
    this.options =  this.options || {};
    this.shader_piece = new PAtime();
}

LGraphAtime.title = "atime";
LGraphAtime.desc = "atime";
LGraphAtime.prototype.onExecute = function()
{
    //this.processNodePath();
}
LGraphAtime.prototype.processInputCode = function(scope)
{
  
    this.codes[0] = this.shader_piece.getCode(
        {
            out_var:"atime_"+this.id,
            out_type: this.getOutputType(),
            scope:scope,
            order:this.order
        });
 
}

LGraphAtime.prototype.getOutputType = function()
{
    var obj = this.output_types ? this.output_types :  this.T_out_types;
    var string_type = LiteGraph.getOtputTypeFromMap(obj);
    return string_type;
}
LiteGraph.registerNodeType("constants/"+LGraphAtime.title , LGraphAtime);