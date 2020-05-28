



// http://iquilezles.org/www/articles/smin/smin.htm
//float h = max(k-abs(a-b),0.0);
//return min(a, b) - h*h*0.25/k;
function Psmooth(){
    this.id = "smooth";
    this.includes = {};
};
Psmooth.prototype.getVertexCode = function (out_type,out_var,a,b,k,optType,scope){
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        var code = 
        "float h =max("+k+"-abs(" +a+"-"+b+"),0.0);\n" +
        out_type+" " +out_var+"=" + optType +"(" +a+","+b+") -"+"h*h*0.25/"+k+";\n";
        return code;


    }
};
Psmooth.prototype.getFragmentCode = function (out_type,out_var,a,b,k,optType,scope){
    
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        var code = 
         
        out_type+" " +out_var+"=smin("+a+","+b+","+k+");\n";
        return code;
    }
};

Psmooth.prototype.getCode = function (params) {
    
    var out_var = params.out_var;
    var out_type = params.out_type;
    var a = params.a;
    var b = params.b;
    var k = params.k;
    var optType = params.optType;
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_type, out_var, a,b,k,optType, scope));
    vertex.setIncludesFromMap(this.includes);
    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_type, out_var, a,b,k,optType,scope));
    fragment.setIncludesFromMap(this.includes );
    return new ShaderCode(vertex, fragment, out_var);
};

// http://iquilezles.org/www/articles/smin/smin.htm
// vec2 smin( vec2 a, vec2 b, float k )
// {
//     float h = clamp( 0.5+0.5*(b.x-a.x)/k, 0.0, 1.0 );
//     return mix( b, a, h ) - k*h*(1.0-h);
// }

function Psmooth2d(){
    this.id = "smooth2d";
    this.includes = {};
};
Psmooth2d.prototype.getVertexCode = function (out_type,out_var,a,b,k,scope){
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        var code = 
        "float h =clamp(0.5+0.5*("+b+".x" + "-" + a+".x)/"+k+",0.0,1.0);\n" +
        out_type+" " +out_var+"=mix("+b+","+a+",h) -"+k+"*h*(1.0-h);\n";
        return code;


    }
};
Psmooth2d.prototype.getFragmentCode = function (out_type,out_var,a,b,k,scope){
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        var code = 
        out_type+" " +out_var+"=smin2("+a+","+b+","+k+");\n";
        return code;
    }
};

Psmooth2d.prototype.getCode = function (params) {
    var out_var = params.out_var;
    var out_type = params.out_type;
    var a = params.a;
    var b = params.b;
    var k = params.k;
   
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_type, out_var, a,b,k, scope));
    vertex.setIncludesFromMap(this.includes);
    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_type, out_var, a,b,k,scope));
    fragment.setIncludesFromMap(this.includes );
    return new ShaderCode(vertex, fragment, out_var);
};

// float sdSphere( vec3 p, float s )
// {
//     return length(p)-s;
// }
function PsdSphere(){
    this.id = "sdSphere";
    this.includes = {};
};
PsdSphere.prototype.getVertexCode = function (out_type,out_var,p,s,scope){
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        var code = 
        out_type+" " +out_var+"=" + "length("+p+")-"+s+";\n";
        return code;

    }
};
PsdSphere.prototype.getFragmentCode = function (out_type,out_var,p,s,scope){
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        var code = 
        //out_type+" " +out_var+"=" + "length("+p+")-"+s+";\n";
        out_type+" " +out_var+"=sdSphere("+p+","+s+");\n";
        return code;
    }
};
PsdSphere.prototype.getCode = function (params) {
    var out_var = params.out_var;
    var out_type = params.out_type;
    var p = params.p;
    var s = params.s;
 
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_type, out_var, p,s, scope));
    vertex.setIncludesFromMap(this.includes);
    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_type, out_var,p,s,scope));
    fragment.setIncludesFromMap(this.includes );
    return new ShaderCode(vertex, fragment, out_var);
};


/*
// http://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
float sdEllipsoid( in vec3 p, in vec3 r ) // approximated
{
    float k0 = length(p/r);
    float k1 = length(p/(r*r));
    return k0*(k0-1.0)/k1;
}
*/

function PsdEllipsoid(){
    this.id = "sdEllipsoid";
    this.includes = {};
};
PsdEllipsoid.prototype.getVertexCode = function (out_type,out_var,p,r,scope){
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        // var code = 
        // "float k0 =length("+p+"/"+r+");\n" +
        // "float k1 =length("+p+"/("+r+"*"+r+"));\n" +
        // out_type+" " +out_var+"=k0*(k0-1.0)/k1;\n";
        var code =out_type+" " +out_var+"= sdEllipsoid(" +p+","+r+ ");\n";
        return code;
 
    }
};
PsdEllipsoid.prototype.getFragmentCode = function (out_type,out_var,p,r,scope){
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        var code =out_type+" " +out_var+"= sdEllipsoid(" +p+","+r+ ");\n";
        return code;
    }
};

PsdEllipsoid.prototype.getCode = function (params) {
    //console.log("params:",params)
    var out_var = params.out_var;
    var out_type = params.out_type;
    var p = params.p;
    var r = params.r;
  
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_type, out_var, p,r, scope));
    vertex.setIncludesFromMap(this.includes);
    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_type, out_var, p,r,scope));
    fragment.setIncludesFromMap(this.includes );
    return new ShaderCode(vertex, fragment, out_var);
};


/*
// http://iquilezles.org/www/articles/smin/smin.htm
vec4 opU( vec4 d1, vec4 d2 )
{
	return (d1.x<d2.x) ? d1 : d2;
}*/
function PopU(){
    this.id = "opU";
    this.includes = {};
};
PopU.prototype.getVertexCode = function (out_type,out_var,d1,d2,scope){
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        var code =       
        out_type+" " +out_var+"=(" +d1.x+"<" + d2.x +")?" +d1+":"+d2+" ;\n";
        return code;
    }
};
PopU.prototype.getFragmentCode = function (out_type,out_var,d1,d2,scope){
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        var code =out_type+" " +out_var+"= opU(" +d1+","+d2+ ");\n";
        return code;
    }
};

PopU.prototype.getCode = function (params) {
    var out_var = params.out_var;
    var out_type = params.out_type;
    var d1 = params.d1;
    var d2 = params.d2;
     
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_type, out_var, d1,d2, scope));
    vertex.setIncludesFromMap(this.includes);
    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_type, out_var, d1,d2,scope));
    fragment.setIncludesFromMap(this.includes );
    return new ShaderCode(vertex, fragment, out_var);
};


/*
vec2 sdStick(vec3 p, vec3 a, vec3 b, float r1, float r2) // approximated
{
    vec3 pa = p-a, ba = b-a;
	float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
	return vec2( length( pa - ba*h ) - mix(r1,r2,h*h*(3.0-2.0*h)), h );
}
*/
function PsdStick(){
    this.id = "sdStick";
    this.includes = {};
};
PsdStick.prototype.getVertexCode = function (out_type,out_var,p,a,b,r1,r2,scope){
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        var code = 
        "vec3 pa ="+p+"-"+a+",ba="+b+"-"+a+";\n" +
        "float h = clamp(dot(pa,ba)/dot(ba,ba),0,0,1,0);"+
        out_type+" " +out_var+"=vec2(length(pa-ba*h)-mix("+r1+","+r2+",h*h*(3.0-2.0*h)),h);\n";
        return code;
 
    }
};
PsdStick.prototype.getFragmentCode = function (out_type,out_var,p,a,b,r1,r2,scope){
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        var code = 
        out_type+" " +out_var+"=sdStick("+p+","+a+","+b+","+r1+","+r2+");\n";
        return code;
    }
};

PsdStick.prototype.getCode = function (params) {
    var out_var = params.out_var;
    var out_type = params.out_type;

    var p = params.p;
    var a = params.a;
    var b = params.b;
    var r1 = params.r1;
    var r2 = params.r2;
     
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_type, out_var,p, a,b,r1,r2, scope));
    vertex.setIncludesFromMap(this.includes);
    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_type, out_var, p, a,b,r1,r2,scope));
    fragment.setIncludesFromMap(this.includes );
    return new ShaderCode(vertex, fragment, out_var);
};






function Psign(){
    this.id = "sign";
    this.includes = {};
};
Psign.prototype.getVertexCode = function (out_type,out_var,p,scope){
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        var code = 
        out_type+" " +out_var+"=sign("+p+");\n";
        return code;
 
    }
};
Psign.prototype.getFragmentCode = function (out_type,out_var,p,scope){
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        var code = 
        out_type+" " +out_var+"=sign("+p+");\n";
        return code;
    }
};

Psign.prototype.getCode = function (params) {
    var out_var = params.out_var;
    var out_type = params.out_type;
    var p = params.p;
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_type, out_var,p,scope));
    vertex.setIncludesFromMap(this.includes);
    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_type, out_var, p,scope));
    fragment.setIncludesFromMap(this.includes);
    return new ShaderCode(vertex, fragment, out_var);
};






function PMat2(){
    this.id = "mat2";
    this.includes = {};
};
PMat2.prototype.getVertexCode = function (out_type,out_var,r1,r2,r3,r4,scope){
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        var code = 
        out_type+" " +out_var+"=mat2("+r1 +","+r2+","+r3+","+r4+");\n";
        return code;
 
    }
};
PMat2.prototype.getFragmentCode = function (out_type,out_var,r1,r2,r3,r4,scope){
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        var code = 
        out_type+" " +out_var+"=mat2("+r1 +","+r2+","+r3+","+r4+");\n";
        return code;
    }
};

PMat2.prototype.getCode = function (params) {
    var out_var = params.out_var;
    var out_type = params.out_type;
    var r1 = params.r1;
    var r2 = params.r2;
    var r3 = params.r3;
    var r4 = params.r4;
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_type, out_var,r1,r2,r3,r4,scope));
    vertex.setIncludesFromMap(this.includes);
    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_type, out_var, r1,r2,r3,r4,scope));
    fragment.setIncludesFromMap(this.includes);
    return new ShaderCode(vertex, fragment, out_var);
};




function PPos(){
    this.id = "pos";
    this.includes = {};
};
PPos.prototype.getVertexCode = function (out_type,out_var,scope){
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        var code = 
        out_type+" " +out_var+"=pos;\n";
        return code;
 
    }
};
PPos.prototype.getFragmentCode = function (out_type,out_var,scope){
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        var code = 
        out_type+" " +out_var+"=pos;\n";
        return code;
    }
};

PPos.prototype.getCode = function (params) {
    var out_var = params.out_var;
    var out_type = params.out_type;
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_type, out_var,scope));
    vertex.setIncludesFromMap(this.includes);
    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_type, out_var,scope));
    fragment.setIncludesFromMap(this.includes);
    return new ShaderCode(vertex, fragment, out_var);
};




function PAtime(){
    this.id = "atime";
    this.includes = {};
};
PAtime.prototype.getVertexCode = function (out_type,out_var,scope){
    if(scope == CodePiece.VERTEX || scope == CodePiece.BOTH){
        var code = 
        out_type+" " +out_var+"=aTime;\n";
        return code;
 
    }
};
PAtime.prototype.getFragmentCode = function (out_type,out_var,scope){
    if(scope == CodePiece.FRAGMENT || scope == CodePiece.BOTH){
        var code = 
        out_type+" " +out_var+"=aTime;\n";
        return code;
    }
};

PAtime.prototype.getCode = function (params) {
    var out_var = params.out_var;
    var out_type = params.out_type;
 
    var scope = params.scope;
    var order = params.hasOwnProperty("order") ? params.order : Number.MAX_VALUE;

    var vertex = new CodePiece(order);
    vertex.setBody(this.getVertexCode(out_type,out_var,scope));
    vertex.setIncludesFromMap(this.includes);
    var fragment = new CodePiece(order);
    fragment.setBody(this.getFragmentCode(out_type,out_var,scope));
    fragment.setIncludesFromMap(this.includes);
    return new ShaderCode(vertex,fragment,out_var);
};
