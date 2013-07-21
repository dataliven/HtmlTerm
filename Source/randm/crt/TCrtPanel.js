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
// TODO This is still ActionScript, not JavaScript
package randm.crt
{
	import randm.StringUtils;
	
	public class TCrtPanel extends TCrtControl 
	{
		public function TCrtPanel(AParent: TCrtControl, ALeft: int, ATop: int, AWidth: int, AHeight: int, ABorder: int, AForeColour: int, ABackColour: int, AText: String, ATextAlign: int): void
		{
			super(AParent, ALeft, ATop, AWidth, AHeight);

			FBorder = ABorder;
			FForeColour = AForeColour;
			FBackColour = ABackColour;
			FText = AText;
			FTextAlign = ATextAlign;
			
			Paint(true);
		}
		
		public function get Border(): int
		{
			return FBorder;
		}
		
		public function set Border(value: int): void
		{
			if (value !== FBorder)
			{
				FBorder = value;
				Paint(true);
			}
		}
		private var FBorder: int;
		
		protected override function Paint(AForce: Boolean): void
		{
			// Characters for the box
			var TopLeft: String;
			var TopRight: String;
			var BottomLeft: String;
			var BottomRight: String;
			var TopBottom: String;
			var LeftRight: String;
			
			// Determine which character set to use
			switch (FBorder)
			{
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
			Crt.FastWrite(TopLeft + StringUtils.NewString(TopBottom, FWidth - 2) + TopRight, ScreenLeft, ScreenTop, FForeColour + (FBackColour << 4));
			
			// Draw middle rows
			for (var Line: int = ScreenTop + 1; Line < ScreenTop + FHeight - 1; Line++)
			{
				Crt.FastWrite(LeftRight + StringUtils.NewString(' ', FWidth - 2) + LeftRight, ScreenLeft, Line, FForeColour + (FBackColour << 4));
			}
			
			// Draw bottom row
			Crt.FastWrite(BottomLeft + StringUtils.NewString(TopBottom, FWidth - 2) + BottomRight, ScreenLeft, ScreenTop + FHeight - 1, FForeColour + (FBackColour << 4));
			
			// Draw window title
			if (StringUtils.Trim(FText).length > 0)
			{
				var TitleX: int = 0;
				var TitleY: int = 0;
				var WindowTitle: String = " " + StringUtils.Trim(FText) + " ";
				
				// Get X component
				switch (FTextAlign)
				{
					case ContentAlignment.BottomLeft:
					case ContentAlignment.MiddleLeft:
					case ContentAlignment.TopLeft:
						TitleX = ScreenLeft + 2;
						break;
					case ContentAlignment.BottomCenter:
					case ContentAlignment.MiddleCenter:
					case ContentAlignment.TopCenter:
						TitleX = ScreenLeft + ((FWidth - WindowTitle.length) / 2);
						break;
					case ContentAlignment.BottomRight:
					case ContentAlignment.MiddleRight:
					case ContentAlignment.TopRight:
						TitleX = ScreenLeft + Width - WindowTitle.length - 2;
						break;
				}
				
				// Get the Y component
				switch (FTextAlign)
				{
					case ContentAlignment.BottomCenter:
					case ContentAlignment.BottomLeft:
					case ContentAlignment.BottomRight:
						TitleY = ScreenTop + FHeight - 1;
						break;
					case ContentAlignment.MiddleCenter:
					case ContentAlignment.MiddleLeft:
					case ContentAlignment.MiddleRight:
					case ContentAlignment.TopCenter:
					case ContentAlignment.TopLeft:
					case ContentAlignment.TopRight:
						TitleY = ScreenTop;
						break;
				}
				
				// Draw title
				Crt.FastWrite(WindowTitle, TitleX, TitleY, FForeColour + (FBackColour << 4));
			}
		}
		
		public function get Text(): String
		{
			return FText;
		}
		
		public function set Text(value: String): void
		{
			FText = value;
			Paint(true);
		}
		private var FText: String = "";
		
		public function get TextAlign(): int
		{
			return FTextAlign;
		}
		
		public function set TextAlign(value: int): void
		{
			if (value !== FTextAlign)
			{
				FTextAlign = value;
				Paint(true);
			}
		}
		private var FTextAlign: int;
	}
}
