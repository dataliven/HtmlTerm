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
var TCrtPanel = function (AParent, ALeft, ATop, AWidth, AHeight, ABorder, AForeColour, ABackColour, AText, ATextAlign) {

    var that = this;
    var FBackground = null;
    var FBorder;
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

    this.__defineGetter__("Border", function () {
        return FBorder;
    });

    this.__defineSetter__("Border", function (AText) {
        if (value !== FBorder) {
            FBorder = value;
            Paint(true);
        }
    });

    this.Hide = function () {
        RestoreBackground();
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
        // Characters for the box
        var TopLeft;
        var TopRight;
        var BottomLeft;
        var BottomRight;
        var TopBottom;
        var LeftRight;

        // Determine which character set to use
        switch (FBorder) {
            case BorderStyle.Single:
                TopLeft = String.fromCharCode(218);
                TopRight = String.fromCharCode(191);
                BottomLeft = String.fromCharCode(192);
                BottomRight = String.fromCharCode(217);
                TopBottom = String.fromCharCode(196);
                LeftRight = String.fromCharCode(179);
                break;
            case BorderStyle.Double:
                TopLeft = String.fromCharCode(201);
                TopRight = String.fromCharCode(187);
                BottomLeft = String.fromCharCode(200);
                BottomRight = String.fromCharCode(188);
                TopBottom = String.fromCharCode(205);
                LeftRight = String.fromCharCode(186);
                break;
            case BorderStyle.DoubleH:
            case BorderStyle.SingleV:
                TopLeft = String.fromCharCode(213);
                TopRight = String.fromCharCode(184);
                BottomLeft = String.fromCharCode(212);
                BottomRight = String.fromCharCode(190);
                TopBottom = String.fromCharCode(205);
                LeftRight = String.fromCharCode(179);
                break;
            case BorderStyle.DoubleV:
            case BorderStyle.SingleH:
                TopLeft = String.fromCharCode(214);
                TopRight = String.fromCharCode(183);
                BottomLeft = String.fromCharCode(211);
                BottomRight = String.fromCharCode(189);
                TopBottom = String.fromCharCode(196);
                LeftRight = String.fromCharCode(186);
                break;
        }

        // Draw top row
        Crt.FastWrite(TopLeft + StringUtils.NewString(TopBottom, FWidth - 2) + TopRight, that.ScreenLeft, that.ScreenTop, FForeColour + (FBackColour << 4));

        // Draw middle rows
        for (var Line = that.ScreenTop + 1; Line < that.ScreenTop + FHeight - 1; Line++) {
            Crt.FastWrite(LeftRight + StringUtils.NewString(' ', FWidth - 2) + LeftRight, that.ScreenLeft, Line, FForeColour + (FBackColour << 4));
        }

        // Draw bottom row
        Crt.FastWrite(BottomLeft + StringUtils.NewString(TopBottom, FWidth - 2) + BottomRight, that.ScreenLeft, that.ScreenTop + FHeight - 1, FForeColour + (FBackColour << 4));

        // Draw window title
        if (StringUtils.Trim(FText).length > 0) {
            var TitleX = 0;
            var TitleY = 0;
            var WindowTitle = " " + StringUtils.Trim(FText) + " ";

            // Get X component
            switch (FTextAlign) {
                case ContentAlignment.BottomLeft:
                case ContentAlignment.MiddleLeft:
                case ContentAlignment.TopLeft:
                    TitleX = that.ScreenLeft + 2;
                    break;
                case ContentAlignment.BottomCenter:
                case ContentAlignment.MiddleCenter:
                case ContentAlignment.TopCenter:
                    TitleX = that.ScreenLeft + ((FWidth - WindowTitle.length) / 2);
                    break;
                case ContentAlignment.BottomRight:
                case ContentAlignment.MiddleRight:
                case ContentAlignment.TopRight:
                    TitleX = that.ScreenLeft + Width - WindowTitle.length - 2;
                    break;
            }

            // Get the Y component
            switch (FTextAlign) {
                case ContentAlignment.BottomCenter:
                case ContentAlignment.BottomLeft:
                case ContentAlignment.BottomRight:
                    TitleY = that.ScreenTop + FHeight - 1;
                    break;
                case ContentAlignment.MiddleCenter:
                case ContentAlignment.MiddleLeft:
                case ContentAlignment.MiddleRight:
                case ContentAlignment.TopCenter:
                case ContentAlignment.TopLeft:
                case ContentAlignment.TopRight:
                    TitleY = that.ScreenTop;
                    break;
            }

            // Draw title
            Crt.FastWrite(WindowTitle, TitleX, TitleY, FForeColour + (FBackColour << 4));
        }
    };

    RestoreBackground = function () {
        Crt.RestoreScreen(FBackground, FLeft, FTop, FLeft + FWidth - 1, FTop + FHeight - 1);
    };

    SaveBackground = function () {
        FBackground = Crt.SaveScreen(FLeft, FTop, FLeft + FWidth - 1, FTop + FHeight - 1);
    };

    this.__defineGetter__("ScreenLeft", function () {
        return FLeft + ((FParent === null) ? 0 : FParent.Left);
    });

    this.__defineGetter__("ScreenTop", function () {
        return FTop + ((FParent === null) ? 0 : FParent.Top);
    });

    this.Show = function () {
        Paint(true);
        for (var i = 0; i < FControls.length; i++) FControls[i].Paint(true);
    };

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
    FParent = AParent;
    FLeft = ALeft;
    FTop = ATop;
    FWidth = AWidth;
    FHeight = AHeight;

    SaveBackground();

    if (FParent !== null) AParent.AddControl(this);

    FBorder = ABorder;
    FForeColour = AForeColour;
    FBackColour = ABackColour;
    FText = AText;
    FTextAlign = ATextAlign;

    Paint(true);
};