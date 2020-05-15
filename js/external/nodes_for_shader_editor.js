
function LGraph1ParamNode()
{
    this.addOutput("result","", this.getOutputTypes(), this.getOutputExtraInfo() );
    this.addInput("A","", this.getInputTypes(), this.getInputExtraInfo());
    this.shader_piece = LiteGraph.CodeLib[this.getCodeName()]; // hardcoded for testing

}

LGraph1ParamNode.prototype.constructor = LGraph1ParamNode;


LGraph1ParamNode.prototype.onExecute = function()
{
    //this.processNodePath();
}

//LGraph1ParamNode.prototype.processNodePath = function()
//{
//    var input = this.getInputNodePath(0);
//    this.insertIntoPath(input);
//    this.node_path[0] = input;
//}


LGraph1ParamNode.prototype.processInputCode = function(scope, priority_modifier)
{

    var code_A = this.getInputCode(0); // normal

    if(code_A){
        // (output, incident, normal)
        var output_code = this.codes[0] = this.shader_piece.getCode(
            { out_var:this.getCodeName() + "_" + this.id,
                a:code_A.getOutputVar(),
                scope:scope,
                out_type:this.getOutputType(),
                order:this.order
            }
        ); // output var must be fragment
        output_code.merge(code_A);
    }

}

LGraph1ParamNode.prototype.getOutputType = function()
{
    var obj = this.output_types ? this.output_types :  this.T_out_types;
    var string_type = LiteGraph.getOtputTypeFromMap(obj);
    return string_type;
}


LGraph1ParamNode.prototype.getOutputTypes = function()
{
    return this.output_types ? this.output_types :  this.T_out_types;
}

LGraph1ParamNode.prototype.getInputTypes = function()
{
    return this.intput_types ? this.intput_types :  this.T_in_types;
}

LGraph1ParamNode.prototype.getScope = function()
{
    return CodePiece.FRAGMENT; // TODO need to really check the scope
}

LGraph1ParamNode.prototype.getCodeName = function()
{
    return this.code_name;
}

LGraph1ParamNode.prototype.getInputExtraInfo = function()
{
    return this.in_extra_info;
}

LGraph1ParamNode.prototype.getOutputExtraInfo = function()
{
    return this.out_extra_info;
}

//LiteGraph.registerNodeType("texture/reflect", LGraphReflect);



function LGraph2ParamNode()
{
    this.addOutput("Result","", this.getOutputTypes(), this.getOutputExtraInfo() );
    this.addInput("A","", this.getInputTypesA(), this.getInputExtraInfoA());
    this.addInput("B","", this.getInputTypesB(), this.getInputExtraInfoB());
    this.shader_piece = LiteGraph.CodeLib[this.getCodeName()];


}

LGraph2ParamNode.prototype.constructor = LGraph2ParamNode;


LGraph2ParamNode.prototype.onExecute = function()
{
    //this.processNodePath();
}

//LGraph2ParamNode.prototype.processNodePath = function()
//{
//    var input1 = this.getInputNodePath(0);
//    var input2 = this.getInputNodePath(1);
//    this.mergePaths(input1,input2);
//    this.insertIntoPath(input1);
//    this.node_path[0] = input1;
//}


LGraph2ParamNode.prototype.processInputCode = function(scope)
{
    var output_code = LiteGraph.EMPTY_CODE;

    var code_A = this.getInputCode(0) || this.onGetNullCode(0, scope);
    var code_B = this.getInputCode(1) || this.onGetNullCode(1 , scope);
    if(code_A && code_B){
        // (out_var, a, b, c, scope, out_type)
        output_code = this.codes[0] = this.shader_piece.getCode(
            { out_var:this.getCodeName() + "_" + this.id,
            a:code_A.getOutputVar(),
            b:code_B.getOutputVar(),
            scope:scope,
            out_type:this.getOutputType(),
            order:this.order
            }); // output var must be fragment
        // if the alpha is an input, otherwise hardcoded
        output_code.merge(code_A);
        output_code.merge(code_B);
    }

}

LGraph2ParamNode.prototype.getOutputTypes = function()
{
    return this.output_types ? this.output_types :  this.T_out_types;
}

LGraph2ParamNode.prototype.getInputTypesA = function()
{
    return this.intput_typesA ? this.intput_typesA :  this.T_in_types;
}

LGraph2ParamNode.prototype.getInputTypesB = function()
{
    return this.intput_typesB ? this.intput_typesB :  this.T_in_types;
}


LGraph2ParamNode.prototype.getOutputType = function()
{
    var obj = this.output_types ? this.output_types :  this.T_out_types;
    var string_type = LiteGraph.getOtputTypeFromMap(obj);
    return string_type;
}

LGraph2ParamNode.prototype.getScope = function()
{
    return CodePiece.FRAGMENT; // TODO need to really check the scope
}

LGraph2ParamNode.prototype.getCodeName = function()
{
    return this.code_name;
}

LGraph2ParamNode.prototype.getInputExtraInfoA = function()
{
    return this.in_extra_infoA;
}

LGraph2ParamNode.prototype.getInputExtraInfoB = function()
{
    return this.in_extra_infoB;
}


LGraph2ParamNode.prototype.getOutputExtraInfo = function()
{
    return this.out_extra_info;
}


//LiteGraph.registerNodeType("texture/reflect", LGraphReflect);





function LGraph3ParamNode()
{
    this.addOutput("Result","", this.getOutputTypes(), this.getOutputExtraInfo() );
    this.addInput("A","", this.getInputTypesA(), this.getInputExtraInfoA());
    this.addInput("B","", this.getInputTypesB(), this.getInputExtraInfoB());
    this.addInput("C","", this.getInputTypesC(), this.getInputExtraInfoC());
    this.shader_piece = LiteGraph.CodeLib[this.getCodeName()]; // hardcoded for testing

}

LGraph3ParamNode.prototype.constructor = LGraph3ParamNode;

LGraph3ParamNode.prototype.onExecute = function()
{
    //this.processNodePath();
}

LGraph3ParamNode.prototype.processInputCode = function(scope)
{

    var output_code = LiteGraph.EMPTY_CODE;

    var code_A = this.getInputCode(0) || this.onGetNullCode(0, scope);
    var code_B = this.getInputCode(1) || this.onGetNullCode(1, scope);
    var code_C = this.getInputCode(2) || this.onGetNullCode(2, scope);
    if(code_A && code_B && code_C){
        // (out_var, a, b, c, scope, out_type)

        output_code = this.codes[0] = this.shader_piece.getCode(
                { out_var:this.getCodeName() + "_" + this.id,
                    a:code_A.getOutputVar(),
                    b:code_B.getOutputVar(),
                    c:code_C.getOutputVar(),
                    scope:scope,
                    out_type:this.getOutputType(),
                    order:this.order
                }); // output var must be fragment
        // if the alpha is an input, otherwise hardcoded
        // we need to set the order into the code so the lines set up correctly
        output_code.setOrder(this.order);

        if(code_C){
            output_code.merge(code_C);
        }
        output_code.merge(code_A);
        output_code.merge(code_B);
    }


}

//LGraph3ParamNode.prototype.processNodePath = function()
//{
//    var input1 = this.getInputNodePath(0);
//    var input2 = this.getInputNodePath(1);
//    var input3 = this.getInputNodePath(2);
//    this.mergePaths(input1,input2);
//    this.mergePaths(input1,input3);
//    this.insertIntoPath(input1);
//
//    this.node_path[0] = input1;
//
//}


LGraph3ParamNode.prototype.getOutputTypes = function()
{
    return this.output_types ? this.output_types :  this.T_out_types;
}

LGraph3ParamNode.prototype.getInputTypesA = function()
{
    return this.intput_typesA ? this.intput_typesA :  this.T_in_types;
}

LGraph3ParamNode.prototype.getInputTypesB = function()
{
    return this.intput_typesB ? this.intput_typesB :  this.T_in_types;
}

LGraph3ParamNode.prototype.getInputTypesC = function()
{
    return this.intput_typesC ? this.intput_typesC :  this.T_in_types;
}

LGraph3ParamNode.prototype.getOutputType = function()
{
    var obj = this.output_types ? this.output_types :  this.T_out_types;
    var string_type = LiteGraph.getOtputTypeFromMap(obj);
    return string_type;
}

LGraph3ParamNode.prototype.getScope = function()
{
    return CodePiece.FRAGMENT; // TODO need to really check the scope
}

LGraph3ParamNode.prototype.getCodeName = function()
{
    return this.code_name;
}

LGraph3ParamNode.prototype.getInputExtraInfoA = function()
{
    return this.in_extra_infoA;
}

LGraph3ParamNode.prototype.getInputExtraInfoB = function()
{
    return this.in_extra_infoB;
}

LGraph3ParamNode.prototype.getInputExtraInfoC = function()
{
    return this.in_extra_infoC;
}

LGraph3ParamNode.prototype.getOutputExtraInfo = function()
{
    return this.out_extra_info;
}


//LiteGraph.registerNodeType("texture/reflect", LGraphReflect);




//Constant
function LGraphConstColor()
{
    this.addOutput("color","vec4", {vec4:1});
    this.properties = { color:"#ffffff"};
    this.editable = { property:"value", type:"vec4" };
    this.options =  this.options || {};
    this.options.is_global = {hidden:false};
    this.boxcolor = this.properties.color;
    this.shader_piece = new PConstant("vec4"); // hardcoded for testing
    this.global_var = {name:"vec4_"+this.id, value: this.properties , getValue:function(){return LiteGraph.hexToColor(this.value["color"], true)}};
}

LGraphConstColor.title = "Color";
LGraphConstColor.desc = "Constant color";


LGraphConstColor.prototype.onDrawBackground = function(ctx)
{
    this.bgcolor = this.properties.color;
}


LGraphConstColor.prototype.onExecute = function()
{
    //this.processNodePath();
    //this.bgcolor = this.properties.color;
}

//LGraphConstColor.prototype.processNodePath = function()
//{
//    var input = {};
//    this.insertIntoPath(input);
//    this.node_path[0] = input;
//
//}

LGraphConstColor.prototype.processInputCode = function(scope)
{
    this.codes[0] = this.shader_piece.getCode(
        { out_var:"vec4_"+this.id,
            a:LiteGraph.hexToColor(this.properties["color"]),
            is_global:this.properties.is_global,
            scope:scope,
            order:this.order
        }); // need to check scope

}

LGraphConstColor.prototype.callbackIsGlobal = function(  )
{
    this.options.global_name.hidden = !this.properties.is_global
    this.setGlobalColor();
    if(this.id in this.graph.globals)
        delete this.graph.globals[this.id];
    else{
        this.graph.globals[this.id] = {name:"vec4_"+this.id, value: this.properties , getValue:function(){return LiteGraph.hexToColor(this.value["color"], true)}};
    }


}

LiteGraph.registerNodeType("constants/"+LGraphConstColor.title, LGraphConstColor);



//Constant
function LGraphConstant()
{
    this.addOutput("value","float", {float:1});
    this.properties = { value:1.0 };
    this.options =  this.options || {};
    this.options.is_global = {hidden:false};

    this.editable = { property:"value", type:"float" };
    this.shader_piece = new PConstant("float"); // hardcoded for testing
}

LGraphConstant.title = "Number";
LGraphConstant.desc = "Constant value";


LGraphConstant.prototype.setValue = function(v)
{
    if( typeof(v) == "string") v = parseFloat(v);
    this.properties["value"] = v;
    this.setDirtyCanvas(true);
};

LGraphConstant.prototype.onExecute = function()
{
//    this.processNodePath();

    this.setOutputData(0, parseFloat( this.properties["value"] ) );
}

//LGraphConstant.prototype.processNodePath = function()
//{
//    var input = {};
//    this.insertIntoPath(input);
//    this.node_path[0] = input;
//}

LGraphConstant.prototype.processInputCode = function(scope)
{
    this.codes[0] = this.shader_piece.getCode(
        { out_var:"float_"+this.id,
            a:this.properties["value"].toFixed(3),
            is_global:this.properties.is_global,
            scope:scope,
            order:this.order
        }); // need to check scope

}

LGraphConstant.prototype.onDrawBackground = function(ctx)
{
    //show the current value
    this.outputs[0].label = this.properties["value"].toFixed(3);
}

LGraphConstant.prototype.onWidget = function(e,widget)
{
    if(widget.name == "value")
        this.setValue(widget.value);
}

LGraphConstant.prototype.callbackIsGlobal = function(  )
{
    this.options.global_name.hidden = !this.properties.is_global;
    this.setGlobalColor();
    if(this.id in this.graph.globals)
        delete this.graph.globals[this.id];
    else{
        this.graph.globals[this.id] = {name:"float_"+this.id, value: this.properties , getValue:function(){return this.value.value}};
    }


}

LiteGraph.registerNodeType("constants/"+LGraphConstant.title, LGraphConstant);



//Constant
function LGraphFrameTime()
{
    this.addOutput("time","float", {float:1});

    this.shader_piece = PFrameTime;
}

LGraphFrameTime.title = "FrameTime";
LGraphFrameTime.desc = "Time between frames";


LGraphFrameTime.prototype.onExecute = function()
{
//    this.processNodePath();
}
//
//LGraphFrameTime.prototype.processNodePath = function()
//{
//    var input = {};
//    this.insertIntoPath(input);
//    this.node_path[0] = input;
//}

LGraphFrameTime.prototype.processInputCode = function(scope)
{
    this.codes[0] = this.shader_piece.getCode({order:this.order, scope:scope}); // need to check scope
}

LiteGraph.registerNodeType("constants/"+LGraphFrameTime.title , LGraphFrameTime);



//Constant
function LGraphTime()
{
    this.addOutput("time","float", {float:1});

    this.shader_piece = PTime; // hardcoded for testing
}

LGraphTime.title = "Time";
LGraphTime.desc = "Time since execution started";


LGraphTime.prototype.onExecute = function()
{
//    this.processNodePath();
}
//
//LGraphTime.prototype.processNodePath = function()
//{
//    var input = {};
//    this.insertIntoPath(input);
//    this.node_path[0] = input;
//}

LGraphTime.prototype.processInputCode = function(scope)
{
    this.codes[0] = this.shader_piece.getCode({order:this.order, scope:scope}); // need to check scope
}

LiteGraph.registerNodeType("constants/"+LGraphTime.title , LGraphTime);



//Constant
function LGraphConstVec2()
{
    this.addOutput("value","vec2", {vec2:1});
    this.properties = { v1:1.0,
                        v2:1.0 };
    this.options =  this.options || {};
    this.options.is_global = {hidden:false};
    //this.editable = { property:"value", type:"vec2" };
    this.size = [115,20];
    this.shader_piece = new PConstant("vec2"); // hardcoded for testing
}

LGraphConstVec2.title = "ConstVec2";
LGraphConstVec2.desc = "Constant vector2";

// repeated function should refactor
LGraphConstVec2.prototype.setFloatValue = function(old_value,new_value) {
    if( typeof(new_value) == "string") new_value = parseFloat(new_value);
    old_value = new_value;
}

LGraphConstVec2.prototype.setValue = function(v1,v2)
{
    this.setFloatValue(this.properties["v1"],v1);
    this.setFloatValue(this.properties["v2"],v2);
    this.setDirtyCanvas(true);
};

LGraphConstVec2.prototype.onExecute = function()
{
    //    this.processNodePath();
}
//
//LGraphConstVec2.prototype.processNodePath = function()
//{
//    var input = {};
//    this.insertIntoPath(input);
//    this.node_path[0] = input;
//}

LGraphConstVec2.prototype.processInputCode = function(scope)
{
    this.codes[0] = this.shader_piece.getCode(
        { out_var:"vec2_"+this.id,
            is_global:this.properties.is_global,
        a:this.valueToString(),
        scope:scope,
        order:this.order
    });
}

LGraphConstVec2.prototype.onDrawBackground = function(ctx)
{
    //show the current value
    this.outputs[0].label = this.valueToString();
}

LGraphConstVec2.prototype.valueToString = function()
{
    return "vec2("+this.properties["v1"].toFixed(3)+","+this.properties["v2"].toFixed(3)+")";
}


LGraphConstVec2.prototype.callbackIsGlobal = function(  )
{
    this.options.global_name.hidden = !this.properties.is_global;
    this.setGlobalColor();
    if(this.id in this.graph.globals)
        delete this.graph.globals[this.id];
    else{
        this.graph.globals[this.id] = {name:"vec2_"+this.id, value: this.properties , getValue:function(){return [this.value.v1,this.value.v2]}};
    }


}

LiteGraph.registerNodeType("constants/"+LGraphConstVec2.title, LGraphConstVec2);



//Constant
function LGraphConstVec3()
{
    this.addOutput("value","vec3", {vec3:1});
    this.properties = { v1:1.0,
                        v2:1.0,
                        v3:1.0};
    this.options =  this.options || {};
    this.options.is_global = {hidden:false};
    this.editable = { property:"value", type:"vec3" };
    this.size = [147,20];
    this.shader_piece = new PConstant("vec3"); // hardcoded for testing
}

LGraphConstVec3.title = "ConstVec3";
LGraphConstVec3.desc = "Constant vector3";

// repeated function should refactor
LGraphConstVec3.prototype.setFloatValue = function(old_value,new_value) {
    if( typeof(new_value) == "string") new_value = parseFloat(new_value);
    old_value = new_value;
}

LGraphConstVec3.prototype.setValue = function(v1,v2,v3)
{
    this.setFloatValue(this.properties["v1"],v1);
    this.setFloatValue(this.properties["v2"],v2);
    this.setFloatValue(this.properties["v3"],v3);
    this.setDirtyCanvas(true);
};

LGraphConstVec3.prototype.onExecute = function()
{
    //this.processNodePath();
}

//LGraphConstVec3.prototype.processNodePath = function()
//{
//    var input = {};
//    this.insertIntoPath(input);
//    this.node_path[0] = input;
//
//}

LGraphConstVec3.prototype.processInputCode = function(scope)
{
    this.codes[0] = this.shader_piece.getCode(
        { out_var:"vec3_"+this.id,
            is_global:this.properties.is_global,
        a:this.valueToString(),
        scope:scope,
        order:this.order
        });
}

LGraphConstVec3.prototype.onDrawBackground = function(ctx)
{
    //show the current value
    this.outputs[0].label = this.valueToString();
}

LGraphConstVec3.prototype.valueToString = function()
{
    return "vec3("+this.properties["v1"].toFixed(3)+","+this.properties["v2"].toFixed(3)+","+this.properties["v3"].toFixed(3)+")";
}

LGraphConstVec3.prototype.callbackIsGlobal = function(  )
{
    this.options.global_name.hidden = !this.properties.is_global;
    this.setGlobalColor();
    if(this.id in this.graph.globals)
        delete this.graph.globals[this.id];
    else{
        this.graph.globals[this.id] = {name:"vec3_"+this.id, value: this.properties , getValue:function(){return [this.value.v1,this.value.v2,this.value.v3]}};
    }


}

LiteGraph.registerNodeType("constants/"+LGraphConstVec3.title, LGraphConstVec3);



//Constant
function LGraphConstVec4()
{
    this.addOutput("value","vec4", {vec4:1});
    this.properties = { v1:1.0,
                        v2:1.0,
                        v3:1.0,
                        v4:1.0};
    this.options =  this.options || {};
    this.options.is_global = {hidden:false};

    this.editable = { property:"value", type:"vec4" };

    this.shader_piece = new PConstant("vec4");
    this.size = [181,20];
}

LGraphConstVec4.title = "ConstVec4";
LGraphConstVec4.desc = "Constant vector4";


// repeated function should refactor
LGraphConstVec4.prototype.setFloatValue = function(old_value,new_value) {
    if( typeof(new_value) == "string") new_value = parseFloat(new_value);
    old_value = new_value;
}

LGraphConstVec4.prototype.setValue = function(v1,v2,v3,v4)
{
    this.setFloatValue(this.properties["v1"],v1);
    this.setFloatValue(this.properties["v2"],v2);
    this.setFloatValue(this.properties["v3"],v3);
    this.setFloatValue(this.properties["v4"],v4);
    this.setDirtyCanvas(true);
};

//LGraphConstVec4.prototype.processNodePath = function()
//{
//    var input = {};
//    this.insertIntoPath(input);
//    this.node_path[0] = input;
//}

LGraphConstVec4.prototype.processInputCode = function(scope)
{
    this.codes[0] = this.shader_piece.getCode(
        { out_var:"vec4_"+this.id,
        is_global:this.properties.is_global,
        a:this.valueToString(),
        scope:scope,
        order:this.order
    });

}

LGraphConstVec4.prototype.onExecute = function()
{
    this.processNodePath();
}

LGraphConstVec4.prototype.onDrawBackground = function(ctx)
{
    //show the current value
    this.outputs[0].label = this.valueToString();
}

LGraphConstVec4.prototype.valueToString = function()
{
    return "vec4("+this.properties["v1"].toFixed(3)+","+this.properties["v2"].toFixed(3)+","+this.properties["v3"].toFixed(3)+","+this.properties["v4"].toFixed(3)+")";
}

LGraphConstVec4.prototype.callbackIsGlobal = function(  )
{

    this.options.global_name.hidden = !this.properties.is_global;

    this.setGlobalColor();
    if(this.id in this.graph.globals)
        delete this.graph.globals[this.id];
    else{
        this.graph.globals[this.id] = {name:"vec4_"+this.id, value: this.properties , getValue:function(){return [this.value.v1,this.value.v2,this.value.v3,this.value.v4]}};
    }


}


LiteGraph.registerNodeType("constants/"+LGraphConstVec4.title, LGraphConstVec4);


//UVS
function LGraphCamToPixelWS()
{
    this.addOutput("Camera To Pixel","vec3", {vec3:1});
    this.shader_piece = PCameraToPixelWS; // hardcoded for testing
}

LGraphCamToPixelWS.title = "CameraToPixelWS";
LGraphCamToPixelWS.desc = "The vector from camera to pixel";

LGraphCamToPixelWS.prototype.onExecute = function()
{

}

LGraphCamToPixelWS.prototype.processInputCode = function(scope)
{
    this.codes[0] = this.shader_piece.getCode({order:this.order,
        scope:scope
    }); // I need to check texture id
}

LiteGraph.registerNodeType("coordinates/"+ LGraphCamToPixelWS.title , LGraphCamToPixelWS);




function LGraphDepth()
{
    this.addOutput("float","float", {float:1});

    this.shader_piece = PDepth; // hardcoded for testing
}

LGraphDepth.title = "Depth";
LGraphDepth.desc = "Depth of the pixel";

LGraphDepth.prototype.onExecute = function()
{
    //this.processNodePath();
}

//LGraphDepth.prototype.processNodePath = function()
//{
//    var input = {};
//    this.insertIntoPath(input);
//    this.node_path[0] = input;
//}

LGraphDepth.prototype.processInputCode = function()
{
    this.codes[0] = this.shader_piece.getCode({order:this.order}); // I need to check texture id
}

LiteGraph.registerNodeType("coordinates/"+LGraphDepth.title, LGraphDepth);




//UVS
function LGraphPixelNormalWS()
{
    this.addOutput("Pixel Normal","vec3", {vec3:1});


    this.shader_piece = PPixelNormalWS; // hardcoded for testing
}

LGraphPixelNormalWS.title = "PixelNormalWS";
LGraphPixelNormalWS.desc = "The normal in world space";

LGraphPixelNormalWS.prototype.onExecute = function()
{

}

LGraphPixelNormalWS.prototype.processInputCode = function(scope)
{
    this.codes[0] = this.shader_piece.getCode({order:this.order,
        scope:scope
    }); // I need to check texture id
}

LiteGraph.registerNodeType("coordinates/"+LGraphPixelNormalWS.title, LGraphPixelNormalWS);



//UVS
function LGraphUVs()
{
    this.addOutput("UVs","vec2", {vec2:1});

    this.properties = { UTiling:1.0,
                        VTiling:1.0 };
    this.options =  this.options || {};
    this.options = {    UTiling:{ step:0.01},
                        VTiling:{step:0.01}
    };
    this.shader_piece = PUVs; // hardcoded for testing
}

LGraphUVs.title = "TextureCoords";
LGraphUVs.desc = "Texture coordinates";

LGraphUVs.prototype.onExecute = function()
{
    //this.processNodePath();
}

//LGraphUVs.prototype.processNodePath = function()
//{
//    var input = {};
//    this.insertIntoPath(input);
//    this.node_path[0] = input;
//}

LGraphUVs.prototype.processInputCode = function(scope)
{
    this.codes[0] = this.shader_piece.getCode({order:this.order,
                                                utiling:this.properties.UTiling.toFixed(3),
                                                vtiling:this.properties.VTiling.toFixed(3),
                                                out_var:"uvs_"+this.id,
                                                scope:scope
                                                }); // I need to check texture id
}

LGraphUVs.prototype.setFloatValue = function(old_value,new_value) {
    if( typeof(new_value) == "string") new_value = parseFloat(new_value);
    old_value = new_value;
}

LGraphUVs.prototype.setValue = function(v1,v2)
{
    this.setFloatValue(this.properties["UTiling"],v1);
    this.setFloatValue(this.properties["VTiling"],v2);
};

LiteGraph.registerNodeType("coordinates/"+LGraphUVs.title , LGraphUVs);



function LGraphVertexPosWS()
{
    this.addOutput("vec3","vec3", {vec3:1});

    this.shader_piece = PVertexPosWS; // hardcoded for testing
}

LGraphVertexPosWS.title = "VertexPositionWS";
LGraphVertexPosWS.desc = "Vertex position in WS";

LGraphVertexPosWS.prototype.onExecute = function()
{
    //this.processNodePath();
}

//LGraphVertexPosWS.prototype.processNodePath = function()
//{
//    var input = {};
//    this.insertIntoPath(input);
//    this.node_path[0] = input;
//}

LGraphVertexPosWS.prototype.processInputCode = function()
{
    this.codes[0] = this.shader_piece.getCode({order:this.order}); // I need to check texture id
}

LiteGraph.registerNodeType("coordinates/"+LGraphVertexPosWS.title, LGraphVertexPosWS);




/**
 * Created by vik on 21/01/2015.
 */


function LGraphShader()
{
    this.uninstantiable = true;
    this.clonable = false;
    this.addInput("albedo","vec3", {vec3:1, vec4:1});
    this.addInput("normal","vec3", {vec3:1, vec4:1}); // tangent space normal, if written
    this.addInput("emission","vec3", {vec3:1, vec4:1});
    this.addInput("specular","float", {float:1}); // specular power in 0..1 range
    this.addInput("gloss","float", {float:1});
    this.addInput("alpha","float", {float:1});
    this.addInput("alpha clip","float", {float:1});
    this.addInput("refraction","float", {float:1});
    this.addInput("vertex offset","float", {float:1});
    this.addInput("sdfProc","vec4", {vec4:1});
    this.addInput("sdfMaterialProc","vec3", {vec3:1});
    //inputs: ["base color","metallic", "specular", "roughness", "emissive color", "opacity", "opacitiy mask", "normal", "world position offset", "world displacement", "tesselation multiplier", "subsurface color", "ambient occlusion", "refraction"],
//    this.properties = { color:"#ffffff",
//                        gloss:4.0,
//                        displacement_factor:1.0,
//                        light_dir_x: 1.0,
//                        light_dir_y: 1.0,
//                        light_dir_z: 1.0
//    };

//    this.options = {
//        gloss:{step:0.01},
//        displacement_factor:{step:0.01},
//        light_dir_x:{min:-1, max:1, step:0.01},
//        light_dir_y:{min:-1, max:1, step:0.01},
//        light_dir_z:{min:-1, max:1, step:0.01}
//    };

    this.size = [125,250];
    this.shader_piece = ShaderConstructor;
}

LGraphShader.title = "Output";
LGraphShader.desc = "Output Main Node";


LGraphShader.prototype.setValue = function(v)
{

};

LGraphShader.prototype.onExecute = function()
{
    this.processInputCode();

}

LGraphShader.prototype.onDrawBackground = function(ctx)
{
    //show the current value
    //this.outputs[0].label = this.properties["value"].toFixed(3);
}

LGraphShader.prototype.onWidget = function(e,widget)
{

}

LGraphShader.prototype.sortPathByOrder = function (map)
{
    var tupleArray = [];
    for (var key in map) tupleArray.push([key, map[key]]);
    tupleArray.sort(function (a, b) { return a[1].order - b[1].order });
    return tupleArray;
}

LGraphShader.prototype.getFullCode = function(slot, scope, modifier) {
    CodePiece.ORDER_MODIFIER = modifier;
    var path = this.getInputNodePath(slot);
    
    var sorted_map = this.sortPathByOrder(path);
    for(var i = 0; i < sorted_map.length; ++i){
        var node = sorted_map[i][1];
        if (node != this)
            node.processInputCode(scope);
    }
    var code = this.getInputCode(slot) || LiteGraph.EMPTY_CODE; // 0 it's the color
   
    return code;
}

LGraphShader.prototype.processInputCode = function() {

    var color_code = this.getFullCode(0, CodePiece.FRAGMENT, 0);
    var normal_code = this.getFullCode(1, CodePiece.FRAGMENT, 1000);
    if(normal_code.getOutputVar()) normal_code.fragment.setBody("normal = normalize("+normal_code.getOutputVar()+".xyz);\n", -5);
    var emission_code = this.getFullCode(2, CodePiece.FRAGMENT,0);
    var specular_code = this.getFullCode(3, CodePiece.FRAGMENT,0);
    var gloss_code = this.getFullCode(4, CodePiece.FRAGMENT,0);
    var alpha_code = this.getFullCode(5, CodePiece.FRAGMENT,0);
    var alphaclip_code = this.getFullCode(6, CodePiece.FRAGMENT,0);
    var refraction_code = this.getFullCode(7, CodePiece.FRAGMENT,0);
    var world_offset_code = this.getFullCode(8, CodePiece.VERTEX,0);
     
    var sdfProc = this.getFullCode(9, CodePiece.FRAGMENT,0);
    
    var sdfMaterialProc = this.getFullCode(10, CodePiece.FRAGMENT,0);
     
    var shader = this.shader_piece.createShader(this.graph.scene_properties ,color_code,normal_code,emission_code,specular_code,gloss_code,alpha_code,alphaclip_code,refraction_code, world_offset_code,sdfProc,sdfMaterialProc);

    var texture_nodes = this.graph.findNodesByType("texture/"+LGraphTexture.title);// we need to find all the textures used in the graph
    var shader_textures = [];
    var shader_cubemaps = [];
    // we set all the names in one array
    // useful to render nodes
    for(var i = 0; i < texture_nodes.length; ++i){
        shader_textures.push(texture_nodes[i].properties.name);
    }
    texture_nodes = this.graph.findNodesByType("texture/"+LGraphCubemap.title);// we need to find all the textures used in the graph
    for(var i = 0; i < texture_nodes.length; ++i){
        shader_cubemaps.push(texture_nodes[i].properties.name);
    }

    shader.cubemaps = shader_cubemaps;
    shader.textures = shader_textures;
    shader.globals = this.graph.globals;
    this.graph.shader_output = shader;

}



LiteGraph.registerNodeType("core/"+ LGraphShader.title ,LGraphShader);


//Constant
function LGraphCompsToVec()
{
    this.output_array_types = [ "" , "float","vec2", "vec3" , "vec4"];
    this.output_array_index = 0;
    this.addOutput("result","");
    this.addInput("x","", {float:1});
    this.addInput("y","", {float:1});
    this.addInput("z","", {float:1});
    this.addInput("v","", {float:1});

    this.shader_piece = new PConstant("vec4");

}

LGraphCompsToVec.title = "CompsToVec";
LGraphCompsToVec.desc = "Components To Vector";


LGraphCompsToVec.prototype.onExecute = function()
{
    //this.processNodePath();
}

//LGraphCompsToVec.prototype.processNodePath = function()
//{
//    var input1 = this.getInputNodePath(0);
//    var input2 = this.getInputNodePath(1);
//    var input3 = this.getInputNodePath(2);
//    var input4 = this.getInputNodePath(3);
//
//    this.mergePaths(input1,input2);
//    this.mergePaths(input1,input3);
//    this.mergePaths(input1,input4);
//    this.insertIntoPath(input1);
//
//
//    this.node_path[0] = input1;
//
//
//}

LGraphCompsToVec.prototype.processInputCode = function(scope)
{
    var comps = 0;
    var x = this.getInputCode(0) || LiteGraph.EMPTY_CODE;
    comps += x.getOutputVar() ? 1 : 0;
    var y = this.getInputCode(1) || LiteGraph.EMPTY_CODE;
    comps += y.getOutputVar() ? 1 : 0;
    var z = this.getInputCode(2) || LiteGraph.EMPTY_CODE;
    comps += z.getOutputVar() ? 1 : 0;
    var v = this.getInputCode(3) || LiteGraph.EMPTY_CODE;
    comps += v.getOutputVar() ? 1 : 0;
    var type = (comps < 2) ? "float" : "vec"+comps;

    this.shader_piece.setType(type);
    var output_code = this.codes[0] = this.shader_piece.getCode(
        { out_var:type+"_"+this.id,
            a:this.valueToString(type,comps, x.getOutputVar(),y.getOutputVar(),z.getOutputVar(),v.getOutputVar()),
            scope:scope,
            order:this.order
        });
    output_code.merge(x);
    output_code.merge(y);
    output_code.merge(z);
    output_code.merge(v);
}
LGraphCompsToVec.prototype.valueToString = function(type,comps,x,y,z,v)
{
    var comps_str = Array.prototype.slice.call(arguments,2,2+ parseInt(comps));
    var val = comps_str.join(",");
    val = type+"("+val+")";
    return val;
}

LGraphCompsToVec.prototype.onInputDisconnect = function(slot)
{
    this.output_array_index--;
    this.outputs[0].types = {};
    this.outputs[0].types[""+this.output_array_types[this.output_array_index]+""] = 1;
}

LGraphCompsToVec.prototype.onInputConnect = function(o)
{
    this.output_array_index++;
    this.outputs[0].types = {};
    this.outputs[0].types[""+this.output_array_types[this.output_array_index]+""] = 1;
}



LiteGraph.registerNodeType("coordinates/"+LGraphCompsToVec.title , LGraphCompsToVec);


//**************************
function LGraphTexturePreview()
{
    this.addInput("Texture","Texture", {Texture:1, Vec3:1, Vec4:1});
    this.properties = { flipY: false };
    this.size = [LGraphTexture.image_preview_size, LGraphTexture.image_preview_size];
}

LGraphTexturePreview.title = "Preview";
LGraphTexturePreview.desc = "Show a texture in the graph canvas";

LGraphTexturePreview.prototype.onDrawBackground = function(ctx)
{
    if(this.flags.collapsed) return;

    var tex = this.getInputData(0);
    if(!tex) return;

    var tex_canvas = null;

    if(!tex.handle && ctx.webgl)
        tex_canvas = tex;
    else
        tex_canvas = LGraphTexture.generateLowResTexturePreview(tex);

    //render to graph canvas
    ctx.save();
    if(this.properties.flipY)
    {
        ctx.translate(0,this.size[1]);
        ctx.scale(1,-1);
    }
    ctx.drawImage(tex_canvas,0 + LiteGraph.NODE_COLLAPSED_RADIUS * 0.5,0 + LiteGraph.NODE_COLLAPSED_RADIUS * 0.5,this.size[0] - LiteGraph.NODE_COLLAPSED_RADIUS,this.size[1]- LiteGraph.NODE_COLLAPSED_RADIUS);
    ctx.restore();
}

//LiteGraph.registerNodeType("texture/"+LGraphTexturePreview.title, LGraphTexturePreview );
window.LGraphTexturePreview = LGraphTexturePreview;

function LGraphTexture()
{
    this.addOutput("Texture","Texture",{Texture:1});
    this.addOutput("Color","vec4", {vec4:1});
    this.addOutput("R","float", {float:1});
    this.addOutput("G","float", {float:1});
    this.addOutput("B","float", {float:1});
    this.addOutput("A","float", {float:1});
    this.addInput("UVs","vec2", {vec2:1});

    // properties for for dat gui
    this.properties =  this.properties || {};
    this.properties.name = "";
    this.properties.texture_url = "";
    this.properties.texture_type = "Color";
    this.properties.normal_map_type = "Tangent space";


    this.options =  this.options || {};
    this.options.is_global = {hidden:false};
    this.options.texture_url = {hidden:1};
    var that = this;
    this.options.texture_type = {multichoice:[ 'Color', 'Normal map'], reloadonchange:1,
                                 callback: "toggleNormalMap"};
    this.options.normal_map_type = {multichoice:[ 'Tangent space', 'Model space', 'Bump map' ], hidden:1};


    //this.size = [LGraphTexture.image_preview_size, LGraphTexture.image_preview_size];
    this.size = [170,165];
    this.shader_piece = PTextureSample; // hardcoded for testing
    this.uvs_piece = PUVs;
    // default texture
//    if(typeof(gl) != "undefined" && gl.textures["default"]){
//        this.properties.name = "default";
//        this._drop_texture = gl.textures["default"];
//    }
}

LGraphTexture.title = "TextureSample";
LGraphTexture.desc = "textureSample";
LGraphTexture.widgets_info = {"name": { widget:"texture"} };

//REPLACE THIS TO INTEGRATE WITH YOUR FRAMEWORK
LGraphTexture.textures_container = {}; //where to seek for the textures, if not specified it uses gl.textures
LGraphTexture.loadTextureCallback = null; //function in charge of loading textures when not present in the container
LGraphTexture.image_preview_size = 256;

//flags to choose output texture type
LGraphTexture.PASS_THROUGH = 1; //do not apply FX
LGraphTexture.COPY = 2;			//create new texture with the same properties as the origin texture
LGraphTexture.LOW = 3;			//create new texture with low precision (byte)
LGraphTexture.HIGH = 4;			//create new texture with high precision (half-float)
LGraphTexture.REUSE = 5;		//reuse input texture
LGraphTexture.DEFAULT = 2;

LGraphTexture.MODE_VALUES = {
    "pass through": LGraphTexture.PASS_THROUGH,
    "copy": LGraphTexture.COPY,
    "low": LGraphTexture.LOW,
    "high": LGraphTexture.HIGH,
    "reuse": LGraphTexture.REUSE,
    "default": LGraphTexture.DEFAULT
};

LGraphTexture.getTexture = function(name, url, is_cube)
{
    var container =  gl.textures || LGraphTexture.textures_container; // changedo order, otherwise it bugs with the multiple context

    if(!container)
        throw("Cannot load texture, container of textures not found");

    var tex = container[ name ];

    if(!tex && name && name[0] != ":" || tex && tex.width == 1 && tex.height == 1 && tex.texture_type != gl.TEXTURE_CUBE_MAP)
    {
        //texture must be loaded
        if(LGraphTexture.loadTextureCallback)
        {
            var loader = LGraphTexture.loadTextureCallback;
            tex = loader( name, url, is_cube );
            return tex;
        }
        else
        {
            var url = name;
            if(url.substr(0,7) == "http://")
            {
                if(LiteGraph.proxy) //proxy external files
                    url = LiteGraph.proxy + url.substr(7);
            }

            tex = container[ name ] = GL.Texture.fromURL(name, {});
        }
    }

    return tex;
}

//used to compute the appropiate output texture
LGraphTexture.getTargetTexture = function( origin, target, mode )
{
    if(!origin)
        throw("LGraphTexture.getTargetTexture expects a reference texture");

    var tex_type = null;

    switch(mode)
    {
        case LGraphTexture.LOW: tex_type = gl.UNSIGNED_BYTE; break;
        case LGraphTexture.HIGH: tex_type = gl.HIGH_PRECISION_FORMAT; break;
        case LGraphTexture.REUSE: return origin;
        case LGraphTexture.COPY:
        default: tex_type = origin ? origin.type : gl.UNSIGNED_BYTE; break;
    }

    if(!target || target.width != origin.width || target.height != origin.height || target.type != tex_type )
        target = new GL.Texture( origin.width, origin.height, { type: tex_type, format: gl.RGBA, filter: gl.LINEAR });

    return target;
}

LGraphTexture.getNoiseTexture = function()
{
    if(this._noise_texture)
        return this._noise_texture;

    var noise = new Uint8Array(512*512*4);
    for(var i = 0; i < 512*512*4; ++i)
        noise[i] = Math.random() * 255;

    var texture = GL.Texture.fromMemory(512,512,noise,{ format: gl.RGBA, wrap: gl.REPEAT, filter: gl.NEAREST });
    this._noise_texture = texture;
    return texture;
}

LGraphTexture.loadTextureFromFile = function(data, filename, file, callback, gl){

    gl = gl || window.gl;
    if(data)
    {
        var texture = null;
        var no_ext_name = LiteGraph.removeExtension(filename);
        if( typeof(data) == "string" )
            gl.textures[no_ext_name] = texture = GL.Texture.fromURL( data, {}, callback, gl );
        else if( filename.toLowerCase().indexOf(".dds") != -1 )
            texture = GL.Texture.fromDDSInMemory(data, { minFilter:  gl.LINEAR_MIPMAP_LINEAR });
        else
        {
            var blob = new Blob([file]);
            var url = URL.createObjectURL(blob);
            texture = GL.Texture.fromURL( url, {}, callback , gl  );
        }
        texture.name = no_ext_name;
        return texture;
    }

}

LGraphTexture.prototype.toggleNormalMap = function () {
    if(this.properties.texture_type == "Normal map") {
        this.options.normal_map_type.hidden = 0;
    } else  {
        this.options.normal_map_type.hidden = 1;
    }
}


LGraphTexture.prototype.onDropFile = function(data, filename, file, callback, gl)
{
    if(!data)
    {
        this._drop_texture = null;
        this.properties.name = "";
    } else {
        var tex = LGraphTexture.loadTextureFromFile(data, filename, file, LGraphTexture.configTexture, gl);
        if(tex){
            this._drop_texture = tex;
            this._last_tex = this._drop_texture;
            this.properties.name = tex.name;
            this._drop_texture.current_ctx = LiteGraph.current_ctx;
        }
    }
}

LGraphTexture.prototype.getExtraMenuOptions = function(graphcanvas)
{
    var that = this;
    if(!this._drop_texture)
        return;
    return [ {content:"Clear", callback:
        function() {
            that._drop_texture = null;
            that.properties.name = "";
        }
    }];
}

LGraphTexture.prototype.onExecute = function()
{
    //this.processNodePath();

    if(this._drop_texture ){

        if(this._drop_texture.current_ctx != LiteGraph.current_ctx){
            this._drop_texture = LGraphTexture.getTexture( this.properties.name, this.properties.texture_url );
        }
            this.setOutputData(0, this._drop_texture);
            return;
    }

    if(!this.properties.name)
        return;

    var tex = LGraphTexture.getTexture( this.properties.name, this.properties.texture_url );
    if(!tex)
        return;

    this._last_tex = tex;
    this.setOutputData(0, tex);
}

LGraphTexture.prototype.onDrawBackground = function(ctx)
{
    if( this.flags.collapsed || this.size[1] <= 20 )
        return;

    if( this._drop_texture && ctx.webgl )
    {
        ctx.drawImage(this._drop_texture,this.size[1]* 0.05,this.size[1]* 0.2,this.size[0]* 0.75,this.size[1]* 0.75);
        //this._drop_texture.renderQuad(this.pos[0],this.pos[1],this.size[0],this.size[1]);
        return;
    }

    //Different texture? then get it from the GPU
    if(this._last_preview_tex != this._last_tex)
    {
        if(ctx.webgl)
        {
            this._canvas = this._last_tex;
        }
        else if( !this._drop_texture && !this._last_tex.hasOwnProperty("ready")|| this._drop_texture && !this._drop_texture.hasOwnProperty("ready"))
        {
            var tex_canvas = LGraphTexture.generateLowResTexturePreview(this._last_tex);
            if(!tex_canvas)
                return;

            this._last_preview_tex = this._last_tex;
            this._canvas = cloneCanvas(tex_canvas);
        }
    }

    if(!this._canvas)
        return;

    //render to graph canvas
    ctx.save();
    if(!ctx.webgl) //reverse image
    {
        ctx.translate(0,this.size[1]);
        ctx.scale(1,-1);
    }
    ctx.drawImage(this._canvas,this.size[1]* 0.05,this.size[1]* 0.1,this.size[0]* 0.75,this.size[1]* 0.75);
    ctx.restore();
}


//very slow, used at your own risk
LGraphTexture.generateLowResTexturePreview = function(tex)
{
    if(!tex) return null;

    var size = LGraphTexture.image_preview_size;
    var temp_tex = tex;

    //Generate low-level version in the GPU to speed up
    if(tex.width > size || tex.height > size)
    {
        temp_tex = this._preview_temp_tex;
        if(!this._preview_temp_tex)
        {
            temp_tex = new GL.Texture(size,size, { minFilter: gl.NEAREST });
            this._preview_temp_tex = temp_tex;
        }

        //copy
        tex.copyTo(temp_tex);
        tex = temp_tex;
    }

    //create intermediate canvas with lowquality version
    var tex_canvas = this._preview_canvas;
    if(!tex_canvas)
    {
        tex_canvas = createCanvas(size,size);
        this._preview_canvas = tex_canvas;
    }

    if(temp_tex)
        temp_tex.toCanvas(tex_canvas);
    return tex_canvas;
}

//LGraphTexture.prototype.processNodePath = function()
//{
//
//    var input = this.getInputNodePath(0);
//
//    this.insertIntoPath(input);
//
//    this.node_path[1] = input;
//    this.node_path[2] = input;
//    this.node_path[3] = input;
//    this.node_path[4] = input;
//    this.node_path[5] = input;
////    this.node_path[2] = cloned_input.slice(0);
////    this.node_path[3] = cloned_input.slice(0);
////    this.node_path[4] = cloned_input.slice(0);
////    this.node_path[5] = cloned_input.slice(0);
//
//}

LGraphTexture.prototype.processInputCode = function(scope)
{

//    if(this.properties.texture_type == "Normal map") {
//        if (!this.properties.hasOwnProperty("normal_map_type"))
//            this.properties.normal_map_type = "Tangent space";
//    } else
//        delete this.properties.normal_map_type;



    var input_code = this.getInputCode(0) || this.onGetNullCode(0);
    var texture_type = 0;
    if(this.properties.texture_type == "Normal map"  ){
        if(this.properties.normal_map_type == "Tangent space")
            texture_type =  LiteGraph.TANGENT_MAP;
        else if(this.properties.normal_map_type == "Model space")
            texture_type = LiteGraph.NORMAL_MAP;
        else if(this.properties.normal_map_type == "Bump map")
            texture_type = LiteGraph.BUMP_MAP;
    }
    else
        texture_type = LiteGraph.COLOR_MAP;


    if(input_code){
        var texture_name = "u_" + (this.properties.name ? this.properties.name : "default_name") + "_texture"; // TODO check if there is a texture
        var color_output = this.codes[1] = this.shader_piece.getCode(
            {   out_var:"color_"+this.id,
                input:input_code.getOutputVar(),
                texture_id:texture_name,
                texture_type:texture_type,
                scope:scope,
                order:this.order
            });

        color_output.merge(input_code);
        var r_chan = color_output.clone();
        r_chan.output_var = color_output.getOutputVar()+".r";
        this.codes[2] = r_chan;
        var g_chan = color_output.clone();
        g_chan.output_var = color_output.getOutputVar()+".g";
        this.codes[3] = g_chan;
        var b_chan = color_output.clone();
        b_chan.output_var = color_output.getOutputVar()+".b";
        this.codes[4] = b_chan;
        var a_chan = color_output.clone();
        a_chan.output_var = color_output.getOutputVar()+".a";
        this.codes[5] = a_chan;
//        this.codes[3]
//        this.codes[4]
//        this.codes[5]
    } else {
        this.codes[0] = LiteGraph.EMPTY_CODE;
        this.codes[1] = LiteGraph.EMPTY_CODE;
        this.codes[2] = LiteGraph.EMPTY_CODE;
        this.codes[3] = LiteGraph.EMPTY_CODE;
        this.codes[4] = LiteGraph.EMPTY_CODE;
        this.codes[5] = LiteGraph.EMPTY_CODE;
    }

}

LGraphTexture.prototype.onGetNullCode = function(slot)
{
    if(slot == 0) {
        var code = this.uvs_piece.getCode( {order:this.order-1});
        return code;
    }

}

LGraphTexture.loadTextureCallback = function(name, url, is_cube)
{
    is_cube = is_cube || false;
    function callback(tex){
        LGraphTexture.configTexture(tex);
        LiteGraph.dispatchEvent("graphCanvasChange", null, null);
    }
    if(!is_cube)
        tex = gl.textures[ name ] = GL.Texture.fromURL(url, {}, callback);
    else
        tex = gl.textures[ name ] = GL.Texture.cubemapFromURL( url, {temp_color:[80,120,40,255], is_cross:1, minFilter: gl.LINEAR_MIPMAP_LINEAR}, callback);
    return tex;
}

LGraphTexture.configTexture = function(tex)
{
    tex.bind();
    if(GL.isPowerOfTwo(tex.width) && GL.isPowerOfTwo(tex.height)){
        gl.generateMipmap(tex.texture_type);
        tex.has_mipmaps = true;
        tex.minFilter = gl.LINEAR_MIPMAP_LINEAR;
        tex.wrapS = gl.REPEAT;
        tex.wrapT = gl.REPEAT;
    } else {
        tex.minFilter = gl.NEAREST;
        tex.wrapS = gl.CLAMP_TO_EDGE;
        tex.wrapT = gl.CLAMP_TO_EDGE;
    }
    gl.texParameteri(tex.texture_type, gl.TEXTURE_WRAP_S, tex.wrapS );
    gl.texParameteri(tex.texture_type, gl.TEXTURE_WRAP_T, tex.wrapT );
    gl.texParameteri(tex.texture_type, gl.TEXTURE_MIN_FILTER, tex.minFilter );
    gl.bindTexture(tex.texture_type, null); //disable
}


LiteGraph.registerNodeType("texture/"+LGraphTexture.title, LGraphTexture );
window.LGraphTexture = LGraphTexture;



function LGraphCubemap()
{
    this.addOutput("Cubemap","Cubemap");
    this.addOutput("Color","vec4", {vec4:1});
    this.addInput("vec3","vec3", {vec3:1});
    this.properties =  this.properties || {};
    this.properties.name = "";

    this.properties =  this.properties || {};
    this.properties.name = "";
    this.properties.texture_url = "";
    this.options =  this.options || {};
    this.options.is_global = {hidden:false};
    this.options = {    texture_url:{hidden:1}};



    this.size = [LGraphTexture.image_preview_size, LGraphTexture.image_preview_size];

    this.shader_piece = PTextureSampleCube; // hardcoded for testing
    this.vector_piece = new PReflected();
    this.size = [170,165];
}

LGraphCubemap.title = "TextureSampleCube";
LGraphCubemap.desc = "textureSampleCube";

LGraphCubemap.prototype.onDropFile = function(data, filename, file)
{
    if(!data)
    {
        this._drop_texture = null;
        this.properties.name = "";
    }
    else
    {
        var no_ext_name = filename.split('.')[0];
        if( typeof(data) == "string" )
            gl.textures[no_ext_name] = this._drop_texture = GL.Texture.cubemapFromURL(data);
        else
            gl.textures[no_ext_name] =this._drop_texture = GL.Texture.fromDDSInMemory(data);
        this.properties.name = no_ext_name;
    }
}

LGraphCubemap.prototype.onExecute = function()
{

    //this.processNodePath();
    if(this._drop_texture)
    {
        this.setOutputData(0, this._drop_texture);
        return;
    }

    if(!this.properties.name)
        return;

    var tex = LGraphTexture.getTexture( this.properties.name, this.properties.texture_url, true );
    if(!tex)
        return;

    this._last_tex = tex;
    this.setOutputData(0, tex);
}

LGraphCubemap.prototype.onDrawBackground = function(ctx)
{
    //    if( this.flags.collapsed || this.size[1] <= 20)
//        return;
//
//    if(!ctx.webgl)
//        return;
//
//    var cube_mesh = gl.meshes["cube"];
//    if(!cube_mesh)
//        cube_mesh = gl.meshes["cube"] = GL.Mesh.cube({size:1});
//
//    //var view = mat4.lookAt( mat4.create(), [0,0


}

//LGraphCubemap.prototype.processNodePath = function()
//{
//    var input = this.getInputNodePath(0);
//    this.insertIntoPath(input);
//    this.node_path[1] = input;
//    this.node_path[2] = input;
//    this.node_path[3] = input;
//    this.node_path[4] = input;
//    this.node_path[5] = input;
//
//}

LGraphCubemap.prototype.processInputCode = function(scope)
{
    var input_code = this.getInputCode(0) || this.onGetNullCode(0); // get input in link 0
    if(input_code){
        var texture_name = "u_" + (this.properties.name ? this.properties.name : "default_name") + "_texture"; // TODO check if there is a texture
        var color_code = this.codes[1] = this.shader_piece.getCode(
            {   out_var:"color_"+this.id,
                input:input_code.getOutputVar(),
                texture_id:texture_name,
                scope:scope,
                order:this.order
            });
        color_code.merge(input_code);

    } else {
        this.codes[0] = LiteGraph.EMPTY_CODE;
        this.codes[1] = LiteGraph.EMPTY_CODE;
    }

}

LGraphCubemap.prototype.onGetNullCode = function(slot)
{
    if(slot == 0){
        var code = this.vector_piece.getCode({order:this.order-1});
        return code;
    }
}

LiteGraph.registerNodeType("texture/"+LGraphCubemap.title, LGraphCubemap );
window.LGraphCubemap = LGraphCubemap;



//Constant
function LGraphVecToComps()
{
    this.addInput("vec","", {vec4:1,vec3:1,vec2:1});
    this.addOutput("x","", {float:1});
    this.addOutput("y","", {float:1});
    this.addOutput("z","", {float:1});
    this.addOutput("v","", {float:1});

}

LGraphVecToComps.title = "VecToComps";
LGraphVecToComps.desc = "Vector To Components";


LGraphVecToComps.prototype.onExecute = function()
{
    //this.processNodePath();
}

//LGraphVecToComps.prototype.processNodePath = function()
//{
//    var input = this.getInputNodePath(0);
//
//    this.insertIntoPath(input);
//
//    this.node_path[0] = input;
//    this.node_path[1] = input;
//    this.node_path[2] = input;
//    this.node_path[3] = input;
//
//
//
//}

LGraphVecToComps.prototype.processInputCode = function(scope)
{
    var input_code = this.getInputCode(0);

    if(input_code){
        var x_chan = input_code.clone();
        x_chan.output_var = input_code.getOutputVar()+".x";
        this.codes[0] = x_chan;
        var y_chan = input_code.clone();
        y_chan.output_var = input_code.getOutputVar()+".y";
        this.codes[1] = y_chan;
        var z_chan = input_code.clone();
        z_chan.output_var = input_code.getOutputVar()+".z";
        this.codes[2] = z_chan;
        var v_chan = input_code.clone();
        v_chan.output_var = input_code.getOutputVar()+".w";
        this.codes[3] = v_chan;
    }
}
LiteGraph.registerNodeType("coordinates/"+LGraphVecToComps.title , LGraphVecToComps);



//Constant
function LGraphVecToVec()
{
    this.addInput("vec","", null, {types_list: {float:1, vec3:1, vec4:1, vec2:1},  use_t:1});
    this.addOutput("number","float", {float:1});
    this.addOutput("vec2","vec2", {vec2:1});
    this.addOutput("vec3","vec3",  {vec3:1});
    this.addOutput("vec4","vec4", {vec4:1});

    this.shader_piece = new PVecToVec();

}

LGraphVecToVec.title = "VecToVec";
LGraphVecToVec.desc = "VectorX To VectorY";


LGraphVecToVec.prototype.onExecute = function()
{
    //this.processNodePath();
}
//
//LGraphVecToVec.prototype.processNodePath = function()
//{
//    var input1 = this.getInputNodePath(0);
//
//
//    this.insertIntoPath(input1);
//
//
//    this.node_path[0] = input1;
//    this.node_path[1] = input1;
//    this.node_path[2] = input1;
//    this.node_path[3] = input1;
//
//
//}

LGraphVecToVec.prototype.processInputCode = function(scope)
{

    var v = this.getInputCode(0) || LiteGraph.EMPTY_CODE;

    var output_code = this.codes[0] = this.shader_piece.getCode(
        {   out_var:"float_"+this.id,
            out_type:"float",
            in_type:this.getInputType(),
            a: v.getOutputVar(),
            scope:scope,
            order:this.order
        });
    output_code.merge(v);

    output_code = this.codes[1] = this.shader_piece.getCode(
        {   out_var:"vec2_"+this.id,
            out_type:"vec2",
            in_type:this.getInputType(),
            a: v.getOutputVar(),
            scope:scope,
            order:this.order
        });
    output_code.merge(v);

    output_code = this.codes[2] = this.shader_piece.getCode(
        {   out_var:"vec3_"+this.id,
            out_type:"vec3",
            in_type:this.getInputType(),
            a: v.getOutputVar(),
            scope:scope,
            order:this.order
        });
    output_code.merge(v);

    output_code = this.codes[3] = this.shader_piece.getCode(
        {   out_var:"vec4_"+this.id,
            out_type:"vec4",
            in_type:this.getInputType(),
            a: v.getOutputVar(),
            scope:scope,
            order:this.order
        });
    output_code.merge(v);

}


LGraphVecToVec.prototype.getInputType = function()
{
    var obj = this.T_in_types;
    var string_type = LiteGraph.getOtputTypeFromMap(obj);
    return string_type;
}

LiteGraph.registerNodeType("coordinates/"+LGraphVecToVec.title , LGraphVecToVec);





function LGraphAbs()
{
    this._ctor(LGraphAbs.title);

    this.code_name = "abs";
    this.output_types = null;
    this.out_extra_info = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};
    this.intput_types = null;
    this.in_extra_info = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};

    LGraph1ParamNode.call( this);
}

LGraphAbs.prototype = Object.create(LGraph1ParamNode);
LGraphAbs.prototype.constructor = LGraphAbs;

LGraphAbs.title = "Abs";
LGraphAbs.desc = "Abs of input";


LiteGraph.extendClass(LGraphAbs,LGraph1ParamNode);
LiteGraph.registerNodeType("math/"+LGraphAbs.title, LGraphAbs);





function LGraphCos()
{
    this._ctor(LGraphCos.title);

    this.code_name = "cos";
    this.output_types = null;
    this.out_extra_info = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};
    this.intput_types = null;
    this.in_extra_info = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};
    LGraph1ParamNode.call( this);
}

LGraphCos.prototype = Object.create(LGraph1ParamNode); // we inherit from Entity
LGraphCos.prototype.constructor = LGraphCos;

LGraphCos.title = "Cos";
LGraphCos.desc = "cosine of input";


LiteGraph.extendClass(LGraphCos,LGraph1ParamNode);
LiteGraph.registerNodeType("math/"+LGraphCos.title, LGraphCos);





function LGraphExp()
{
    this._ctor(LGraphExp.title);

    this.code_name = "exp2";
    this.output_types = null;
    this.out_extra_info = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};
    this.intput_types = null;
    this.in_extra_info = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};
    LGraph1ParamNode.call( this);
}

LGraphExp.prototype = Object.create(LGraph1ParamNode); // we inherit from Entity

LGraphExp.prototype.constructor = LGraphExp;

LGraphExp.title = "Exp2";
LGraphExp.desc = "Exp of input";


LiteGraph.extendClass(LGraphExp,LGraph1ParamNode);
LiteGraph.registerNodeType("math/"+LGraphExp.title, LGraphExp);





function LGraphFrac()
{
    this._ctor(LGraphFrac.title);
    this.code_name = "fract";
    this.output_types = null;
    this.out_extra_info = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};
    this.intput_types = null;
    this.in_extra_info = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};
    LGraph1ParamNode.call( this);
}

LGraphFrac.prototype = Object.create(LGraph1ParamNode); // we inherit from Entity
LGraphFrac.prototype.constructor = LGraphFrac;

LGraphFrac.title = "Fract";
LGraphFrac.desc = "fract of input";


LiteGraph.extendClass(LGraphFrac,LGraph1ParamNode);
LiteGraph.registerNodeType("math/"+LGraphFrac.title, LGraphFrac);





function LGraphNormnalize()
{
    this._ctor(LGraphNormnalize.title);

    this.code_name = "normalize";
    this.output_types = null;
    this.out_extra_info = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};
    this.intput_types = null;
    this.in_extra_info = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};
    LGraph1ParamNode.call( this);
}

LGraphNormnalize.prototype = Object.create(LGraph1ParamNode); // we inherit from Entity

LGraphNormnalize.prototype.constructor = LGraphNormnalize;

LGraphNormnalize.title = "Normalize";
LGraphNormnalize.desc = "normalize of input";


LiteGraph.extendClass(LGraphNormnalize,LGraph1ParamNode);
LiteGraph.registerNodeType("math/"+LGraphNormnalize.title, LGraphNormnalize);





function LGraphSin()
{
    this._ctor(LGraphSin.title);

    this.code_name = "sin";
    this.output_types = null;
    this.out_extra_info = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};
    this.intput_types = null;
    this.in_extra_info = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};
    LGraph1ParamNode.call( this);
}

LGraphSin.prototype = Object.create(LGraph1ParamNode); // we inherit from Entity

LGraphSin.prototype.constructor = LGraphSin;

LGraphSin.title = "Sin";
LGraphSin.desc = "sine of input";


LiteGraph.extendClass(LGraphSin,LGraph1ParamNode);
LiteGraph.registerNodeType("math/"+LGraphSin.title, LGraphSin);






function LGraphOperation()
{
    this.output_types = this.output_types || null;
    this.out_extra_info = this.out_extra_info || {types_list: {float:1},   use_t:1};
    this.intput_typesA = this.intput_typesA || null;
    this.in_extra_infoA = this.in_extra_infoA || {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1}
    this.intput_typesB = this.intput_typesB || null;
    this.in_extra_infoB = this.in_extra_infoB || {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};
//    this.output_types = {vec2:1, float:1, vec3:1,  vec4:1};
//    this.intput_typesA = {vec2:1, float:1, vec3:1,  vec4:1};
//    this.intput_typesB = {vec2:1, float:1, vec3:1, vec4:1};


    this.number_piece = new PConstant("float"); // hardcoded when the inputs are null
    this.properties = { A:0.0, B:0.0};

    LGraph2ParamNode.call( this);
}
LGraphOperation.prototype = Object.create(LGraph2ParamNode);
LGraphOperation.prototype.constructor = LGraphOperation;



LGraphOperation.prototype.infereTypes = function( output_slot, target_slot, node) {


    var out_types = node.getTypesFromOutputSlot(output_slot);
    if( Object.keys(out_types)[0] == "float")
        return;

    this.connectTemplateSlot();


    var input = this.inputs[target_slot];
    if (input.use_t && Object.keys(this.T_in_types).length === 0) {

        this.T_in_types["float"] = 1; // we hardcode the float as operation always accept float in one of the inputs
        for (var k in out_types)
            this.T_in_types[k] = out_types[k];
        for (var k in out_types)
            this.T_out_types[k] = out_types[k];
    }

}


LGraphOperation.prototype.onGetNullCode = function(slot, scope)
{
    if(slot == 0){
        var code = this.number_piece.getCode(
            {
                out_var:"float_A"+this.id,
                a:this.properties["A"].toFixed(3),
                scope:scope,
                order:this.order-1
            });
        return code;
    } else if(slot == 1){
        var code = this.number_piece.getCode(
            {
                out_var:"float_B"+this.id,
                a:this.properties["B"].toFixed(3),
                scope:scope,
                order:this.order-1
        });
        return code;
    }

}

LGraphOperation.prototype.onDrawBackground = function(ctx)
{
    this.inputs[0].label = "A";
    if(!this.isInputConnected(0))
        this.inputs[0].label += "="+this.properties["A"].toFixed(3);

    this.inputs[1].label = "B";
    if(!this.isInputConnected(1))
        this.inputs[1].label += "="+this.properties["B"].toFixed(3);
}



LiteGraph.extendClass(LGraphOperation,LGraph2ParamNode);







function LGraphAddOp()
{
    this._ctor(LGraphAddOp.title);

    this.code_name = "add";

    LGraphOperation.call( this);
}
LGraphAddOp.prototype = Object.create(LGraphOperation);
LGraphAddOp.prototype.constructor = LGraphAddOp;

LGraphAddOp.title = "Add";
LGraphAddOp.desc = "Add the inputs";



LiteGraph.extendClass(LGraphAddOp,LGraphOperation);
LiteGraph.registerNodeType("math/"+LGraphAddOp.title, LGraphAddOp);





function LGraphClamp()
{
    this._ctor(LGraphClamp.title);

    this.code_name = "clamp";
    this.output_types = null;
    this.out_extra_info = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};
    this.intput_typesA = null;
    this.in_extra_infoA = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1}
    this.intput_typesB = null;
    this.in_extra_infoB = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};
    this.intput_typesC = null;
    this.in_extra_infoC = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};


    this.properties = { min:0.0,
        max:1.5};

    this.number_piece = new PConstant("float");
    LGraph3ParamNode.call( this);
}

LGraphClamp.prototype = Object.create(LGraph3ParamNode); // we inherit from Entity
LGraphClamp.prototype.constructor = LGraphClamp;

LGraphClamp.title = "Clamp";
LGraphClamp.desc = "Clamp of input";



LGraphClamp.prototype.onGetNullCode = function(slot, scope)
{
    if(slot == 1){
        var code = this.number_piece.getCode({
            out_var:"float_"+this.id+""+ slot,
            a:this.properties["min"].toFixed(3),
            scope:scope,
            order:this.order-1
        });
        return code;
    }
    else if(slot == 2){
        var code = this.number_piece.getCode({
            out_var:"float_"+this.id+""+ slot,
            a:this.properties["max"].toFixed(3),
            scope:scope,
            order:this.order-1
        });
        return code;
    }

    return LiteGraph.EMPTY_CODE;

}

LGraphClamp.prototype.onDrawBackground = function(ctx)
{
    //show the current value
    this.inputs[0].label = "x";

    this.inputs[1].label = "min";
    if(!this.isInputConnected(1))
        this.inputs[1].label += "="+this.properties["min"].toFixed(3);
    this.inputs[2].label = "max";
    if(!this.isInputConnected(2))
        this.inputs[2].label += "="+this.properties["max"].toFixed(3);

}

LiteGraph.extendClass(LGraphClamp,LGraph3ParamNode);
LiteGraph.registerNodeType("math/"+LGraphClamp.title, LGraphClamp);






function LGraphDivOp()
{
    this._ctor(LGraphDivOp.title);
    this.code_name = "div";
    LGraphOperation.call( this);
}


LGraphDivOp.title = "Div";
LGraphDivOp.desc = "div the inputs";


//LGraphMulDiv.prototype = Object.create(LGraphOperation); // we inherit from Entity
//LGraphMulDiv.prototype.constructor = LGraphMulDiv;
LiteGraph.extendClass(LGraphDivOp,LGraphOperation);
LiteGraph.registerNodeType("math/"+LGraphDivOp.title, LGraphDivOp);






function LGraphDot()
{
    this._ctor(LGraphDot.title);
    this.code_name = "dot";
    this.output_types = {float:1};
    this.out_extra_info = {};
    LGraphOperation.call( this);


}


LGraphDot.title = "Dot";
LGraphDot.desc = "Dot product the inputs";


LiteGraph.extendClass(LGraphDot,LGraphOperation);
LiteGraph.registerNodeType("math/"+LGraphDot.title, LGraphDot);



//UVS
function LGraphFresnel()
{
    this.addOutput("result","float", {float:1});
    this.addInput("normal","vec3", {vec3:1,vec4:1});
    this.addInput("exp","float", {float:1});

    this.shader_piece = new PFresnel(); // hardcoded for testing

}

LGraphFresnel.title = "Fresnel";
LGraphFresnel.desc = "Fresnel the input";


LGraphFresnel.prototype.onExecute = function()
{
    //this.processNodePath();
}

//LGraphFresnel.prototype.processNodePath = function()
//{
//    var input1 = this.getInputNodePath(0);
//    var input2 = this.getInputNodePath(1);
//    this.mergePaths(input1,input2);
//    this.insertIntoPath(input1);
//    this.node_path[0] = input1;
//}


LGraphFresnel.prototype.processInputCode = function(scope)
{

    var code_normal = this.getInputCode(0) || LiteGraph.EMPTY_CODE;
    var code_exp = this.getInputCode(1) || LiteGraph.EMPTY_CODE;

    //(out_var, input, dx, dy, scope, out_type)

    var output_code = this.codes[0] = this.shader_piece.getCode(
        {
            out_var:"fresnel_"+this.id,
            normal:code_normal.getOutputVar(),
            exp:code_exp.getOutputVar(),
            scope:scope,
            order:this.order
        });

    if(code_normal != LiteGraph.EMPTY_CODE)
        output_code.merge(code_normal);
    output_code.merge(code_exp);


}

//LGraphFresnel.prototype.onGetNullCode = function(slot, scope)
//{
//
//
//}

LiteGraph.registerNodeType("math/"+LGraphFresnel.title, LGraphFresnel);




//Constant
function LGraphIf()
{
    this._ctor(LGraphIf.title);
    this.addOutput("result","", null, {types_list: {float:1, vec3:1, vec4:1, vec2:1},  use_t:1});
    this.addInput("A","float", {float:1,vec4:1,vec3:1,vec2:1});
    this.addInput("B","float", {float:1,vec4:1,vec3:1,vec2:1});
    this.addInput("A>B","", null, {types_list: {float:1, vec3:1, vec4:1, vec2:1},  use_t:1});
    this.addInput("A<B","", null, {types_list: {float:1, vec3:1, vec4:1, vec2:1},  use_t:1});
    this.addInput("A==B","", null, {types_list: {float:1, vec3:1, vec4:1, vec2:1},  use_t:1});

    this.shader_piece = new PIf();
}

LGraphIf.title = "If";
LGraphIf.desc = "if between A and B";


LGraphIf.prototype.onExecute = function()
{
    //this.processNodePath();
}

//LGraphIf.prototype.processNodePath = function()
//{
//    var input1 = this.getInputNodePath(0);
//    var input2 = this.getInputNodePath(1);
//    var input3 = this.getInputNodePath(2);
//    var input4 = this.getInputNodePath(3);
//    var input5 = this.getInputNodePath(4);
//
//    this.mergePaths(input1,input2);
//    this.mergePaths(input1,input3);
//    this.mergePaths(input1,input4);
//    this.mergePaths(input1,input5);
//    this.insertIntoPath(input1);
//
//
//    this.node_path[0] = input1;
//
//
//}

LGraphIf.prototype.processInputCode = function(scope)
{
    var A = this.getInputCode(0) || LiteGraph.EMPTY_CODE;
    var B = this.getInputCode(1) || LiteGraph.EMPTY_CODE;
    var gt = this.getInputCode(2) || LiteGraph.EMPTY_CODE;
    var lt = this.getInputCode(3) || LiteGraph.EMPTY_CODE;
    var eq = this.getInputCode(4) || LiteGraph.EMPTY_CODE;


    A.merge(B);
    var gt_str = A.partialMerge(gt);
    var lt_str = A.partialMerge(lt);
    var eq_str = A.partialMerge(eq);



    var output_code = this.codes[0] = this.shader_piece.getCode(
        {
            out_var:"if_"+this.id,
            out_type: this.getOutputType(),
            a: A.getOutputVar(),
            b: B.getOutputVar(),
            gt_out: gt.getOutputVar(),
            lt_out: lt.getOutputVar(),
            eq_out: eq.getOutputVar(),
            gt: gt_str[scope -1],
            lt: lt_str[scope -1],
            eq: eq_str[scope -1],
            scope:scope,
            order:this.order
        });

    output_code.merge(A);

}

LGraphIf.prototype.getOutputType = function()
{
    var obj = this.output_types ? this.output_types :  this.T_out_types;
    var string_type = LiteGraph.getOtputTypeFromMap(obj);
    return string_type;
}

LiteGraph.registerNodeType("math/"+LGraphIf.title , LGraphIf);





function LGraphMix()
{
    this._ctor(LGraphMix.title);

    this.code_name = "mix";
    this.output_types = null;
    this.out_extra_info = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};
    this.intput_typesA = null;
    this.in_extra_infoA = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1}
    this.intput_typesB = null;
    this.in_extra_infoB = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};
    this.intput_typesC = {float:1};
    //this.in_extra_infoC = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};

    this.properties = { alpha:0.5};
    this.options = { alpha:{min:0, max:1, step:0.01}};
    this.number_piece = new PConstant("float");
    LGraph3ParamNode.call( this);
}

LGraphMix.prototype = Object.create(LGraph3ParamNode); // we inherit from Entity
LGraphMix.prototype.constructor = LGraphMix;

LGraphMix.title = "Mix";
LGraphMix.desc = "mix of input";

LGraphMix.prototype.infereTypes = function( output_slot, target_slot, node) {
    var out_types = node.getTypesFromOutputSlot(output_slot);
    if( target_slot == 2 && Object.keys(out_types)[0] == "float")
        return;
    this.connectTemplateSlot();


    var input = this.inputs[target_slot];
    if (input.use_t && Object.keys(this.T_in_types).length === 0) {

        //this.T_in_types["float"] = 1; // we hardcode the float as operation always accept float in one of the inputs
        for (var k in out_types)
            this.T_in_types[k] = out_types[k];
        for (var k in out_types)
            this.T_out_types[k] = out_types[k];
    }
}

LGraphMix.prototype.disconnectTemplateSlot = function(input_slot){
    if(input_slot == 2 ) return;

    if(this.in_conected_using_T > 0)
        this.in_conected_using_T--;
    this.resetTypes(input_slot);
}

LGraphMix.prototype.onGetNullCode = function(slot, scope)
{
    if(slot == 2){
        var code = this.number_piece.getCode(
            { out_var:"float_"+this.id,
            a:this.properties["alpha"].toFixed(3),
            scope:scope,
            order:this.order-1
        });
        return code; // need to check scope;
    }

}

LGraphMix.prototype.onDrawBackground = function(ctx)
{
    //show the current value
    this.inputs[2].label = "alpha";
    if(!this.isInputConnected(2))
        this.inputs[2].label += "="+this.properties["alpha"].toFixed(3);
}

LiteGraph.extendClass(LGraphMix,LGraph3ParamNode);
LiteGraph.registerNodeType("math/"+LGraphMix.title, LGraphMix);






function LGraphMulOp()
{
    this._ctor(LGraphMulOp.title);
    this.code_name = "mul";
    LGraphOperation.call( this);
}


LGraphMulOp.title = "Mul";
LGraphMulOp.desc = "Mul the inputs";


//LGraphMulOp.prototype = Object.create(LGraphOperation); // we inherit from Entity
//LGraphMulOp.prototype.constructor = LGraphMulOp;
LiteGraph.extendClass(LGraphMulOp,LGraphOperation);
LiteGraph.registerNodeType("math/"+LGraphMulOp.title, LGraphMulOp);



//UVS
function LGraphPanner()
{
    this.addOutput("output","", {vec2:1});
    this.addInput("coordinate","", {vec2:1});
    this.addInput("time","", {float:1});
    this.properties = { SpeedX:1.0,
        SpeedY:1.0 };
    this.options =  this.options || {};
    this.options = {    SpeedX:{min:-1.0, max:1.0, step:0.001},
        SpeedY:{min:-1.0, max:1.0, step:0.001}
    };
    this.shader_piece = new PPanner(); // hardcoded for testing
    this.uvs_piece = PUVs;
}

LGraphPanner.title = "Panner";
LGraphPanner.desc = "Moves the input";


LGraphPanner.prototype.onExecute = function()
{
   // this.processNodePath();
}

//LGraphPanner.prototype.processNodePath = function()
//{
//    var input1 = this.getInputNodePath(0);
//    var input2 = this.getInputNodePath(1);
//    this.mergePaths(input1,input2);
//    this.insertIntoPath(input1);
//    this.node_path[0] = input1;
//}


LGraphPanner.prototype.processInputCode = function(scope)
{

    var code_input = this.getInputCode(0) || this.onGetNullCode(0, scope);
    var code_time = this.getInputCode(1) || LiteGraph.EMPTY_CODE;

    //(out_var, input, dx, dy, scope, out_type)

    var output_code = this.codes[0] = this.shader_piece.getCode(
        { out_var:"panner_"+this.id,
        input:code_input.getOutputVar(),
        time:code_time.getOutputVar(),
        dx:this.properties.SpeedX.toFixed(3),
        dy:this.properties.SpeedY.toFixed(3),
        scope:scope,
        out_type:"vec2",
        order:this.order
        });

    if(code_time != LiteGraph.EMPTY_CODE)
        output_code.merge(code_time);
    output_code.merge(code_input);


}

LGraphPanner.prototype.onGetNullCode = function(slot, scope)
{
    if(slot == 0){
        var code = this.uvs_piece.getCode({order:this.order-1});
        return code;
    }

}

LiteGraph.registerNodeType("math/"+LGraphPanner.title, LGraphPanner);


function LGraphPow()
{
    this._ctor(LGraphPow.title);
    this.code_name = "pow";
    LGraphOperation.call( this);
    this.inputs[0].label = "Value";
    this.inputs[1].label = "Exp";
}


LGraphPow.title = "Pow";
LGraphPow.desc = "Power of the input";


LGraphPow.prototype.onDrawBackground = function(ctx)
{
    this.inputs[0].label = "Value";
    this.inputs[1].label = "Exp";
    if(!this.isInputConnected(0))
        this.inputs[0].label += "="+this.properties["A"].toFixed(3);
    if(!this.isInputConnected(1))
        this.inputs[1].label += "="+this.properties["B"].toFixed(3);
}

//LGraphMulOp.prototype = Object.create(LGraphOperation); // we inherit from Entity
//LGraphMulOp.prototype.constructor = LGraphMulOp;
LiteGraph.extendClass(LGraphPow,LGraphOperation);
LiteGraph.registerNodeType("math/"+LGraphPow.title, LGraphPow);



//UVS
function LGraphReflect()
{
    this.addOutput("reflect vector","vec3", {vec3:1});
    this.addInput("normal","vec3", {vec3:1});
    this.addInput("vector","vec3", {vec3:1});

    this.shader_piece = LiteGraph.CodeLib["reflect"]; // hardcoded for testing
}

LGraphReflect.title = "Reflect";
LGraphReflect.desc = "To reflect a vector3";


LGraphReflect.prototype.onExecute = function()
{
    //this.processInputCode();
}


LGraphReflect.prototype.processInputCode = function(scope)
{

    var code_normal = this.getInputCode(0); // normal
    var code_incident = this.getInputCode(1); // inident vector

    // (output, incident, normal)
    if(code_incident && code_normal){
        var output_code = this.codes[0] = this.shader_piece.getCode(
            { out_var: "reflect_" + this.id,
                a: code_incident.getOutputVar(),
                b: code_normal.getOutputVar(),
                scope: scope,
                out_type: "vec3",
                order: this.order
            });

        output_code.merge(code_normal);
        output_code.merge(code_incident);
    } else {
        this.codes[0] = LiteGraph.EMPTY_CODE;
    }

}

LiteGraph.registerNodeType("math/"+LGraphReflect.title, LGraphReflect);





function LGraphSmoothStep()
{
    this._ctor(LGraphSmoothStep.title);

    this.code_name = "smoothstep";
    this.output_types = null;
    this.out_extra_info = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};
    this.intput_typesA = null;
    this.in_extra_infoA = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1}
    this.intput_typesB = null;
    this.in_extra_infoB = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};
    this.intput_typesC = null;
    this.in_extra_infoC = {types_list: {float:1, vec3:1, vec4:1, vec2:1},   use_t:1};


    this.properties = { lower:0.0,
                        upper:1.5};

    this.number_piece = new PConstant("float");
    LGraph3ParamNode.call( this);
}

LGraphSmoothStep.prototype = Object.create(LGraph3ParamNode); // we inherit from Entity
LGraphSmoothStep.prototype.constructor = LGraphSmoothStep;

LGraphSmoothStep.title = "SmoothStep";
LGraphSmoothStep.desc = "smoothstep of input";

LGraphSmoothStep.prototype.infereTypes = function( output_slot, target_slot, node) {
    var out_types = node.getTypesFromOutputSlot(output_slot);
    if( (target_slot == 0 || target_slot == 1) && Object.keys(out_types)[0] == "float")
        return;
    this.connectTemplateSlot();


    var input = this.inputs[target_slot];
    if (input.use_t && Object.keys(this.T_in_types).length === 0) {

        this.T_in_types["float"] = 1; // we hardcode the float as operation always accept float in one of the inputs
        for (var k in out_types)
            this.T_in_types[k] = out_types[k];
        for (var k in out_types)
            this.T_out_types[k] = out_types[k];
    }
}

LGraphMix.prototype.disconnectTemplateSlot = function(input_slot){
    if(input_slot == 0 || input_slot == 1 ) return;

    if(this.in_conected_using_T > 0)
        this.in_conected_using_T--;
    this.resetTypes(input_slot);
}

LGraphSmoothStep.prototype.onGetNullCode = function(slot, scope)
{
    if(slot == 0){
        var code = this.number_piece.getCode({
                out_var:"float_"+this.id+""+ slot,
            a:this.properties["lower"].toFixed(3),
            scope:scope,
            order:this.order-1
        });
        return code;
    }
    else if(slot == 1){
        var code = this.number_piece.getCode({
            out_var:"float_"+this.id+""+ slot,
            a:this.properties["upper"].toFixed(3),
            scope:scope,
            order:this.order-1
        });
        return code;
    }

    return LiteGraph.EMPTY_CODE;

}

LGraphSmoothStep.prototype.onDrawBackground = function(ctx)
{
    //show the current value
    this.inputs[0].label = "lower";
    if(!this.isInputConnected(0))
        this.inputs[0].label += "="+this.properties["lower"].toFixed(3);
    this.inputs[1].label = "upper";
    if(!this.isInputConnected(1))
        this.inputs[1].label += "="+this.properties["upper"].toFixed(3);
}

LiteGraph.extendClass(LGraphSmoothStep,LGraph3ParamNode);
LiteGraph.registerNodeType("math/"+LGraphSmoothStep.title, LGraphSmoothStep);






function LGraphSubOp()
{
    this._ctor(LGraphSubOp.title);

    this.code_name = "sub";

    LGraphOperation.call( this);
}
LGraphSubOp.prototype = Object.create(LGraphOperation);
LGraphSubOp.prototype.constructor = LGraphSubOp;

LGraphSubOp.title = "Sub";
LGraphSubOp.desc = "Substraction of the inputs";



LiteGraph.extendClass(LGraphSubOp,LGraphOperation);
LiteGraph.registerNodeType("math/"+LGraphSubOp.title, LGraphSubOp);

