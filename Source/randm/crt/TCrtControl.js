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
	public class TCrtControl
	{
		private var FBackground: * = null;
		protected var FControls: Array = new Array();
		
		public function TCrtControl(AParent: TCrtControl, ALeft: int, ATop: int, AWidth: int, AHeight: int)
		{
			FParent = AParent;
			FLeft = ALeft;
			FTop = ATop;
			FWidth = AWidth;
			FHeight = AHeight;
			
			SaveBackground();
			
			if (FParent !== null) AParent.AddControl(this);
		}
		
		protected function AddControl(AChild: TCrtControl): void
		{
			FControls.push(AChild);
		}
		
		public function get BackColour(): int
		{
			return FBackColour;
		}
		
		public function set BackColour(value: int): void
		{
			if (value !== FBackColour)
			{
				FBackColour = value;
				Paint(true);
			}
		}

		protected var FBackColour: int = Crt.BLACK;
		
		public function get ForeColour(): int
		{
			return FForeColour;
		}
		
		public function set ForeColour(value: int): void
		{
			if (value !== FForeColour)
			{
				FForeColour = value;
				Paint(true);
			}
		}

		protected var FForeColour: int = Crt.LIGHTGRAY;
		
		public function get Height(): int
		{
			return FHeight;
		}
		
		public function set Height(value: int): void
		{
			if (value !== FHeight)
			{
				RestoreBackground();
				FHeight = value;
				SaveBackground();
				Paint(true);
			}
		}

		protected var FHeight: int;

		public function Hide(): void
		{
			RestoreBackground();			
		}
		
		public function get Left(): int
		{
			return FLeft;
		}
		
		public function set Left(value: int): void
		{
            var i;

			if (value !== FLeft)
			{
				RestoreBackground();
				FLeft = value;
				SaveBackground();
				Paint(true);
				
				for (i: int = 0; i < FControls.length; i++) FControls[i].Paint(true);
			}
		}

		protected var FLeft: int;
		
		protected function Paint(AForce: Boolean): void
		{
			// Override in extended class
		}
		
		protected function get Parent(): TCrtControl
		{
			return FParent;
		}
		
		protected function set Parent(value: TCrtControl): void
		{
			RestoreBackground();
			FParent = value;
			SaveBackground();
			Paint(true);
		}

		protected var FParent: TCrtControl = null;
		
		private function RestoreBackground(): void
		{
			Crt.RestoreScreen(FBackground, FLeft, FTop, FLeft + FWidth - 1, FTop + FHeight - 1);
		}
		
		private function SaveBackground(): void
		{
			FBackground = Crt.SaveScreen(FLeft, FTop, FLeft + FWidth - 1, FTop + FHeight - 1);
		}
		
		protected function get ScreenLeft(): int
		{
			return FLeft + ((FParent === null) ? 0 : FParent.Left);
		}
		
		protected function get ScreenTop(): int
		{
			return FTop + ((FParent === null) ? 0 : FParent.Top);
		}
		
		public function Show(): void
		{
			Paint(true);			
			for (var i: int = 0; i < FControls.length; i++) FControls[i].Paint(true);
		}
		
		public function get Top(): int
		{
			return FTop;
		}
		
		public function set Top(value: int): void
		{
			if (value !== FTop)
			{
				RestoreBackground();
				FTop = value;
				SaveBackground();
				Paint(true);
				
				for (var i: int = 0; i < FControls.length; i++) FControls[i].Paint(true);
			}
		}

		protected var FTop: int;
		
		public function get Width(): int
		{
			return FWidth;
		}
		
		public function set Width(value: int): void
		{
			if (value !== FWidth)
			{
				RestoreBackground();
				FWidth = value;
				SaveBackground();
				Paint(true);
			}
		}

		protected var FWidth: int;
	}
}
