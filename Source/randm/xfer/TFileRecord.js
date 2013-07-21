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
package randm.xfer
{
	import flash.utils.ByteArray;

	public class TFileRecord
	{
		private var FData: ByteArray = new ByteArray();
		private var FName: String = "";
		private var FSize: uint = 0;
		
		public function TFileRecord(AName: String, ASize: int): void
		{
			FName = AName;
			FSize = ASize;
		}
		
		public function get data(): ByteArray
		{
			return FData;
		}
		
		public function get name(): String
		{
			return FName;
		}
		
		public function get size(): uint
		{
			return FSize;
		}
	}
}
