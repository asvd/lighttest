/**
 * @fileoverview Platform-dependent routines for the Lighttest library
 */

include('base.js');

init = function() {
    lighttest._platform = {};

    lighttest._platform._initialized = false;

    /**
     * Initializes Lighttest upon the first launch of the tests
     */
    lighttest._platform.init = function() {
        if ( !lighttest._platform._initialized ) {
            if ( typeof window != 'undefined' ) {
                lighttest._platform._initWeb();
            } else {
                lighttest._platform._initNode();
            }

            lighttest._platform._initialized = true;
        }
    }
    
    
    
    /**
     * Initializes Lighttest for the web-based environment
     */
    lighttest._platform._initWeb = function() {
        var target = document.getElementById('lighttest') ||
            document.getElementsByTagName('body').item(0);

        target.style.margin = 0;

        var style1 = {
            backgroundColor : 'rgb(2,14,15)',
            width : '100%',
            height : '100%',
            overflow : 'auto',
            position : 'absolute'
        }

        var div1 = document.createElement('div');
        for ( var i in style1 ) {
            div1.style[i] = style1[i];
        }

        target.appendChild(div1);

        var style2 = {
            color : 'rgb(173,196,190)',
            paddingBottom : '5px',
            paddingLeft : '5px',
            fontFamily : 'monospace',
            fontSize : '8pt',
            position : 'absolute'
        }

        var div2 = document.createElement('div');
        for ( i in style2 ) {
            div2.style[i] = style2[i];
        }

        div1.appendChild(div2);

        lighttest._platform.print = function( text ) {
            div2.innerHTML += text.replace(/\ /g, '&nbsp;');
        }

        lighttest._platform._printPlain = function( text ) {
            div2.innerHTML += text;
        }

        var styleRed = 'text-shadow : 0px 0px 6px #FD4E7F; color: #F13D35;';
        lighttest._platform.printRed = function( text ) {
            lighttest._platform._printPlain(
                '<span style="'+styleRed+'">' + text + '</span>'
            );
        }

        var styleGreen = 'text-shadow : 0px 0px 8px #50A39C; color: #56D670;';
        lighttest._platform.printGreen = function( text ) {
            lighttest._platform._printPlain(
                '<span style="'+styleGreen+'">' + text + '</span>'
            );
        }

        var styleBlue = 'text-shadow: 0px 0px 8px #507EA3; color: #58AEC9;';
        lighttest._platform.printBlue = function( text ) {
            lighttest._platform._printPlain(
                '<span style="'+styleBlue+'">' + text + '</span>'
            );
        }

        lighttest._platform.printWhite = lighttest._platform.printPlain;

        lighttest._platform.printLine = function() {
            lighttest._platform.print('<br/>');
            setTimeout(
                function() {
                    div1.scrollTop = div1.scrollHeight;
                }, 1
            );
        }

        lighttest._platform.reset = function() {
            div2.innerHTML = '';
        }

        lighttest._platform.exit = function(code) {
            // impossible for web environment
        }
    }



    /**
     * Initializes Lighttest for the Node.js-based environment
     */
    lighttest._platform._initNode = function() {
        var red   = '\033[31m';
        var green = '\033[32m';
        var blue  = '\033[36m';
        var bold = '\x1b[1m';
        var reset = '\033[0m';

        lighttest._platform.print = function(val) {
            process.stdout.write(val);
        }
        
        lighttest._platform.printRed = function(text) {
            lighttest._platform.print( red+bold+text+reset );
        }

        lighttest._platform.printGreen = function(text) {
            lighttest._platform.print( green+bold+text+reset );
        }

        lighttest._platform.printBlue = function(text) {
            lighttest._platform.print( blue+text+reset );
        }

        lighttest._platform.printWhite = function (text) {
            lighttest._platform.print( bold+text+reset );
        };

        lighttest._platform.printLine = function() {
            console.log();
        }

        lighttest._platform.reset = function(code) {
            // impossible for NodeJS
        }

        lighttest._platform.exit = function(code) {
            process.exit(code);
        }

        // prevents from crashing on exceptions
        process.on(
            'uncaughtException',
            function (err) {
                console.log();
                console.error(err);
            }
        );
    }


}

