nhpup = {

    pup: null,      // This is the popup box, represented by a div    
    identifier: "pup",  // Name of ID and class of the popup box
    minMargin: 15,  // Set how much minimal space there should be (in pixels)
                    // between the popup and everything else (borders, mouse)
    default_width: 500, // Will be set to width from css in document.ready
    move: false,   // Move it around with the mouse? we are only ready for that when the mouse event is set up.
                   // Besides, having this turned off initially is resource-friendly.

    /*
     Write message, show popup w/ custom width if necessary,
      make sure it disappears on mouseout
    */
    popup: function(p_msg, p_config)
    {
        // do track mouse moves and update position 
        this.move = true;
        // restore defaults
        this.pup.removeClass()
                .addClass(this.identifier)
                .width(this.default_width);

        // custom configuration
        if (typeof p_config != 'undefined') {
            if ('class' in p_config) {
                this.pup.addClass(p_config['class']);
            }
            if ('width' in p_config) {
                this.pup.width(p_config['width']);
            }
        }

        // Write content and display
        this.pup.html(p_msg).show();

        // Make sure popup goes away on mouse out and we stop the constant 
        //  positioning on mouse moves.
        // The event obj needs to be gotten from the virtual 
        //  caller, since we use onmouseover='nhpup.popup(p_msg)' 
        var t = this.getTarget(arguments.callee.caller.arguments[0]);
        $jq(t).unbind('mouseout').bind('mouseout', 
            function(e){
                nhpup.pup.hide();
                nhpup.move = false;
            }
        );
    },

    // set the target element position
    setElementPos: function(x, y)
    {
        // Call nudge to avoid edge overflow. Important tweak: x+10, because if
        //  the popup is where the mouse is, the hoverOver/hoverOut events flicker
        var x_y = this.nudge(x + 10, y);
        // remember: the popup is still hidden
        this.pup.css('top', x_y[1] + 'px')
                .css('left', x_y[0] + 'px');
    },

    /* Avoid edge overflow */
    nudge: function(x,y)
    {
        var win = $jq(window);

        // When the mouse is too far on the right, put window to the left
        var xtreme = $jq(document).scrollLeft() + win.width() - this.pup.width() - this.minMargin;
        if(x > xtreme) {
            x -= this.pup.width() + 2 * this.minMargin;
        }
        x = this.max(x, 0);

        // When the mouse is too far down, move window up
        if((y + this.pup.height()) > (win.height() +  $jq(document).scrollTop())) {
            y -= this.pup.height() + this.minMargin;
        }

        return [ x, y ];
    },

    /* custom max */
    max: function(a,b)
    {
        if (a>b) return a;
        else return b;
    },

    /*
     Get the target (element) of an event.
     Inspired by quirksmode
    */
    getTarget: function(e)
    {
        var targ;
        if (!e) var e = window.event;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug
            targ = targ.parentNode;
        return targ;
    },

    onTouchDevice: function() 
    {
        var deviceAgent = navigator.userAgent.toLowerCase();
        return deviceAgent.match(/(iphone|ipod|ipad|android|blackberry|iemobile|opera m(ob|in)i|vodafone)/) !== null;
    },
	
    initialized: false,
    initialize : function(){
        if (this.initialized) return;

        window.$jq = jQuery; // this is safe in WP installations with noConflict mode (which is default)

        /* Prepare popup and define the mouseover callback */
        jQuery(document).ready(function () {
            // create default popup on the page
            $jq('body').append('<div id="' + nhpup.identifier + '" class="' + nhpup.identifier + '" style="position:absolute; display:none; z-index:200;"></div>');
            nhpup.pup = $jq('#' + nhpup.identifier);

            // set dynamic coords when the mouse moves
            $jq(document).mousemove(function (e) {
                if (!nhpup.onTouchDevice()) { // turn off constant repositioning for touch devices (no use for this anyway)
                    if (nhpup.move) {
                        nhpup.setElementPos(e.pageX, e.pageY);
                    }
                }
            });
        });

        this.initialized = true;
    }
};

if ('jQuery' in window) nhpup.initialize();