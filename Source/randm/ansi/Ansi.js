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
var Ansi = 0;
var TAnsi = function () {
    this.onesc5n = function () { }; // Do nothing
    this.onesc6n = function () { }; // Do nothing
    this.onesc255n = function () { }; // Do nothing
    this.onescQ = function () { }; // Do nothing
    this.onripdetect = function () { }; // Do nothing
    this.onripdisable = function () { }; // Do nothing
    this.onripenable = function () { }; // Do nothing

    var ANSI_COLORS = [0, 4, 2, 6, 1, 5, 3, 7];

    var that = this;
    var FAnsiAttr;
    var FAnsiBuffer;
    var FAnsiParams;
    var FAnsiParserState;
    var FAnsiXY;

    var AnsiCommand = function (ACommand) {
        var Colour = 0;
        var X = 0;
        var Y = 0;
        var Z = 0;

        switch (ACommand) {
            case "!": // CSI ! - RIP detect
                // n = 0 performs RIP detect
                // n = 1 disables RIP parsing (treat RIPscrip commands as raw text)
                // n = 2 enables RIP parsing
                switch (parseInt(FAnsiParams.shift(), 10)) {
                    case 0: that.onripdetect(); break;
                    case 1: that.onripdisable(); break;
                    case 2: that.onripenable(); break;
                    default: trace("ANSI Escape " + X + "! is not implemented");
                }
                break;
            case "@": // CSI n @ - Moves text from the current position to the right edge p1 characters to the right, with rightmost charaters going off-screen and the resulting hole being filled with the current attribute.
                X = Math.max(1, parseInt(FAnsiParams.shift(), 10));
                Crt.InsChar(" ", X);
                break;
            case "A": // CSI n A - Moves the cursor n (default 1) cells up. If the cursor is already at the edge of the screen, this has no effect.
                Y = Math.max(1, parseInt(FAnsiParams.shift(), 10));
                Y = Math.max(1, Crt.WhereY() - Y);
                Crt.GotoXY(Crt.WhereX(), Y);
                break;
            case "B": // CSI n B - Moves the cursor n (default 1) cells down. If the cursor is already at the edge of the screen, this has no effect.
                Y = Math.max(1, parseInt(FAnsiParams.shift(), 10));
                Y = Math.min(Crt.WindRows, Crt.WhereY() + Y);
                Crt.GotoXY(Crt.WhereX(), Y);
                break;
            case "C": // CSI n C - Moves the cursor n (default 1) cells right. If the cursor is already at the edge of the screen, this has no effect.
                X = Math.max(1, parseInt(FAnsiParams.shift(), 10));
                X = Math.min(Crt.WindCols, Crt.WhereX() + X);
                Crt.GotoXY(X, Crt.WhereY());
                break;
            case "D": // CSI n D - Moves the cursor n (default 1) cells left. If the cursor is already at the edge of the screen, this has no effect.
                X = Math.max(1, parseInt(FAnsiParams.shift(), 10));
                X = Math.max(1, Crt.WhereX() - X);
                Crt.GotoXY(X, Crt.WhereY());
                break;
                //TODO E AND F CAME FROM WHERE?				
            case "E": // CSI n E - Moves cursor to beginning of the line n (default 1) lines down.
                Y = Math.max(1, parseInt(FAnsiParams.shift(), 10));
                Y = Math.min(Crt.WindRows, Crt.WhereY() + Y);
                Crt.GotoXY(1, Y);
                break;
            case "F": // CSI n F - Moves cursor to beginning of the line n (default 1) lines up.
                Y = Math.max(1, parseInt(FAnsiParams.shift(), 10));
                Y = Math.max(1, Crt.WhereY() - Y);
                Crt.GotoXY(1, Y);
                break;
            case "f": // CSI y ; x f or CSI ; x f or CSI y ; f - Moves the cursor to row y, column x. The values are 1-based, and default to 1 (top left corner) if omitted. A sequence such as CSI ;5f is a synonym for CSI 1;5f as well as CSI 17;f is the same as CSI 17f and CSI 17;1f
                while (FAnsiParams.length < 2) { FAnsiParams.push("1"); } // Make sure we have enough parameters
                Y = Math.max(1, parseInt(FAnsiParams.shift(), 10));
                X = Math.max(1, parseInt(FAnsiParams.shift(), 10));
                Crt.GotoXY(X, Y);
                break;
            case "G": // CSI n G - Moves the cursor to column n.
                X = Math.max(1, parseInt(FAnsiParams.shift(), 10));
                if ((X >= 1) && (X <= Crt.WindCols)) {
                    Crt.GotoXY(X, Crt.WhereY());
                }
                break;
            case "H": // CSI y ; x H or CSI ; x H or CSI y ; H - Moves the cursor to row y, column x. The values are 1-based, and default to 1 (top left corner) if omitted. A sequence such as CSI ;5H is a synonym for CSI 1;5H as well as CSI 17;H is the same as CSI 17H and CSI 17;1H
                while (FAnsiParams.length < 2) { FAnsiParams.push("1"); } // Make sure we have enough parameters
                Y = Math.max(1, parseInt(FAnsiParams.shift(), 10));
                X = Math.max(1, parseInt(FAnsiParams.shift(), 10));
                Crt.GotoXY(X, Y);
                break;
            case "h": // CSI n h
                // n = 7 enables auto line wrap when writing to last column of screen (which is on by default so we ignore the sequence)
                X = parseInt(FAnsiParams.shift(), 10);
                switch (X) {
                    case 7: /* Ignore */break;
                    case 25: Crt.ShowCursor(); break;
                    default: trace("ANSI Escape " + X + "h is not implemented");
                }
                break;
            case "J": // CSI n J - Clears part of the screen. If n is zero (or missing), clear from cursor to end of screen. If n is one, clear from cursor to beginning of the screen. If n is two, clear entire screen (and moves cursor to upper left on MS-DOS ANSI.SYS).
                switch (parseInt(FAnsiParams.shift(), 10)) {
                    case 0: Crt.ClrEos(); break;
                    case 1: Crt.ClrBos(); break;
                    case 2: Crt.ClrScr(); break;
                }
                break;
            case "K": // CSI n K - Erases part of the line. If n is zero (or missing), clear from cursor to the end of the line. If n is one, clear from cursor to beginning of the line. If n is two, clear entire line. Cursor position does not change.
                switch (parseInt(FAnsiParams.shift(), 10)) {
                    case 0: Crt.ClrEol(); break;
                    case 1: Crt.ClrBol(); break;
                    case 2: Crt.ClrLine(); break;
                }
                break;
            case "L": // CSI n L - Insert n new lines, pushing the current line and those below it down
                Y = Math.max(1, parseInt(FAnsiParams.shift(), 10));
                Crt.InsLine(Y);
                break;
            case "l": // CSI n l
                // n = 7 disables auto line wrap when writing to last column of screen (we dont support this)
                X = parseInt(FAnsiParams.shift(), 10);
                switch (X) {
                    case 7: /* Ignore */break;
                    case 25: Crt.HideCursor(); break;
                    default: trace("ANSI Escape " + X + "l is not implemented");
                }
                break;
            case "M": // CSI n M - Delete n lines, pulling the lines below the deleted lines up
                Y = Math.max(1, parseInt(FAnsiParams.shift(), 10));
                Crt.DelLine(Y);
                break;
            case "m": // CSI n [;k] m - Sets SGR parameters. After CSI can be zero or more parameters separated with ;. With no parameters, CSI m is treated as CSI 0 m (reset / normal), which is typical of most of the ANSI escape sequences.
                while (FAnsiParams.length > 0) {
                    X = parseInt(FAnsiParams.shift(), 10);
                    switch (X) {
                        case 0: // Reset / Normal (all attributes off)
                            Crt.NormVideo();
                            break;
                        case 1: // Intensity: Bold
                            Crt.HighVideo();
                            break;
                        case 2: // Intensity: Faint (not widely supported)
                            Crt.LowVideo();
                            break;
                        case 3: // Italic: on (not widely supported)
                            break;
                        case 4: // Underline: Single
                            break;
                        case 5: // Blink: Slow (< 150 per minute)
                            Crt.SetBlink(true);
                            Crt.SetBlinkRate(500);
                            break;
                        case 6: // Blink: Rapid (>= 150 per minute)
                            Crt.SetBlink(true);
                            Crt.SetBlinkRate(250);
                            break;
                        case 7: // Image: Negative (swap foreground and background)
                            Crt.ReverseVideo();
                            break;
                        case 8: // Conceal (not widely supported)
                            FAnsiAttr = Crt.TextAttr;
                            Crt.Conceal();
                            break;
                        case 21: // Underline: Double (not widely supported)
                            break;
                        case 22: //	Intensity: Normal (not widely supported)
                            Crt.LowVideo();
                            break;
                        case 24: // Underline: None
                            break;
                        case 25: // Blink: off
                            Crt.SetBlink(false);
                            break;
                        case 27: // Image: Positive (handle the same as negative)
                            Crt.ReverseVideo();
                            break;
                        case 28: // Reveal (conceal off)
                            Crt.TextAttr = FAnsiAttr;
                            break;
                        case 30: // Set foreground color, normal intensity
                        case 31:
                        case 32:
                        case 33:
                        case 34:
                        case 35:
                        case 36:
                        case 37:
                            Colour = ANSI_COLORS[X - 30];
                            if (Crt.TextAttr % 16 > 7) { Colour += 8; }
                            Crt.TextColor(Colour);
                            break;
                        case 40: // Set background color, normal intensity
                        case 41:
                        case 42:
                        case 43:
                        case 44:
                        case 45:
                        case 46:
                        case 47:
                            Colour = ANSI_COLORS[X - 40];
                            Crt.TextBackground(Colour);
                            break;
                    }
                }
                break;
            case "n": // CSI X n
                //       n = 6 Reports the cursor position to the application as (as though typed at the keyboard) ESC[n;mR, where n is the row and m is the column. (May not work on MS-DOS.)
                //       n = 255 Reports the bottom right cursor position (essentially the screen size)
                X = parseInt(FAnsiParams.shift(), 10);
                switch (X) {
                    case 5: that.onesc5n(); break;
                    case 6: that.onesc6n(); break;
                    case 255: that.onesc255n(); break;
                    default: trace("ANSI Escape " + X + "n is not implemented");
                }
                break;
            case "P": // CSI n P - Deletes the character at the current position by shifting all characters from the current column + p1 left to the current column. Opened blanks at the end of the line are filled with the current attribute.
                X = Math.max(1, parseInt(FAnsiParams.shift(), 10));
                Crt.DelChar(X);
                break;
            case "Q": // CSI cp ; x ; y Q - NON-STANDARD fTelnet EXTENSION - Changes the current font to CodePage=cp, Width=x, Height=y
                while (FAnsiParams.length < 3) { FAnsiParams.push("0"); } // Make sure we have enough parameters
                X = parseInt(FAnsiParams.shift(), 10);
                Y = parseInt(FAnsiParams.shift(), 10);
                Z = parseInt(FAnsiParams.shift(), 10);
                that.onescQ(new ESCQEvent(X, Y, Z));
                break;
            case "S": // CSI n S - Scroll whole page up by n (default 1) lines. New lines are added at the bottom. (not ANSI.SYS)
                Y = Math.max(1, parseInt(FAnsiParams.shift(), 10));
                Crt.ScrollUpScreen(Y);
                break;
            case "s": // CSI s - Saves the cursor position.
                FAnsiXY = new Point(Crt.WhereX(), Crt.WhereY());
                break;
            case "T": // CSI n T - Scroll whole page down by n (default 1) lines. New lines are added at the top. (not ANSI.SYS)
                Y = Math.max(1, parseInt(FAnsiParams.shift(), 10));
                Crt.ScrollDownWindow(Y);
                break;
            case "u": // CSI u - Restores the cursor position.
                Crt.GotoXY(FAnsiXY.x, FAnsiXY.y);
                break;
            case "X": // CSI n X - Erases p1 characters starting at the corrent position. Will not go past the end of the line.
                X = Math.max(1, parseInt(FAnsiParams.shift(), 10));
                Crt.DelChar(X);
                break;
                //TODO case "Z": // CSI n Z - Move the cursor to the p1th preceeding tab stop. Will not go past the start of the line.
                //TODO	break;
            default:
                trace("Unknown ESC sequence: " + ACommand + " (" + FAnsiParams.toString() + ")");
                break;
        }
    };

    this.ClrBol = function () {
        return "\x1B[1K";
    };

    this.ClrBos = function () {
        return "\x1B[1J";
    };

    this.ClrEol = function () {
        return "\x1B[K";
    };

    this.ClrEos = function () {
        return "\x1B[J";
    };

    this.ClrLine = function () {
        return "\x1B[2K";
    };

    this.ClrScr = function () {
        return "\x1B[2J";
    };

    this.CursorDown = function (ACount) {
        if (ACount === 1) {
            return "\x1B[B";
        } else {
            return "\x1B[" + ACount.toString() + "B";
        }
    };

    this.CursorLeft = function (ACount) {
        if (ACount === 1) {
            return "\x1B[D";
        } else {
            return "\x1B[" + ACount.toString() + "D";
        }
    };

    this.CursorPosition = function (ARows, ACols) {
        if (ARows === undefined) { ARows = Crt.WhereYA(); }
        if (ACols === undefined) { ACols = Crt.WhereXA(); }

        return "\x1B[" + ARows + ";" + ACols + "R";
    };

    this.CursorRestore = function () {
        return "\x1B[u";
    };

    this.CursorRight = function (ACount) {
        if (ACount === 1) {
            return "\x1B[C";
        } else {
            return "\x1B[" + ACount.toString() + "C";
        }
    };

    this.CursorSave = function () {
        return "\x1B[s";
    };

    this.CursorUp = function (ACount) {
        if (ACount === 1) {
            return "\x1B[A";
        } else {
            return "\x1B[" + ACount.toString() + "A";
        }
    };

    this.GotoX = function (AX) {
        if (AX === 1) {
            return that.CursorLeft(255);
        }
        else {
            return that.CursorLeft(255) + that.CursorRight(AX - 1);
        }
    };

    this.GotoXY = function (AX, AY) {
        return "\x1B[" + AY.toString() + ";" + AX.toString() + "H";
    };

    this.GotoY = function (AY) {
        if (AY === 1) {
            return that.CursorUp(255);
        }
        else {
            return that.CursorUp(255) + that.CursorDown(AY - 1);
        }
    };

    this.TextAttr = function (AAttr) {
        return that.TextColor(AAttr % 16) + that.TextBackground(Math.floor(AAttr / 16));
    };

    this.TextBackground = function (AColour) {
        while (AColour >= 8) { AColour -= 8; }
        return "\x1B[" + (40 + ANSI_COLORS[AColour]).toString() + "m";
    };

    this.TextColor = function (AColour) {
        switch (AColour % 16) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7: return "\x1B[0;" + (30 + ANSI_COLORS[AColour % 16]).toString() + "m" + that.TextBackground(Crt.TextAttr / 16);
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
            case 14:
            case 15: return "\x1B[1;" + (30 + ANSI_COLORS[(AColour % 16) - 8]).toString() + "m";
        }

        return "";
    };

    this.Write = function (AText) {
        // Check for Atari mode, which doesn't use ANSI
        if (Crt.Atari) {
            Crt.Write(AText);
        } else {
            var Buffer = "";

            var i;
            for (i = 0; i < AText.length; i++) {
                if (AText.charAt(i) === "\x1B") {
                    FAnsiParserState = AnsiParserState.Escape;
                }
                else if (FAnsiParserState === AnsiParserState.Escape) {
                    if (AText.charAt(i) === '[') {
                        FAnsiParserState = AnsiParserState.Bracket;
                        FAnsiBuffer = "0";

                        while (FAnsiParams.length > 0) { FAnsiParams.pop(); }
                    } else {
                        Buffer += AText.charAt(i);
                        FAnsiParserState = AnsiParserState.None;
                    }
                }
                else if (FAnsiParserState === AnsiParserState.Bracket) {
                    if ("0123456789".indexOf(AText.charAt(i)) !== -1) {
                        FAnsiBuffer += AText.charAt(i);
                    } else if (AText.charAt(i) === ';') {
                        FAnsiParams.push(FAnsiBuffer);
                        FAnsiBuffer = "0";
                    } else {
                        Crt.Write(Buffer);
                        Buffer = "";

                        FAnsiParams.push(FAnsiBuffer);
                        AnsiCommand(AText.charAt(i));
                        FAnsiParserState = AnsiParserState.None;
                    }
                } else {
                    Buffer += AText.charAt(i);
                }
            }

            Crt.Write(Buffer);
        }
    };

    this.WriteLn = function (AText) {
        that.Write(AText + "\r\n");
    };

    // Constructor
    FAnsiAttr = 7;
    FAnsiBuffer = "0";
    FAnsiParams = [];
    FAnsiParserState = AnsiParserState.None;
    FAnsiXY = new Point(1, 1);
};
Ansi = new TAnsi();
