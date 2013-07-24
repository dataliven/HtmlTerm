/*
  HtmlTerm: An HTML5 WebSocket client
  Copyright (C) 2009-2013  Rick Parrish, R&M Software

  This file is part of HtmlTerm.

  HtmlTerm is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  any later version.

  HtmlTerm is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with HtmlTerm.  If not, see <http://www.gnu.org/licenses/>.
*/
var TCrtProgressBar = function(AParent, ALeft, ATop, AWidth, AStyle) {
    var that = this; 
    var FBackColour = Crt.BLACK;
    var FBackground = null;
    var FBarForeColour;
    var FBlankForeColour;
    var FControls = [];
    var FForeColour = Crt.LIGHTGRAY;
    var FHeight;
    var FLastBarWidth = 9999;
    var FLastMarqueeUpdate = 0; 
    var FLastPercentText = "";
    var FLeft;
    var FMarqueeAnimationSpeed;
    var FMaximum;
    var FParent = null;
    var FPercentPrecision;
    var FPercentVisible;
    var FStyle;
    var FTop;
    var FValue;
    var FWidth;

    // Private methods
    var Paint = function (AForce) { }; // Do nothing
    var RestoreBackground = function () { }; // Do nothing
    var SaveBackground = function () { }; // Do nothing
		
    this.__defineGetter__("BarForeColour", function () {
        return FBarForeColour;
    });

    this.__defineSetter__("BarForeColour", function (ABarForeColour) {
        if (ABarForeColour !== FBarForeColour)
        {
            FBarForeColour = ABarForeColour;
            Paint(true);
        }
    });
		
    this.__defineGetter__("BlankForeColour", function () {
        return FBlankForeColour;
    });

    this.__defineSetter__("BlankForeColour", function (ABlankForeColour) {
        if (ABlankForeColour !== FBlankForeColour)
        {
            FBlankForeColour = ABlankForeColour;
            Paint(true);
        }
    });
		
    this.__defineGetter__("Left", function () {
        return FLeft;
    });

    this.__defineSetter__("Left", function (ALeft) {
        var i;

        if (ALeft !== FLeft) {
            RestoreBackground();
            FLeft = ALeft;
            SaveBackground();
            Paint(true);

            for (i = 0; i < FControls.length; i++) {
                FControls[i].Paint(true);
            }
        }
    });

    this.__defineGetter__("MarqueeAnimationSpeed", function () {
        return FMarqueeAnimationSpeed;
    });

    this.__defineSetter__("MarqueeAnimationSpeed", function (AMarqueeAnimationSpeed) {
        FMarqueeAnimationSpeed = AMarqueeAnimationSpeed;
    });
		
    this.__defineGetter__("Maximum", function () {
        return FMaximum;
    });

    this.__defineSetter__("Maximum", function (AMaximum) {
        if (AMaximum !== FMaximum)
        {
            FMaximum = AMaximum;
            if (FValue > FMaximum) {
                FValue = FMaximum;
            }
            Paint(true);
        }
    });
		
    /// <summary>
    /// Re-Draw the bar and percent text.
    /// </summary>
    /// <param name="AForce">When true, the bar and percent will always be Paintn.  When false, the bar and percent will only be Paintn as necessary, which reduces the number of unnecessary Paints (especially when a large maximum is used)</param>
    Paint = function (AForce) {
        if (FStyle === ProgressBarStyle.Marquee)
        {
            if (AForce)
            {
                // Erase the old bar
                Crt.FastWrite(StringUtils.NewString(String.fromCharCode(176), FWidth), that.ScreenLeft, that.ScreenTop, FBlankForeColour + (FBackColour << 4));
            }
				
            // Draw the new bar
            if (FValue > 0)
            {
                if (FValue > FWidth)
                {
                    Crt.FastWrite(String.fromCharCode(176), that.ScreenLeft + FWidth - (15 - Math.floor(FValue - FWidth)), that.ScreenTop, FBlankForeColour + (FBackColour << 4));
                }
                else if (FValue >= 15)
                {
                    Crt.FastWrite(StringUtils.NewString(String.fromCharCode(219), Math.min(FValue, 15)), that.ScreenLeft + FValue - 15, that.ScreenTop, FBarForeColour + (FBackColour << 4));
                    Crt.FastWrite(String.fromCharCode(176), that.ScreenLeft + FValue - 15, that.ScreenTop, FBlankForeColour + (FBackColour << 4));
                }
                else
                {
                    Crt.FastWrite(StringUtils.NewString(String.fromCharCode(219), Math.min(FValue, 15)), that.ScreenLeft, that.ScreenTop, FBarForeColour + (FBackColour << 4));
                }
            }
        }
        else
        {
            // Check if we're forcing an update (probably due to a change in Left, Top, Width, etc)
            if (AForce)
            {
                // Yep, so reset the "Last" variables
                FLastBarWidth = 9999;
                FLastPercentText = "";
            }
				
            var PaintPercentText = false;
            var Percent = FValue / FMaximum;
            var NewBarWidth = Math.floor(Percent * FWidth);
            if (NewBarWidth !== FLastBarWidth)
            {
                // Check if the bar shrank (if so, we need to delete the old bar)
                if (NewBarWidth < FLastBarWidth)
                {
                    // Erase the old bar
                    Crt.FastWrite(StringUtils.NewString(String.fromCharCode(176), FWidth), that.ScreenLeft, that.ScreenTop, FBlankForeColour + (FBackColour << 4));
                }
					
                // Draw the new bar
                Crt.FastWrite(StringUtils.NewString(String.fromCharCode(FStyle), NewBarWidth), that.ScreenLeft, that.ScreenTop, FBarForeColour + (FBackColour << 4));
					
                FLastBarWidth = NewBarWidth;
                PaintPercentText = true;
            }
				
            // Draw the percentage
            if (FPercentVisible)
            {
                var NewPercentText = StringUtils.FormatPercent(Percent, FPercentPrecision);
                if ((NewPercentText !== FLastPercentText) || (PaintPercentText))
                {
                    FLastPercentText = NewPercentText;
						
                    var ProgressStart = Math.round((FWidth - NewPercentText.length) / 2);
                    if (ProgressStart >= NewBarWidth)
                    {
                        // Bar hasn't reached the percent text, so draw in the bar's empty color
                        Crt.FastWrite(NewPercentText, that.ScreenLeft + ProgressStart, that.ScreenTop, FBlankForeColour + (FBackColour << 4));
                    }
                    else if (ProgressStart + NewPercentText.length <= NewBarWidth)
                    {
                        // Bar has passed the percent text, so draw in the bar's foreground colour (or still use background for Blocks)
                        Crt.FastWrite(NewPercentText, that.ScreenLeft + ProgressStart, that.ScreenTop, FBackColour + (FBarForeColour << 4));
                    }
                    else
                    {
                        // Bar is in the middle of the percent text, so draw the colour as necessary for each letter in the text
                        var i;
                        for (i = 0; i < NewPercentText.length; i++)
                        {
                            var LetterPosition = ProgressStart + i;
                            var FG = (LetterPosition >= NewBarWidth) ? FBlankForeColour : FBackColour;
                            var BG = (LetterPosition >= NewBarWidth) ? FBackColour : FBarForeColour;
                            Crt.FastWrite(NewPercentText.charAt(i), that.ScreenLeft + LetterPosition, that.ScreenTop, FG + (BG << 4));
                        }
                    }
                }
            }
        }
    };
		
    this.__defineGetter__("PercentPrecision", function () {
        return FPercentPrecision;
    });

    this.__defineSetter__("PercentPrecision", function (APercentPrecision) {
        if (APercentPrecision !== FPercentPrecision)
        {
            FPercentPrecision = APercentPrecision;
            Paint(true);
        }
    });
		
    this.__defineGetter__("PercentVisible", function () {
        return FPercentVisible;
    });

    this.__defineSetter__("PercentVisible", function (APercentVisible) {
        if (APercentVisible !== FPercentVisible)
        {
            FPercentVisible = APercentVisible;
            Paint(true);
        }
    });
		
    this.__defineGetter__("ScreenLeft", function () {
        return FLeft + ((FParent === null) ? 0 : FParent.Left);
    });

    this.__defineGetter__("ScreenTop", function () {
        return FTop + ((FParent === null) ? 0 : FParent.Top);
    });
		
    this.Step = function() {
        that.StepBy(1);
    };
		
    this.StepBy = function(ABy) {
        that.Value += ABy;
    };
		
    this.__defineGetter__("Style", function () {
        return FStyle;
    });

    this.__defineSetter__("Style", function (AStyle) {
        if (AStyle !== FStyle)
        {
            FStyle = AStyle;
            Paint(true);
        }
    });

    this.__defineGetter__("Top", function () {
        return FTop;
    });

    this.__defineSetter__("Top", function (ATop) {
        var i;

        if (ATop !== FTop) {
            RestoreBackground();
            FTop = ATop;
            SaveBackground();
            Paint(true);

            for (i = 0; i < FControls.length; i++) {
                FControls[i].Paint(true);
            }
        }
    });
		
    this.__defineGetter__("Value", function () {
        return FValue;
    });

    this.__defineSetter__("Value", function (AValue) {
        if (AValue !== FValue)
        {
            if (FStyle === ProgressBarStyle.Marquee)
            {
                if ((new Date()) - FLastMarqueeUpdate >= FMarqueeAnimationSpeed)
                {
                    // Keep value between 0 and Maximum + 15
                    if (AValue < 0) {
                        AValue = 0;
                    }
                    if (AValue >= FWidth + 15) {
                        AValue = 0;
                    }
                    FValue = AValue;
                    Paint(false);
                    FLastMarqueeUpdate = new Date();
                }
            }
            else
            {
                // Keep value between 0 and Maximum
                FValue = Math.max(0, Math.min(AValue, FMaximum));
                Paint(false);
            }
        }
    });

    //super(AParent, ALeft, ATop, AWidth, 1);
    FParent = AParent;
    FLeft = ALeft;
    FTop = ATop;
    FWidth = AWidth;
    FHeight = 1;

    SaveBackground();

    if (FParent !== null) {
        AParent.AddControl(this);
    }
		
    FStyle = AStyle;
			
    FBackColour = Crt.BLUE;
    FBarForeColour = Crt.YELLOW; // TODO This causes blinking orange background behind percent text since Crt unit doesn't support high backgrounds unless you disable blink (so this note is to remind me to allow high backgrounds AND blink, like fTelnet)
    FBlankForeColour = Crt.LIGHTGRAY;
    FLastMarqueeUpdate = new Date();
    FMarqueeAnimationSpeed = 25;
    FMaximum = 100;
    FPercentPrecision = 2;
    FPercentVisible = true;
    FValue = 0;
			
    Paint(true);
};
