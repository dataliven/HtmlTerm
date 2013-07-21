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
	import flash.utils.getTimer;
	
	import randm.StringUtils;

	public class TCrtProgressBar extends TCrtControl
	{
		private var FLastBarWidth: int = 9999;
		private var FLastMarqueeUpdate: int = 0; 
		private var FLastPercentText: String = "";
		
		/// <summary>
		/// Initializes a progress bar with the given name and details, and draws the 0% progress to the screen
		/// </summary>
		/// <param name="AX">The x coordinate of the bar</param>
		/// <param name="AY">The y coordinate of the bar</param>
		/// <param name="AWidth">The width of the bar</param>
		/// <param name="AStyle">The style of the bar</param>
		/// <param name="AFG">The foreground colour of the completed bar</param>
		/// <param name="ABG">The background colour of the bar</param>
		/// <param name="AShaded">The foreground colour of the uncompleted bar</param>
		public function TCrtProgressBar(AParent: TCrtControl, ALeft: int, ATop: int, AWidth: int, AStyle: int)
		{
			super(AParent, ALeft, ATop, AWidth, 1);
			
			FStyle = AStyle;
			
			FBackColour = Crt.BLUE;
			FBarForeColour = Crt.YELLOW;
			FBlankForeColour = Crt.LIGHTGRAY;
			FLastMarqueeUpdate = getTimer();
			FMarqueeAnimationSpeed = 25;
			FMaximum = 100;
			FPercentPrecision = 2;
			FPercentVisible = true;
			FValue = 0;
			
			Paint(true);
		}
		
		public function get BarForeColour(): int
		{
			return FBarForeColour;
		}
		
		public function set BarForeColour(value: int): void
		{
			if (value !== FBarForeColour)
			{
				FBarForeColour = value;
				Paint(true);
			}
		}
		private var FBarForeColour: int;
		
		public function get BlankForeColour(): int
		{
			return FBlankForeColour;
		}
		
		public function set BlankForeColour(value: int): void
		{
			if (value !== FBlankForeColour)
			{
				FBlankForeColour = value;
				Paint(true);
			}
		}

		private var FBlankForeColour: int;
		
		public function get MarqueeAnimationSpeed(): int
		{
			return FMarqueeAnimationSpeed;
		}
		
		public function set MarqueeAnimationSpeed(value: int): void
		{
			FMarqueeAnimationSpeed = value;
		}
		private var FMarqueeAnimationSpeed: int;
		
		public function get Maximum(): Number
		{
			return FMaximum;
		}
		
		public function set Maximum(value: Number): void
		{
			if (value !== FMaximum)
			{
				FMaximum = value;
				if (FValue > FMaximum) FValue = FMaximum;
				Paint(true);
			}
		}
		
		private var FMaximum: Number;
		
		/// <summary>
		/// Re-Draw the bar and percent text.
		/// </summary>
		/// <param name="AForce">When true, the bar and percent will always be Paintn.  When false, the bar and percent will only be Paintn as necessary, which reduces the number of unnecessary Paints (especially when a large maximum is used)</param>
		protected override function Paint(AForce: Boolean): void
		{
			if (Style === ProgressBarStyle.Marquee)
			{
				if (AForce)
				{
					// Erase the old bar
					Crt.FastWrite(StringUtils.NewString(String.fromCharCode(176), FWidth), ScreenLeft, ScreenTop, FBlankForeColour + (FBackColour << 4));
				}
				
				// Draw the new bar
				if (FValue > 0)
				{
					if (FValue > FWidth)
					{
						Crt.FastWrite(String.fromCharCode(176), ScreenLeft + FWidth - (15 - (int)(FValue - FWidth)), ScreenTop, FBlankForeColour + (FBackColour << 4));
					}
					else if (FValue >= 15)
					{
						Crt.FastWrite(StringUtils.NewString(String.fromCharCode(219), Math.min(FValue, 15)), ScreenLeft + FValue - 15, ScreenTop, FBarForeColour + (FBackColour << 4));
						Crt.FastWrite(String.fromCharCode(176), ScreenLeft + FValue - 15, ScreenTop, FBlankForeColour + (FBackColour << 4));
					}
					else
					{
						Crt.FastWrite(StringUtils.NewString(String.fromCharCode(219), Math.min(FValue, 15)), ScreenLeft, ScreenTop, FBarForeColour + (FBackColour << 4));
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
				
				var PaintPercentText: Boolean = false;
				var Percent: Number = Value / Maximum;
				var NewBarWidth: int = int(Percent * FWidth);
				if (NewBarWidth !== FLastBarWidth)
				{
					// Check if the bar shrank (if so, we need to delete the old bar)
					if (NewBarWidth < FLastBarWidth)
					{
						// Erase the old bar
						Crt.FastWrite(StringUtils.NewString(String.fromCharCode(176), FWidth), ScreenLeft, ScreenTop, FBlankForeColour + (FBackColour << 4));
					}
					
					// Draw the new bar
					Crt.FastWrite(StringUtils.NewString(String.fromCharCode(FStyle), NewBarWidth), ScreenLeft, ScreenTop, FBarForeColour + (FBackColour << 4));
					
					FLastBarWidth = NewBarWidth;
					PaintPercentText = true;
				}
				
				// Draw the percentage
				if (FPercentVisible)
				{
					var NewPercentText: String = StringUtils.FormatPercent(Percent, FPercentPrecision);
					if ((NewPercentText !== FLastPercentText) || (PaintPercentText))
					{
						FLastPercentText = NewPercentText;
						
						var ProgressStart: int = (Width - NewPercentText.length) / 2;
						if (ProgressStart >= NewBarWidth)
						{
							// Bar hasn't reached the percent text, so draw in the bar's empty color
							Crt.FastWrite(NewPercentText, ScreenLeft + ProgressStart, ScreenTop, FBlankForeColour + (FBackColour << 4));
						}
						else if (ProgressStart + NewPercentText.length <= NewBarWidth)
						{
							// Bar has passed the percent text, so draw in the bar's foreground colour (or still use background for Blocks)
							Crt.FastWrite(NewPercentText, ScreenLeft + ProgressStart, ScreenTop, FBackColour + (FBarForeColour << 4));
							
						}
						else
						{
							// Bar is in the middle of the percent text, so draw the colour as necessary for each letter in the text
							for (var i: int = 0; i < NewPercentText.length; i++)
							{
								var LetterPosition: int = ProgressStart + i;
								var FG: int = (LetterPosition >= NewBarWidth) ? FBlankForeColour : FBackColour;
								var BG: int = (LetterPosition >= NewBarWidth) ? FBackColour : FBarForeColour;
								Crt.FastWrite(NewPercentText.charAt(i), ScreenLeft + LetterPosition, ScreenTop, FG + (BG << 4));
							}
						}
					}
				}
			}
		}
		
		public function get PercentPrecision(): int
		{
			return FPercentPrecision;
		}
		
		public function set PercentPrecision(value: int): void
		{
			if (value !== FPercentPrecision)
			{
				FPercentPrecision = value;
				Paint(true);
			}
		}
		private var FPercentPrecision: int;
		
		public function get PercentVisible(): Boolean
		{
			return FPercentVisible;
		}
		
		public function set PercentVisible(value: Boolean): void
		{
			if (value !== FPercentVisible)
			{
				FPercentVisible = value;
				Paint(true);
			}
		}

		private var FPercentVisible: Boolean;
		
		public function Step(): void
		{
			StepBy(1);
		}
		
		public function StepBy(ABy: int): void
		{
			Value += ABy;
		}
		
		public function get Style(): int
		{
			return FStyle;
		}
		
		public function set Style(value: int): void
		{
			if (value !== FStyle)
			{
				FStyle = value;
				Paint(true);
			}
		}

		private var FStyle: int;
		
		public function get Value(): Number
		{
			return FValue;
		}
		
		public function set Value(value: Number): void
		{
			if (value !== FValue)
			{
				if (FStyle === ProgressBarStyle.Marquee)
				{
					if (getTimer() - FLastMarqueeUpdate >= FMarqueeAnimationSpeed)
					{
						// Keep value between 0 and Maximum + 15
						if (value < 0) value = 0;
						if (value >= FWidth + 15) value = 0;
						FValue = value;
						Paint(false);
						FLastMarqueeUpdate = getTimer();
					}
				}
				else
				{
					// Keep value between 0 and Maximum
					FValue = Math.max(0, Math.min(value, Maximum));
					Paint(false);
				}
			}
		}

		private var FValue: Number;
	}
}
