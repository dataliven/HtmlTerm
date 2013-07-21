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
package randm.crt
{
	import randm.StringUtils;

	public class TCrtLabel extends TCrtControl
	{
		public function TCrtLabel(AParent: TCrtControl, ALeft: int, ATop: int, AWidth: int, AText: String, ATextAlign: int, AForeColour: int, ABackColour: int)
		{
			super(AParent, ALeft, ATop, AWidth, 1);

			FText = AText;
			FTextAlign = ATextAlign;
			FForeColour = AForeColour;
			FBackColour = ABackColour;
			
			Paint(true);
		}
		
		protected override function Paint(AForce: Boolean): void
		{
			// Draw the message
			switch (FTextAlign)
			{
				case ContentAlignment.Center:
					if (Text.length >= Width)
					{
						// Text is greater than available space so chop it off with PadRight()
						Crt.FastWrite(Text.substring(0, Width), ScreenLeft, ScreenTop, FForeColour + (FBackColour << 4));
					}
					else
					{
						// Text needs to be centered
						var i: int = 0;
						var LeftSpaces: String = "";
						for (i = 0; i < int((Width - Text.length) / 2); i++) LeftSpaces += " ";
						var RightSpaces: String = "";
						for (i = 0; i < Width - Text.length - LeftSpaces.length; i++) RightSpaces += " ";
						Crt.FastWrite(LeftSpaces + Text + RightSpaces, ScreenLeft, ScreenTop, FForeColour + (FBackColour << 4));
					}
					break;
				case ContentAlignment.Left:
					Crt.FastWrite(StringUtils.PadRight(Text, ' ', Width), ScreenLeft, ScreenTop, FForeColour + (FBackColour << 4));
					break;
				case ContentAlignment.Right:
					Crt.FastWrite(StringUtils.PadLeft(Text, ' ', Width), ScreenLeft, ScreenTop, FForeColour + (FBackColour << 4));
					break;
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
