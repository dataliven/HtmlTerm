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
/// <reference path="randm/crt/Crt.js" />

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
                    if ((KPE.ctrlKey) && (KPE.keyCode === Keyboard.PAGE_DOWN)) {
                        that.Download();
                    } else if ((KPE.ctrlKey) && (KPE.keyCode === Keyboard.PAGE_UP)) {
                        OnUploadMenuClick();
                    } else if (KPE.keyString.length > 0) {
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
        FYModemSend.removeEventListener('TRANSFER_COMPLETE', OnUploadComplete, false);
    };

    OnUploadListFileLoad = function (e) {
        // Upload the file
        FYModemSend.Upload(FileReference(e.target), FUploadList.fileList.length);
    };

    OnUploadListFileSelect = function (e) {
        // Get the YModemSend class ready to go
        //TODO FYModemSend = new TYModemSend(FConnection);

        // Setup the listeners
        clearInterval(FTimer);
        FYModemSend.addEventListener('TRANSFER_COMPLETE', OnUploadComplete, false);

        /*TODO
        FUploadList.removeEventListener(Event.SELECT, OnUploadListFileSelect, false);

        var i;
        for (i = 0; i < FUploadList.fileList.length; i++) {
        FileReference(FUploadList.fileList[i]).addEventListener(Event.COMPLETE, OnUploadListFileLoad, false);
        FileReference(FUploadList.fileList[i]).load();
        }
        */
    };

    OnUploadMenuClick = function (cme) {
        if (FConnection === null) { return; }
        if (!FConnection.connected) { return; }

        // Create the upload reference
        /*TODO
        FUploadList = new FileReferenceList();
        FUploadList.addEventListener(Event.SELECT, OnUploadListFileSelect, false);
        FUploadList.browse();
        */
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
