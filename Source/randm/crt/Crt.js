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
/// <reference path="cursor/TCursor.js" />

var Crt = function () { }; // Do nothing
var TCrt = function () {
    /// <summary>
    /// A class for manipulating a console window
    /// Compatibility with the Borland Pascal CRT unit was attempted, along with a few new additions
    /// </summary>

    /*  Color Constants
    ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯
    Use these color constants with SetPalette, SetAllPalette, TextColor, and
    TextBackground:
    */
    this.BLACK = 0;
    this.BLUE = 1;
    this.GREEN = 2;
    this.CYAN = 3;
    this.RED = 4;
    this.MAGENTA = 5;
    this.BROWN = 6;
    this.LIGHTGRAY = 7;
    this.DARKGRAY = 8;
    this.LIGHTBLUE = 9;
    this.LIGHTGREEN = 10;
    this.LIGHTCYAN = 11;
    this.LIGHTRED = 12;
    this.LIGHTMAGENTA = 13;
    this.YELLOW = 14;
    this.WHITE = 15;
    this.BLINK = 128;

    /* Private variables */
    var that = this;
    var FAtari = false;
    var FATASCIIEscaped;
    var FBitmap;
    var FBlink;
    var FBlinkHidden;
    var FBuffer;
    var FCanvas;
    var FContext;
    var FCursor;
    var FFont;
    var FKeyBuf;
    var FLastChar;
    var FScreenSize;
    var FTextAttr;
    var FWindMin;
    var FWindMax;

    // Sigh: Chrome 7.0.517 stable has a canvas problem.
    // http://code.google.com/p/chromium/issues/detail?id=60336
    var brokenCanvasUpdate = (navigator.userAgent.toLowerCase().indexOf("chrome/7.0.517") !== -1);

    // Private methods
    var InitBuffer = function () { }; // Do nothing
    var OnBlinkHide = function (e) { }; // Do nothing
    var OnBlinkShow = function (e) { }; // Do nothing
    var OnFontChanged = function (e) { }; // Do nothing
    var OnKeyDown = function (ke) { }; // Do nothing
    var OnKeyPress = function (ke) { }; // Do nothing

    Array.prototype.InitTwoDimensions = function (x, y) {
        var i;
        for (i = 0; i <= x; i++) {
            this[i] = [y + 1];
        }
    };

    this.Init = function (AParent) {
        // Init variables
        // FAtari
        FATASCIIEscaped = false;
        // FBitmap
        FBlink = true;
        FBlinkHidden = false;
        // FBuffer
        // FCanvas
        // FCursor
        FFont = new TFont();
        FFont.onchange = OnFontChanged;
        FKeyBuf = [];
        FLastChar = 0;
        FScreenSize = new Point(80, 25);
        FTextAttr = 7;
        // FWindMin
        // FWindMax

        // Create the canvas
        FCanvas = document.createElement('canvas');
        FCanvas.innerHTML = "Your browser doesn't support the HTML5 Canvas element!<br>The latest version of every major web browser supports this element, so please consider upgrading now:<ul><li><a href=\"http://www.mozilla.com/firefox/\">Mozilla Firefox</a></li><li><a href=\"http://www.google.com/chrome\">Google Chrome</a></li><li><a href=\"http://www.apple.com/safari/\">Apple Safari</a></li><li><a href=\"http://www.opera.com/\">Opera</a></li><li><a href=\"http://windows.microsoft.com/en-US/internet-explorer/products/ie/home\">MS Internet Explorer</a></li></ul>";
        FCanvas.width = FFont.Width * FScreenSize.x;
        FCanvas.height = FFont.Height * FScreenSize.y;
        AParent.appendChild(FCanvas);

        if (!FCanvas.getContext) {
            trace("HtmlTerm Error: Canvas not supported");
            return false;
        }

        // Register keydown and keypress handlers
        window.addEventListener("keydown", OnKeyDown, false); // For special keys
        window.addEventListener("keypress", OnKeyPress, false); // For regular keys

        // Reset the screen buffer
        InitBuffer();

        // Create the cursor
        FCursor = new TCursor(AParent, FFont.HTML_COLOURS[that.LIGHTGRAY], FFont.Size);
        FCursor.onhide = OnBlinkHide;
        FCursor.onshow = OnBlinkShow;

        // Update the WindMin/WindMax records
        FWindMin = 0;
        FWindMax = (FScreenSize.x - 1) | ((FScreenSize.y - 1) << 8);

        // Create the context
        FContext = FCanvas.getContext('2d');
        FContext.font = '12pt monospace';
        FContext.textBaseline = 'top';
        that.ClrScr();

        return true;
    };

    this.__defineGetter__("Atari", function () {
        return FAtari;
    });

    this.__defineSetter__("Atari", function (AAtari) {
        FAtari = AAtari;
    });

    this.Beep = function () {
        /*TODO
        var Duration = 44100 * 0.3; // 0.3 = 300ms
        var Frequency = 440; // 440hz

        */
    };

    this.__defineGetter__("bitmapData", function () {
        return FBitmap.bitmapData;
    });

    this.__defineGetter__("Blink", function () {
        return FBlink;
    });

    this.__defineSetter__("Blink", function (ABlink) {
        FBlink = ABlink;
    });

    this.__defineGetter__("Canvas", function () {
        return FCanvas;
    });

    this.ClrBol = function () {
        /// <summary>
        /// Clears all characters from the cursor position to the start of the line
        /// without moving the cursor.
        /// </summary>
        /// <remarks>
        /// All character positions are set to blanks with the currently defined text
        /// attributes. Thus, if TextBackground is not black, the current cursor
        /// position to the left edge becomes the background color.
        ///
        /// ClrBol is window-relative.
        /// </remarks>
        that.FastWrite(StringUtils.NewString(' ', that.WhereX()), that.WindMinX + 1, that.WhereYA(), FTextAttr);
    };

    this.ClrBos = function () {
        /// <summary>
        /// Clears the active window from the cursor's current line to the start of the window
        /// </summary>
        /// <remarks>
        /// Sets all character positions from the cursor's current line to the start of the window
        /// to blanks with the currently defined text attributes. Thus, if TextBackground is not
        /// black, the entire screen becomes the background color. This also applies to characters 
        /// cleared by ClrEol, InsLine, and DelLine, and to empty lines created by scrolling.
        ///
        /// ClrBos is window-relative.
        /// </remarks>
        that.ScrollUpWindow(that.WhereY());
        that.ScrollDownWindow(that.WhereY());
    };

    this.ClrEol = function () {
        /// <summary>
        /// Clears all characters from the cursor position to the end of the line
        /// without moving the cursor.
        /// </summary>
        /// <remarks>
        /// All character positions are set to blanks with the currently defined text
        /// attributes. Thus, if TextBackground is not black, the current cursor
        /// position to the right edge becomes the background color.
        ///
        /// ClrEol is window-relative.
        /// </remarks>
        that.FastWrite(StringUtils.NewString(' ', that.WindMaxX - that.WhereX() + 1), that.WhereXA(), that.WhereYA(), FTextAttr);
    };

    this.ClrEos = function () {
        /// <summary>
        /// Clears the active window from the cursor's current line to the end of the window
        /// </summary>
        /// <remarks>
        /// Sets all character positions from the cursor's current line to the end of the window
        /// to blanks with the currently defined text attributes. Thus, if TextBackground is not
        /// black, the entire screen becomes the background color. This also applies to characters 
        /// cleared by ClrEol, InsLine, and DelLine, and to empty lines created by scrolling.
        ///
        /// ClrEos is window-relative.
        /// </remarks>
        that.ScrollDownWindow(that.WindRows - that.WhereY() + 1);
        that.ScrollUpWindow(that.WindRows - that.WhereY() + 1);
    };

    this.ClrLine = function () {
        /// <summary>
        /// Clears all characters from the cursor position's current line
        /// without moving the cursor.
        /// </summary>
        /// <remarks>
        /// All character positions are set to blanks with the currently defined text
        /// attributes. Thus, if TextBackground is not black, the current cursor
        /// position's line becomes the background color.
        ///
        /// ClrLine is window-relative.
        /// </remarks>
        that.FastWrite(StringUtils.NewString(' ', that.WindCols), that.WindMinX + 1, that.WhereYA(), FTextAttr);
    };

    this.ClrScr = function () {
        /// <summary>
        /// Clears the active windows and returns the cursor to the upper-left corner.
        /// </summary>
        /// <remarks>
        /// Sets all character positions to blanks with the currently defined text
        /// attributes. Thus, if TextBackground is not black, the entire screen becomes
        /// the background color. This also applies to characters cleared by ClrEol,
        /// InsLine, and DelLine, and to empty lines created by scrolling.
        ///
        /// ClrScr is window-relative.
        /// </remarks>
        that.ScrollUpWindow(that.WindRows);
        that.GotoXY(1, 1);
    };

    this.Conceal = function () {
        // Set the foreground to the background
        var BG = 0;
        if (FBlink) {
            BG = ((FTextAttr & 0x70) >> 4);
        } else {
            BG = ((FTextAttr & 0xF0) >> 4);
        }
        that.TextColor(BG);
    };

    this.__defineGetter__("Cursor", function () {
        return FCursor;
    });

    this.DelChar = function (AChars) {
        if (AChars === undefined) { AChars = 1; }

        var i;
        for (i = that.WhereXA(); i <= that.WindMinX + that.WindCols - AChars; i++) {
            that.FastWrite(String.fromCharCode(FBuffer[i + AChars][that.WhereYA()].x), i, that.WhereYA(), FBuffer[i + AChars][that.WhereYA()].y);
        }
        for (i = that.WindMinX + that.WindCols + 1 - AChars; i <= that.WindMinX + that.WindCols; i++) {
            that.FastWrite(" ", i, that.WhereYA(), FTextAttr);
        }
    };

    this.DelLine = function (ALines) {
        /// <summary>
        /// Deletes the line containing the cursor.
        /// </summary>
        /// <remarks>
        /// The line containing the cursor is deleted, and all lines below are moved one
        /// line up (using the BIOS scroll routine). A new line is added at the bottom.
        ///
        /// All character positions are set to blanks with the currently defined text
        /// attributes. Thus, if TextBackground is not black, the new line becomes the
        /// background color.
        /// </remarks>
        if (ALines === undefined) { ALines = 1; }
        that.ScrollUpCustom(that.WindMinX + 1, that.WhereYA(), that.WindMaxX + 1, that.WindMaxY + 1, ALines, FTextAttr);
    };

    this.FastWrite = function (AText, AX, AY, AAttr, AUpdateBuffer) {
        /// <summary>
        /// Writes a string of text at the desired X/Y coordinate with the given text attribute.
        /// 
        /// FastWrite is not window-relative, and it does not wrap text that goes beyond the right edge of the screen.
        /// </summary>
        /// <param name="AText" type="String">The text to write</param>
        /// <param name="AX" type="Number" integer="true">The 1-based column to start the text</param>
        /// <param name="AY" type="Number" integer="true">The 1-based row to start the text</param>
        /// <param name="AAttr" type="Number" integer="true">The text attribute to colour the text</param>
        /// <param name="AUpdateBuffer" type="Boolean" optional="true">Whether to update the internal buffer or not (default is true)</param>
        if (AUpdateBuffer === undefined) { AUpdateBuffer = true; }

        if ((AX <= FScreenSize.x) && (AY <= FScreenSize.y)) {
            // Remove high background if blinking is enabled
            var CharAttr = (FBlink) ? AAttr & 0x7F : AAttr;

            var i;
            for (i = 0; i < AText.length; i++) {
                var Char = FFont.GetChar(AText.charCodeAt(i), CharAttr);
                if (Char) { FContext.putImageData(Char, (AX - 1 + i) * FFont.Width, (AY - 1) * FFont.Height); }

                if (AUpdateBuffer) {
                    FBuffer[AX + i][AY].x = AText.charCodeAt(i);
                    FBuffer[AX + i][AY].y = AAttr;
                }

                if (AX + i >= FScreenSize.x) { break; }
            }
        }
    };

    this.GotoXY = function (AX, AY) {
        /// <summary>
        /// Moves the cursor to the given coordinates within the virtual screen.
        /// </summary>
        /// <remarks>
        /// The upper-left corner of the virtual screen corresponds to (1, 1).
        /// 
        /// GotoXY is window-relative.
        /// </remarks>
        /// <param name="AX">The 1-based column to move to</param>
        /// <param name="AY">The 1-based row to move to</param>
        if ((AX > 0) && (AY > 0) && ((AX - 1 + that.WindMinX) <= that.WindMaxX) && ((AY - 1 + that.WindMinY) <= that.WindMaxY)) {
            FCursor.Position = new Point(AX, AY);
        }
    };

    this.HideCursor = function () {
        FCursor.Visible = false;
    };

    this.HighVideo = function () {
        /// <summary>
        /// Selects high-intensity characters.
        /// </summary>
        /// <remarks>
        /// There is a Byte variable in Crt TextAttr that is used to hold the current
        /// video attribute. HighVideo sets the high intensity bit of TextAttr's
        /// fore-ground color, thus mapping colors 0-7 onto colors 8-15.
        /// </remarks>
        FTextAttr |= 0x08;
    };

    // Have to do this here because the static constructor doesn't seem to like the X and Y variables
    InitBuffer = function () {
        FBuffer = [];
        FBuffer.InitTwoDimensions(FScreenSize.x, FScreenSize.y);

        var X;
        var Y;
        for (Y = 1; Y <= FScreenSize.y; Y++) {
            for (X = 1; X <= FScreenSize.x; X++) {
                FBuffer[X][Y] = new Point(32, 7);
            }
        }
    };

    this.InsChar = function (AChars) {
        if (AChars === undefined) { AChars = 1; }

        var i;
        for (i = that.WindMinX + that.WindCols; i >= that.WhereXA() + AChars; i--) {
            that.FastWrite(String.fromCharCode(FBuffer[i - AChars][that.WhereYA()].x), i, that.WhereYA(), FBuffer[i - AChars][that.WhereYA()].y);
        }
        for (i = that.WhereXA(); i < that.WhereXA() + AChars; i++) {
            that.FastWrite(" ", i, that.WhereYA(), FTextAttr);
        }
    };

    this.InsLine = function (ALines) {
        /// <summary>
        /// Inserts an empty line at the cursor position.
        /// </summary>
        /// <remarks>
        /// All lines below the inserted line are moved down one line, and the bottom
        /// line scrolls off the screen (using the BIOS scroll routine).
        ///
        /// All character positions are set to blanks with the currently defined text
        /// attributes. Thus, if TextBackground is not black, the new line becomes the
        /// background color.
        /// 
        /// InsLine is window-relative.
        /// </remarks>
        if (ALines === undefined) { ALines = 1; }
        that.ScrollDownCustom(that.WindMinX + 1, that.WhereYA(), that.WindMaxX + 1, that.WindMaxY + 1, ALines, FTextAttr);

    };

    this.KeyPressed = function () {
        return (FKeyBuf.length > 0);
    };

    this.LowVideo = function () {
        /// <summary>
        /// Selects low intensity characters.
        /// </summary>
        /// <remarks>
        /// There is a Byte variable in Crt--TextAttr--that holds the current video
        /// attribute. LowVideo clears the high-intensity bit of TextAttr's foreground
        /// color, thus mapping colors 8 to 15 onto colors 0 to 7.
        /// </remarks>
        FTextAttr &= 0xF7;
    };

    this.NormVideo = function () {
        /// <summary>
        /// Selects the original text attribute read from the cursor location at startup.
        /// </summary>
        /// <remarks>
        /// There is a Byte variable in Crt--TextAttr--that holds the current video
        /// attribute. NormVideo restores TextAttr to the value it had when the program
        /// was started.
        /// </remarks>
        FTextAttr = that.LIGHTGRAY;
    };

    OnBlinkHide = function (e) {
        // Only hide the text if blink is enabled
        if (FBlink) {
            FBlinkHidden = true;

            var X;
            var Y;
            for (Y = 1; Y <= FScreenSize.y; Y++) {
                for (X = 1; X <= FScreenSize.x; X++) {
                    if ((FBuffer[X][Y].y & that.BLINK) === that.BLINK) {
                        if (FBuffer[X][Y].x !== 32) {
                            that.FastWrite(" ", X, Y, FBuffer[X][Y].y, false);
                        }
                    }
                }
            }
        }

        // Fix for broken Chrome
        if (brokenCanvasUpdate) { Crt.Canvas.style.opacity = 0.999; }
    };

    OnBlinkShow = function (e) {
        // Show the text if blink is enabled, or we need a reset (which happens when blink is diabled while in the hidden state)
        if (FBlink || FBlinkHidden) {
            FBlinkHidden = false;

            var X;
            var Y;
            for (Y = 1; Y <= FScreenSize.y; Y++) {
                for (X = 1; X <= FScreenSize.x; X++) {
                    if ((FBuffer[X][Y].y & that.BLINK) === that.BLINK) {
                        if (FBuffer[X][Y].x !== 32) {
                            that.FastWrite(String.fromCharCode(FBuffer[X][Y].x), X, Y, FBuffer[X][Y].y, false);
                        }
                    }
                }
            }
        }

        // Reposition the cursor
        FCursor.WindowOffset = getElementPosition(FCanvas);

        // Fix for broken Chrome
        if (brokenCanvasUpdate) { Crt.Canvas.style.opacity = 1; }
    };

    OnFontChanged = function (e) {
        // Resize the cursor
        FCursor.Size = FFont.Size;

        // Update the bitmap
        FCanvas.height = FFont.Height * FScreenSize.y;
        FCanvas.width = FFont.Width * FScreenSize.x;

        // Restore the screen contents
        var X;
        var Y;
        if (FBuffer !== null) {
            for (Y = 1; Y <= FScreenSize.y; Y++) {
                for (X = 1; X <= FScreenSize.x; X++) {
                    that.FastWrite(String.fromCharCode(FBuffer[X][Y].x), X, Y, FBuffer[X][Y].y, false);
                }
            }
        }
    };

    OnKeyDown = function (ke) {
        var keyString = "";

        if (ke.ctrlKey) {
            // Handle control + letter keys
            if ((ke.keyCode >= 65) && (ke.keyCode <= 90)) {
                if (FAtari) {
                    switch (ke.keyCode) {
                        case 72: keyString = String.fromCharCode(126); break; // CTRL-H
                        case 74: keyString = String.fromCharCode(13); break; // CTRL-J
                        case 77: keyString = String.fromCharCode(155); break; // CTRL-M
                        default: keyString = String.fromCharCode(ke.keyCode - 64); break;
                    }
                } else {
                    keyString = String.fromCharCode(ke.keyCode - 64);
                }
            }
            else if ((ke.keyCode >= 97) && (ke.keyCode <= 122)) {
                if (FAtari) {
                    switch (ke.keyCode) {
                        case 104: keyString = String.fromCharCode(126); break; // CTRL-H
                        case 106: keyString = String.fromCharCode(13); break; // CTRL-J
                        case 109: keyString = String.fromCharCode(155); break; // CTRL-M
                        default: keyString = String.fromCharCode(ke.keyCode - 96); break;
                    }
                } else {
                    keyString = String.fromCharCode(ke.keyCode - 96);
                }
            }
        } else {
            switch (ke.keyCode) {
                // Handle special keys                                                                                                  
                case Keyboard.BACKSPACE: keyString = (FAtari) ? String.fromCharCode(0x7E) : String.fromCharCode(ke.keyCode); break;
                case Keyboard.DELETE: keyString = "\x7F"; break;
                case Keyboard.DOWN: keyString = "\x1B[B"; break;
                case Keyboard.END: keyString = "\x1B[K"; break;
                case Keyboard.ENTER: keyString = (FAtari) ? "\x9B" : "\r\n"; break;
                case Keyboard.ESCAPE: keyString = "\x1B"; break;
                case Keyboard.F1: keyString = "\x1BOP"; break;
                case Keyboard.F2: keyString = "\x1BOQ"; break;
                case Keyboard.F3: keyString = "\x1BOR"; break;
                case Keyboard.F4: keyString = "\x1BOS"; break;
                case Keyboard.F5: keyString = "\x1BOt"; break;
                case Keyboard.F6: keyString = "\x1B[17~"; break;
                case Keyboard.F7: keyString = "\x1B[18~"; break;
                case Keyboard.F8: keyString = "\x1B[19~"; break;
                case Keyboard.F9: keyString = "\x1B[20~"; break;
                case Keyboard.F10: keyString = "\x1B[21~"; break;
                case Keyboard.F11: keyString = "\x1B[23~"; break;
                case Keyboard.F12: keyString = "\x1B[24~"; break;
                case Keyboard.HOME: keyString = "\x1B[H"; break;
                case Keyboard.INSERT: keyString = "\x1B@"; break;
                case Keyboard.LEFT: keyString = "\x1B[D"; break;
                case Keyboard.PAGE_DOWN: keyString = "\x1B[U"; break;
                case Keyboard.PAGE_UP: keyString = "\x1B[V"; break;
                case Keyboard.RIGHT: keyString = "\x1B[C"; break;
                case Keyboard.SPACE: keyString = " "; break;
                case Keyboard.TAB: keyString = (FAtari) ? "\x7F" : String.fromCharCode(ke.keyCode); break;
                case Keyboard.UP: keyString = "\x1B[A"; break;
            }
        }

        FKeyBuf.push(new KeyPressEvent(ke, keyString));

        if ((keyString) || (ke.ctrlKey)) {
            ke.preventDefault();
        }
    };

    OnKeyPress = function (ke) {
        var keyString = "";

        if (ke.ctrlKey) { return; } // This is only meant for regular keypresses

        // Opera doesn't give us the charCode, so try which in that case
        var which = (ke.charCode !== null) ? ke.charCode : ke.which;
        if ((which >= 33) && (which <= 126)) {
            keyString = String.fromCharCode(which);
        }

        FKeyBuf.push(new KeyPressEvent(ke, keyString));
    };

    this.OnKeyFocusChange = function (fe) {
        fe.preventDefault();
    };

    this.ReadKey = function () {
        if (FKeyBuf.length === 0) { return null; }

        return FKeyBuf.shift();
    };

    this.ReDraw = function () {
        var X;
        var Y;
        for (Y = 1; Y <= FScreenSize.y; Y++) {
            for (X = 1; X <= FScreenSize.x; X++) {
                that.FastWrite(String.fromCharCode(FBuffer[X][Y].x), X, Y, FBuffer[X][Y].y, false);
            }
        }
    };

    this.RestoreScreen = function (ABuffer, ALeft, ATop, ARight, ABottom) {
        var X;
        var Y;
        for (Y = ATop; Y <= ABottom; Y++) {
            for (X = ALeft; X <= ARight; X++) {
                that.FastWrite(String.fromCharCode(ABuffer[X][Y].x), X, Y, ABuffer[X][Y].y);
            }
        }
    };

    this.ReverseVideo = function () {
        /// <summary>
        /// Reverses the foreground and background text attributes
        /// </summary>
        if (FBlink) {
            FTextAttr = ((FTextAttr & 0x70) >> 4) | ((FTextAttr & 0x07) << 4);
        } else {
            FTextAttr = ((FTextAttr & 0xF0) >> 4) | ((FTextAttr & 0x0F) << 4);
        }
    };

    this.SaveScreen = function (ALeft, ATop, ARight, ABottom) {
        var Result = [];
        Result.InitTwoDimensions(FScreenSize.x, FScreenSize.y);

        var X;
        var Y;
        for (Y = ATop; Y <= ABottom; Y++) {
            for (X = ALeft; X <= ARight; X++) {
                Result[X][Y] = new Point(FBuffer[X][Y].x, FBuffer[X][Y].y);
            }
        }

        return Result;
    };

    this.__defineGetter__("ScreenCols", function () {
        return FScreenSize.x;
    });

    this.__defineGetter__("ScreenRows", function () {
        return FScreenSize.y;
    });

    this.ScrollDownCustom = function (AX1, AY1, AX2, AY2, ALines, AAttr) {
        /// <summary>
        /// Scrolls the given window down the given number of lines (leaving blank lines at the top), filling the void with the given character with the given text attribute
        /// </summary>
        /// <param name="AX1">The 1-based left column of the window</param>
        /// <param name="AY1">The 1-based top row of the window</param>
        /// <param name="AX2">The 1-based right column of the window</param>
        /// <param name="AY2">The 1-based bottom row of the window</param>
        /// <param name="ALines">The number of lines to scroll</param>
        /// <param name="ACh">The character to fill the void with</param>
        /// <param name="AAttr">The text attribute to fill the void with</param>

        // Validate the ALines parameter
        var MaxLines = AY2 - AY1 + 1;
        if (ALines > MaxLines) { ALines = MaxLines; }

        var Back = (AAttr & 0xF0) >> 4;
        if (FBlink) { Back &= 0x07; }

        // Scroll -- TODO Hasn't been tested yet
        var Left = (AX1 - 1) * FFont.Width;
        var Top = (AY1 - 1) * FFont.Height;
        var Width = (AX2 - AX1 + 1) * FFont.Width;
        var Height = ((AY2 - AY1 + 1 - ALines) * FFont.Height);
        if (Height > 0) {
            var Buf = FContext.getImageData(Left, Top, Width, Height);
            Left = (AX1 - 1) * FFont.Width;
            Top = (AY1 - 1) * FFont.Height;
            FContext.putImageData(Buf, Left, Top);
        }

        // Blank -- TODO Hasn't been tested yet
        FContext.fillStyle = (FBlink) ? FFont.HTML_COLOURS[(AAttr & 0x70) >> 4] : FFont.HTML_COLOURS[(AAttr & 0xF0) >> 4];
        Left = (AX1 - 1) * FFont.Width;
        Top = (AY1 - 1) * FFont.Height;
        Width = (AX2 - AX1 + 1) * FFont.Width;
        Height = (ALines * FFont.Height);
        FContext.fillRect(Left, Top, Width, Height);

        // Now to adjust the buffer
        var X = 0;
        var Y = 0;

        // First, shuffle the contents that are still visible
        for (Y = AY2; Y > ALines; Y--) {
            for (X = AX1; X <= AX2; X++) {
                FBuffer[X][Y].x = FBuffer[X][Y - ALines].x;
                FBuffer[X][Y].y = FBuffer[X][Y - ALines].y;
            }
        }

        // Then, blank the contents that are not
        for (Y = AY1; Y <= ALines; Y++) {
            for (X = AX1; X <= AX2; X++) {
                FBuffer[X][Y].x = 32; // Blank
                FBuffer[X][Y].y = AAttr;
            }
        }
    };

    this.ScrollDownScreen = function (ALines) {
        /// <summary>
        /// Scrolls the screen down the given number of lines (leaving blanks at the top)
        /// </summary>
        /// <param name="ALines">The number of lines to scroll</param>
        that.ScrollDownCustom(1, 1, FScreenSize.x, FScreenSize.y, ALines, FTextAttr);
    };

    this.ScrollDownWindow = function (ALines) {
        /// <summary>
        /// Scrolls the current window down the given number of lines (leaving blanks at the top)
        /// </summary>
        /// <param name="ALines">The number of lines to scroll</param>
        that.ScrollDownCustom(that.WindMinX + 1, that.WindMinY + 1, that.WindMaxX + 1, that.WindMaxY + 1, ALines, FTextAttr);
    };

    this.ScrollUpCustom = function (AX1, AY1, AX2, AY2, ALines, AAttr) {
        /// <summary>
        /// Scrolls the given window up the given number of lines (leaving blank lines at the bottom), filling the void with the given character with the given text attribute
        /// </summary>
        /// <param name="AX1">The 1-based left column of the window</param>
        /// <param name="AY1">The 1-based top row of the window</param>
        /// <param name="AX2">The 1-based right column of the window</param>
        /// <param name="AY2">The 1-based bottom row of the window</param>
        /// <param name="ALines">The number of lines to scroll</param>
        /// <param name="ACh">The character to fill the void with</param>
        /// <param name="AAttr">The text attribute to fill the void with</param>

        // Validate the ALines parameter
        var MaxLines = AY2 - AY1 + 1;
        if (ALines > MaxLines) { ALines = MaxLines; }

        var Back = (AAttr & 0xF0) >> 4;
        if (FBlink) { Back &= 0x07; }

        // Scroll
        var Left = (AX1 - 1) * FFont.Width;
        var Top = (AY1 - 1 + ALines) * FFont.Height;
        var Width = (AX2 - AX1 + 1) * FFont.Width;
        var Height = ((AY2 - AY1 + 1 - ALines) * FFont.Height);
        if (Height > 0) {
            var Buf = FContext.getImageData(Left, Top, Width, Height);
            Left = (AX1 - 1) * FFont.Width;
            Top = (AY1 - 1) * FFont.Height;
            FContext.putImageData(Buf, Left, Top);
        }

        // Blank
        FContext.fillStyle = (FBlink) ? FFont.HTML_COLOURS[(AAttr & 0x70) >> 4] : FFont.HTML_COLOURS[(AAttr & 0xF0) >> 4];
        Left = (AX1 - 1) * FFont.Width;
        Top = (AY2 - ALines) * FFont.Height;
        Width = (AX2 - AX1 + 1) * FFont.Width;
        Height = (ALines * FFont.Height);
        FContext.fillRect(Left, Top, Width, Height);

        // Now to adjust the buffer
        var X = 0;
        var Y = 0;

        // First, shuffle the contents that are still visible
        for (Y = AY1; Y <= (AY2 - ALines); Y++) {
            for (X = AX1; X <= AX2; X++) {
                FBuffer[X][Y].x = FBuffer[X][Y + ALines].x;
                FBuffer[X][Y].y = FBuffer[X][Y + ALines].y;
            }
        }

        // Then, blank the contents that are not
        for (Y = AY2; Y > (AY2 - ALines); Y--) {
            for (X = AX1; X <= AX2; X++) {
                FBuffer[X][Y].x = 32; // Blank
                FBuffer[X][Y].y = AAttr;
            }
        }
    };

    this.ScrollUpScreen = function (ALines) {
        /// <summary>
        /// Scrolls the screen up the given number of lines (leaving blanks at the bottom)
        /// </summary>
        /// <param name="ALines">The number of lines to scroll</param>
        that.ScrollUpCustom(1, 1, FScreenSize.x, FScreenSize.y, ALines, FTextAttr);
    };

    this.ScrollUpWindow = function (ALines) {
        /// <summary>
        /// Scrolls the current window up the given number of lines (leaving blanks at the bottom)
        /// </summary>
        /// <param name="ALines">The number of lines to scroll</param>
        that.ScrollUpCustom(that.WindMinX + 1, that.WindMinY + 1, that.WindMaxX + 1, that.WindMaxY + 1, ALines, FTextAttr);
    };

    this.SetBlinkRate = function (AMS) {
        FCursor.BlinkRate = AMS;
    };

    this.SetFont = function (ACodePage, AWidth, AHeight) {
        /// <summary>
        /// Try to set the console font size to characters with the given X and Y size
        /// </summary>
        /// <param name="AX">The horizontal size</param>
        /// <param name="AY">The vertical size</param>
        /// <returns>True if the size was found and set, False if the size was not available</returns>

        // Only try to change if the current size doens't match the requested size
        if ((ACodePage !== FFont.CodePage) || (AWidth !== FFont.Size.x) || (AHeight !== FFont.Size.y)) {
            // Request the new font
            FFont.Load(ACodePage, AWidth, AHeight);
        }
    };

    this.SetScreenSize = function (AColumns, ARows) {
        // Check if the requested size is already in use
        if ((AColumns === FScreenSize.x) && (ARows === FScreenSize.y)) { return; }

        var X = 0;
        var Y = 0;

        // Save the old details
        var FOldBuffer;
        if (FBuffer !== null) {
            FOldBuffer = [];
            FOldBuffer.InitTwoDimensions(FScreenSize.x, FScreenSize.y);
            for (Y = 1; Y <= FScreenSize.y; Y++) {
                for (X = 1; X <= FScreenSize.x; X++) {
                    FOldBuffer[X][Y] = new Point(FBuffer[X][Y].x, FBuffer[X][Y].y);
                }
            }
        }
        var FOldScreenSize = new Point(FScreenSize.x, FScreenSize.y);

        // Set the new console screen size
        FScreenSize.x = AColumns;
        FScreenSize.y = ARows;

        // Update the WindMin/WindMax records
        FWindMin = 0;
        FWindMax = (FScreenSize.x - 1) | ((FScreenSize.y - 1) << 8);

        // Reset the screen buffer 
        FBuffer = [];
        FBuffer.InitTwoDimensions(FScreenSize.x, FScreenSize.y);
        for (Y = 1; Y <= FScreenSize.y; Y++) {
            for (X = 1; X <= FScreenSize.x; X++) {
                FBuffer[X][Y] = new Point(32, 7);
            }
        }

        // Update the bitmap
        /*FBitmap.bitmapData = new BitmapData(FFont.Width * FScreenSize.x, FFont.Height * FScreenSize.y, false, 0);
        FCanvas.width = FBitmap.width;
        FCanvas.height = FBitmap.height;*/

        // Restore the screen contents
        if (FOldBuffer !== null) {
            for (Y = 1; Y <= Math.min(FScreenSize.y, FOldScreenSize.y); Y++) {
                for (X = 1; X <= Math.min(FScreenSize.x, FOldScreenSize.x); X++) {
                    that.FastWrite(String.fromCharCode(FOldBuffer[X][Y].x), X, Y, FOldBuffer[X][Y].y);
                }
            }
        }

        // Let the program know about the update
        //FCanvas.dispatchEvent(that.SCREEN_SIZE_CHANGED);
        var evObj = document.createEvent('Events');
        evObj.initEvent(that.SCREEN_SIZE_CHANGED, true, false);
        FCanvas.dispatchEvent(evObj);
    };

    this.ShowCursor = function () {
        FCursor.Visible = true;
    };

    this.__defineGetter__("TextAttr", function () {
        /// <summary>
        /// Stores currently selected text attributes
        /// </summary>
        /// <remarks>
        /// The text attributes are normally set through calls to TextColor and
        /// TextBackground.
        ///
        /// However, you can also set them by directly storing a value in TextAttr.
        /// </remarks>
        return FTextAttr;
    });

    this.__defineSetter__("TextAttr", function (AAttr) {
        FTextAttr = AAttr;
    });

    this.TextBackground = function (AColor) {
        /// <summary>
        /// Selects the background color.
        /// </summary>
        /// <remarks>
        /// Color is an integer expression in the range 0..7, corresponding to one of
        /// the first eight text color constants. There is a byte variable in
        /// Crt--TextAttr--that is used to hold the current video attribute.
        /// TextBackground sets bits 4-6 of TextAttr to Color.
        ///
        /// The background of all characters subsequently written will be in the
        /// specified color.
        /// </remarks>
        /// <param name="AColor">The colour to set the background to</param>
        if (FBlink) {
            FTextAttr = (FTextAttr & 0x8F) | ((AColor & 0x07) << 4);
        } else {
            FTextAttr = (FTextAttr & 0x0F) | ((AColor & 0x0F) << 4);
        }
    };

    this.TextColor = function (AColor) {
        /// <summary>
        /// Selects the foreground character color.
        /// </summary>
        /// <remarks>
        /// Color is an integer expression in the range 0..15, corresponding to one of
        /// the text color constants defined in Crt.
        ///
        /// There is a byte-type variable Crt--TextAttr--that is used to hold the
        /// current video attribute. TextColor sets bits 0-3 to Color. If Color is
        /// greater than 15, the blink bit (bit 7) is also set; otherwise, it is
        /// cleared.
        ///
        /// You can make characters blink by adding 128 to the color value. The Blink
        /// constant is defined for that purpose; in fact, for compatibility with Turbo
        /// Pascal 3.0, any Color value above 15 causes the characters to blink. The
        /// foreground of all characters subsequently written will be in the specified
        /// color.
        /// </remarks>
        /// <param name="AColor">The colour to set the foreground to</param>
        FTextAttr = (FTextAttr & 0xF0) | (AColor & 0x0F);
    };

    this.WhereX = function () {
        /// <summary>
        /// Returns the CP's X coordinate of the current cursor location.
        /// </summary>
        /// <remarks>
        /// WhereX is window-specific.
        /// </remarks>
        /// <returns>The 1-based column of the window the cursor is currently in</returns>
        return FCursor.Position.x;
    };

    this.WhereXA = function () {
        /// <summary>
        /// Returns the CP's X coordinate of the current cursor location.
        /// </summary>
        /// <remarks>
        /// WhereXA is not window-specific.
        /// </remarks>
        /// <returns>The 1-based column of the screen the cursor is currently in</returns>
        return that.WhereX() + that.WindMinX;
    };

    /// <summary>
    /// Returns the CP's Y coordinate of the current cursor location.
    /// </summary>
    /// <remarks>
    /// WhereY is window-specific.
    /// </remarks>
    /// <returns>The 1-based row of the window the cursor is currently in</returns>
    this.WhereY = function () {
        return FCursor.Position.y;
    };

    this.WhereYA = function () {
        /// <summary>
        /// Returns the CP's Y coordinate of the current cursor location.
        /// </summary>
        /// <remarks>
        /// WhereYA is now window-specific.
        /// </remarks>
        /// <returns>The 1-based row of the screen the cursor is currently in</returns>
        return that.WhereY() + that.WindMinY;
    };

    this.__defineGetter__("WindCols", function () {
        /// <summary>
        /// The number of columns found in the currently defined window
        /// </summary>
        return that.WindMaxX - that.WindMinX + 1;
    });

    this.__defineGetter__("WindMax", function () {
        /// <summary>
        /// The 0-based lower right coordinate of the current window
        /// </summary>
        return FWindMax;
    });

    this.__defineGetter__("WindMaxX", function () {
        /// <summary>
        /// The 0-based left column of the current window
        /// </summary>
        return (that.WindMax & 0x00FF);
    });

    this.__defineGetter__("WindMaxY", function () {
        /// <summary>
        /// The 0-based right column of the current window
        /// </summary>
        return ((that.WindMax & 0xFF00) >> 8);
    });

    this.__defineGetter__("WindMin", function () {
        /// <summary>
        /// The 0-based upper left coordinate of the current window
        /// </summary>
        return FWindMin;
    });

    this.__defineGetter__("WindMinX", function () {
        /// <summary>
        /// The 0-based top row of the current window
        /// </summary>
        return (that.WindMin & 0x00FF);
    });

    this.__defineGetter__("WindMinY", function () {
        /// <summary>
        /// The 0-based bottom row of the current window
        /// </summary>
        return ((that.WindMin & 0xFF00) >> 8);
    });

    this.Window = function (AX1, AY1, AX2, AY2) {
        /// <summary>
        /// Defines a text window on the screen.
        /// </summary>
        /// <remarks>
        /// X1 and Y1 are the coordinates of the upper left corner of the window, and X2
        /// and Y2 are the coordinates of the lower right corner. The upper left corner
        /// of the screen corresponds to (1, 1). The minimum size of a text window is
        /// one column by one line. If the coordinates are invalid in any way, the call
        /// to Window is ignored.
        ///
        /// The default window is (1, 1, 80, 25) in 25-line mode, and (1, 1, 80, 43) in
        /// 43-line mode, corresponding to the entire screen.
        ///
        /// All screen coordinates (except the window coordinates themselves) are
        /// relative to the current window. For instance, GotoXY(1, 1) will always
        /// position the cursor in the upper left corner of the current window.
        ///
        /// Many Crt procedures and functions are window-relative, including ClrEol,
        /// ClrScr, DelLine, GotoXY, InsLine, WhereX, WhereY, Read, Readln, Write,
        /// Writeln.
        ///
        /// WindMin and WindMax store the current window definition. A call to the
        /// Window procedure always moves the cursor to (1, 1).
        /// </remarks>
        /// <param name="AX1">The 1-based left column of the window</param>
        /// <param name="AY1">The 1-based top row of the window</param>
        /// <param name="AX2">The 1-based right column of the window</param>
        /// <param name="AY2">The 1-based bottom row of the window</param>
        if ((AX1 > 0) && (AY1 > 0) && (AX1 <= AX2) && (AY1 <= AY2)) {
            if ((AX2 <= FScreenSize.x) && (AY2 <= FScreenSize.y)) {
                FWindMin = (AX1 - 1) + ((AY1 - 1) << 8);
                FWindMax = (AX2 - 1) + ((AY2 - 1) << 8);
                FCursor.WindowOffset = new Point(AX1 - 1, AY1 - 1);
                that.GotoXY(1, 1);
            }
        }
    };

    this.__defineGetter__("WindRows", function () {
        /// <summary>
        /// The number of rows found in the currently defined window
        /// </summary>
        return that.WindMaxY - that.WindMinY + 1;
    });

    this.Write = function (AText) {
        /// <summary>
        /// Writes a given line of text to the screen.
        /// </summary>
        /// <remarks>
        /// Text is wrapped if it exceeds the right edge of the window
        /// </remarks>
        /// <param name="AText">The text to print to the screen</param>
        if (FAtari) {
            that.WriteATASCII(AText);
        } else {
            that.WriteASCII(AText);
        }
    };

    this.WriteASCII = function (AText) {
        if (AText === undefined) { AText = ""; }

        var X = that.WhereX();
        var Y = that.WhereY();
        var Buf = "";

        var i;
        for (i = 0; i < AText.length; i++) {
            var DoGoto = false;

            if (AText.charCodeAt(i) === 0x07) {
                that.Beep();
            }
            else if (AText.charCodeAt(i) === 0x08) {
                // Backspace, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
                X += Buf.length;
                if (X > 1) { X -= 1; }
                DoGoto = true;

                Buf = "";
            }
            else if (AText.charCodeAt(i) === 0x09) {
                // Tab, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
                X += Buf.length;
                Buf = "";

                // Figure out where the next tabstop is
                if (X === that.WindCols) {
                    // Cursor is in last position, tab goes to the first position of the next line
                    X = 1;
                    Y += 1;
                } else {
                    // Cursor goes to the next multiple of 8
                    X += 8 - (X % 8);
                }
                DoGoto = true;
            }
            else if (AText.charCodeAt(i) === 0x0A) {
                // Line feed, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
                X += Buf.length;
                Y += 1;
                DoGoto = true;

                Buf = "";
            }
            else if (AText.charCodeAt(i) === 0x0C) {
                // Clear the screen
                that.ClrScr();

                // Reset the variables
                X = 1;
                Y = 1;
                Buf = "";
            }
            else if (AText.charCodeAt(i) === 0x0D) {
                // Carriage return, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
                X = 1;
                DoGoto = true;

                Buf = "";
            }
            else if (AText.charCodeAt(i) !== 0) {
                // Append character to buffer
                Buf += String.fromCharCode(AText.charCodeAt(i) & 0xFF);

                // Check if we've passed the right edge of the window
                if ((X + Buf.length) > that.WindCols) {
                    // We have, need to flush buffer before moving cursor
                    that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
                    Buf = "";

                    X = 1;
                    Y += 1;
                    DoGoto = true;
                }
            }

            // Check if we've passed the bottom edge of the window
            if (Y > that.WindRows) {
                // We have, need to scroll the window one line
                Y = that.WindRows;
                that.ScrollUpWindow(1);
                DoGoto = true;
            }

            if (DoGoto) { that.GotoXY(X, Y); }
        }

        // Flush remaining text in buffer if we have any
        if (Buf.length > 0) {
            that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
            X += Buf.length;
            that.GotoXY(X, Y);
        }
    };

    this.WriteATASCII = function (AText) {
        if (AText === undefined) { AText = ""; }

        var X = that.WhereX();
        var Y = that.WhereY();
        var Buf = "";

        var i;
        for (i = 0; i < AText.length; i++) {
            // trace(AText.charCodeAt(i));
            var DoGoto = false;

            if ((AText.charCodeAt(i) === 0x1B) && (!FATASCIIEscaped)) {
                // Escape
                FATASCIIEscaped = true;
            }
            else if ((AText.charCodeAt(i) === 0x1C) && (!FATASCIIEscaped)) {
                // Cursor up, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
                X += Buf.length;
                Y = (Y > 1) ? Y - 1 : that.WindRows;
                DoGoto = true;

                Buf = "";
            }
            else if ((AText.charCodeAt(i) === 0x1D) && (!FATASCIIEscaped)) {
                // Cursor down, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
                X += Buf.length;
                Y = (Y < that.WindRows) ? Y + 1 : 1;
                DoGoto = true;

                Buf = "";
            }
            else if ((AText.charCodeAt(i) === 0x1E) && (!FATASCIIEscaped)) {
                // Cursor left, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
                X += Buf.length;
                X = (X > 1) ? X - 1 : that.WindCols;
                DoGoto = true;

                Buf = "";
            }
            else if ((AText.charCodeAt(i) === 0x1F) && (!FATASCIIEscaped)) {
                // Cursor right, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
                X += Buf.length;
                X = (X < that.WindCols) ? X + 1 : 1;
                DoGoto = true;

                Buf = "";
            }
            else if ((AText.charCodeAt(i) === 0x7D) && (!FATASCIIEscaped)) {
                // Clear the screen
                that.ClrScr();

                // Reset the variables
                X = 1;
                Y = 1;
                Buf = "";
            }
            else if ((AText.charCodeAt(i) === 0x7E) && (!FATASCIIEscaped)) {
                // Backspace, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
                X += Buf.length;
                Buf = "";
                DoGoto = true;

                if (X > 1) {
                    X -= 1;
                    that.FastWrite(" ", X, that.WhereYA(), FTextAttr);
                }
            }
            else if ((AText.charCodeAt(i) === 0x7F) && (!FATASCIIEscaped)) {
                // Tab, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
                X += Buf.length;
                Buf = "";

                // Figure out where the next tabstop is
                if (X === that.WindCols) {
                    // Cursor is in last position, tab goes to the first position of the next line
                    X = 1;
                    Y += 1;
                } else {
                    // Cursor goes to the next multiple of 8
                    X += 8 - (X % 8);
                }
                DoGoto = true;
            }
            else if ((AText.charCodeAt(i) === 0x9B) && (!FATASCIIEscaped)) {
                // Line feed, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
                X = 1;
                Y += 1;
                DoGoto = true;

                Buf = "";
            }
            else if ((AText.charCodeAt(i) === 0x9C) && (!FATASCIIEscaped)) {
                // Delete line, need to flush buffer before doing so
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
                X = 1;
                Buf = "";

                that.GotoXY(X, Y);
                that.DelLine();
            }
            else if ((AText.charCodeAt(i) === 0x9D) && (!FATASCIIEscaped)) {
                // Insert line, need to flush buffer before doing so
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
                X = 1;
                Buf = "";

                that.GotoXY(X, Y);
                that.InsLine();
            }
            else if ((AText.charCodeAt(i) === 0xFD) && (!FATASCIIEscaped)) {
                that.Beep();
            }
            else if ((AText.charCodeAt(i) === 0xFE) && (!FATASCIIEscaped)) {
                // Delete character, need to flush buffer before doing so
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
                X += Buf.length;
                Buf = "";

                that.GotoXY(X, Y);
                that.DelChar();
            }
            else if ((AText.charCodeAt(i) === 0xFF) && (!FATASCIIEscaped)) {
                // Insert character, need to flush buffer before doing so
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
                X += Buf.length;
                Buf = "";

                that.GotoXY(X, Y);
                that.InsChar();
            }
            else {
                // Append character to buffer (but handle lantronix filter)
                if ((AText.charCodeAt(i) === 0x00) && (FLastChar === 0x0D)) {
                    // LANtronix always sends 0 after 13, so we'll ignore it
                    Buf += ""; // Make JSLint happy
                } else {
                    // Add key to buffer
                    Buf += String.fromCharCode(AText.charCodeAt(i) & 0xFF);
                }
                FATASCIIEscaped = false;
                FLastChar = AText.charCodeAt(i);

                // Check if we've passed the right edge of the window
                if ((X + Buf.length) > that.WindCols) {
                    // We have, need to flush buffer before moving cursor
                    that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
                    Buf = "";

                    X = 1;
                    Y += 1;
                    DoGoto = true;
                }
            }

            // Check if we've passed the bottom edge of the window
            if (Y > that.WindRows) {
                // We have, need to scroll the window one line
                Y = that.WindRows;
                that.ScrollUpWindow(1);
                DoGoto = true;
            }

            if (DoGoto) { that.GotoXY(X, Y); }
        }

        // Flush remaining text in buffer if we have any
        if (Buf.length > 0) {
            that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FTextAttr);
            X += Buf.length;
            that.GotoXY(X, Y);
        }
    };

    this.WriteLn = function (AText) {
        /// <summary>
        /// Writes a given line of text to the screen, followed by a carriage return and line feed.
        /// </summary>
        /// <remarks>
        /// Text is wrapped if it exceeds the right edge of the window
        /// </remarks>
        /// <param name="AText">The text to print to the screen</param>
        if (AText === undefined) { AText = ""; }
        that.Write(AText + "\r\n");
    };
};
Crt = new TCrt();
