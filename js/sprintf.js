/*
sprintf v1.00
Copyright (c) Paolo Gatti < paolo_._gatti84_@_gmail_._com >
http://github.com/lordkrandel/

Original License:
http://www.diveintojavascript.com/projects/javascript-sprintf
Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of sprintf() for JavaScript nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL Alexandru Marasteanu or Paolo Gatti BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
var sprintf = function() {

    // retrieve the type string
    this.getType = function(variable) {
        return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
    }

    // checks the actual datatype against the expected one
    this.checkType = function(token, arg, regex, expectedType){
        var actualType = getType(arg);
        if ( regex.test(token) && actualType != expectedType && ( actualType != 'object' || ! arg instanceof expectedType )){
            throw( sprintf( 'wrong token type, expecting %s but found %s on token "%s"', token, expectedType, actualType));
        }
    };

    this.format = function(stack, argv) {
        var cursor = 1;
        var arg;
        var ret = [];
        var argType = { "positional": 0, "named": 0 };

        for (var currentToken in stack) {

            // iterate over the stack
            var token = stack[currentToken];
            var type = getType(token);

            if ( type === 'string') {

                // no further processing
                ret.push(token);

            } else if (type === 'array' ){

                // map to object m
                m = token.toObject([ 'positional', 'keyword', 'plus', 'padchar', 'leftAlign', 'width', 'precision', 'token', 'dateFormat' ]);

                // setup padchar
                m.padchar = ( m.padchar || ' ' ).charAt(0);

                // cannot mix positional and named tokens
                argType.positional += m["positional"] ? 1 : 0
                argType.named      += m["named"]      ? 1 : 0
                if (argType.positional && argType.named){
                    throw("Cannot mix positional and named tokens.");
                }

                // handle keyword, positional explicit, positional implicit
                if ( m.keyword ) {
                    arg = argv[cursor];
                    for ( var k in m.keyword ) {
                        var t = m.keyword[k];
                        if (!arg.hasOwnProperty( t )) {
                            throw(sprintf('property "%s" does not exist', t));
                        }
                        arg = arg[m.keyword[k]];
                    }
                } else {
                    arg = argv[ m.positional || cursor++ ];
                }

                // arg datatype checking
                checkType(m.token, arg, /[^sDT]/, 'number');
                checkType(m.token, arg, /[DT]/,   Date );

                // setup the token as a string
                switch ( m.token ) {
                    case 'b': arg = arg.toString(2); break;
                    case 'c': arg = String.fromCharCode(arg); break;
                    case 'd': arg = parseInt(arg, 10); break;
                    case 'e': arg = m.precision ? arg.toExponential(m.precision) : arg.toExponential(); break;
                    case 'f': arg = m.precision ? parseFloat(arg).toFixed(m.precision) : parseFloat(arg); break;
                    case 'D': arg = new Date(arg).fmt( m.dateFormat || 'DD/MM/YYYY' ); break;
                    case 'T': arg = new Date(arg).fmt( m.dateFormat || 'hh:mm:ss' ); break;
                    case 'o': arg = arg.toString(8); break;
                    case 's': arg = String(arg); break;
                    case 'u': arg = Math.abs(arg); break;
                    case 'x': arg = arg.toString(16); break;
                    case 'X': arg = arg.toString(16).toUpperCase(); break;
                }

                // to string
                arg = String(arg);

                // handle conditions
                if ( m.plus ) { arg = (arg >= 0 ? '+' : '-') + arg; }
                if ( m.width ){ arg = arg.toFixed(m.width, m.padchar, m.leftAlign); }

                // push
                ret.push(arg);

            }
        }

        // return joined array
        return ret.join('');

    };

    this.parse = function(s){

        var match;
        var ret = [];

        while (s) {

            if ( match = s.match(/^\\n/)) {
                ret.push("\n");
            } else if ( match = s.match(/^([^%]+)/))  {
                ret.push(m[0]);
            } else if ( match = s.match(/^%%/)) {
                ret.push("%");
            } else if ( match = s.match(/^%(?:(\d+\$)|(\w+\$))?(\+)?(0)?(-)?(\d+)?(\.\d+)?([bcdefoOsuxXDT])(?:\(([^)]+)\))?/) ){
                ret.push(match);
            } else {
                throw("Unknown token: " + s);
            }

            s = s.substr(match[0].length);

        }
        return ret;
    }

    // Save a parsed-strings cache
    if (! this.cache ) {
        this.cache = {};
    };
    var args = Array.prototype.slice.call(arguments);
    var ret = "";
    var formatstring = args[0];

    try {
        if ( !cache[formatstring]){
            // If not in cache
            cache[formatstring] = parse(formatstring);
        }
        // format the parsed string
        ret = format( cache[formatstring], args );
    } catch(e) {
        ret = String( "[sprintf] " + e.message );
    }
    return ret;

};

// String prototype functions
String.prototype.fmt = function(){
    Array.prototype.unshift.call(arguments, this);
    return sprintf.apply(null, arguments);
}

Date.prototype.fmt = function( mask ){
    o = {
        'YYYY' : this.getFullYear()
        , 'YY' : this.getFullYear()
        , 'MM' : this.getMonth()+1
        , 'DD' : this.getDate()
        , 'hh' : this.getHours()
        , 'mm' : this.getMinutes()
        , 'ss' : this.getSeconds()
    };
    for ( re in o ) {
        var val = String(o[re]).toFixed(re.length, 0);
        mask = mask.replace( RegExp( re, 'g'), val );
    }
    return mask;
};
String.prototype.toFixed = function(n, padchar, leftAlign){
    padchar |= ' ';
    var len = this.length;
    var s = this;
    if ( n < len ){
        s = s.substr( 0, n );
    } else {
        var pad = Array( n-len+1 ).join(padchar);
        s = leftAlign ? s + pad : pad + s;
    }
    return s;
};
Array.prototype.toObject = function(labels){
    var i = 0;
    var obj = {};
    while( labels[i] ) {
        obj[labels[i]] = this[++i];
    };
    return obj;
}
