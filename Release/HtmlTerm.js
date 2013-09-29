// HtmlTerm.js 
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
/*global document: false, navigator: false, console: false, setTimeout: false, setInterval: false, Image: false, window: false, WebSocket: false, MozWebSocket: false, XMLHttpRequest: false, confirm: false, clearInterval: false, ArrayBuffer: false, DataView: false, Blob: false, FileReader: false, KeyboardEvent: false, Uint8Array: false */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// From: http://hg.mozilla.org/mozilla-central/raw-file/ec10630b1a54/js/src/devtools/jint/sunspider/string-base64.js

/*jslint white: false, bitwise: false, plusplus: false */
/*global console */

var Base64 = {

    /* Convert data (an array of integers) to a Base64 string. */
    toBase64Table: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split(''),
    base64Pad: '=',

    encode: function (data) {
        "use strict";
        var result = '';
        var toBase64Table = Base64.toBase64Table;
        var base64Pad = Base64.base64Pad;
        var length = data.length;
        var i;
        // Convert every three bytes to 4 ascii characters.
        /* BEGIN LOOP */
        for (i = 0; i < (length - 2) ; i += 3) {
            result += toBase64Table[data[i] >> 2];
            result += toBase64Table[((data[i] & 0x03) << 4) + (data[i + 1] >> 4)];
            result += toBase64Table[((data[i + 1] & 0x0f) << 2) + (data[i + 2] >> 6)];
            result += toBase64Table[data[i + 2] & 0x3f];
        }
        /* END LOOP */

        // Convert the remaining 1 or 2 bytes, pad out to 4 characters.
        if (length % 3) {
            i = length - (length % 3);
            result += toBase64Table[data[i] >> 2];
            if ((length % 3) === 2) {
                result += toBase64Table[((data[i] & 0x03) << 4) + (data[i + 1] >> 4)];
                result += toBase64Table[(data[i + 1] & 0x0f) << 2];
                result += base64Pad;
            } else {
                result += toBase64Table[(data[i] & 0x03) << 4];
                result += base64Pad + base64Pad;
            }
        }

        return result;
    },

    /* Convert Base64 data to a string */
    toBinaryTable: [
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, 0, -1, -1,
        -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
        -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
    ],

    decode: function (data, offset) {
        "use strict";
        offset = typeof (offset) !== 'undefined' ? offset : 0;
        var toBinaryTable = Base64.toBinaryTable;
        var base64Pad = Base64.base64Pad;
        var result, result_length, idx, i, c, padding;
        var leftbits = 0; // number of bits decoded, but yet to be appended
        var leftdata = 0; // bits decoded, but yet to be appended
        var data_length = data.indexOf('=') - offset;

        if (data_length < 0) { data_length = data.length - offset; }

        /* Every four characters is 3 resulting numbers */
        result_length = (data_length >> 2) * 3 + Math.floor((data_length % 4) / 1.5);
        result = new Array(result_length);

        // Convert one by one.
        /* BEGIN LOOP */
        for (idx = 0, i = offset; i < data.length; i++) {
            c = toBinaryTable[data.charCodeAt(i) & 0x7f];
            padding = (data.charAt(i) === base64Pad);
            // Skip illegal characters and whitespace
            if (c === -1) {
                console.error("Illegal character code " + data.charCodeAt(i) + " at position " + i);
                continue;
            }

            // Collect data into leftdata, update bitcount
            leftdata = (leftdata << 6) | c;
            leftbits += 6;

            // If we have 8 or more bits, append 8 bits to the result
            if (leftbits >= 8) {
                leftbits -= 8;
                // Append if not padding.
                if (!padding) {
                    result[idx++] = (leftdata >> leftbits) & 0xff;
                }
                leftdata &= (1 << leftbits) - 1;
            }
        }
        /* END LOOP */

        // If there are any bits left, the base64 string was corrupted
        if (leftbits) {
            throw {
                name: 'Base64-Error',
                message: 'Corrupted base64 string'
            };
        }

        return result;
    }

}; /* End of Base64 namespace */
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
var ByteArray = function () {
    // Private variables
    var that = this;
    var FBytes = [];
    var FLength = 0;
    var FPosition = 0;

    this.__defineGetter__("bytesAvailable", function () {
        return FLength - FPosition;
    });

    this.clear = function () {
        FBytes = [];
        FLength = 0;
        FPosition = 0;
    };

    this.__defineGetter__("length", function () {
        return FLength;
    });
    this.__defineSetter__("length", function (value) {
        if (value <= 0) {
            that.clear();
            return;
        }

        if (value < FLength) {
            FBytes.splice(value, FLength - value);
        } else if (value > FLength) {
            var i;
            for (i = FLength + 1; i <= value; i++) {
                FBytes.push(0);
            }
        }

        FLength = value;
    });

    this.__defineGetter__("position", function () {
        return FPosition;
    });
    this.__defineSetter__("position", function (value) {
        if (value <= 0) {
            value = 0;
        } else if (value >= FLength) {
            value = FLength;
        }

        FPosition = value;
    });

    this.readBytes = function (ADest, AOffset, ACount) {
        if (FPosition + ACount > FLength) {
            throw "There is not sufficient data available to read.";
        }

        var DestPosition = ADest.position;
        ADest.position = AOffset;

        var i;
        for (i = 0; i < ACount; i++) {
            ADest.writeByte(FBytes[FPosition++] & 0xFF);
        }

        ADest.position = DestPosition;
    };

    this.readString = function () {
        var Result = [];
        var i;
        for (i = FPosition; i < FLength; i++) {
            Result.push(String.fromCharCode(FBytes[i]));
        }
        that.clear();
        return Result.join("");
    };

    this.readUnsignedByte = function () {
        if (FPosition >= FLength) {
            throw "There is not sufficient data available to read.";
        }

        return (FBytes[FPosition++] & 0xFF);
    };

    this.readUnsignedShort = function () {
        if (FPosition >= (FLength - 1)) {
            throw "There is not sufficient data available to read.";
        }

        return ((FBytes[FPosition++] & 0xFF) << 8) + (FBytes[FPosition++] & 0xFF);
    };

    this.toString = function () {
        var Result = [];
        var i;
        for (i = 0; i < FLength; i++) {
            Result.push(String.fromCharCode(FBytes[i]));
        }
        return Result.join("");
    };

    this.writeByte = function (value) {
        FBytes[FPosition++] = (value & 0xFF);
        if (FPosition > FLength) { FLength++; }
    };

    this.writeBytes = function (bytes, offset, length) {
        // Handle optional parameters
        if (typeof offset === "undefined") { offset = 0; }
        if (typeof length === "undefined") { length = 0; }

        if (offset < 0) { offset = 0; }
        if (length < 0) { return; } else if (length === 0) { length = bytes.length; }

        if (offset >= bytes.length) { offset = 0; }
        if (length > bytes.length) { length = bytes.length; }
        if (offset + length > bytes.length) { length = bytes.length - offset; }

        var BytesPosition = bytes.position;
        bytes.position = offset;

        var i;
        for (i = 0; i < length; i++) {
            that.writeByte(bytes.readUnsignedByte());
        }

        bytes.position = BytesPosition;
    };

    this.writeShort = function (value) {
        that.writeByte((value & 0xFF00) >> 8);
        that.writeByte(value & 0x00FF);
    };

    this.writeString = function (AText) {
        var i;
        var ATextlength = AText.length;
        for (i = 0; i < ATextlength; i++) {
            that.writeByte(AText.charCodeAt(i));
        }
    };
};
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
var FileReference = function (AName, ASize) {
    this.data = new ByteArray();
    this.name = AName;
    this.size = ASize;
};
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
var Keyboard = 0;
var TKeyboard = function () {
    this.BACKSPACE = 8;
    this.DELETE = 46;
    this.DOWN = 40;
    this.END = 35;
    this.ESCAPE = 27;
    this.ENTER = 13;
    this.F1 = 112;
    this.F2 = 113;
    this.F3 = 114;
    this.F4 = 115;
    this.F5 = 116;
    this.F6 = 117;
    this.F7 = 118;
    this.F8 = 119;
    this.F9 = 120;
    this.F10 = 121;
    this.F11 = 122;
    this.F12 = 123;
    this.HOME = 36;
    this.INSERT = 45;
    this.LEFT = 37;
    this.PAGE_DOWN = 34;
    this.PAGE_UP = 33;
    this.RIGHT = 39;
    this.SPACE = 32;
    this.TAB = 9;
    this.UP = 38;
};
Keyboard = new TKeyboard();
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
var Point = function (AX, AY) {
    this.x = AX;
    this.y = AY;
};
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
function Base64Decode(input) {
    var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {

        enc1 = _keyStr.indexOf(input.charAt(i++));
        enc2 = _keyStr.indexOf(input.charAt(i++));
        enc3 = _keyStr.indexOf(input.charAt(i++));
        enc4 = _keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 !== 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 !== 64) {
            output = output + String.fromCharCode(chr3);
        }

    }

    return output;

}

var ConnectAns = Base64Decode("G1swbRtbMkobWzA7MEgbWzE7NDQ7MzRt2sTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEG1swOzQ0OzMwbb8bWzBtDQobWzE7NDQ7MzRtsyAgG1szN21XZWxjb21lISAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAbWzA7NDQ7MzBtsxtbMG0NChtbMTs0NDszNG3AG1swOzQ0OzMwbcTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTE2RtbMG0NCg0KG1sxbSAbWzBtIBtbMTs0NDszNG3axMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMQbWzA7NDQ7MzBtvxtbMG0NCiAgG1sxOzQ0OzM0bbMbWzA7MzRt29vb2xtbMzBt29vb29vb29vb29vb29vb29vb29vb2xtbMzRt29vb29vbG1s0NDszMG2zG1swbQ0KICAbWzE7NDQ7MzRtsxtbMDszNG3b29vbG1sxOzMwbdvb29vb29vb29vb29vb29vb29vb29sbWzA7MzBt29sbWzM0bdvb29sbWzQ0OzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1swOzM0bdvb29sbWzE7MzBt29vb2xtbMG3b29vb29vb29vb29sbWzFt29vb2xtbMzBt29sbWzA7MzBt29sbWzM0bdvb29sbWzQ0OzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1swOzM0bdvb29sbWzE7MzBt29vb2xtbMG3b29vb29vb29vbG1sxbdvb29sbWzBt29sbWzE7MzBt29sbWzA7MzBt29sbWzM0bdvb29sbWzQ0OzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1swOzM0bdvb29sbWzE7MzBt29vb2xtbMG3b29vb29vb2xtbMW3b29vbG1swbdvbG1sxbdvbG1szMG3b2xtbMDszMG3b2xtbMzRt29vb2xtbNDQ7MzBtsxtbMG0NCiAgG1sxOzQ0OzM0bbMbWzA7MzRt29vb2xtbMTszMG3b29vbG1swbdvb29vb2xtbMW3b29vbG1swbdvbG1sxbdvb29sbWzMwbdvbG1swOzMwbdvbG1szNG3b29vbG1s0NDszMG2zG1swbQ0KICAbWzE7NDQ7MzRtsxtbMDszNG3b29vbG1sxOzMwbdvb29sbWzBt29vb2xtbMW3b29vbG1swbdvbG1sxbdvb29vb2xtbMzBt29sbWzA7MzBt29sbWzM0bdvb29sbWzQ0OzMwbbMbWzQwOzM3bQ0KICAbWzE7NDQ7MzRtsxtbMDszNG3b29vbG1sxOzMwbdvbG1swOzMwbdvbG1sxbdvb29vb29vb29vb29vb29vb2xtbMDszMG3b2xtbMzRt29vb2xtbNDQ7MzBtsxtbNDA7MzdtDQogIBtbMTs0NDszNG2zG1swOzM0bdvb29sbWzE7MzBt29sbWzBt29vb29vb29vb29vb29vb29vb29sbWzMwbdvbG1szNG3b29vbG1s0NDszMG2zG1s0MDszN20NCiAgG1sxOzQ0OzM0bbMbWzA7MzBt29vb29vb29vb29vb29vb29vb29vb29vb29vb29vbG1szNG3b2xtbNDQ7MzBtsxtbNDA7MzdtDQogIBtbMTs0NDszNG2zG1s0MDszMG3b2xtbMG3b29vb29vb29vb29vb29vb29vb29vb29vb29vbG1szMG3b2xtbNDRtsxtbNDA7MzdtIBtbMzRtIBtbMTs0NzszN23axMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMQbWzMwbb8bWzBtDQogIBtbMTs0NDszNG2zG1swOzMwbdvbG1sxbdvb29vb29vb29vb29vb29sbWzA7MzBt29vb29vb29vb2xtbMW3b2xtbMDszMG3b2xtbNDRtsxtbNDA7MzdtIBtbMzRtIBtbMTs0NzszN22zICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAbWzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1s0MDszMG3b2xtbMG3b29vb29vb29vb29vb29vb29vb29vb29vb29vbG1szMG3b2xtbNDRtsxtbMG0gG1szNG0gG1sxOzQ3OzM3bbMgICAbWzM0bUh0bWxUZXJtIC0tIFRlbG5ldCogZm9yIHRoZSBXZWIgICAgG1szMG2zG1swbQ0KG1sxbSAbWzBtIBtbMTs0NDszNG2zG1swOzMwbdvbG1sxbdvb29vb29vb29vb29vb29vb29vb29vb2xtbMDszMG3b29vb29sbWzQ0bbMbWzBtIBtbMzRtIBtbMTs0NzszN22zICAgICAbWzA7NDc7MzRtV2ViIGJhc2VkIEJCUyB0ZXJtaW5hbCBjbGllbnQgICAgG1sxOzMwbbMbWzBtDQogIBtbMTs0NDszNG2zG1swOzM0bdvbG1szMG3b29vb29vb29vb29vb29vb29vb29vb29vb29vbG1szNG3b2xtbNDQ7MzBtsxtbMG0gG1szNG0gG1sxOzQ3OzM3bbMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIBtbMzBtsxtbMG0NCiAgG1sxOzQ0OzM0bcAbWzA7NDQ7MzBtxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTZG1swbSAbWzM0bSAbWzE7NDc7MzdtwBtbMzBtxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTZG1swbQ0KDQobWzExQxtbMTszMm1Db3B5cmlnaHQgKEMpIDIwMDAtMjAxMCBSJk0gU29mdHdhcmUuICBBbGwgUmlnaHRzIFJlc2VydmVkDQobWzE7MzBtICogTk9URTogSHRtbFRlcm0gaXMgYWN0dWFsbHkgYSBXZWJTb2NrZXQgY2xpZW50LCBub3QgYSBUZWxuZXQgY2xpZW50DQobWzA7MzRtxMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExA==");
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
// Set based on whether we're debugging or not
var DEBUG = false;

// Used by embedded PNG assets encoded in base64
var PNGAsset = "data:image/png;base64,";

// Emulate legacy getter/setter API using ES5 APIs
// This allows IE9 to use __defineGetter__ and __defineSetter__
try {
    if (!Object.prototype.__defineGetter__ && Object.defineProperty({}, "x", { get: function () { return true; } }).x) {
        Object.defineProperty(Object.prototype, "__defineGetter__",
            { enumerable: false, configurable: true,
                value: function (name, func) {
                    Object.defineProperty(this, name,
                 { get: func, enumerable: true, configurable: true });
                }
            });
        Object.defineProperty(Object.prototype, "__defineSetter__",
            { enumerable: false, configurable: true,
                value: function (name, func) {
                    Object.defineProperty(this, name,
                 { set: func, enumerable: true, configurable: true });
                }
            });
    }
} catch (defPropException) {
    // Create a dummy function since the above failed (prevents errors with IE8)
    if (!Object.prototype.__defineGetter__) {
        Object.prototype.__defineGetter__ = function (prop, get) {
            // Do nothing
        };
        Object.prototype.__defineSetter__ = function (prop, set) {
            // Do nothing
        };
    }
}

// This allows IE to use addEventListener and removeEventListener
if (!Object.prototype.addEventListener && Object.attachEvent) {
    Object.defineProperty(Object.prototype, "addEventListener",
         { enumerable: false, configurable: true,
             value: function (eventname, func) {
                 Object.attachEvent("on" + eventname, func);
             }
         });
    Object.defineProperty(Object.prototype, "removeEventListener",
         { enumerable: false, configurable: true,
             value: function (eventname, func) {
                 Object.detachEvent("on" + eventname, func);
             }
         });
}

// This determines an elements position on the page
function getElementPosition(elem) {
    var offsetTrail = (typeof (elem) === "string") ? document.getElementById(elem) : elem;
    var offsetLeft = 0;
    var offsetTop = 0;
    while (offsetTrail) {
        offsetLeft += offsetTrail.offsetLeft;
        offsetTop += offsetTrail.offsetTop;
        offsetTrail = offsetTrail.offsetParent;
    }
    if (navigator.userAgent.indexOf('Mac') !== -1 && typeof document.body.leftMargin !== 'undefined') {
        offsetLeft += document.body.leftMargin;
        offsetTop += document.body.topMargin;
    }
    return new Point(offsetLeft, offsetTop);
}

// This adds a trace message to the javascript error console
function trace(AText) {
    try {
        console.log("trace: " + AText);
    } catch (e) {
        if (DEBUG) {
            setTimeout(function () { throw new Error("trace: " + AText); }, 0); 
        }
    }
}
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
var StringUtils = 0;
var TStringUtils = function () {
    var that = this;

    this.AddCommas = function (ANum) {
        var Result = "";

        var Position = 1;
        var i;
        for (i = ANum.toString().length - 1; i >= 0; i--) {
            if ((Position > 3) && (Position % 3 === 1)) { Result = "," + Result; }
            Result = ANum.toString().charAt(i) + Result;
            Position++;
        }

        return Result;
    };

    this.FormatPercent = function (ANumber, APrecision) {
        return (ANumber * 100).toFixed(APrecision) + "%";
    };

    this.NewString = function (AChar, ALength) {
        if (AChar.length === 0) { return ""; }

        var Result = "";
        var i;
        for (i = 0; i < ALength; i++) { Result += AChar.charAt(0); }
        return Result;
    };

    this.PadLeft = function (AText, AChar, ALength) {
        if (AChar.length === 0) { return AText; }

        while (AText.length < ALength) { AText = AChar.charAt(0) + AText; }
        return AText.substring(0, ALength);
    };

    this.PadRight = function (AText, AChar, ALength) {
        if (AChar.length === 0) { return AText; }

        while (AText.length < ALength) { AText += AChar.charAt(0); }
        return AText.substring(0, ALength);
    };

    this.Trim = function (AText) {
        return that.TrimLeft(that.TrimRight(AText));
    };

    this.TrimLeft = function (AText) {
        return AText.replace(/^\s+/g, "");
    };

    this.TrimRight = function (AText) {
        return AText.replace(/\s+$/g, "");
    };
};
StringUtils = new TStringUtils();
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
/**
* @constructor
*/
var TConnectButton = function () {
    this.ongraphicchanged = function () { }; // Do nothing

    // Private variables
    var that = this;
    var FConnectDown = PNGAsset + 'iVBORw0KGgoAAAANSUhEUgAAARMAAABBCAMAAADFRrDCAAAABGdBTUEAALGPC/xhBQAAAwBQTFRFAAAAFxcXGBgYGxsbHBwcHR0dHh4eHx8fICAgISEhIiIiIiMjJCQkJSUlJiYmJycnKCgoKSkpKioqKysrLCwsLS0tLi4uLy8vMDAwMTExMjIyMjMzNDQ0NTU1NjY2Nzc3Nzg4ODg3ODg4ODk5Ojo5Ojo6Ozs7PDw7PDw8PD09Pj4+Pz8/P0BAQEA/QEBAQEFBQkJCQkNDQ0RERERDRERERUVFRUZGRkdHR0hISEhISUlJSkpKS0tLTU1NTk5OT09PUlJSU1NTVFRUVVVVVlZWV1dXWFhYW1tbXFxcXV1dXl5eXl9fYGBgYWFhYmJiZmZmZ2dnaGhoaWlpampqa2trbGxsbW1tbm5ub29vcHBwcnJyc3Nzc3R0dHR0dXV1dnZ2eHh4eXl5enp6e3t7fHx8fX19f39/gICAgYGBgoKChYWFh4eHiIiIiYmJioqKi4uLjIyMjo6Oj4+PkJCQkZGRkpKSlJSUlZWVl5eXmJiYmZmZmpqanZ2dnp6en5+foKCgoqKio6Ojpqamp6enqKioqampq6urra2trq6ur6+vsLCwsbGxs7Oztra2uLi4ubm5u7u7vLy8vb29vr6+wMDAwsLCxMTExcXFx8fHyMjIycnJysrKy8vLzMzMzc3Nzs7Oz8/P0NDQ0dHR0tLS09PT1dXV1tbW19fX2NjY2dnZ3Nzc3d3d3t7e39/f4ODg4uLi4+Pj5OTk5ubm5+fn6Ojo6enp6urq6+vr7OzsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAob01kQAAAQB0Uk5T////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AFP3ByUAAAAJcEhZcwAACxEAAAsRAX9kX5EAAAAHdElNRQfaCBENBQGlDLlSAAAAGXRFWHRTb2Z0d2FyZQBQYWludC5ORVQgdjMuNS41SYr84AAACihJREFUeF7tnPtj09YVx9uNdm2T0ZB3SGR10qzqsclyK9uz09FmjGUwninjMTZooaRlYyUZSwqEDQZbSGgZK20pK4VRoILSLilstP3vtnPuQ76SrhWHH/jBzjW2pXtufHU+/p6je68sHvnfUokTeGQJSYLAEpOkKJaYLMREaeaymtMRdLK6mYEQ3z1Kpcqk6YkggCiTJSSEQFnQCUMyvGV8qhnL5JZhRqDKhFZs+HfQvOXeGxQCzyercMc40bxAiOfveAQDy7EEUBLJtYkdftejj36r0985ca0JgF2hQiHnHXIW3hBz+tqe9m8/0fp0e2dHe/vy1ieWrdjT+FjGiVAIE4InmksuvrisZUV3T18/WAb6+wf6utpblq262OhiKSOJkElEJl+uffzprj5lAIHAM0Ne+rqWP7b2y8amQvJsyOQNwdl3l7d29fcrA8BiIAM0sEDb/pWdra3vNjSUExEmk1VfD3+nvT+jKYqa0VRFVXRopym4mVH6Op462shQokymQle3tfQOgDbwH2BQn1FV2NThCTsZpevJbQ0MZSqik5DJ+tZuEAcQUFQVxIIcvgd4NBWQaFDR0zLSuFDkTF5tXYlIgAX8Ax4aRBDEDlIiyskova37GhaKlMmZll4MGE3LZDTyokKBLY3UASBVU/ta3m5UKDIm9zp6kAUBgSmWwIBHhrxRSybT3XEvCeXc6BAGY2Xrqbmk8erBIRuM/tDEDdE4T0ZGirImrJxhNfNYs4A5YG1jb2IHNyZIv7bY70b5nykK9Clj8osORKJpOngPL/gkIOgu7uB2puuXMbfvbhI7+umnEfM3b4pGffKb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';
    var FConnectOver = PNGAsset + 'iVBORw0KGgoAAAANSUhEUgAAARMAAABBCAMAAADFRrDCAAAABGdBTUEAALGPC/xhBQAAAwBQTFRFAAAAFxcXGBgYGxsbHBwcHR0dHh4eHx8fICAgISEhIiIiIiMjJCQkJSUlJiYmJycnKCgoKSkpKioqKysrLCwsLS0tLi4uLy8vMDAwMTExMjIyMjMzNDQ0NTU1NjY2Nzc3Nzg4ODg3ODg4ODk5Ojo5Ojo6Ozs7PDw7PDw8PD09Pj4+Pz8/P0BAQEA/QEBAQEFBQkJCQkNDQ0RERERDRERERUVFRUZGRkdHR0hISEhISUlJSkpKS0tLTU1NTk5OT09PUlJSU1NTVFRUVVVVVlZWV1dXWFhYW1tbXFxcXV1dXl5eXl9fYGBgYWFhYmJiZmZmZ2dnaGhoaWlpampqa2trbGxsbW1tbm5ub29vcHBwcnJyc3Nzc3R0dHR0dXV1dnZ2eHh4eXl5enp6e3t7fHx8fX19f39/gICAgYGBgoKChYWFh4eHiIiIiYmJioqKi4uLjIyMjo6Oj4+PkJCQkZGRkpKSlJSUlZWVl5eXmJiYmZmZmpqanZ2dnp6en5+foKCgoqKio6Ojpqamp6enqKioqampq6urra2trq6ur6+vsLCwsbGxs7Oztra2uLi4ubm5u7u7vLy8vb29vr6+wMDAwsLCxMTExcXFx8fHyMjIycnJysrKy8vLzMzMzc3Nzs7Oz8/P0NDQ0dHR0tLS09PT1dXV1tbW19fX2NjY2dnZ3Nzc3d3d3t7e39/f4ODg4uLi4+Pj5OTk5ubm5+fn6Ojo6enp6urq6+vr7Ozs7e3t7+/v8PDw8vLy8/Pz9/f3+fn5+vr6/Pz8////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABcRGgAAAAQB0Uk5T////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AFP3ByUAAAAJcEhZcwAACxEAAAsRAX9kX5EAAAAHdElNRQfaCBENBQGlDLlSAAAAGXRFWHRTb2Z0d2FyZQBQYWludC5ORVQgdjMuNS41SYr84AAACohJREFUeF7tnPt/FNUVwLVFqybFkHfIzq6d6Y7zaPehs7vdDY2mFFMoBIjIo7SgIFFaKkkpEQgtFFpI0EgFFSpCERAQaSK0qAUSlvnH2nOfe2fm7rD7C5+Pu7mb3Xmcu3vnfOecc8+9M5NH/jdX/AQemUMSICAyUeq5LC6h4UwW1zMQrHuKUWFM6p4IAkChUCZzSDCBPKZCmFAk/atHxuqxjK7upwRKTMiOFf9y67fcfJNAYHbSizb0A/ULBGv+bgpjoL6DAQWRnN+93ml79NHvtDobdp+vA2BnmaFAPMG98Aqf0uc3N3/3icanm1tbmpvnNz4xb8Hm2scyQg0FmGA83ljy0QvzGha0d3R1gyTS3R3pamtumNf7UY0by708iSiUicdMvlz6+NNtXUoEAYF3FH90tc1/bOmXtU0Fx1nO5E1B2ffnN7Z1dysRYBGJAg1UoG73wtbGxvdrGsoBD5PRkq67vtfcHVUVJRZVY0pM0aCeqqDVqNLV8tTeWobiZTLGVL23tqEzAraB/gBD7JlYDFY1eMNGVGl7cu292qUy5rETxuT+8sZ2MA4goMRiYCyIww8AjxoDJCrs6GgYrDcmrzUuREiABfwBDxU8CHwHUcKWE1U6G7fWLBSpnRxt6EQOo6rRqIo/YlBgTcX7AFBMjXU1vFOrUGRMbrZ0IBYYBAqxGAa8onhBJNFoe8vNAJQ7k0N9yBkLaw5NBYSz53b0WSB0+nZfnBWk0zgzUpQlRbZznO6ZRjseIHZpXd9C+P3Zi7txuxa0y5sYkH9NUaBNGZNftiAkqqqB9vCB3hgE2UQbaD3a9opP7RsrxYZ+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';
    var FConnectUp = PNGAsset + 'iVBORw0KGgoAAAANSUhEUgAAARMAAABBCAMAAADFRrDCAAAABGdBTUEAALGPC/xhBQAAAwBQTFRFAAAAFxcXGBgYGxsbHBwcHR0dHh4eHx8fICAgISEhIiIiIiMjJCQkJSUlJiYmJycnKCgoKSkpKioqKysrLCwsLS0tLi4uLy8vMDAwMTExMjIyMjMzNDQ0NTU1NjY2Nzc3Nzg4ODg3ODg4ODk5Ojo5Ojo6Ozs7PDw7PDw8PD09Pj4+Pz8/P0BAQEA/QEBAQEFBQkJCQkNDQ0RERERDRERERUVFRUZGRkdHR0hISEhISUlJSkpKS0tLTU1NTk5OT09PUlJSU1NTVFRUVVVVVlZWV1dXWFhYW1tbXFxcXV1dXl5eXl9fYGBgYWFhYmJiZmZmZ2dnaGhoaWlpampqa2trbGxsbW1tbm5ub29vcHBwcnJyc3Nzc3R0dHR0dXV1dnZ2eHh4eXl5enp6e3t7fHx8fX19f39/gICAgYGBgoKChYWFh4eHiIiIiYmJioqKi4uLjIyMjo6Oj4+PkJCQkZGRkpKSlJSUlZWVl5eXmJiYmZmZmpqanZ2dnp6en5+foKCgoqKio6Ojpqamp6enqKioqampq6urra2trq6ur6+vsLCwsbGxs7Oztra2uLi4ubm5u7u7vLy8vb29vr6+wMDAwsLCxMTExcXFx8fHyMjIycnJysrKy8vLzMzMzc3Nzs7Oz8/P0NDQ0dHR0tLS09PT1dXV1tbW19fX2NjY2dnZ3Nzc3d3d3t7e39/f4ODg4uLi4+Pj5OTk5ubm5+fn6Ojo6enp6urq6+vr7OzsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAob01kQAAAQB0Uk5T////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AFP3ByUAAAAJcEhZcwAACxEAAAsRAX9kX5EAAAAHdElNRQfaCBENBQGlDLlSAAAAGXRFWHRTb2Z0d2FyZQBQYWludC5ORVQgdjMuNS41SYr84AAACi9JREFUeF7tnPtjFNUVx7WiVZNiyDtkZ8fOdMd5tLOzOrvb3dhopDSF8oyUR2lBQaK0VJLSRCC0UKghQSkVFakIIuCAaBOhRf3v2nPuY553Jxt+4Ifd3E12Z+652Tvns99z5t47O3nof0slTuChJSQJAmEmUjOXVQEan8mqZgZCfHc4Fc6k6YkgAAaFMVlCQghUCBXKhCEZ3jw+1YxlcvMwIxAwoRXr/+01b7n7BoXAdTKIO9rx5gVCPH/XIRhY7BBASSRXJ7a7XQ8//L1Od8fE1SYAdpkLBfIJOQuvjzl9dXf7I4+3PtXe2dHevrz18WUrdjc+lnEmFGBC8ERzyYUXlrWs6O7p6wdLpr8/09fV3rJs8EKji6VCMwpjEpHJ12see6qrT8ogEPjNkqe+ruWPrvm6samQPOszeSPk7HvLW7v6+6UMsMhkgQYWaNu/srO19b2GhnI8wmQy8PXQ99v7s4okyVlFlmRJhXaKhJtZqa/jySONDCXKZMp3dWtLbwa0gT+AQX5almFThV/YyUpdT2xtYChTEZ34TNa1doM4gIAkyyAW5PBDwKPIgESBip6WkcaFImbyautKRAIs4Ad4KBBBEDtIiSgnK/W27m1YKEImp1t6MWAUJZtVyJMMBbYUUgeAZEXua3mnUaGImNzt6EEWBASmWAIDHlnyQi3ZbHfH3SSUs6NDGIzVLSfnksYrB4ZMMLpDE9fDxnkyMpKk1X7lDKuZx5oFzB5rG3sJd3B9gvRrhvvdIP4zSYI+RUx+1YFIFEUF7+EJfwkIuos7uJ3t+nXM7Tsbwx39/POI+bs3w0Z18jvfyp2WTvAq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';
    var FDownError = 1; // Disables loading custom images
    var FImage = 0;
    var FOverError = 1; // Disables loading custom images
    var FUpError = 1; // Disables loading custom images

    // Private methods
    var OnDown = function () { }; // Do nothing
    var OnDownError = function () { }; // Do nothing
    var OnLoad = function () { }; // Do nothing
    var OnOver = function () { }; // Do nothing
    var OnOverError = function () { }; // Do nothing
    var OnUp = function () { }; // Do nothing
    var OnUpError = function () { }; // Do nothing

    this.Center = function (ACenterTo) {
        if (FImage.style.display !== 'none') {
            // Get position of element to center to
            var CenterToPosition = getElementPosition(ACenterTo);

            // Reset button position
            FImage.style.left = "0px";
            FImage.style.top = "0px";
            var ConnectPosition = getElementPosition(FImage);

            // Calculate new button position
            FImage.style.left = ((ACenterTo.width - FImage.width) / 2 + (CenterToPosition.x - ConnectPosition.x)) + "px";
            FImage.style.top = ((ACenterTo.height - FImage.height) / 2 + (CenterToPosition.y - ConnectPosition.y)) + "px";
        }
    };

    this.Hide = function () {
        FImage.style.display = 'none';
    };

    this.__defineGetter__("Image", function () {
        return FImage;
    });

    OnDown = function () {
        // Try to display the custom image, but handle the error if it doesn't exist
        FImage.onerror = OnDownError;
        FImage.src = (FDownError) ? FConnectDown : "img/ConnectDown.png";
        that.ongraphicchanged();
    };

    OnDownError = function () {
        // Use the embedded image instead
        FDownError = true;
        FImage.onerror = "";
        FImage.src = FConnectDown;
        that.ongraphicchanged();
    };

    OnLoad = function () {
        that.ongraphicchanged();
    };

    OnOver = function () {
        // Try to display the custom image, but handle the error if it doesn't exist
        FImage.onerror = OnOverError;
        FImage.src = (FOverError) ? FConnectOver : "img/ConnectOver.png";
        that.ongraphicchanged();
    };

    OnOverError = function () {
        // Use the embedded image instead
        FOverError = true;
        FImage.onerror = "";
        FImage.src = FConnectOver;
        that.ongraphicchanged();
    };

    OnUp = function () {
        // Try to display the custom image, but handle the error if it doesn't exist
        FImage.onerror = OnUpError;
        FImage.src = (FUpError) ? FConnectUp : "img/ConnectUp.png";
        that.ongraphicchanged();
    };

    OnUpError = function () {
        // Use the embedded image instead
        FUpError = true;
        FImage.onerror = "";
        FImage.src = FConnectUp;
        that.ongraphicchanged();
    };

    this.Show = function () {
        FImage.style.display = '';
    };

    // Constructor
    FImage = document.createElement("img");
    FImage.onerror = OnUpError;
    FImage.onload = OnLoad;
    FImage.onmouseover = OnOver;
    FImage.onmouseout = OnUp;
    FImage.onmousedown = OnDown;
    FImage.onmouseup = OnUp;
    FImage.src = FConnectUp;  // Disables loading custom images "img/ConnectUp.png";
    FImage.style.cursor = "pointer";
    FImage.style.position = "absolute";
    FImage.style.left = "0px";
    FImage.style.top = "0px";
    that.Hide();
};
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
/**
* @constructor
*/
var TSaveFilesButton = function () {
    this.ongraphicchanged = function () { }; // Do nothing

    // Private variables
    var that = this;
    var FSaveFilesDown = PNGAsset + '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';
    var FSaveFilesOver = PNGAsset + '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';
    var FSaveFilesUp = PNGAsset + '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';
    var FDownError = 1; // Disables loading custom images
    var FImage = 0;
    var FOverError = 1; // Disables loading custom images
    var FUpError = 1; // Disables loading custom images

    // Private methods
    var OnDown = function () { }; // Do nothing
    var OnDownError = function () { }; // Do nothing
    var OnLoad = function () { }; // Do nothing
    var OnOver = function () { }; // Do nothing
    var OnOverError = function () { }; // Do nothing
    var OnUp = function () { }; // Do nothing
    var OnUpError = function () { }; // Do nothing

    this.Center = function (ACenterTo) {
        if (FImage.style.display !== 'none') {
            // Get position of element to center to
            var CenterToPosition = getElementPosition(ACenterTo);

            // Reset button position
            FImage.style.left = "0px";
            FImage.style.top = "0px";
            var SaveFilesPosition = getElementPosition(FImage);

            // Calculate new button position
            FImage.style.left = ((ACenterTo.width - FImage.width) / 2 + (CenterToPosition.x - SaveFilesPosition.x)) + "px";
            FImage.style.top = ((ACenterTo.height - FImage.height) / 2 + (CenterToPosition.y - SaveFilesPosition.y)) + "px";
        }
    };

    this.Hide = function () {
        FImage.style.display = 'none';
    };

    this.__defineGetter__("Image", function () {
        return FImage;
    });

    OnDown = function () {
        // Try to display the custom image, but handle the error if it doesn't exist
        FImage.onerror = OnDownError;
        FImage.src = (FDownError) ? FSaveFilesDown : "img/SaveFilesDown.png";
        that.ongraphicchanged();
    };

    OnDownError = function () {
        // Use the embedded image instead
        FDownError = true;
        FImage.onerror = "";
        FImage.src = FSaveFilesDown;
        that.ongraphicchanged();
    };

    OnLoad = function () {
        that.ongraphicchanged();
    };

    OnOver = function () {
        // Try to display the custom image, but handle the error if it doesn't exist
        FImage.onerror = OnOverError;
        FImage.src = (FOverError) ? FSaveFilesOver : "img/SaveFilesOver.png";
        that.ongraphicchanged();
    };

    OnOverError = function () {
        // Use the embedded image instead
        FOverError = true;
        FImage.onerror = "";
        FImage.src = FSaveFilesOver;
        that.ongraphicchanged();
    };

    OnUp = function () {
        // Try to display the custom image, but handle the error if it doesn't exist
        FImage.onerror = OnUpError;
        FImage.src = (FUpError) ? FSaveFilesUp : "img/SaveFilesUp.png";
        that.ongraphicchanged();
    };

    OnUpError = function () {
        // Use the embedded image instead
        FUpError = true;
        FImage.onerror = "";
        FImage.src = FSaveFilesUp;
        that.ongraphicchanged();
    };

    this.Show = function () {
        FImage.style.display = '';
    };

    // Constructor
    FImage = document.createElement("img");
    FImage.onerror = OnUpError;
    FImage.onload = OnLoad;
    FImage.onmouseover = OnOver;
    FImage.onmouseout = OnUp;
    FImage.onmousedown = OnDown;
    FImage.onmouseup = OnUp;
    FImage.src = FSaveFilesUp;  // Disables loading custom images "img/SaveFilesUp.png";
    FImage.style.cursor = "pointer";
    FImage.style.position = "absolute";
    FImage.style.left = "0px";
    FImage.style.top = "0px";
    that.Hide();
};
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
var BlinkState = 0;
var TBlinkState = function () {
    this.Show = 0;
    this.Hide = 1;
};
BlinkState = new TBlinkState();
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
var TCursor = function (AParent, AColour, ASize) {
    // Public events
    this.onhide = function () { }; // Do nothing
    this.onshow = function () { }; // Do nothing

    // Private variables
    var that = this;
    var FBlinkRate;
    var FBlinkState;
    var FCanvas = 0;
    var FColour;
    var FContext = 0;
    var FPosition;
    var FSize;
    var FTimer;
    var FVisible;
    var FWindowOffset;
    var FWindowOffsetAdjusted;

    // Private methods
    var Draw = function () { }; // Do nothing
    var OnTimer = function (teEvent) { }; // Do nothing
    var Update = function () { }; // Do nothing

    this.__defineSetter__("BlinkRate", function (AMS) {
        FTimer.delay = AMS;
    });

    this.__defineSetter__("Colour", function (AColour) {
        FColour = AColour;
        Draw();
    });

    Draw = function () {
        if (FContext) {
            FCanvas.width = FSize.x;
            FCanvas.height = FSize.y;

            FContext.fillStyle = FColour;
            FContext.fillRect(0, FSize.y - (FSize.y * 0.20), FSize.x, FSize.y * 0.20);
        }
    };

    OnTimer = function (teEvent) {
        // Flip the blink state
        FBlinkState = (FBlinkState === BlinkState.Hide) ? BlinkState.Show : BlinkState.Hide;

        // Update the opacity
        if (FVisible) {
            // Set the opacity to the desired state
            FCanvas.style.opacity = (FBlinkState === BlinkState.Hide) ? 0 : 1;
        } else {
            // Set the opacity to off
            FCanvas.style.opacity = 0;
        }

        // Let the Crt unit know it can blink text now
        switch (FBlinkState) {
            case BlinkState.Hide: that.onhide(); break;
            case BlinkState.Show: that.onshow(); break;
        }
    };

    this.__defineGetter__("Position", function () {
        return FPosition;
    });

    this.__defineSetter__("Position", function (APosition) {
        FPosition = APosition;
        Update();
    });

    this.__defineSetter__("Size", function (ASize) {
        FSize = ASize;
        Draw();
        Update();
    });

    Update = function () {
        if (FCanvas && FVisible) {
            FCanvas.style.left = (FPosition.x - 1) * FSize.x + FWindowOffsetAdjusted.x + "px";
            FCanvas.style.top = (FPosition.y - 1) * FSize.y + FWindowOffsetAdjusted.y + "px";
        }
    };

    this.__defineSetter__("Visible", function (AVisible) {
        FVisible = AVisible;
        if (FVisible) { Update(); }
    });

    this.__defineSetter__("WindowOffset", function (AWindowOffset) {
        // Store new window offset
        if ((AWindowOffset.x !== FWindowOffset.x) || (AWindowOffset.y !== FWindowOffset.y)) {
            FWindowOffset = AWindowOffset;

            // Reset button position
            FCanvas.style.left = "0px";
            FCanvas.style.top = "0px";
            var CursorPosition = getElementPosition(FCanvas);

            FWindowOffsetAdjusted.x = AWindowOffset.x - CursorPosition.x;
            FWindowOffsetAdjusted.y = AWindowOffset.y - CursorPosition.y;

            Update();
        }
    });

    // Constructor
    FBlinkRate = 500;
    FBlinkState = BlinkState.Hide;
    FColour = AColour;
    FPosition = new Point(1, 1);
    FSize = ASize;
    FVisible = true;
    FWindowOffset = new Point(0, 0);
    FWindowOffsetAdjusted = new Point(0, 0);

    FCanvas = document.createElement('canvas');
    if (FCanvas.getContext) {
        FCanvas.style.position = "absolute";
        FContext = FCanvas.getContext('2d');
        AParent.appendChild(FCanvas);

        // Draw the initial position
        Update();
        Draw();

        // Start the I/O timer
        FTimer = setInterval(OnTimer, FBlinkRate);
    }
};
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
var CrtFonts = [];

CrtFonts['437x9x16'] = PNGAsset + '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';
CrtFonts.ASCIIx9x16 = PNGAsset + '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';

var TFont = function () {
    // Public event
    this.onchange = function () { }; // Do nothing

    // Public variables
    this.HTML_COLOURS = [
		"#000000", "#0000A8", "#00A800", "#00A8A8", "#A80000", "#A800A8", "#A85400", "#A8A8A8",
		"#545454", "#5454FC", "#54FC54", "#54FCFC", "#FC5454", "#FC54FC", "#FCFC54", "#FCFCFC"];

    // Private variables
    var that = this;
    var FCanvas = 0;
    var FCharMap = [];
    var FCodePage = 0;
    var FContext = 0;
    var FLoading = 0;
    var FLower = 0;
    var FNewCodePage = 0;
    var FNewSize = 0;
    var FSize = 0;
    var FUpper = 0;

    // Private methods
    var OnLoadLower = function () { }; // Do nothing
    var OnLoadUpper = function () { }; // Do nothing

    this.__defineGetter__("CodePage", function () {
        return FCodePage;
    });

    this.GetChar = function (ACharCode, AAttr) {
        if (FLoading > 0) { return 0; }

        // Validate values
        if ((ACharCode < 0) || (ACharCode > 255) || (AAttr < 0) || (AAttr > 255)) { return 0; }

        // Check if we have used this character before
        if (!FCharMap[ACharCode][AAttr]) {
            // Nope, so get character (in black and white)
            FCharMap[ACharCode][AAttr] = FContext.getImageData(ACharCode * FSize.x, 0, FSize.x, FSize.y);

            // Now colour the character (if necessary -- If attr 15 is requested, we already have it since the image is white on black!)
            if (AAttr !== 15) {
                // Get the text colour
                var Back = that.HTML_COLOURS[(AAttr & 0xF0) >> 4];
                var Fore = that.HTML_COLOURS[(AAttr & 0x0F)];

                // Get the individual RGB colours
                var BackR = parseInt(Back[1].toString() + Back[2].toString(), 16);
                var BackG = parseInt(Back[3].toString() + Back[4].toString(), 16);
                var BackB = parseInt(Back[5].toString() + Back[6].toString(), 16);
                var ForeR = parseInt(Fore[1].toString() + Fore[2].toString(), 16);
                var ForeG = parseInt(Fore[3].toString() + Fore[4].toString(), 16);
                var ForeB = parseInt(Fore[5].toString() + Fore[6].toString(), 16);

                // Colour the pixels 1 at a time
                var R = 0;
                var G = 0;
                var B = 0;
                var i;
                for (i = 0; i < FCharMap[ACharCode][AAttr].data.length; i += 4) {
                    // Determine if it's back or fore colour to use for this pixel
                    if (FCharMap[ACharCode][AAttr].data[i]) {
                        R = ForeR;
                        G = ForeG;
                        B = ForeB;
                    } else {
                        R = BackR;
                        G = BackG;
                        B = BackB;
                    }

                    FCharMap[ACharCode][AAttr].data[i]     = R;
                    FCharMap[ACharCode][AAttr].data[i + 1] = G;
                    FCharMap[ACharCode][AAttr].data[i + 2] = B;
                    FCharMap[ACharCode][AAttr].data[i + 3] = 255;
                }
            }
        }

        // Return the character if we have it
        return FCharMap[ACharCode][AAttr];
    };

    this.__defineGetter__("Height", function () {
        return FSize.y;
    });

    this.Load = function (ACodePage, AWidth, AHeight) {
        // Ensure the requested font exists
        if (CrtFonts[ACodePage + "x" + AWidth + "x" + AHeight] !== undefined) {
            that.HTML_COLOURS[7] = "#A8A8A8";
            that.HTML_COLOURS[0] = "#000000";

            FLoading += 1;
            FNewCodePage = ACodePage;
            FNewSize = new Point(AWidth, AHeight);

            // Check for PC or other font
            if (isNaN(parseInt(ACodePage, 10))) {
                // non-number means not a PC codepage

                // Override colour for ATASCII clients
                if (ACodePage.indexOf("ATASCII") === 0) {
                    that.HTML_COLOURS[7] = "#63B6E7";
                    that.HTML_COLOURS[0] = "#005184";
                }

                FLower = new Image();
                FLower.onload = OnLoadUpper;
                FLower.src = CrtFonts[FNewCodePage + "x" + FNewSize.x + "x" + FNewSize.y];
                FUpper = 0;
            } else {
                // Load the lower font
                FLower = new Image();
                FLower.onload = OnLoadLower;
                FLower.src = CrtFonts["ASCIIx" + AWidth + "x" + AHeight];
            }
        } else {
            trace("HtmlTerm Error: Font CP=" + ACodePage + ", Width=" + AWidth + ", Height=" + AHeight + " does not exist");
        }
    };

    OnLoadLower = function () {
        // Load the upper font
        FUpper = new Image();
        FUpper.onload = OnLoadUpper;
        FUpper.src = CrtFonts[FNewCodePage + "x" + FNewSize.x + "x" + FNewSize.y];
    };

    OnLoadUpper = function () {
        FCodePage = FNewCodePage;
        FSize = FNewSize;

        // Reset Canvas
        if (FUpper) {
            FCanvas.width = FLower.width * 2; // *2 for lower and upper ascii
        } else {
            FCanvas.width = FLower.width;
        }
        FCanvas.height = FLower.height;
        FContext.drawImage(FLower, 0, 0);
        if (FUpper) { FContext.drawImage(FUpper, FLower.width, 0); }

        // Reset CharMap
        var i;
        for (i = 0; i < 256; i++) { FCharMap[i] = []; }

        // Raise change event
        FLoading -= 1;
        that.onchange();
    };

    this.__defineGetter__("Size", function () {
        return FSize;
    });

    this.__defineGetter__("Width", function () {
        return FSize.x;
    });

    // Constructor
    FCodePage = 437;
    FSize = new Point(9, 16);

    var i;
    FCanvas = document.createElement("canvas");
    if (FCanvas.getContext) {
        FContext = FCanvas.getContext("2d");
        for (i = 0; i < 256; i++) { FCharMap[i] = []; }
        this.Load(FCodePage, FSize.x, FSize.y);
    }
};/*
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
var BorderStyle = 0;
var TBorderStyle = function () {
    /// <summary>
    /// Single lines all around
    /// </summary>
    this.Single = 0;

    /// <summary>
    /// Double lines all around
    /// </summary>
    this.Double = 1;

    /// <summary>
    /// Single lines horizontally, double lines vertically
    /// </summary>
    /// <see>DoubleV</see>
    this.SingleH = 2;

    /// <summary>
    /// Single lines vertically, double lines horizontally
    /// </summary>
    /// <see>DoubleH</see>
    this.SingleV = 3;

    /// <summary>
    /// Double lines horizontally, single lines vertically
    /// </summary>
    /// <see>SingleV</see>
    this.DoubleH = 4;

    /// <summary>
    /// Double lines vertically, single lines horizontally
    /// </summary>
    /// <see>SingleH</see>
    this.DoubleV = 5;
};
BorderStyle = new TBorderStyle();/*
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
var ContentAlignment = 0;
var TContentAlignment = function () {
    this.BottomLeft = 0;
    this.BottomCenter = 1;
    this.BottomRight = 2;
    this.MiddleLeft = 3;
    this.MiddleCenter = 4;
    this.MiddleRight = 5;
    this.TopLeft = 6;
    this.TopCenter = 7;
    this.TopRight = 8;
    this.Left = 9;
    this.Center = 10;
    this.Right = 11;
};
ContentAlignment = new TContentAlignment();/*
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
var KeyPressEvent = function (AKeyEvent, AKeyString) {
    // Constructor		
    this.altKey = AKeyEvent.altKey;
    this.charCode = AKeyEvent.charCode;
    this.ctrlKey = AKeyEvent.ctrlKey;
    this.keyCode = AKeyEvent.keyCode;
    this.keyString = AKeyString;
    this.shiftKey = AKeyEvent.shiftKey;
};
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
var ProgressBarStyle = 0;
var TProgressBarStyle = function () {
    this.Blocks = 254;
    this.Continuous = 219;
    this.Marquee = 0;
};
ProgressBarStyle = new TProgressBarStyle();
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
var TCharInfo = function (ACh, AAttr, ABlink, AUnderline) {
    // Handle optional parameters
    if (typeof ABlink === "undefined") { ABlink = false; }
    if (typeof AUnderline === "undefined") { AUnderline = false; }

    // Constructor
    this.Ch = ACh;
    this.Attr = AAttr;
    this.Blink = ABlink;
    this.Underline = AUnderline;
};/*
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
    var FAtari;
    var FATASCIIEscaped;
    var FBitmap;
    var FBlink;
    var FBlinkHidden;
    var FBuffer;
    var FCanvas;
    var FCharInfo;
    var FContext;
    var FCursor;
    var FFont;
    var FInScrollBack;
    var FKeyBuf;
    var FLastChar;
    var FLocalEcho;
    var FScreenSize;
    var FScrollBack;
    var FScrollBackPosition;
    var FScrollBackSize;
    var FScrollBackTemp;
    var FWindMin;
    var FWindMax;

    // Sigh: Chrome 7.0.517 stable has a canvas problem.
    // http://code.google.com/p/chromium/issues/detail?id=60336
    var brokenCanvasUpdate = (navigator.userAgent.toLowerCase().indexOf("chrome/7.0.517") !== -1);

    // Private methods
    var InitBuffers = function (AInitScrollBack) { }; // Do nothing
    var OnBlinkHide = function (e) { }; // Do nothing
    var OnBlinkShow = function (e) { }; // Do nothing
    var OnFontChanged = function (e) { }; // Do nothing
    var OnKeyDown = function (ke) { }; // Do nothing
    var OnKeyPress = function (ke) { }; // Do nothing

    Array.prototype.InitTwoDimensions = function (y, x) {
        var i;
        for (i = 0; i <= y; i++) {
            this[i] = [x + 1];
        }
    };

    this.Init = function (AParent) {
        // Init variables
        FAtari = false;
        FATASCIIEscaped = false;
        // FBitmap
        FBlink = true;
        FBlinkHidden = false;
        // FBuffer
        // FCanvas
        FCharInfo = new TCharInfo(" ", that.LIGHTGRAY, false, false);
        // FCursor
        FFont = new TFont();
        FFont.onchange = OnFontChanged;
        FInScrollBack = false;
        FKeyBuf = [];
        FLastChar = 0;
        FLocalEcho = false;
        FScreenSize = new Point(80, 25);
        // FScrollBack
        FScrollBackPosition = -1;
        FScrollBackSize = 1000;
        // FScrollBackTemp
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
        InitBuffers(true);

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
        that.FastWrite(StringUtils.NewString(' ', that.WhereX()), that.WindMinX + 1, that.WhereYA(), FCharInfo);
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
        // Clear rows before current row
        that.ScrollUpWindow(that.WhereY() - 1);
        that.ScrollDownWindow(that.WhereY() - 1);
        // Clear start of current row
        that.ClrBol();
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
        that.FastWrite(StringUtils.NewString(' ', (that.WindMaxX + 1) - that.WhereX() + 1), that.WhereXA(), that.WhereYA(), FCharInfo);
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
        // Clear rows after current row
        that.ScrollDownWindow(that.WindRows - that.WhereY());
        that.ScrollUpWindow(that.WindRows - that.WhereY());
        // Clear rest of current row
        that.ClrEol();
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
        that.FastWrite(StringUtils.NewString(' ', that.WindCols), that.WindMinX + 1, that.WhereYA(), FCharInfo);
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
        that.TextColor((that.TextAttr & 0xF0) >> 4);
    };

    this.__defineGetter__("Cursor", function () {
        return FCursor;
    });

    this.DelChar = function (AChars) {
        if (AChars === undefined) { AChars = 1; }

        var i;
        for (i = that.WhereXA() ; i <= that.WindMinX + that.WindCols - AChars; i++) {
            that.FastWrite(FBuffer[that.WhereYA()][i + AChars].Ch, i, that.WhereYA(), FBuffer[that.WhereYA()][i + AChars]);
        }
        for (i = that.WindMinX + that.WindCols + 1 - AChars; i <= that.WindMinX + that.WindCols; i++) {
            that.FastWrite(" ", i, that.WhereYA(), FCharInfo);
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
        that.ScrollUpCustom(that.WindMinX + 1, that.WhereYA(), that.WindMaxX + 1, that.WindMaxY + 1, ALines, FCharInfo);
    };

    this.EnterScrollBack = function () {
        if (!FInScrollBack) {
            FInScrollBack = true;

            var NewRow;
            var X;
            var Y;

            // Make copy of current scrollback buffer in temp scrollback buffer
            FScrollBackTemp = [];
            for (Y = 0; Y < FScrollBack.length; Y++) {
                NewRow = [];
                for (X = 0; X < FScrollBack[Y].length; X++) {
                    NewRow.push(new TCharInfo(FScrollBack[Y][X].Ch, FScrollBack[Y][X].Attr, FScrollBack[Y][X].Blink, FScrollBack[Y][X].Underline));
                }
                FScrollBackTemp.push(NewRow);
            }

            // Add current screen to temp scrollback buffer
            var YOffset = FScrollBackTemp.length - 1;
            for (Y = 1; Y <= FScreenSize.y; Y++) {
                NewRow = [];
                for (X = 1; X <= FScreenSize.x; X++) {
                    NewRow.push(new TCharInfo(FBuffer[Y][X].Ch, FBuffer[Y][X].Attr, FBuffer[Y][X].Blink, FBuffer[Y][X].Underline));
                }
                FScrollBackTemp.push(NewRow);
            }

            // Set our position in the scrollback
            FScrollBackPosition = FScrollBackTemp.length;

            // Display footer showing we're in scrollback mode 
            that.ScrollUpCustom(1, 1, FScreenSize.x, FScreenSize.y, 1, new TCharInfo(" ", 31, false, false), false);
            that.FastWrite("SCROLLBACK (" + (FScrollBackPosition - (FScreenSize.y - 1) + 1) + "/" + (FScrollBackTemp.length - (FScreenSize.y - 1) + 1) + "): Use Up/Down or PgUp/PgDn to navigate and Esc when done", 1, FScreenSize.y, new TCharInfo(" ", 31, false, false), false);
        }
    };

    this.FastWrite = function (AText, AX, AY, ACharInfo, AUpdateBuffer) {
        /// <summary>
        /// Writes a string of text at the desired X/Y coordinate with the given text attribute.
        /// 
        /// FastWrite is not window-relative, and it does not wrap text that goes beyond the right edge of the screen.
        /// </summary>
        /// <param name="AText" type="String">The text to write</param>
        /// <param name="AX" type="Number" integer="true">The 1-based column to start the text</param>
        /// <param name="AY" type="Number" integer="true">The 1-based row to start the text</param>
        /// <param name="ACharInfo" type="TCharInfo">The text attribute to colour the text</param>
        /// <param name="AUpdateBuffer" type="Boolean" optional="true">Whether to update the internal buffer or not (default is true)</param>
        if (AUpdateBuffer === undefined) { AUpdateBuffer = true; }

        if ((AX <= FScreenSize.x) && (AY <= FScreenSize.y)) {
            var i;
            for (i = 0; i < AText.length; i++) {
                var Char = FFont.GetChar(AText.charCodeAt(i), ACharInfo.Attr);
                if (Char) {
                    if ((!FInScrollBack) || (FInScrollBack && !AUpdateBuffer)) {
                        FContext.putImageData(Char, (AX - 1 + i) * FFont.Width, (AY - 1) * FFont.Height);
                    }
                }

                if (AUpdateBuffer) {
                    FBuffer[AY][AX + i].Ch = AText.charAt(i);
                    FBuffer[AY][AX + i].Attr = ACharInfo.Attr;
                    FBuffer[AY][AX + i].Blink = ACharInfo.Blink;
                    FBuffer[AY][AX + i].Underline = ACharInfo.Underline;
                }

                if (AX + i >= FScreenSize.x) { break; }
            }
        }
    };

    this.FillScreen = function (AChar) {
        var Line = StringUtils.NewString(AChar.charAt(0), that.ScreenCols);

        var Y;
        for (Y = 1; Y <= that.ScreenRows; Y++) {
            that.FastWrite(Line, 1, Y, FCharInfo);
        }
    };

    this.GetCharInfo = function () {
        return FCharInfo;
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
        if ((AX >= 1) && (AY >= 1) && ((AX - 1 + that.WindMinX) <= that.WindMaxX) && ((AY - 1 + that.WindMinY) <= that.WindMaxY)) {
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
        that.TextAttr |= 0x08;
    };

    // Have to do this here because the static constructor doesn't seem to like the X and Y variables
    InitBuffers = function (AInitScrollBack) {
        FBuffer = [];
        FBuffer.InitTwoDimensions(FScreenSize.y, FScreenSize.x);

        var X;
        var Y;
        for (Y = 1; Y <= FScreenSize.y; Y++) {
            for (X = 1; X <= FScreenSize.x; X++) {
                FBuffer[Y][X] = new TCharInfo(" ", that.LIGHTGRAY, false, false);
            }
        }

        if (AInitScrollBack) {
            FScrollBack = [];
        }
    };

    this.InsChar = function (AChars) {
        if (AChars === undefined) { AChars = 1; }

        var i;
        for (i = that.WindMinX + that.WindCols; i >= that.WhereXA() + AChars; i--) {
            that.FastWrite(FBuffer[that.WhereYA()][i - AChars].Ch, i, that.WhereYA(), FBuffer[that.WhereYA()][i - AChars]);
        }
        for (i = that.WhereXA() ; i < that.WhereXA() + AChars; i++) {
            that.FastWrite(" ", i, that.WhereYA(), FCharInfo);
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
        that.ScrollDownCustom(that.WindMinX + 1, that.WhereYA(), that.WindMaxX + 1, that.WindMaxY + 1, ALines, FCharInfo);

    };

    this.KeyPressed = function () {
        return (FKeyBuf.length > 0);
    };

    this.__defineSetter__("LocalEcho", function (ALocalEcho) {
        FLocalEcho = ALocalEcho;
    });

    this.LowVideo = function () {
        /// <summary>
        /// Selects low intensity characters.
        /// </summary>
        /// <remarks>
        /// There is a Byte variable in Crt--TextAttr--that holds the current video
        /// attribute. LowVideo clears the high-intensity bit of TextAttr's foreground
        /// color, thus mapping colors 8 to 15 onto colors 0 to 7.
        /// </remarks>
        that.TextAttr &= 0xF7;
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
        FCharInfo.Attr = that.LIGHTGRAY;
        FCharInfo.Blink = false;
        FCharInfo.Underline = false;
    };

    OnBlinkHide = function (e) {
        // Only hide the text if blink is enabled
        if (FBlink) {
            FBlinkHidden = true;

            var X;
            var Y;
            for (Y = 1; Y <= FScreenSize.y; Y++) {
                for (X = 1; X <= FScreenSize.x; X++) {
                    if (FBuffer[Y][X].Blink) {
                        if (FBuffer[Y][X].Ch !== " ") {
                            that.FastWrite(" ", X, Y, FBuffer[Y][X], false);
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
                    if (FBuffer[Y][X].Blink) {
                        if (FBuffer[Y][X].Ch !== " ") {
                            that.FastWrite(FBuffer[Y][X].Ch, X, Y, FBuffer[Y][X], false);
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
                    that.FastWrite(FBuffer[Y][X].Ch, X, Y, FBuffer[Y][X], false);
                }
            }
        }
    };

    OnKeyDown = function (ke) {
        if (FInScrollBack) {
            var i;
            var X;
            var XEnd;
            var Y;
            var YDest;
            var YSource;
				
            if (ke.keyCode === Keyboard.DOWN) {
                if (FScrollBackPosition < FScrollBackTemp.length) {
                    FScrollBackPosition += 1;
                    that.ScrollUpCustom(1, 1, FScreenSize.x, FScreenSize.y - 1, 1, new TCharInfo(' ', 7), false);
                    that.FastWrite("SCROLLBACK (" + (FScrollBackPosition - (FScreenSize.y - 1) + 1) + "/" + (FScrollBackTemp.length - (FScreenSize.y - 1) + 1) + "): Use Up/Down or PgUp/PgDn to navigate and Esc when done ", 1, FScreenSize.y, new TCharInfo(' ', 31), false);
						
                    YDest = FScreenSize.y - 1;
                    YSource = FScrollBackPosition - 1;
                    XEnd = Math.min(FScreenSize.x, FScrollBackTemp[YSource].length);
                    for (X = 0; X < XEnd; X++) {
                        that.FastWrite(FScrollBackTemp[YSource][X].Ch, X + 1, YDest, FScrollBackTemp[YSource][X], false);
                    }
                }
            } else if (ke.keyCode === Keyboard.ESCAPE) {
                // Restore the screen contents
                if (FBuffer !== null) {
                    for (Y = 1; Y <= FScreenSize.y; Y++) {
                        for (X = 1; X <= FScreenSize.x; X++) {
                            that.FastWrite(FBuffer[Y][X].Ch, X, Y, FBuffer[Y][X], false);
                        }
                    }
                }
					
                FInScrollBack = false;
            } else if (ke.keyCode === Keyboard.PAGE_DOWN) {
                for (i = 0; i < (FScreenSize.y - 1) ; i++) {
                    // TODO Not working
                    OnKeyDown(new KeyboardEvent("keydown", true, false, 0, Keyboard.DOWN));
                }
            } else if (ke.keyCode === Keyboard.PAGE_UP) {
                for (i = 0; i < (FScreenSize.y - 1); i++) {
                    // TODO Not working
                    OnKeyDown(new KeyboardEvent("keydown", true, false, 0, Keyboard.UP));
                }
            } else if (ke.keyCode === Keyboard.UP) {
                if (FScrollBackPosition > (FScreenSize.y - 1)) {
                    FScrollBackPosition -= 1;
                    that.ScrollDownCustom(1, 1, FScreenSize.x, FScreenSize.y - 1, 1, new TCharInfo(" ", 7, false, false), false);
                    that.FastWrite("SCROLLBACK (" + (FScrollBackPosition - (FScreenSize.y - 1) + 1) + "/" + (FScrollBackTemp.length - (FScreenSize.y - 1) + 1) + "): Use Up/Down or PgUp/PgDn to navigate and Esc when done ", 1, FScreenSize.y, new TCharInfo(' ', 31), false);
						
                    YDest = 1;
                    YSource = FScrollBackPosition - (FScreenSize.y - 1);
                    XEnd = Math.min(FScreenSize.x, FScrollBackTemp[YSource].length);
                    for (X = 0; X < XEnd; X++) {
                        that.FastWrite(FScrollBackTemp[YSource][X].Ch, X + 1, YDest, FScrollBackTemp[YSource][X], false);
                    }
                }
            }

            ke.preventDefault();

            return;
        }
        
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
        if (FInScrollBack) { return; }

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

        var KPE = FKeyBuf.shift();
        if (FLocalEcho) {
            that.Write(KPE.keyString);
        }
        return KPE;
    };

    this.ReDraw = function () {
        var X;
        var Y;
        for (Y = 1; Y <= FScreenSize.y; Y++) {
            for (X = 1; X <= FScreenSize.x; X++) {
                that.FastWrite(FBuffer[Y][X].Ch, X, Y, FBuffer[Y][X], false);
            }
        }
    };

    // TODO This doesn't match Crt.as -- which is correct?
    this.RestoreScreen = function (ABuffer, ALeft, ATop, ARight, ABottom) {
        var X;
        var Y;
        for (Y = ATop; Y <= ABottom; Y++) {
            for (X = ALeft; X <= ARight; X++) {
                that.FastWrite(ABuffer[Y][X].Ch, X, Y, ABuffer[Y][X]);
            }
        }
    };

    this.ReverseVideo = function () {
        /// <summary>
        /// Reverses the foreground and background text attributes
        /// </summary>
        that.TextAttr = ((that.TextAttr & 0xF0) >> 4) | ((that.TextAttr & 0x0F) << 4);
    };

    // TODO This doesn't match Crt.as -- which is correct?
    this.SaveScreen = function (ALeft, ATop, ARight, ABottom) {
        var Result = [];
        Result.InitTwoDimensions(FScreenSize.y, FScreenSize.x);

        var X;
        var Y;
        for (Y = ATop; Y <= ABottom; Y++) {
            for (X = ALeft; X <= ARight; X++) {
                Result[Y][X] = new TCharInfo(FBuffer[Y][X].Ch, FBuffer[Y][X].Attr, FBuffer[Y][X].Blink, FBuffer[Y][X].Underline);
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

    this.ScrollDownCustom = function (AX1, AY1, AX2, AY2, ALines, ACharInfo, AUpdateBuffer) {
        /// <summary>
        /// Scrolls the given window down the given number of lines (leaving blank lines at the top), filling the void with the given character with the given text attribute
        /// </summary>
        /// <param name="AX1">The 1-based left column of the window</param>
        /// <param name="AY1">The 1-based top row of the window</param>
        /// <param name="AX2">The 1-based right column of the window</param>
        /// <param name="AY2">The 1-based bottom row of the window</param>
        /// <param name="ALines">The number of lines to scroll</param>
        /// <param name="ACh">The character to fill the void with</param>
        /// <param name="ACharInfo">The text attribute to fill the void with</param>

        // Handle optional parameters
        if (typeof AUpdateBuffer === "undefined") { AUpdateBuffer = true; }

        // Validate the ALines parameter
        var MaxLines = AY2 - AY1 + 1;
        if (ALines > MaxLines) { ALines = MaxLines; }

        var Back = (ACharInfo.Attr & 0xF0) >> 4;

        // Scroll -- TODO Hasn't been tested yet
        var Left = (AX1 - 1) * FFont.Width;
        var Top = (AY1 - 1) * FFont.Height;
        var Width = (AX2 - AX1 + 1) * FFont.Width;
        var Height = ((AY2 - AY1 + 1 - ALines) * FFont.Height);
        if (Height > 0) {
            var Buf = FContext.getImageData(Left, Top, Width, Height);
            Left = (AX1 - 1) * FFont.Width;
            Top = (AY1 - 1 + ALines) * FFont.Height;
            FContext.putImageData(Buf, Left, Top);
        }

        // Blank -- TODO Hasn't been tested yet
        FContext.fillStyle = FFont.HTML_COLOURS[(ACharInfo.Attr & 0xF0) >> 4];
        Left = (AX1 - 1) * FFont.Width;
        Top = (AY1 - 1) * FFont.Height;
        Width = (AX2 - AX1 + 1) * FFont.Width;
        Height = (ALines * FFont.Height);
        FContext.fillRect(Left, Top, Width, Height);

        if (AUpdateBuffer) {
            // Now to adjust the buffer
            var X = 0;
            var Y = 0;

            // First, shuffle the contents that are still visible
            for (Y = AY2; Y > ALines; Y--) {
                for (X = AX1; X <= AX2; X++) {
                    FBuffer[Y][X].Ch = FBuffer[Y - ALines][X].Ch;
                    FBuffer[Y][X].Attr = FBuffer[Y - ALines][X].Attr;
                    FBuffer[Y][X].Blink = FBuffer[Y - ALines][X].Blink;
                    FBuffer[Y][X].Underline = FBuffer[Y - ALines][X].Underline;
                }
            }

            // Then, blank the contents that are not
            for (Y = AY1; Y <= ALines; Y++) {
                for (X = AX1; X <= AX2; X++) {
                    FBuffer[Y][X].Ch = ACharInfo.Ch;
                    FBuffer[Y][X].Attr = ACharInfo.Attr;
                    FBuffer[Y][X].Blink = ACharInfo.Blink;
                    FBuffer[Y][X].Underline = ACharInfo.Underline;
                }
            }
        }
    };

    this.ScrollDownScreen = function (ALines) {
        /// <summary>
        /// Scrolls the screen down the given number of lines (leaving blanks at the top)
        /// </summary>
        /// <param name="ALines">The number of lines to scroll</param>
        that.ScrollDownCustom(1, 1, FScreenSize.x, FScreenSize.y, ALines, FCharInfo);
    };

    this.ScrollDownWindow = function (ALines) {
        /// <summary>
        /// Scrolls the current window down the given number of lines (leaving blanks at the top)
        /// </summary>
        /// <param name="ALines">The number of lines to scroll</param>
        that.ScrollDownCustom(that.WindMinX + 1, that.WindMinY + 1, that.WindMaxX + 1, that.WindMaxY + 1, ALines, FCharInfo);
    };

    this.ScrollUpCustom = function (AX1, AY1, AX2, AY2, ALines, ACharInfo, AUpdateBuffer) {
        /// <summary>
        /// Scrolls the given window up the given number of lines (leaving blank lines at the bottom), filling the void with the given character with the given text attribute
        /// </summary>
        /// <param name="AX1">The 1-based left column of the window</param>
        /// <param name="AY1">The 1-based top row of the window</param>
        /// <param name="AX2">The 1-based right column of the window</param>
        /// <param name="AY2">The 1-based bottom row of the window</param>
        /// <param name="ALines">The number of lines to scroll</param>
        /// <param name="ACh">The character to fill the void with</param>
        /// <param name="ACharInfo">The text attribute to fill the void with</param>

        // Handle optional parameters
        if (typeof AUpdateBuffer === "undefined") { AUpdateBuffer = true; }

        // Validate the ALines parameter
        var MaxLines = AY2 - AY1 + 1;
        if (ALines > MaxLines) { ALines = MaxLines; }

        var Back = (ACharInfo.Attr & 0xF0) >> 4;

        if ((!FInScrollBack) || (FInScrollBack && !AUpdateBuffer)) {
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
            FContext.fillStyle = FFont.HTML_COLOURS[(ACharInfo.Attr & 0xF0) >> 4];
            Left = (AX1 - 1) * FFont.Width;
            Top = (AY2 - ALines) * FFont.Height;
            Width = (AX2 - AX1 + 1) * FFont.Width;
            Height = (ALines * FFont.Height);
            FContext.fillRect(Left, Top, Width, Height);
        }

        if (AUpdateBuffer) {
            // Now to adjust the buffer
            var NewRow ;
            var X;
            var Y;

            // First, store the contents of the scrolled lines in the scrollback buffer
            for (Y = 0; Y < ALines; Y++) {
                NewRow = [];
                for (X = AX1; X <= AX2; X++) {
                    NewRow.push(new TCharInfo(FBuffer[Y + AY1][X].Ch, FBuffer[Y + AY1][X].Attr, FBuffer[Y + AY1][X].Blink, FBuffer[Y + AY1][X].Underline));
                }
                FScrollBack.push(NewRow);
            }
            // Trim the scrollback to 1000 lines, if necessary
            var FScrollBackLength = FScrollBack.length;
            while (FScrollBackLength > (FScrollBackSize - 2)) {
                FScrollBack.shift();
                FScrollBackLength -= 1;
            }

            // Then, shuffle the contents that are still visible
            for (Y = AY1; Y <= (AY2 - ALines) ; Y++) {
                for (X = AX1; X <= AX2; X++) {
                    FBuffer[Y][X].Ch = FBuffer[Y + ALines][X].Ch;
                    FBuffer[Y][X].Attr = FBuffer[Y + ALines][X].Attr;
                    FBuffer[Y][X].Blink = FBuffer[Y + ALines][X].Blink;
                    FBuffer[Y][X].Underline = FBuffer[Y + ALines][X].Underline;
                }
            }

            // Then, blank the contents that are not
            for (Y = AY2; Y > (AY2 - ALines) ; Y--) {
                for (X = AX1; X <= AX2; X++) {
                    FBuffer[Y][X].Ch = ACharInfo.Ch;
                    FBuffer[Y][X].Attr = ACharInfo.Attr;
                    FBuffer[Y][X].Blink = ACharInfo.Blink;
                    FBuffer[Y][X].Underline = ACharInfo.Underline;
                }
            }
        }
    };

    this.ScrollUpScreen = function (ALines) {
        /// <summary>
        /// Scrolls the screen up the given number of lines (leaving blanks at the bottom)
        /// </summary>
        /// <param name="ALines">The number of lines to scroll</param>
        that.ScrollUpCustom(1, 1, FScreenSize.x, FScreenSize.y, ALines, FCharInfo);
    };

    this.ScrollUpWindow = function (ALines) {
        /// <summary>
        /// Scrolls the current window up the given number of lines (leaving blanks at the bottom)
        /// </summary>
        /// <param name="ALines">The number of lines to scroll</param>
        that.ScrollUpCustom(that.WindMinX + 1, that.WindMinY + 1, that.WindMaxX + 1, that.WindMaxY + 1, ALines, FCharInfo);
    };

    this.SetBlink = function (ABlink) {
        FCharInfo.Blink = ABlink;
    };

    this.SetBlinkRate = function (AMS) {
        FCursor.BlinkRate = AMS;
    };

    this.SetCharInfo = function (ACharInfo) {
        FCharInfo = new TCharInfo(ACharInfo.Ch, ACharInfo.Attr, ACharInfo.Blink, ACharInfo.Underline);
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
        // Check if we're in scrollback
        if (FInScrollBack) { return; }

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
                    FOldBuffer[Y][X] = new TCharInfo(FBuffer[Y][X].Ch, FBuffer[Y][X].Attr, FBuffer[Y][X].Blink, FBuffer[Y][X].Underline);
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
        InitBuffers(false);

        // Update the bitmap
        // TODO Why is this commented out?
        /*FBitmap.bitmapData = new BitmapData(FFont.Width * FScreenSize.x, FFont.Height * FScreenSize.y, false, 0);
        FCanvas.width = FBitmap.width;
        FCanvas.height = FBitmap.height;*/

        // Restore the screen contents
        // TODO If new screen is smaller than old screen, restore bottom portion not top portion
        if (FOldBuffer !== null) {
            for (Y = 1; Y <= Math.min(FScreenSize.y, FOldScreenSize.y) ; Y++) {
                for (X = 1; X <= Math.min(FScreenSize.x, FOldScreenSize.x) ; X++) {
                    that.FastWrite(FOldBuffer[Y][X].Ch, X, Y, FOldBuffer[Y][X]);
                }
            }
        }

        // Let the program know about the update
        // TODO Is the commented or uncommented code correct?
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
        return FCharInfo.Attr;
    });

    this.__defineSetter__("TextAttr", function (AAttr) {
        FCharInfo.Attr = AAttr;
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
        that.TextAttr = (that.TextAttr & 0x0F) | ((AColor & 0x0F) << 4);
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
        that.TextAttr = (that.TextAttr & 0xF0) | (AColor & 0x0F);
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
        if ((AX1 >= 1) && (AY1 >= 1) && (AX1 <= AX2) && (AY1 <= AY2)) {
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

            if (AText.charCodeAt(i) === 0x00) {
                // NULL, ignore
                i += 0; // Make JSLint happy (doesn't like empty block)
            }
            else if (AText.charCodeAt(i) === 0x07) {
                that.Beep();
            }
            else if (AText.charCodeAt(i) === 0x08) {
                // Backspace, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
                X += Buf.length;
                if (X > 1) { X -= 1; }
                DoGoto = true;

                Buf = "";
            }
            else if (AText.charCodeAt(i) === 0x09) {
                // Tab, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
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

                    // Make sure we didn't tab beyond the width of the window (can happen if width of window is not divisible by 8)
                    X = Math.min(X, that.WindCols);
                }
                DoGoto = true;
            }
            else if (AText.charCodeAt(i) === 0x0A) {
                // Line feed, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
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
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
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
                    that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
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
            that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
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

            if (AText.charCodeAt(i) === 0x00) {
                // NULL, ignore
                i += 0; // Make JSLint happy (doesn't like empty block)
            }
            if ((AText.charCodeAt(i) === 0x1B) && (!FATASCIIEscaped)) {
                // Escape
                FATASCIIEscaped = true;
            }
            else if ((AText.charCodeAt(i) === 0x1C) && (!FATASCIIEscaped)) {
                // Cursor up, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
                X += Buf.length;
                Y = (Y > 1) ? Y - 1 : that.WindRows;
                DoGoto = true;

                Buf = "";
            }
            else if ((AText.charCodeAt(i) === 0x1D) && (!FATASCIIEscaped)) {
                // Cursor down, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
                X += Buf.length;
                Y = (Y < that.WindRows) ? Y + 1 : 1;
                DoGoto = true;

                Buf = "";
            }
            else if ((AText.charCodeAt(i) === 0x1E) && (!FATASCIIEscaped)) {
                // Cursor left, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
                X += Buf.length;
                X = (X > 1) ? X - 1 : that.WindCols;
                DoGoto = true;

                Buf = "";
            }
            else if ((AText.charCodeAt(i) === 0x1F) && (!FATASCIIEscaped)) {
                // Cursor right, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
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
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
                X += Buf.length;
                Buf = "";
                DoGoto = true;

                if (X > 1) {
                    X -= 1;
                    that.FastWrite(" ", X, that.WhereYA(), FCharInfo);
                }
            }
            else if ((AText.charCodeAt(i) === 0x7F) && (!FATASCIIEscaped)) {
                // Tab, need to flush buffer before moving cursor
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
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
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
                X = 1;
                Y += 1;
                DoGoto = true;

                Buf = "";
            }
            else if ((AText.charCodeAt(i) === 0x9C) && (!FATASCIIEscaped)) {
                // Delete line, need to flush buffer before doing so
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
                X = 1;
                Buf = "";

                that.GotoXY(X, Y);
                that.DelLine();
            }
            else if ((AText.charCodeAt(i) === 0x9D) && (!FATASCIIEscaped)) {
                // Insert line, need to flush buffer before doing so
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
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
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
                X += Buf.length;
                Buf = "";

                that.GotoXY(X, Y);
                that.DelChar();
            }
            else if ((AText.charCodeAt(i) === 0xFF) && (!FATASCIIEscaped)) {
                // Insert character, need to flush buffer before doing so
                that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
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
                    that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
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
            that.FastWrite(Buf, that.WhereXA(), that.WhereYA(), FCharInfo);
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
var TCrtControl = function (AParent, ALeft, ATop, AWidth, AHeight) {
    var that = this;
    var FBackColour = Crt.BLACK;
    var FBackground = null;
    var FControls = [];
    var FForeColour = Crt.LIGHTGRAY;
    var FHeight;
    var FLeft;
    var FParent = null;
    var FTop;
    var FWidth;

    // Private methods
    var Paint = function (AForce) { }; // Do nothing
    var RestoreBackground = function () { }; // Do nothing
    var SaveBackground = function () { }; // Do nothing

    this.AddControl = function (AChild) {
        FControls.push(AChild);
    };

    this.__defineGetter__("BackColour", function () {
        return FBackColour;
    });

    this.__defineSetter__("BackColour", function (ABackColour) {
        if (ABackColour !== FBackColour) {
            FBackColour = ABackColour;
            Paint(true);
        }
    });

    this.__defineGetter__("ForeColour", function () {
        return FForeColour;
    });

    this.__defineSetter__("ForeColour", function (AForeColour) {
        if (AForeColour !== FForeColour) {
            FForeColour = AForeColour;
            Paint(true);
        }
    });

    this.__defineGetter__("Height", function () {
        return FHeight;
    });

    this.__defineSetter__("Height", function (AHeight) {
        if (AHeight !== FHeight) {
            RestoreBackground();
            FHeight = AHeight;
            SaveBackground();
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

            for (i = 0; i < FControls.length; i++) {
                FControls[i].Paint(true);
            }
        }
    });

    Paint = function (AForce) {
        // Override in extended class
    };

    this.__defineGetter__("Parent", function () {
        return FParent;
    });

    this.__defineSetter__("Parent", function (AParent) {
        RestoreBackground();
        FParent = AParent;
        SaveBackground();
        Paint(true);
    });

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

        var i;
        for (i = 0; i < FControls.length; i++) {
            FControls[i].Paint(true);
        }
    };

    this.__defineGetter__("Top", function () {
        return FTop;
    });

    this.__defineSetter__("Top", function (ATop) {
        if (ATop !== FTop) {
            RestoreBackground();
            FTop = ATop;
            SaveBackground();
            Paint(true);

            var i;
            for (i = 0; i < FControls.length; i++) {
                FControls[i].Paint(true);
            }
        }
    });

    this.__defineGetter__("Width", function () {
        return FWidth;
    });

    this.__defineSetter__("Width", function (AWidth) {
        if (AWidth !== FWidth) {
            RestoreBackground();
            FWidth = AWidth;
            SaveBackground();
            Paint(true);
        }
    });

    // Constructor
    FParent = AParent;
    FLeft = ALeft;
    FTop = ATop;
    FWidth = AWidth;
    FHeight = AHeight;

    SaveBackground();

    if (FParent !== null) {
        AParent.AddControl(this);
    }
};

var TCrtControlSurrogate = function () { };
TCrtControlSurrogate.prototype = TCrtControl.prototype;/*
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
    var FText = "";
    var FTextAlign;

    // Private methods
    var Paint = function (AForce) { }; // Do nothing

    Paint = function (AForce) {
        // Draw the message
        switch (FTextAlign) {
            case ContentAlignment.Center:
                if (FText.length >= that.Width) {
                    // Text is greater than available space so chop it off with PadRight()
                    Crt.FastWrite(FText.substring(0, that.Width), that.ScreenLeft, that.ScreenTop, new TCharInfo(" ", that.ForeColour + (that.BackColour << 4)));
                } else {
                    // Text needs to be centered
                    var i = 0;
                    var LeftSpaces = "";
                    for (i = 0; i < Math.floor((that.Width - FText.length) / 2) ; i++) {
                        LeftSpaces += " ";
                    }
                    var RightSpaces = "";
                    for (i = 0; i < that.Width - FText.length - LeftSpaces.length; i++) {
                        RightSpaces += " ";
                    }
                    Crt.FastWrite(LeftSpaces + FText + RightSpaces, that.ScreenLeft, that.ScreenTop, new TCharInfo(" ", that.ForeColour + (that.BackColour << 4)));
                }
                break;
            case ContentAlignment.Left:
                Crt.FastWrite(StringUtils.PadRight(FText, ' ', that.Width), that.ScreenLeft, that.ScreenTop, new TCharInfo(" ", that.ForeColour + (that.BackColour << 4)));
                break;
            case ContentAlignment.Right:
                Crt.FastWrite(StringUtils.PadLeft(FText, ' ', that.Width), that.ScreenLeft, that.ScreenTop, new TCharInfo(" ", that.ForeColour + (that.BackColour << 4)));
                break;
        }
    };

    this.__defineGetter__("Text", function () {
        return FText;
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

    // Constructor
    TCrtControl.call(this, AParent, ALeft, ATop, AWidth, 1);

    FText = AText;
    FTextAlign = ATextAlign;
    that.ForeColour = AForeColour;
    that.BackColour = ABackColour;

    Paint(true);
};

TCrtLabel.prototype = new TCrtControlSurrogate();
TCrtLabel.prototype.constructor = TCrtLabel;/*
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
    var FBorder;
    var FText = "";
    var FTextAlign;

    // Private methods
    var Paint = function (AForce) { }; // Do nothing

    this.__defineGetter__("Border", function () {
        return FBorder;
    });

    this.__defineSetter__("Border", function (ABorder) {
        if (ABorder !== FBorder) {
            FBorder = ABorder;
            Paint(true);
        }
    });

    Paint = function (AForce) {
        // Characters for the box
        var Line;
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
        Crt.FastWrite(TopLeft + StringUtils.NewString(TopBottom, that.Width - 2) + TopRight, that.ScreenLeft, that.ScreenTop, new TCharInfo(" ", that.ForeColour + (that.BackColour << 4)));

        // Draw middle rows
        for (Line = that.ScreenTop + 1; Line < that.ScreenTop + that.Height - 1; Line++) {
            Crt.FastWrite(LeftRight + StringUtils.NewString(' ', that.Width - 2) + LeftRight, that.ScreenLeft, Line, new TCharInfo(" ", that.ForeColour + (that.BackColour << 4)));
        }

        // Draw bottom row
        Crt.FastWrite(BottomLeft + StringUtils.NewString(TopBottom, that.Width - 2) + BottomRight, that.ScreenLeft, that.ScreenTop + that.Height - 1, new TCharInfo(" ", that.ForeColour + (that.BackColour << 4)));

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
                    TitleX = that.ScreenLeft + Math.round((that.Width - WindowTitle.length) / 2);
                    break;
                case ContentAlignment.BottomRight:
                case ContentAlignment.MiddleRight:
                case ContentAlignment.TopRight:
                    TitleX = that.ScreenLeft + that.Width - WindowTitle.length - 2;
                    break;
            }

            // Get the Y component
            switch (FTextAlign) {
                case ContentAlignment.BottomCenter:
                case ContentAlignment.BottomLeft:
                case ContentAlignment.BottomRight:
                    TitleY = that.ScreenTop + that.Height - 1;
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
            Crt.FastWrite(WindowTitle, TitleX, TitleY, new TCharInfo(" ", that.ForeColour + (that.BackColour << 4)));
        }
    };

    this.__defineGetter__("Text", function () {
        return FText;
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

    // Constructor
    TCrtControl.call(this, AParent, ALeft, ATop, AWidth, AHeight);

    FBorder = ABorder;
    that.ForeColour = AForeColour;
    that.BackColour = ABackColour;
    FText = AText;
    FTextAlign = ATextAlign;

    Paint(true);
};

TCrtPanel.prototype = new TCrtControlSurrogate();
TCrtPanel.prototype.constructor = TCrtPanel;/*
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
    var FBarForeColour;
    var FBlankForeColour;
    var FLastBarWidth = 9999;
    var FLastMarqueeUpdate = 0; 
    var FLastPercentText = "";
    var FMarqueeAnimationSpeed;
    var FMaximum;
    var FPercentPrecision;
    var FPercentVisible;
    var FStyle;
    var FValue;

    // Private methods
    var Paint = function (AForce) { }; // Do nothing
		
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
                Crt.FastWrite(StringUtils.NewString(String.fromCharCode(176), that.Width), that.ScreenLeft, that.ScreenTop, new TCharInfo(" ", FBlankForeColour + (that.BackColour << 4)));
            }
				
            // Draw the new bar
            if (FValue > 0)
            {
                if (FValue > that.Width)
                {
                    Crt.FastWrite(String.fromCharCode(176), that.ScreenLeft + that.Width - (15 - Math.floor(FValue - that.Width)), that.ScreenTop, new TCharInfo(" ", FBlankForeColour + (that.BackColour << 4)));
                }
                else if (FValue >= 15)
                {
                    Crt.FastWrite(StringUtils.NewString(String.fromCharCode(219), Math.min(FValue, 15)), that.ScreenLeft + FValue - 15, that.ScreenTop, new TCharInfo(" ", FBarForeColour + (that.BackColour << 4)));
                    Crt.FastWrite(String.fromCharCode(176), that.ScreenLeft + FValue - 15, that.ScreenTop, new TCharInfo(" ", FBlankForeColour + (that.BackColour << 4)));
                }
                else
                {
                    Crt.FastWrite(StringUtils.NewString(String.fromCharCode(219), Math.min(FValue, 15)), that.ScreenLeft, that.ScreenTop, new TCharInfo(" ", FBarForeColour + (that.BackColour << 4)));
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
            var NewBarWidth = Math.floor(Percent * that.Width);
            if (NewBarWidth !== FLastBarWidth)
            {
                // Check if the bar shrank (if so, we need to delete the old bar)
                if (NewBarWidth < FLastBarWidth)
                {
                    // Erase the old bar
                    Crt.FastWrite(StringUtils.NewString(String.fromCharCode(176), that.Width), that.ScreenLeft, that.ScreenTop, new TCharInfo(" ", FBlankForeColour + (that.BackColour << 4)));
                }
					
                // Draw the new bar
                Crt.FastWrite(StringUtils.NewString(String.fromCharCode(FStyle), NewBarWidth), that.ScreenLeft, that.ScreenTop, new TCharInfo(" ", FBarForeColour + (that.BackColour << 4)));
					
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
						
                    var ProgressStart = Math.round((that.Width - NewPercentText.length) / 2);
                    if (ProgressStart >= NewBarWidth)
                    {
                        // Bar hasn't reached the percent text, so draw in the bar's empty color
                        Crt.FastWrite(NewPercentText, that.ScreenLeft + ProgressStart, that.ScreenTop, new TCharInfo(" ", FBlankForeColour + (that.BackColour << 4)));
                    }
                    else if (ProgressStart + NewPercentText.length <= NewBarWidth)
                    {
                        // Bar has passed the percent text, so draw in the bar's foreground colour (or still use background for Blocks)
                        Crt.FastWrite(NewPercentText, that.ScreenLeft + ProgressStart, that.ScreenTop, new TCharInfo(" ", that.BackColour + (FBarForeColour << 4)));
                    }
                    else
                    {
                        // Bar is in the middle of the percent text, so draw the colour as necessary for each letter in the text
                        var i;
                        for (i = 0; i < NewPercentText.length; i++)
                        {
                            var LetterPosition = ProgressStart + i;
                            var FG = (LetterPosition >= NewBarWidth) ? FBlankForeColour : that.BackColour;
                            var BG = (LetterPosition >= NewBarWidth) ? that.BackColour : FBarForeColour;
                            Crt.FastWrite(NewPercentText.charAt(i), that.ScreenLeft + LetterPosition, that.ScreenTop, new TCharInfo(" ", FG + (BG << 4)));
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
                    if (AValue >= that.Width + 15) {
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

    // Constructor
    TCrtControl.call(this, AParent, ALeft, ATop, AWidth, 1);

    FStyle = AStyle;
			
    that.BackColour = Crt.BLUE;
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

TCrtProgressBar.prototype = new TCrtControlSurrogate();
TCrtProgressBar.prototype.constructor = TCrtProgressBar;/*
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
var AnsiParserState = 0;
/// <summary>
/// The possible states the ANSI parser may find itself in
/// </summary>
var TAnsiParserState = function () {
	/// <summary>
	/// The default data state
	/// </summary>
	this.None = 0;
		
	/// <summary>
	/// The last received character was an ESC
	/// </summary>
	this.Escape = 1;
		
	/// <summary>
	/// The last received character was a [
	/// </summary>
	this.Bracket = 2;
};
AnsiParserState = new TAnsiParserState();
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
var ESCQEvent = function (ACodePage, AWidth, AHeight) {
	// Constructor
	this.CodePage = ACodePage;
	this.Width = AWidth;
	this.Height = AHeight;
};
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
var TTelnet = function () {
    // Public events
    this.onclose = function () { }; // Do nothing
    this.onconnect = function () { }; // Do nothing
    this.onioerror = function (ioee) { }; // Do nothing
    this.onsecurityerror = function () { }; // Do nothing

    // Private variables
    var that = this;
    var FInputBuffer;
    var FMode = 'plain';
    var FOutputBuffer;
    var FWasConnected = false;
    var FWebSocket;

    // Private methods
    var decode_message = function (data) { }; // Do nothing
    var encode_message = function (data) { }; // Do nothing
    var OnSocketClose = function () { }; // Do nothing
    var OnSocketError = function (e) { }; // Do nothing
    var OnSocketOpen = function () { }; // Do nothing
    var OnSocketMessage = function (e) { }; // Do nothing

    this.__defineGetter__("bytesAvailable", function () {
        return FInputBuffer.bytesAvailable;
    });

    this.close = function () {
        if (FWebSocket) {
            FWebSocket.close();
        }
    };

    this.connect = function (AHost, APort) {
        // These support checks are from websockify's websock.js
        var bt = false;
        var wsbt = false;
        var protocols;

        // Check for full typed array support
        if (('Uint8Array' in window) && ('set' in Uint8Array.prototype)) {
            bt = true;
        }

        // Check for full binary type support in WebSockets
        // TODO: this sucks, the property should exist on the prototype
        // but it does not.
        try {
            if (bt && ('binaryType' in (new WebSocket("ws://localhost:17523")))) {
                wsbt = true;
            }
        } catch (exc) {
            // Just ignore failed test localhost connections
        }

        if (wsbt) {
            protocols = ['binary', 'base64', 'plain'];
        } else {
            protocols = ['base64', 'plain'];
        }

        try {
            FWasConnected = false;
            FWebSocket = new WebSocket("ws://" + AHost + ":" + APort, protocols);
        } catch (ex) {
            try {
                FWebSocket = new MozWebSocket("ws://" + AHost + ":" + APort, protocols);
            } catch (ex2) {
                that.onsecurityerror();
                return;
            }
        }

        if (protocols.indexOf('binary') >= 0) {
            FWebSocket.binaryType = 'arraybuffer';
        }

        // Set event handlers
        FWebSocket.onclose = OnSocketClose;
        FWebSocket.onerror = OnSocketError;
        FWebSocket.onmessage = OnSocketMessage;
        FWebSocket.onopen = OnSocketOpen;
    };

    this.__defineGetter__("connected", function () {
        if (FWebSocket) {
            return (FWebSocket.readyState === FWebSocket.OPEN);
        }

        return false;
    });

    decode_message = function (data) {
        var i;
        var Result = "";

        if (FMode === 'binary') {
            var u8 = new Uint8Array(data);
            for (i = 0; i < u8.length; i++) {
                Result += String.fromCharCode(u8[i]);
            }
        } else if (FMode === 'base64') {
            var decoded = Base64.decode(data, 0);
            for (i = 0; i < decoded.length; i++) {
                Result += String.fromCharCode(decoded[i]);
            }
        } else {
            Result = data;
        }

        return Result;
    };

    encode_message = function (data) {
        var i;
        var Result = [];

        if (FMode === 'binary') {
            for (i = 0; i < data.length; i++) {
                Result.push(data.charCodeAt(i));
            }
            return new Uint8Array(Result);
        } else if (FMode === 'base64') {
            for (i = 0; i < data.length; i++) {
                Result.push(data.charCodeAt(i));
            }
            return Base64.encode(Result);
        } else {
            return data;
        }
    };

    this.flush = function () {
        // if (DEBUG) trace("flush(): " + FOutputBuffer.toString());

        FWebSocket.send(encode_message(FOutputBuffer.toString()));
        FOutputBuffer.clear();
    };

    OnSocketClose = function () {
        if (FWasConnected) {
            that.onclose();
        } else {
            that.onsecurityerror();
        }
        FWasConnected = false;
    };

    OnSocketError = function (e) {
        that.onioerror(e);
    };

    OnSocketOpen = function () {
        if (FWebSocket.protocol) {
            FMode = FWebSocket.protocol;
        } else {
            FMode = 'plain';
        }

        FWasConnected = true;
        that.onconnect();
    };

    OnSocketMessage = function (e) {
        // Free up some memory if we're at the end of the buffer
        if (FInputBuffer.bytesAvailable === 0) { FInputBuffer.clear(); }

        // Save the old position and set the new position to the end of the buffer
        var OldPosition = FInputBuffer.position;
        FInputBuffer.position = FInputBuffer.length;

        // Write the incoming message to the input buffer
        FInputBuffer.writeString(decode_message(e.data));

        // Restore the old buffer position
        FInputBuffer.position = OldPosition;
    };

    // Remap all the read* functions to operate on our input buffer instead
    this.readBoolean = function () {
        return FInputBuffer.readBoolean();
    };

    this.readByte = function () {
        return FInputBuffer.readByte();
    };

    this.readBytes = function (ABytes, AOffset, ALength) {
        return FInputBuffer.readBytes(ABytes, AOffset, ALength);
    };

    this.readDouble = function () {
        return FInputBuffer.readDouble();
    };

    this.readFloat = function () {
        return FInputBuffer.readFloat();
    };

    this.readInt = function () {
        return FInputBuffer.readInt();
    };

    this.readMultiByte = function (ALength, ACharSet) {
        return FInputBuffer.readMultiByte(ALength, ACharSet);
    };

    this.readObject = function () {
        return FInputBuffer.readObject();
    };

    this.readShort = function () {
        return FInputBuffer.readShort();
    };

    this.readString = function (ALength) {
        return FInputBuffer.readString();
    };

    this.readUnsignedByte = function () {
        return FInputBuffer.readUnsignedByte();
    };

    this.readUnsignedInt = function () {
        return FInputBuffer.readUnsignedInt();
    };

    this.readUnsignedShort = function () {
        return FInputBuffer.readUnsignedShort();
    };

    this.readUTF = function () {
        return FInputBuffer.readUTF();
    };

    this.readUTFBytes = function (ALength) {
        return FInputBuffer.readUTFBytes(ALength);
    };

    // Remap all the write* functions to operate on our output buffer instead
    this.writeBoolean = function (AValue) {
        FOutputBuffer.writeBoolean(AValue);
    };

    this.writeByte = function (AValue) {
        FOutputBuffer.writeByte(AValue);
    };

    this.writeBytes = function (ABytes, AOffset, ALength) {
        FOutputBuffer.writeBytes(ABytes, AOffset, ALength);
    };

    this.writeDouble = function (AValue) {
        FOutputBuffer.writeDouble(AValue);
    };

    this.writeFloat = function (AValue) {
        FOutputBuffer.writeFloat(AValue);
    };

    this.writeInt = function (AValue) {
        FOutputBuffer.writeInt(AValue);
    };

    this.writeMultiByte = function (AValue, ACharSet) {
        FOutputBuffer.writeMultiByte(AValue, ACharSet);
    };

    this.writeObject = function (AObject) {
        FOutputBuffer.writeObject(AObject);
    };

    this.writeShort = function (AValue) {
        FOutputBuffer.writeShort(AValue);
    };

    this.writeString = function (AText) {
        FOutputBuffer.writeString(AText);
        that.flush();
    };

    this.writeUnsignedInt = function (AValue) {
        FOutputBuffer.writeUnsignedInt(AValue);
    };

    this.writeUTF = function (AValue) {
        FOutputBuffer.writeUTF(AValue);
    };

    this.writeUTFBytes = function (AValue) {
        FOutputBuffer.writeUTFBytes(AValue);
    };

    // Constructor
    FInputBuffer = new ByteArray();
    FOutputBuffer = new ByteArray();
};
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
var CRC = function () { }; // Do nothing
var TCRC = function () {
    // Private constants
    var CrcTable = [0x0000,  0x1021,  0x2042,  0x3063,  0x4084,  0x50a5,  0x60c6,  0x70e7,
                    0x8108,  0x9129,  0xa14a,  0xb16b,  0xc18c,  0xd1ad,  0xe1ce,  0xf1ef,
                    0x1231,  0x0210,  0x3273,  0x2252,  0x52b5,  0x4294,  0x72f7,  0x62d6,
                    0x9339,  0x8318,  0xb37b,  0xa35a,  0xd3bd,  0xc39c,  0xf3ff,  0xe3de,
                    0x2462,  0x3443,  0x0420,  0x1401,  0x64e6,  0x74c7,  0x44a4,  0x5485,
                    0xa56a,  0xb54b,  0x8528,  0x9509,  0xe5ee,  0xf5cf,  0xc5ac,  0xd58d,
                    0x3653,  0x2672,  0x1611,  0x0630,  0x76d7,  0x66f6,  0x5695,  0x46b4,
                    0xb75b,  0xa77a,  0x9719,  0x8738,  0xf7df,  0xe7fe,  0xd79d,  0xc7bc,
                    0x48c4,  0x58e5,  0x6886,  0x78a7,  0x0840,  0x1861,  0x2802,  0x3823,
                    0xc9cc,  0xd9ed,  0xe98e,  0xf9af,  0x8948,  0x9969,  0xa90a,  0xb92b,
                    0x5af5,  0x4ad4,  0x7ab7,  0x6a96,  0x1a71,  0x0a50,  0x3a33,  0x2a12,
                    0xdbfd,  0xcbdc,  0xfbbf,  0xeb9e,  0x9b79,  0x8b58,  0xbb3b,  0xab1a,
                    0x6ca6,  0x7c87,  0x4ce4,  0x5cc5,  0x2c22,  0x3c03,  0x0c60,  0x1c41,
                    0xedae,  0xfd8f,  0xcdec,  0xddcd,  0xad2a,  0xbd0b,  0x8d68,  0x9d49,
                    0x7e97,  0x6eb6,  0x5ed5,  0x4ef4,  0x3e13,  0x2e32,  0x1e51,  0x0e70,
                    0xff9f,  0xefbe,  0xdfdd,  0xcffc,  0xbf1b,  0xaf3a,  0x9f59,  0x8f78,
                    0x9188,  0x81a9,  0xb1ca,  0xa1eb,  0xd10c,  0xc12d,  0xf14e,  0xe16f,
                    0x1080,  0x00a1,  0x30c2,  0x20e3,  0x5004,  0x4025,  0x7046,  0x6067,
                    0x83b9,  0x9398,  0xa3fb,  0xb3da,  0xc33d,  0xd31c,  0xe37f,  0xf35e,
                    0x02b1,  0x1290,  0x22f3,  0x32d2,  0x4235,  0x5214,  0x6277,  0x7256,
                    0xb5ea,  0xa5cb,  0x95a8,  0x8589,  0xf56e,  0xe54f,  0xd52c,  0xc50d,
                    0x34e2,  0x24c3,  0x14a0,  0x0481,  0x7466,  0x6447,  0x5424,  0x4405,
                    0xa7db,  0xb7fa,  0x8799,  0x97b8,  0xe75f,  0xf77e,  0xc71d,  0xd73c,
                    0x26d3,  0x36f2,  0x0691,  0x16b0,  0x6657,  0x7676,  0x4615,  0x5634,
                    0xd94c,  0xc96d,  0xf90e,  0xe92f,  0x99c8,  0x89e9,  0xb98a,  0xa9ab,
                    0x5844,  0x4865,  0x7806,  0x6827,  0x18c0,  0x08e1,  0x3882,  0x28a3,
                    0xcb7d,  0xdb5c,  0xeb3f,  0xfb1e,  0x8bf9,  0x9bd8,  0xabbb,  0xbb9a,
                    0x4a75,  0x5a54,  0x6a37,  0x7a16,  0x0af1,  0x1ad0,  0x2ab3,  0x3a92,
                    0xfd2e,  0xed0f,  0xdd6c,  0xcd4d,  0xbdaa,  0xad8b,  0x9de8,  0x8dc9,
                    0x7c26,  0x6c07,  0x5c64,  0x4c45,  0x3ca2,  0x2c83,  0x1ce0,  0x0cc1,
                    0xef1f,  0xff3e,  0xcf5d,  0xdf7c,  0xaf9b,  0xbfba,  0x8fd9,  0x9ff8,
                    0x6e17,  0x7e36,  0x4e55,  0x5e74,  0x2e93,  0x3eb2,  0x0ed1,  0x1ef0];

    // Private methods
    var OldUpdateCrc = function(CurByte, CurCrc) { }; // Do nothing
    var UpdateCrc = function(CurByte, CurCrc) { }; // Do nothing
		
    this.Calculate16 = function(ABytes) {
        var CRC = 0;
			
        // Save the old byte position
        var OldPosition = ABytes.position;
        ABytes.position = 0;
			
        // Calculate the CRC
        while (ABytes.bytesAvailable > 0) {
            CRC = UpdateCrc(ABytes.readUnsignedByte(), CRC);
        }
        CRC = UpdateCrc(0, CRC);
        CRC = UpdateCrc(0, CRC);
	
        // Restore the old byte position
        ABytes.position = OldPosition;
			
        return CRC;
    };
		
    OldUpdateCrc = function(CurByte, CurCrc) {
        // Pascal code: UpdateCrc := CrcTable[((CurCrc shr 8) and 255)] xor (CurCrc shl 8) xor CurByte;
			
        // Probably overkill, but without a byte type this is the safe alternative
        var A = (CurCrc >> 8) & 0x00FF;
        var B = (CurCrc << 8) & 0xFF00;
        var C = CurByte & 0x00FF;
        var D = (CrcTable[A] ^ B) & 0xFFFF;
        var E = (D ^ C) & 0xFFFF;
        return E;
    };

    UpdateCrc = function(CurByte, CurCrc) {
        // Pascal code: UpdateCrc := CrcTable[((CurCrc shr 8) and 255)] xor (CurCrc shl 8) xor CurByte;
        return (CrcTable[(CurCrc >> 8) & 0x00FF] ^ (CurCrc << 8) ^ CurByte) & 0xFFFF;
    };
};
CRC = new TCRC();/*
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
var TFileRecord = function (AName, ASize) {
    var FData = new ByteArray();
    var FName = "";
    var FSize = 0;

    this.__defineGetter__("data", function () {
        return FData;
    });

    this.__defineGetter__("name", function () {
        return FName;
    });

    this.__defineGetter__("size", function () {
        return FSize;
    });

    // Constructor
    FName = AName;
    FSize = ASize;
};/*
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
var TYModemReceive = function (ATelnet) {
    // Public events
    this.ontransfercomplete = function () { }; // Do nothing

    // Private constants
    var SOH = 0x01;
    var STX = 0x02;
    var EOT = 0x04;
    var ACK = 0x06;
    var NAK = 0x15;
    var CAN = 0x18;
    var SUB = 0x1A;
    var CAPG = "G".charCodeAt(0);

    // Private variables
    var that = this;
    var FBlink = false;
    var FLastGTime = 0;
    var FExpectingHeader = true;
    var FFile;
    var FFiles = [];
    var FNextByte = 0;
    var FShouldSendG = true;
    var FTelnet;
    var FTimer;
    var FTotalBytesReceived = 0;
    var lblFileCount;
    var lblFileName;
    var lblFileSize;
    var lblFileReceived;
    var lblTotalReceived;
    var lblStatus;
    var pbFileReceived;
    var pnlMain;

    // Private methods
    var Cancel = function (AReason) { }; // Do nothing
    var CleanUp = function (AMessage) { }; // Do nothing
    var Dispatch = function () { }; // Do nothing
    var HandleIOError = function (ioe) { }; // Do nothing
    var OnTimer = function (e) { }; // Do nothing

    Cancel = function (AReason) {
        // Send the cancel request
        try {
            FTelnet.writeByte(CAN);
            FTelnet.writeByte(CAN);
            FTelnet.writeByte(CAN);
            FTelnet.writeByte(CAN);
            FTelnet.writeByte(CAN);
            FTelnet.writeString("\b\b\b\b\b     \b\b\b\b\b"); // will auto-flush
        } catch (ioe1) {
            HandleIOError(ioe1);
            return;
        }

        // Drain the input buffer
        try {
            FTelnet.readString();
        } catch (ioe2) {
            HandleIOError(ioe2);
            return;
        }

        CleanUp("Cancelling (" + AReason + ")");
    };

    CleanUp = function (AMessage) {
        // Remove the listeners
        clearInterval(FTimer);

        // Update status label
        lblStatus.Text = "Status: " + AMessage;

        // Dispatch the event after 3 seconds
        setTimeout(Dispatch, 3000);
    };

    Dispatch = function () {
        // Remove the panel
        pnlMain.Hide();
        Crt.Blink = FBlink;
        Crt.ShowCursor();

        that.ontransfercomplete();
    };

    this.Download = function () {
        // Create our main timer
        FTimer = setInterval(OnTimer, 50);

        // Create the transfer dialog
        FBlink = Crt.Blink;
        Crt.Blink = false;
        Crt.HideCursor();
        pnlMain = new TCrtPanel(null, 10, 5, 60, 14, BorderStyle.Single, Crt.WHITE, Crt.BLUE, "YModem-G Receive Status (Hit CTRL+X to abort)", ContentAlignment.TopLeft);
        lblFileCount = new TCrtLabel(pnlMain, 2, 2, 56, "Receiving file 1", ContentAlignment.Left, Crt.YELLOW, Crt.BLUE);
        lblFileName = new TCrtLabel(pnlMain, 2, 4, 56, "File Name: ", ContentAlignment.Left, Crt.YELLOW, Crt.BLUE);
        lblFileSize = new TCrtLabel(pnlMain, 2, 5, 56, "File Size: ", ContentAlignment.Left, Crt.YELLOW, Crt.BLUE);
        lblFileReceived = new TCrtLabel(pnlMain, 2, 6, 56, "File Recv: ", ContentAlignment.Left, Crt.YELLOW, Crt.BLUE);
        pbFileReceived = new TCrtProgressBar(pnlMain, 2, 7, 56, ProgressBarStyle.Continuous);
        lblTotalReceived = new TCrtLabel(pnlMain, 2, 9, 56, "Total Recv: ", ContentAlignment.Left, Crt.YELLOW, Crt.BLUE);
        lblStatus = new TCrtLabel(pnlMain, 2, 11, 56, "Status: Transferring file(s)", ContentAlignment.Left, Crt.WHITE, Crt.BLUE);
    };

    this.FileAt = function (AIndex) {
        return FFiles[AIndex];
    };

    this.__defineGetter__("FileCount", function () {
        return FFiles.length;
    });

    HandleIOError = function (ioe) {
        trace("I/O Error: " + ioe);

        if (FTelnet.connected) {
            CleanUp("Unhandled I/O error");
        } else {
            CleanUp("Connection to server lost");
        }
    };

    OnTimer = function (e) {
        // Check for abort
        while (Crt.KeyPressed()) {
            var KPE = Crt.ReadKey();
            if ((KPE !== null) && (KPE.keyString.length > 0) && (KPE.keyString.charCodeAt(0) === CAN)) {
                Cancel("User requested abort");
            }
        }

        // Keep going until we don't have any more data to read
        while (true) {
            // Check if we've read a byte previously
            if (FNextByte === 0) {
                // Nope, try to read one now
                if (FTelnet.bytesAvailable === 0) {
                    // No data -- check if we should send a G
                    if (FShouldSendG && ((new Date()) - FLastGTime > 3000)) {
                        // Send a G after 3 quiet seconds	
                        try {
                            FTelnet.writeByte(CAPG);
                            FTelnet.flush();
                        } catch (ioe1) {
                            HandleIOError(ioe1);
                            return;
                        }

                        // Reset last G time so we don't spam G's
                        FLastGTime = new Date();
                    }

                    return;
                } else {
                    // Data available, so read the next byte
                    try {
                        FNextByte = FTelnet.readUnsignedByte();
                    } catch (ioe2) {
                        HandleIOError(ioe2);
                        return;
                    }
                }
            }

            // See what to do
            switch (FNextByte) {
                case CAN:
                    // Sender requested cancellation
                    CleanUp("Sender requested abort");

                    break;
                case SOH:
                case STX:
                    // File transfer is happening, don't send a G on timeout
                    FShouldSendG = false;

                    var BlockSize = (FNextByte === STX) ? 1024 : 128;

                    // Make sure we have enough data to read a full block
                    if (FTelnet.bytesAvailable < (1 + 1 + BlockSize + 1 + 1)) {
                        return;
                    }

                    // Reset NextByte variable so we read in a new byte next loop
                    FNextByte = 0;

                    // Get block numbers
                    var InBlock = FTelnet.readUnsignedByte();
                    var InBlockInverse = FTelnet.readUnsignedByte();

                    // Validate block numbers
                    if (InBlockInverse !== (255 - InBlock)) {
                        Cancel("Bad block #: " + InBlockInverse.toString() + " !== 255-" + InBlock.toString());
                        return;
                    }

                    // Read data block
                    var Packet = new ByteArray();
                    FTelnet.readBytes(Packet, 0, BlockSize);

                    // Validate CRC
                    var InCRC = FTelnet.readUnsignedShort();
                    var OurCRC = CRC.Calculate16(Packet);
                    if (InCRC !== OurCRC) {
                        Cancel("Bad CRC: " + InCRC.toString() + " !== " + OurCRC.toString());
                        return;
                    }

                    // Reading the header?
                    if (FExpectingHeader) {
                        // Make sure it's block 0
                        if (InBlock !== 0) {
                            Cancel("Expecting header got block " + InBlock.toString());
                            return;
                        }

                        // It is, so mark that we don't want it next packet 0
                        FExpectingHeader = false;

                        // Get the filename
                        var FileName = "";
                        var B = Packet.readUnsignedByte();
                        while ((B !== 0) && (Packet.bytesAvailable > 0)) {
                            FileName += String.fromCharCode(B);
                            B = Packet.readUnsignedByte();
                        }

                        // Get the file size
                        var Temp = "";
                        var FileSize = 0;
                        B = Packet.readUnsignedByte();
                        while ((B >= 48) && (B <= 57) && (Packet.bytesAvailable > 0)) {
                            Temp += String.fromCharCode(B);
                            B = Packet.readUnsignedByte();
                        }
                        FileSize = parseInt(Temp, 10);

                        // Check for blank filename (means batch is complete)
                        if (FileName.length === 0) {
                            CleanUp("File(s) successfully received!");
                            return;
                        }

                        // Check for blank file size (we don't like this case!)
                        if (isNaN(FileSize) || (FileSize === 0)) {
                            Cancel("File Size missing from header block");
                            return;
                        }

                        // Header is good, setup a new file record
                        FFile = new TFileRecord(FileName, FileSize);
                        lblFileCount.Text = "Receiving file " + (FFiles.length + 1).toString();
                        lblFileName.Text = "File Name: " + FileName;
                        lblFileSize.Text = "File Size: " + StringUtils.AddCommas(FileSize) + " bytes";
                        lblFileReceived.Text = "File Recv: 0 bytes";
                        pbFileReceived.Value = 0;
                        pbFileReceived.Maximum = FileSize;

                        // Send a G to request file start
                        try {
                            FTelnet.writeByte(CAPG);
                            FTelnet.flush();
                        } catch (ioe3) {
                            HandleIOError(ioe3);
                            return;
                        }
                    } else {
                        // Add bytes to byte array (don't exceed desired file size though)
                        var BytesToWrite = Math.min(BlockSize, FFile.size - FFile.data.length);
                        FFile.data.writeBytes(Packet, 0, BytesToWrite);
                        FTotalBytesReceived += BytesToWrite;

                        lblFileReceived.Text = "File Recv: " + StringUtils.AddCommas(FFile.data.length) + " bytes";
                        pbFileReceived.Value = FFile.data.length;
                        lblTotalReceived.Text = "Total Recv: " + StringUtils.AddCommas(FTotalBytesReceived) + " bytes";
                    }

                    break;
                case EOT:
                    // File transfer is over, send a G on timeout
                    FShouldSendG = true;

                    // Acknowledge EOT and ask for next file
                    try {
                        FTelnet.writeByte(ACK);
                        FTelnet.writeByte(CAPG);
                        FTelnet.flush();
                    } catch (ioe4) {
                        HandleIOError(ioe4);
                        return;
                    }

                    // Reset NextByte variable so we read in a new byte next loop
                    FNextByte = 0;

                    // Reset variables for next transfer
                    FExpectingHeader = true;
                    FFiles.push(FFile);

                    break;
                default:
                    // Didn't expect this, so abort
                    Cancel("Unexpected byte: " + FNextByte.toString());
                    return;
            }
        }
    };

    // Constructor
    FTelnet = ATelnet;
};/*
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
var TYModemSend = function (ATelnet) {
    // Public events
    this.ontransfercomplete = function () { }; // Do nothing

    // Private constants
    var SOH = 0x01;
    var STX = 0x02;
    var EOT = 0x04;
    var ACK = 0x06;
    var NAK = 0x15;
    var CAN = 0x18;
    var SUB = 0x1A;
    var CAPG = "G".charCodeAt(0);

    var ssWaitingForHeaderRequest = 0;
    var ssWaitingForHeaderAck = 1;
    var ssWaitingForFileRequest = 2;
    var ssSendingData = 3;
    var ssWaitingForFileAck = 4;

    // Private variables
    var that = this;
    var FBlock = 0;
    var FBlink = false;
    var FEOTCount = 0;
    var FFile;
    var FFileBytesSent = 0;
    var FFileCount = 0;
    var FFiles = [];
    var FState = ssWaitingForHeaderRequest;
    var FTelnet;
    var FTimer;
    var FTotalBytes = 0;
    var FTotalBytesSent = 0;
    var lblFileCount;
    var lblFileName;
    var lblFileSize;
    var lblFileSent;
    var lblTotalSize;
    var lblTotalSent;
    var lblStatus;
    var pbFileSent;
    var pbTotalSent;
    var pnlMain;

    // Private methods
    var Cancel = function (AReason) { }; // Do nothing
    var CleanUp = function (AMessage) { }; // Do nothing
    var Dispatch = function () { }; // Do nothing
    var HandleIOError = function (ioe) { }; // Do nothing
    var OnTimer = function (e) { }; // Do nothing
    var SendDataBlocks = function (ABlocks) { }; // Do nothing
    var SendEmptyHeaderBlock = function () { }; // Do nothing
    var SendEOT = function () { }; // Do nothing
    var SendHeaderBlock = function () { }; // Do nothing

    Cancel = function (AReason) {
        // Send the cancel request
        try {
            FTelnet.writeByte(CAN);
            FTelnet.writeByte(CAN);
            FTelnet.writeByte(CAN);
            FTelnet.writeByte(CAN);
            FTelnet.writeByte(CAN);
            FTelnet.writeString("\b\b\b\b\b     \b\b\b\b\b"); // will auto-flush
        } catch (ioe1) {
            HandleIOError(ioe1);
            return;
        }

        // Drain the input buffer
        try {
            FTelnet.readString();
        } catch (ioe2) {
            HandleIOError(ioe2);
            return;
        }

        CleanUp("Cancelling (" + AReason + ")");
    };

    CleanUp = function (AMessage) {
        // Remove the listeners
        clearInterval(FTimer);

        // Update status label
        lblStatus.Text = "Status: " + AMessage;

        // Dispatch the event after 3 seconds
        setTimeout(Dispatch, 3000);
    };

    Dispatch = function () {
        // Remove the panel
        pnlMain.Hide();
        Crt.Blink = FBlink;
        Crt.ShowCursor();

        that.ontransfercomplete();
    };

    HandleIOError = function (ioe) {
        trace("I/O Error: " + ioe);

        if (FTelnet.connected) {
            CleanUp("Unhandled I/O error");
        } else {
            CleanUp("Connection to server lost");
        }
    };

    OnTimer = function (e) {
        // Check for abort
        while (Crt.KeyPressed()) {
            var KPE = Crt.ReadKey();
            if ((KPE !== null) && (KPE.keyString.length > 0) && (KPE.keyString.charCodeAt(0) === CAN)) {
                Cancel("User requested abort");
            }
        }

        var B = 0;

        // Break if no data is waiting (unless we're in the ssSendingData state)
        if ((FState !== ssSendingData) && (FTelnet.bytesAvailable === 0)) {
            return;
        }

        // Determine what to do
        switch (FState) {
            case ssWaitingForHeaderRequest:
                // Check for G
                try {
                    B = FTelnet.readUnsignedByte();
                } catch (ioe1) {
                    HandleIOError(ioe1);
                    return;
                }

                // Make sure we got the G and not something else
                if (B !== CAPG) {
                    Cancel("Expecting G got " + B.toString() + " (State=" + FState + ")");
                    return;
                }

                // Drain the input buffer so that we're synchronized (Receiver may have sent multiple G's while we were browsing for the file)
                try {
                    FTelnet.readString();
                } catch (ioe2) {
                    HandleIOError(ioe2);
                    return;
                }

                // Do we still have files in the array?
                if (FFiles.length === 0) {
                    // Nope, let the other end know we're done
                    SendEmptyHeaderBlock();
                    CleanUp("File(s) successfully sent!");
                    return;
                }

                // Load the next file
                FFile = FFiles.shift();
                lblFileCount.Text = "Sending file " + (FFileCount - FFiles.length).toString() + " of " + FFileCount.toString();
                lblFileName.Text = "File Name: " + FFile.name;
                lblFileSize.Text = "File Size: " + StringUtils.AddCommas(FFile.size) + " bytes";
                lblFileSent.Text = "File Sent: 0 bytes";
                pbFileSent.Value = 0;
                pbFileSent.Maximum = FFile.size;

                // Send the header block
                SendHeaderBlock();

                // Reset variables for the new file transfer
                FBlock = 1;
                FEOTCount = 0;
                FFileBytesSent = 0;

                // Move to next state
                FState = ssWaitingForHeaderAck;
                return;

            case ssWaitingForHeaderAck:
                // Check for ACK or G
                try {
                    B = FTelnet.readUnsignedByte();
                } catch (ioe3) {
                    HandleIOError(ioe3);
                    return;
                }

                // Make sure we got the ACK or G and not something else
                if ((B !== ACK) && (B !== CAPG)) {
                    Cancel("Expecting ACK/G got " + B.toString() + " (State=" + FState + ")");
                    return;
                }

                if (B === ACK) {
                    // Move to next state
                    FState = ssWaitingForFileRequest;
                } else if (B === CAPG) {
                    // Async PRO doesn't ACK the header packet, so we can only assume this G is a request for the file to start, not for a re-send of the header
                    // Move to next state
                    FState = ssSendingData;
                }
                return;

            case ssWaitingForFileRequest:
                // Check for G
                try {
                    B = FTelnet.readUnsignedByte();
                } catch (ioe4) {
                    HandleIOError(ioe4);
                    return;
                }

                // Make sure we got the G and not something else
                if (B !== CAPG) {
                    Cancel("Expecting G got " + B.toString() + " (State=" + FState + ")");
                    return;
                }

                // Move to next state
                FState = ssSendingData;
                return;

            case ssSendingData:
                if (SendDataBlocks(16)) {
                    // SendDataBlocks returns true when the whole file has been sent
                    FState = ssWaitingForFileAck;
                }
                return;

            case ssWaitingForFileAck:
                // Check for ACK
                try {
                    B = FTelnet.readUnsignedByte();
                } catch (ioe5) {
                    HandleIOError(ioe5);
                    return;
                }

                // Make sure we got the ACK (or NAK) and not something else
                if ((B !== ACK) && (B !== NAK)) {
                    Cancel("Expecting (N)ACK got " + B.toString() + " (State=" + FState + ")");
                    return;
                }

                // Move to next state
                if (B === ACK) {
                    // Waiting for them to request the next header
                    FState = ssWaitingForHeaderRequest;
                }
                else if (B === NAK) {
                    // Re-send the EOT
                    SendEOT();
                }
                return;
        }
    };

    SendDataBlocks = function (ABlocks) {
        // Loop ABlocks times for ABlocks k per timer event
        var loop;
        for (loop = 0; loop < ABlocks; loop++) {
            // Determine how many bytes to read (max 1024 per block)
            var BytesToRead = Math.min(1024, FFile.data.bytesAvailable);

            // Check how many bytes are left
            if (BytesToRead === 0) {
                // No more bytes left, send the EOT
                SendEOT();
                return true;
            }
            else {
                // Read the bytes from the file
                var Packet = new ByteArray();
                FFile.data.readBytes(Packet, 0, BytesToRead);

                // Append SUB bytes to pad to 1024, if necessary
                if (Packet.length < 1024) {
                    Packet.position = Packet.length;
                    while (Packet.length < 1024) {
                        Packet.writeByte(SUB);
                    }
                    Packet.position = 0;
                }

                // Send the block
                try {
                    FTelnet.writeByte(STX);
                    FTelnet.writeByte(FBlock % 256);
                    FTelnet.writeByte(255 - (FBlock % 256));
                    FTelnet.writeBytes(Packet);
                    FTelnet.writeShort(CRC.Calculate16(Packet));
                    FTelnet.flush();
                } catch (ioe) {
                    HandleIOError(ioe);
                    return false;
                }

                // Increment counters
                FBlock++;
                FFileBytesSent += BytesToRead;
                FTotalBytesSent += BytesToRead;

                // Update labels
                lblFileSent.Text = "File Sent: " + StringUtils.AddCommas(FFileBytesSent) + " bytes";
                pbFileSent.StepBy(BytesToRead);
                lblTotalSent.Text = "Total Sent: " + StringUtils.AddCommas(FTotalBytesSent) + " bytes";
                pbTotalSent.StepBy(BytesToRead);
            }
        }

        // Didn't finish the file yet
        return false;
    };

    SendEmptyHeaderBlock = function () {
        var Packet = new ByteArray();

        // Add 128 null bytes
        var i;
        for (i = 0; i < 128; i++) {
            Packet.writeByte(0);
        }

        try {
            FTelnet.writeByte(SOH);
            FTelnet.writeByte(0);
            FTelnet.writeByte(255);
            FTelnet.writeBytes(Packet);
            FTelnet.writeShort(CRC.Calculate16(Packet));
            FTelnet.flush();
        } catch (ioe) {
            HandleIOError(ioe);
            return;
        }
    };

    SendEOT = function () {
        try {
            FTelnet.writeByte(EOT);
            FTelnet.flush();
        } catch (ioe) {
            HandleIOError(ioe);
            return;
        }
        FEOTCount++;
    };

    SendHeaderBlock = function () {
        var i = 0;
        var Packet = new ByteArray();

        // Add filename to packet
        for (i = 0; i < FFile.name.length; i++) {
            Packet.writeByte(FFile.name.charCodeAt(i));
        }

        // Add null separator
        Packet.writeByte(0);

        // Add file size to packet (as string)
        var Size = FFile.size.toString();
        for (i = 0; i < Size.length; i++) {
            Packet.writeByte(Size.charCodeAt(i));
        }

        // Pad out the packet as necessary
        if (Packet.length < 128) {
            // Pad out to 128 bytes
            while (Packet.length < 128) {
                Packet.writeByte(0);
            }
        } else if (Packet.length === 128) {
            // Do nothing, we fit into 128 bytes exactly
            i = 0; // Make JSLint happy
        } else if (Packet.length < 1024) {
            // Pad out to 1024 bytes
            while (Packet.length < 1024) {
                Packet.writeByte(0);
            }
        } else if (Packet.length === 1024) {
            // Do nothing, we fit into 1024 bytes exactly				
            i = 0; // Make JSLint happy
        } else {
            // Shitty, we exceeded 1024 bytes!  What to do now?
            Cancel("Header packet exceeded 1024 bytes!");
            return;
        }

        try {
            FTelnet.writeByte(Packet.length === 128 ? SOH : STX);
            FTelnet.writeByte(0);
            FTelnet.writeByte(255);
            FTelnet.writeBytes(Packet);
            FTelnet.writeShort(CRC.Calculate16(Packet));
            FTelnet.flush();
        } catch (ioe) {
            HandleIOError(ioe);
            return;
        }
    };

    this.Upload = function (AFile, AFileCount) {
        FFileCount = AFileCount;

        // Add the file to the queue
        FFiles.push(AFile);

        // If the queue has just this one item, start the timers and listeners
        if (FFiles.length === AFileCount) {
            // Create our main timer
            FTimer = setInterval(OnTimer, 50);

            // Determine the number of total bytes
            var i;
            for (i = 0; i < FFiles.length; i++) {
                FTotalBytes += FFiles[i].size;
            }

            // Create the transfer dialog
            FBlink = Crt.Blink;
            Crt.Blink = false;
            Crt.HideCursor();
            pnlMain = new TCrtPanel(null, 10, 5, 60, 16, BorderStyle.Single, Crt.WHITE, Crt.BLUE, "YModem-G Send Status (Hit CTRL+X to abort)", ContentAlignment.TopLeft);
            lblFileCount = new TCrtLabel(pnlMain, 2, 2, 56, "Sending file 1 of " + FFileCount.toString(), ContentAlignment.Left, Crt.YELLOW, Crt.BLUE);
            lblFileName = new TCrtLabel(pnlMain, 2, 4, 56, "File Name: " + FFiles[0].name, ContentAlignment.Left, Crt.YELLOW, Crt.BLUE);
            lblFileSize = new TCrtLabel(pnlMain, 2, 5, 56, "File Size: " + StringUtils.AddCommas(FFiles[0].size) + " bytes", ContentAlignment.Left, Crt.YELLOW, Crt.BLUE);
            lblFileSent = new TCrtLabel(pnlMain, 2, 6, 56, "File Sent: 0 bytes", ContentAlignment.Left, Crt.YELLOW, Crt.BLUE);
            pbFileSent = new TCrtProgressBar(pnlMain, 2, 7, 56, ProgressBarStyle.Continuous);
            lblTotalSize = new TCrtLabel(pnlMain, 2, 9, 56, "Total Size: " + StringUtils.AddCommas(FTotalBytes) + " bytes", ContentAlignment.Left, Crt.YELLOW, Crt.BLUE);
            lblTotalSent = new TCrtLabel(pnlMain, 2, 10, 56, "Total Sent: 0 bytes", ContentAlignment.Left, Crt.YELLOW, Crt.BLUE);
            pbTotalSent = new TCrtProgressBar(pnlMain, 2, 11, 56, ProgressBarStyle.Continuous);
            pbTotalSent.Maximum = FTotalBytes;
            lblStatus = new TCrtLabel(pnlMain, 2, 13, 56, "Status: Transferring file(s)", ContentAlignment.Left, Crt.WHITE, Crt.BLUE);
        }
    };

    // Constructor
    FTelnet = ATelnet;
};/*
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
var HtmlTerm = function () { }; // Do nothing
var THtmlTerm = function () {
    // Private variables
    var that = this;
    var FConnectButton = 0;
    var FConnection = 0;
    var FContainer = 0;
    var FLastTimer = 0;
    var FLoaded = false;
    var FSaveFilesButton = 0;
    var FTimer = 0;
    var FUploadList = 0;
    var FYModemReceive = 0;
    var FYModemSend = 0;

    // Settings to be loaded from HTML
    var FAutoConnect = false;
    var FBitsPerSecond = 115200;
    var FBlink = true;
    var FBorderStyle = "Win7";
    var FCodePage = "437";
    var FConnectAnsi = "connect.ans";
    var FEnter = "\r";
    var FFontHeight = 16;
    var FFontWidth = 9;
    var FProxyWebSocketHostName = "";
    var FProxyWebSocketPort = 11235;
    var FScreenColumns = 80;
    var FScreenRows = 25;
    var FSendOnConnect = "";
    var FServerName = "fTelnet and HtmlTerm Support BBS";
    var FWebSocketHostName = "bbs.ftelnet.ca";
    var FWebSocketPort = 1123;

    // Private methods
    var CenterConnectButton = function () { }; // Do nothing
    var CenterSaveFilesButton = function () { }; // Do nothing
    var LoadFile = function (f, len) { }; // Do nothing
    var LoadSettings = function (AClientVars) { }; // Do nothing
    var OnAnsiESC5n = function (AEvent) { }; // Do nothing
    var OnAnsiESC6n = function (AEvent) { }; // Do nothing
    var OnAnsiESC255n = function (AEvent) { }; // Do nothing
    var OnAnsiESCQ = function (AEvent) { }; // Do nothing
    var OnCloseButtonClick = function (me) { }; // Do nothing
    var OnConnectButtonClick = function (me) { }; // Do nothing
    var OnConnectButtonGraphicChanged = function (e) { }; // Do nothing
    var OnConnectionClose = function (e) { }; // Do nothing
    var OnConnectionConnect = function (e) { }; // Do nothing
    var OnConnectionIOError = function (e) { }; // Do nothing
    var OnConnectionSecurityError = function (see) { }; // Do nothing
    var OnCrtFontChanged = function (e) { }; // Do nothing    
    var OnCrtScreenSizeChanged = function (e) { }; // Do nothing
    var OnDonateMenuClick = function (cme) { }; // Do nothing
    var OnDownloadComplete = function () { }; // Do nothing
    var OnHelpMenuClick = function (cme) { }; // Do nothing
    var OnMaximizeButtonClick = function (me) { }; // Do nothing
    var OnMinimizeButtonClick = function (me) { }; // Do nothing
    var OnSaveFilesButtonClick = function (me) { }; // Do nothing
    var OnSaveFilesButtonGraphicChanged = function (e) { }; // Do nothing
    var OnTimer = function (e) { }; // Do nothing
    var OnUploadComplete = function (e) { }; // Do nothing
    var OnUploadListFileLoad = function (e) { }; // Do nothing
    var OnUploadListFileSelect = function (e) { }; // Do nothing
    var OnUploadMenuClick = function (cme) { }; // Do nothing
    var OnWebPageMenuClick = function (cme) { }; // Do nothing
    var SetupContextMenu = function () { }; // Do nothing
    var ShowConnectButton = function () { }; // Do nothing
    var ShowSaveFilesButton = function () { }; // Do nothing

    this.Init = function (AContainerID, AClientVars) {
        // Ensure we have our container
        if (document.getElementById(AContainerID) === null) {
            trace('HtmlTerm Error: Your document is missing the required element with id="' + AContainerID + '"');
            return false;
        }
        FContainer = document.getElementById(AContainerID);

        // IE less than 9.0 will throw script errors and not even load
        if (navigator.appName === 'Microsoft Internet Explorer') {
            var Version = -1;
            var RE = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");
            if (RE.exec(navigator.userAgent) !== null) { Version = parseFloat(RegExp.$1); }
            if (Version < 9.0) {
                trace("HtmlTerm Error: IE less than 9.0 found (and is not supported)");
                return false;
            }
        }

        // Load the settings from the flashvars parameter
        LoadSettings(AClientVars);

        // Add the entries to the right-click context menu
        SetupContextMenu();

        // Seup the crt window
        if (Crt.Init(FContainer)) {
            Crt.Blink = FBlink;
            Crt.SetFont(FCodePage, FFontWidth, FFontHeight);
            Crt.SetScreenSize(FScreenColumns, FScreenRows);
            Crt.Canvas.addEventListener(Crt.FONT_CHANGED, OnCrtFontChanged, false);
            Crt.Canvas.addEventListener(Crt.SCREEN_SIZE_CHANGED, OnCrtScreenSizeChanged, false);

            // Check for websocket support
            if ((typeof (WebSocket) === "undefined") && (typeof (MozWebSocket) === "undefined")) {
                Crt.WriteLn("Sorry, your browser doesn't support the WebSocket API");
                Crt.WriteLn();
                Crt.WriteLn("When this version of HtmlTerm was released, WebSocket was implemented in:");
                Crt.WriteLn("    Chrome 4");
                Crt.WriteLn("    Firefox 4 *");
                Crt.WriteLn("    Internet Explorer 10 Developer Preview");
                Crt.WriteLn("    Opera 10.70 **");
                Crt.WriteLn("    Safari 5");
                Crt.WriteLn();
                Crt.WriteLn("* WebSockets are disabled by default in FireFox 4 and 5.");
                Crt.WriteLn("  Enable them by changing this setting in \"about:config\":");
                Crt.WriteLn("    network.websocket.enabled = true");
                Crt.WriteLn("    network.websocket.override-security-block = true");
                Crt.WriteLn("  As of Firefox 6 this change is no longer required");
                Crt.WriteLn();
                Crt.WriteLn("** WebSockets are disabled by default in Opera.");
                Crt.WriteLn("   Enable them by changing this setting in \"opera:config\":");
                Crt.WriteLn("     User Prefs -> Enable WebSockets = checked");
                trace("HtmlTerm Error: WebSocket not supported");
                return false;
            }

            // Create the telnet object
            FConnection = new TTelnet();
            FConnection.onclose = OnConnectionClose;
            FConnection.onconnect = OnConnectionConnect;
            FConnection.onioerror = OnConnectionIOError;
            FConnection.onsecurityerror = OnConnectionSecurityError;

            // Create the connect button
            FConnectButton = new TConnectButton();
            FContainer.appendChild(FConnectButton.Image);
            FConnectButton.ongraphicchanged = OnConnectButtonGraphicChanged;
            CenterConnectButton();

            // Create the Save Files button
            FSaveFilesButton = new TSaveFilesButton();
            FContainer.appendChild(FSaveFilesButton.Image);
            FSaveFilesButton.ongraphicchanged = OnSaveFilesButtonGraphicChanged;
            CenterSaveFilesButton();

            // Create the ansi cursor position handler
            Ansi.onesc5n = OnAnsiESC5n;
            Ansi.onesc6n = OnAnsiESC6n;
            Ansi.onesc255n = OnAnsiESC255n;
            Ansi.onescQ = OnAnsiESCQ;

            // And either auto-connect, or display the connect button
            if (FAutoConnect) {
                OnConnectButtonClick("AutoConnect");
            } else {
                ShowConnectButton();
                Crt.Canvas.style.opacity = 1;

                // Load the welcome ANSI
                var http = new XMLHttpRequest();
                try {
                    http.onreadystatechange = function () {
                        try {
                            if (this.readyState === 4) {
                                // Check for success
                                if (this.status === 200) {
                                    // Check for content
                                    if (this.responseText === '') {
                                        // No content, use built-in ANSI
                                        Ansi.Write(ConnectAns);
                                    } else {
                                        // Use the ANSI we loaded from the server
                                        Ansi.Write(this.responseText);
                                    }
                                } else {
                                    // No success, use built-in ANSI
                                    Ansi.Write(ConnectAns);
                                }
                            }
                        } catch (ex) {
                            // Unable to load, use built-in ANSI
                            Ansi.Write(ConnectAns);
                        }
                    };
                    if (http.overrideMimeType) { http.overrideMimeType('text/plain; charset=x-user-defined'); }
                    http.open("GET", FConnectAnsi, true);
                    http.send(null);
                } catch (ex) {
                    // Unable to load, use built-in ANSI
                    Ansi.Write(ConnectAns);
                }
            }
        } else {
            trace("HtmlTerm Error: Unable to init Crt");
        }

        // Create our main timer
        FTimer = setInterval(OnTimer, 50);

        FLoaded = true;
        return true;
    };

    CenterConnectButton = function () {
        FConnectButton.Center(Crt.Canvas);
    };

    CenterSaveFilesButton = function () {
        FSaveFilesButton.Center(Crt.Canvas);
    };

    this.Connect = function (AHost, APort) {
        if ((FConnection !== null) && (FConnection.connected)) { return; }

        FWebSocketHostName = AHost;
        FWebSocketPort = APort;
        OnConnectButtonClick("EIConnect");
    };

    this.Connected = function () {
        if (FConnection === null) { return false; }
        return FConnection.connected;
    };

    this.Disconnect = function () {
        if (FConnection === null) { return; }
        if (!FConnection.connected) { return; }

        FConnection.close();
        OnConnectionClose("Disconnect");
    };

    this.Download = function (cme) {
        if (FConnection === null) { return; }
        if (!FConnection.connected) { return; }

        // Transfer the file
        FYModemReceive = new TYModemReceive(FConnection);

        // Setup listeners for during transfer
        clearInterval(FTimer);
        FYModemReceive.ontransfercomplete = OnDownloadComplete;

        // Download the file
        FYModemReceive.Download();
    };

    this.__defineGetter__("Loaded", function () {
        return FLoaded;
    });

    LoadSettings = function (AClientVars) {
        if (AClientVars === undefined) { return; }
        if (AClientVars.AutoConnect !== undefined) { FAutoConnect = AClientVars.AutoConnect; }
        if (AClientVars.BitsPerSecond !== undefined) { FBitsPerSecond = AClientVars.BitsPerSecond; }
        if (AClientVars.Blink !== undefined) { FBlink = AClientVars.Blink; }
        if (AClientVars.BorderStyle !== undefined) { FBorderStyle = AClientVars.BorderStyle; }
        if (AClientVars.CodePage !== undefined) { FCodePage = AClientVars.CodePage; }
        if (AClientVars.ConnectAnsi !== undefined) { FConnectAnsi = AClientVars.ConnectAnsi; }
        if (AClientVars.Enter !== undefined) { FEnter = AClientVars.Enter; }
        if (AClientVars.FontHeight !== undefined) { FFontHeight = AClientVars.FontHeight; }
        if (AClientVars.FontWidth !== undefined) { FFontWidth = AClientVars.FontWidth; }
        if (AClientVars.ProxyWebSocketHostName !== undefined) { FProxyWebSocketHostName = AClientVars.ProxyWebSocketHostName; }
        if (AClientVars.ProxyWebSocketPort !== undefined) { FProxyWebSocketPort = AClientVars.ProxyWebSocketPort; }
        if (AClientVars.ScreenColumns !== undefined) { FScreenColumns = AClientVars.ScreenColumns; }
        if (AClientVars.ScreenRows !== undefined) { FScreenRows = AClientVars.ScreenRows; }
        if (AClientVars.SendOnConnect !== undefined) { FSendOnConnect = AClientVars.SendOnConnect; }
        if (AClientVars.ServerName !== undefined) { FServerName = AClientVars.ServerName; }
        if (AClientVars.WebSocketHostName !== undefined) { FWebSocketHostName = AClientVars.WebSocketHostName; }
        if (AClientVars.WebSocketPort !== undefined) { FWebSocketPort = AClientVars.WebSocketPort; }

        // Font based overrides
        if (FCodePage.indexOf("ATASCII") === 0) {
            // Enable ATASCII settings
            Crt.Atari = true;
            FFontHeight = 16;
            FFontWidth = (FCodePage.indexOf("HalfWidth") === -1) ? 16 : 8;
        } else if (FCodePage.indexOf("BStrict") === 0) {
            // Override font size
            FFontHeight = 8;
            FFontWidth = 8;
        } else if (FCodePage.indexOf("BStruct") === 0) {
            // Override font size
            FFontHeight = 8;
            FFontWidth = 8;
        } else if (FCodePage.indexOf("MicroKnight") === 0) {
            // Override font size
            FFontHeight = 8;
            FFontWidth = 8;
        } else if (FCodePage.indexOf("MoSoul") === 0) {
            // Override font size
            FFontHeight = 8;
            FFontWidth = 8;
        } else if (FCodePage.indexOf("PotNoodle") === 0) {
            // Override font size
            FFontHeight = 8;
            FFontWidth = 11;
        } else if (FCodePage.indexOf("TopazPlus") === 0) {
            // Override font size
            FFontHeight = 8;
            FFontWidth = 11;
        } else if (FCodePage.indexOf("Topaz") === 0) {
            // Override font size
            FFontHeight = 8;
            FFontWidth = 11;
        }
    };

    OnAnsiESC5n = function (AEvent) {
        FConnection.writeString("\x1B[0n");
    };

    OnAnsiESC6n = function (AEvent) {
        FConnection.writeString(Ansi.CursorPosition());
    };

    OnAnsiESC255n = function (AEvent) {
        FConnection.writeString(Ansi.CursorPosition(Crt.ScreenRows, Crt.ScreenCols));
    };

    OnAnsiESCQ = function (AEvent) {
        Crt.SetFont(AEvent.CodePage, AEvent.Width, AEvent.Height);
    };

    OnCloseButtonClick = function (me) {
        if (FConnection === null) { return; }
        if (!FConnection.connected) { return; }

        if (confirm("Are you sure you'd like to disconnect from " + FServerName + "?")) { that.Disconnect(); }
    };

    OnConnectButtonClick = function (me) {
        Crt.Canvas.style.opacity = 1;
        Crt.ShowCursor();

        FConnectButton.Image.removeEventListener("click", OnConnectButtonClick, false);
        FConnectButton.Hide();

        FAutoConnect = false;

        // Reset display
        Crt.NormVideo();
        Crt.ClrScr();

        // Make connection
        if (FProxyWebSocketHostName === "") {
            Crt.WriteLn("Connecting to " + FServerName + " (" + FWebSocketHostName + ":" + FWebSocketPort + ")");
            FConnection.connect(FWebSocketHostName, FWebSocketPort);
        } else {
            Crt.WriteLn("Connecting to " + FServerName + " (" + FWebSocketHostName + ":" + FWebSocketPort + ") via proxy");
            FConnection.connect(FProxyWebSocketHostName, FProxyWebSocketPort);
        }
    };

    OnConnectButtonGraphicChanged = function (e) {
        CenterConnectButton();
    };

    OnConnectionClose = function (e) {
        // Remove save button (if visible)
        FSaveFilesButton.Image.removeEventListener("click", OnSaveFilesButtonClick, false);
        FSaveFilesButton.Hide();

        // Show the connect button
        ShowConnectButton();
    };

    OnConnectionConnect = function (e) {
        Crt.ClrScr();
        if (FProxyWebSocketHostName !== "") { FConnection.writeString(FWebSocketHostName + ":" + FWebSocketPort + "\r\n"); }
        if (FSendOnConnect.length > 0) { FConnection.writeString(FSendOnConnect); }
    };

    OnConnectionIOError = function (e) {
        trace("HtmlTerm.OnConnectionIOError");
    };

    OnConnectionSecurityError = function (see) {
        Crt.WriteLn("Unable to connect...");
        ShowConnectButton();
    };

    OnCrtFontChanged = function (e) {
        // Center the buttons
        CenterConnectButton();
        CenterSaveFilesButton();
    };

    OnCrtScreenSizeChanged = function (e) {
        // Center the buttons
        CenterConnectButton();
        CenterSaveFilesButton();
    };

    OnDonateMenuClick = function (cme) {
        //TODO
    };

    OnDownloadComplete = function () {
        // Restart listeners for keyboard and connection data
        FTimer = setInterval(OnTimer, 50);

        // Display the save button (if files were completed)
        if (FYModemReceive.FileCount > 0) { ShowSaveFilesButton(); }
    };

    OnHelpMenuClick = function (cme) {
        //TODO navigateToURL(new URLRequest("http://www.ftelnet.ca/help.php"));
    };

    OnSaveFilesButtonClick = function (me) {
        if (FYModemReceive === null) { return; }
        if (FYModemReceive.FileCount === 0) { return; }

        var i;
        var j;
        var ByteString;
        var buffer;
        var dataView;
        var myBlob;
        var fileSaver;

        if (FYModemReceive.FileCount === 1) {
            // If we have just one file, save it
            ByteString = FYModemReceive.FileAt(0).data.toString();

            buffer = new ArrayBuffer(ByteString.length);
            dataView = new DataView(buffer);
            for (i = 0; i < ByteString.length; i++) {
                dataView.setUint8(i, ByteString.charCodeAt(i));
            }

            myBlob = new Blob([buffer], { type: 'application/octet-binary' });
            fileSaver = window.saveAs(myBlob, FYModemReceive.FileAt(0).name);
        } else if (FYModemReceive.FileCount > 1) {
            // More than one requires bundling in a TAR archive
            var TAR = new ByteArray();
            for (i = 0; i < FYModemReceive.FileCount; i++) {
                // Create header
                var Header = new ByteArray();
                // File Name 100 bytes
                var FileName = FYModemReceive.FileAt(i).name;
                for (j = 0; j < 100; j++) {
                    if (j < FileName.length) {
                        Header.writeByte(FileName.charCodeAt(j));
                    } else {
                        Header.writeByte(0);
                    }
                }
                // File Mode 8 bytes
                for (j = 0; j < 8; j++) { Header.writeByte(0); }
                // Owner's UserID 8 bytes
                for (j = 0; j < 8; j++) { Header.writeByte(0); }
                // Owner's GroupID 8 bytes
                for (j = 0; j < 8; j++) { Header.writeByte(0); }
                // File size in bytes with leading 0s 11 bytes plus 1 null
                var FileSize = FYModemReceive.FileAt(i).data.length.toString(8);
                for (j = 0; j < 11 - FileSize.length; j++) { Header.writeByte("0".charCodeAt(0)); }
                for (j = 0; j < FileSize.length; j++) { Header.writeByte(FileSize.charCodeAt(j)); }
                Header.writeByte(0);
                // Last modification time in numeric Unix time format 11 bytes plus 1 null (ASCII representation of the octal number of seconds since January 1, 1970, 00:00 UTC)
                for (j = 0; j < 11; j++) { Header.writeByte(0); }
                Header.writeByte(0);
                // Checksum for header block 8 bytes (spaces initially)
                for (j = 0; j < 8; j++) { Header.writeByte(32); }
                // Link indicator 1 byte
                Header.writeByte("0".charCodeAt(0));
                // Name of linked file 100 bytes
                for (j = 0; j < 100; j++) { Header.writeByte(0); }
                // Reset of 512 byte header
                for (j = 0; j < 255; j++) { Header.writeByte(0); }

                // Calculate checksum (sum of unsigned bytes)
                Header.position = 0;
                var CheckSum = 0;
                for (j = 0; j < 512; j++) {
                    CheckSum += Header.readUnsignedByte();
                }

                // Write header up to checksum
                TAR.writeBytes(Header, 0, 148);

                // Write checksum (zero prefixed 6 digit octal number followed by NULL SPACE)
                var CheckSumStr = CheckSum.toString(8);
                for (j = 0; j < 6 - CheckSumStr.length; j++) { TAR.writeByte("0".charCodeAt(0)); }
                for (j = 0; j < CheckSumStr.length; j++) { TAR.writeByte(CheckSumStr.charCodeAt(j)); }
                TAR.writeByte(0);
                TAR.writeByte(32);

                // Write header after hash
                TAR.writeBytes(Header, 156, 356);

                // Add file data
                TAR.writeBytes(FYModemReceive.FileAt(i).data);

                // Add the padding if the file isn't a multiple of 512 bytes
                if (FYModemReceive.FileAt(i).data.length % 512 !== 0) {
                    for (j = 0; j < 512 - (FYModemReceive.FileAt(i).data.length % 512); j++) {
                        TAR.writeByte(0);
                    }
                }
            }

            // Add 2 zero filled blocks for end of archive
            for (i = 0; i < 1024; i++) {
                TAR.writeByte(0);
            }

            // Save the tar
            ByteString = TAR.toString();

            buffer = new ArrayBuffer(ByteString.length);
            dataView = new DataView(buffer);
            for (i = 0; i < ByteString.length; i++) {
                dataView.setUint8(i, ByteString.charCodeAt(i));
            }

            myBlob = new Blob([buffer], { type: 'application/octet-binary' });
            fileSaver = window.saveAs(myBlob, "HtmlTerm-BatchDownload.tar");
        }

        // Remove button
        FSaveFilesButton.Image.removeEventListener('click', OnSaveFilesButtonClick, false);
        FSaveFilesButton.Hide();

        // Reset display
        Crt.Canvas.style.opacity = 1;
    };

    OnSaveFilesButtonGraphicChanged = function (e) {
        CenterSaveFilesButton();
    };

    OnTimer = function (e) {
        if (FConnection.connected) {
            // Determine how long it took between frames
            var MSecElapsed = new Date().getTime() - FLastTimer;
            if (MSecElapsed < 1) { MSecElapsed = 1; }

            // Determine how many bytes we need to read to achieve the requested BitsPerSecond rate
            var BytesToRead = Math.floor(FBitsPerSecond / 8 / (1000 / MSecElapsed));
            if (BytesToRead < 1) { BytesToRead = 1; }

            // Read the number of bytes we want
            var Data = FConnection.readString(BytesToRead);
            if (Data.length > 0) {
                // if (DEBUG) trace("HtmlTerm.OnTimer Data = " + Data);
                Ansi.Write(Data);
            }

            while (Crt.KeyPressed()) {
                var KPE = Crt.ReadKey();

                // Check for upload/download
                if (KPE !== null) {
                    if (KPE.keyString.length > 0) {
                        // Handle translating Enter key
                        if (KPE.keyString === "\r\n") {
                            FConnection.writeString(FEnter);
                        } else {
                            FConnection.writeString(KPE.keyString);
                        }
                    }
                }
            }
        }
        FLastTimer = new Date().getTime();
    };

    OnUploadComplete = function (e) {
        // Restart listeners for keyboard and connection data
        FTimer = setInterval(OnTimer, 50);
    };

    LoadFile = function (AFile, AFileCount) {
        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = function (e) {
            var FR = new TFileRecord(AFile.name, AFile.size);
            FR.data.writeString(e.target.result);
            FR.data.position = 0;
            FYModemSend.Upload(FR, AFileCount);
        };

        // Read in the image file as a data URL.
        reader.readAsBinaryString(AFile);
    };

    this.Upload = function (AFiles) {
        if (FConnection === null) { return; }
        if (!FConnection.connected) { return; }

        // Get the YModemSend class ready to go
        FYModemSend = new TYModemSend(FConnection);

        // Setup the listeners
        clearInterval(FTimer);
        FYModemSend.ontransfercomplete = OnUploadComplete;

        // Loop through the FileList and prep them for upload
        var i;
        for (i = 0; i < AFiles.length; i++) {
            LoadFile(AFiles[i], AFiles.length);
        }
    };

    OnWebPageMenuClick = function (cme) {
        //TODO navigateToURL(new URLRequest("http://www.ftelnet.ca/"));
    };

    SetupContextMenu = function () {
        /* TODO Create a ContextMenu control
        var mnuMain = new ContextMenu();
        mnuMain.hideBuiltInItems();

        // Add info items
        var mnuWebPage = new ContextMenuItem("fTelnet v10.09.05");
        mnuWebPage.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, OnWebPageMenuClick);
        mnuMain.customItems.push(mnuWebPage);
        mnuMain.customItems.push(new ContextMenuItem("© 2010 Rick Parrish, R&&M Software", false, false));
        var mnuDonate = new ContextMenuItem("Donate");
        mnuDonate.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, OnDonateMenuClick);
        mnuMain.customItems.push(mnuDonate);
        var mnuHelp = new ContextMenuItem("Help");
        mnuHelp.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, OnHelpMenuClick);
        mnuMain.customItems.push(mnuHelp);

        // Add download and upload items
        var mnuUpload = new ContextMenuItem("Upload", true);
        mnuUpload.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, OnUploadMenuClick);
        mnuMain.customItems.push(mnuUpload);
        var mnuDownload = new ContextMenuItem("Download");
        mnuDownload.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, OnDownloadMenuClick);
        mnuMain.customItems.push(mnuDownload);

        contextMenu = mnuMain;
        */
    };

    ShowConnectButton = function () {
        Crt.Canvas.style.opacity = 0.4;
        Crt.HideCursor();

        FConnectButton.Image.addEventListener("click", OnConnectButtonClick, false);
        FConnectButton.Show();
    };

    ShowSaveFilesButton = function () {
        Crt.Canvas.style.opacity = 0.4;

        FSaveFilesButton.Image.addEventListener('click', OnSaveFilesButtonClick, false);
        FSaveFilesButton.Show();
    };
};
HtmlTerm = new THtmlTerm();
