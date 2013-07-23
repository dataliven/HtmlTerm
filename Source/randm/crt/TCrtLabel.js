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
var TCrtLabel = function (AParent, ALeft, ATop, AWidth, AText, ATextAlign, AForeColour, ABackColour) {

    var that = this;
    var FBackground;
    var FControls = [];
    var FHeight;
    var FLeft;
    var FParent = null;
    var FText = "";
    var FTextAlign;
    var FTop;
    var FWidth;

    // Private methods
    var Paint = function (AForce) { }; // Do nothing
    var RestoreBackground = function () { }; // Do nothing
    var SaveBackground = function () { }; // Do nothing

    this.AddControl = function (AChild) {
        FControls.push(AChild);
    };

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

            for (i = 0; i < FControls.length; i++) FControls[i].Paint(true);
        }
    });

    Paint = function (AForce) {
        // Draw the message
        switch (FTextAlign) {
            case ContentAlignment.Center:
                if (FText.length >= FWidth) {
                    // Text is greater than available space so chop it off with PadRight()
                    Crt.FastWrite(FText.substring(0, FWidth), that.ScreenLeft, that.ScreenTop, FForeColour + (FBackColour << 4));
                } else {
                    // Text needs to be centered
                    var i = 0;
                    var LeftSpaces = "";
                    for (i = 0; i < int((FWidth - FText.length) / 2) ; i++) LeftSpaces += " ";
                    var RightSpaces = "";
                    for (i = 0; i < FWidth - FText.length - LeftSpaces.length; i++) RightSpaces += " ";
                    Crt.FastWrite(LeftSpaces + FText + RightSpaces, that.ScreenLeft, that.ScreenTop, FForeColour + (FBackColour << 4));
                }
                break;
            case ContentAlignment.Left:
                Crt.FastWrite(StringUtils.PadRight(FText, ' ', FWidth), that.ScreenLeft, that.ScreenTop, FForeColour + (FBackColour << 4));
                break;
            case ContentAlignment.Right:
                Crt.FastWrite(StringUtils.PadLeft(FText, ' ', FWidth), that.ScreenLeft, that.ScreenTop, FForeColour + (FBackColour << 4));
                break;
        }
    };

    RestoreBackground = function () {
        Crt.RestoreScreen(FBackground, FLeft, FTop, FLeft + FWidth - 1, FTop + FHeight - 1);
    };

    SaveBackground = function () {
        FBackground = Crt.SaveScreen(FLeft, FTop, FLeft + FWidth - 1, FTop + FHeight - 1);
    };

    this.__defineGetter__("ScreenLeft", function () {
        trace("FLeft=" + FLeft);
        trace("FParent=" + FParent);
        trace("FParent.Left=" + FParent.Left);
        return FLeft + ((FParent === null) ? 0 : FParent.Left);
    });

    this.__defineGetter__("ScreenTop", function () {
        return FTop + ((FParent === null) ? 0 : FParent.Top);
    });

    this.__defineGetter__("Text", function () {
        return FBackColour;
    });

    this.__defineSetter__("Text", function (AText) {
        FText = AText;
        Paint(true);
    });

    this.__defineGetter__("TextAlign", function () {
        return FTextAlign;
    });

    this.__defineSetter__("TextAlign", function (ATextAlign) {
        if (ATextAlign !== FTextAlign) {
            FTextAlign = ATextAlign;
            Paint(true);
        }
    });

    this.__defineGetter__("Top", function () {
        return FTop;
    });

    this.__defineSetter__("Top", function (ATop) {
        if (ATop !== FTop) {
            RestoreBackground();
            FTop = ATop;
            SaveBackground();
            Paint(true);

            for (var i = 0; i < FControls.length; i++) FControls[i].Paint(true);
        }
    });

    // Constructor
    //super(AParent, ALeft, ATop, AWidth, 1);
    FParent = AParent;
    FLeft = ALeft;
    FTop = ATop;
    FWidth = AWidth;
    FHeight = 1;

    SaveBackground();

    if (FParent !== null) AParent.AddControl(this);

    FText = AText;
    FTextAlign = ATextAlign;
    FForeColour = AForeColour;
    FBackColour = ABackColour;

    Paint(true);
};