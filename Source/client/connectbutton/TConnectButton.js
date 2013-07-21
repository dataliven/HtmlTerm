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
    var FConnectDown = PNGAsset + 'iVBORw0KGgoAAAANSUhEUgAAARMAAABBCAMAAADFRrDCAAAABGdBTUEAALGPC/xhBQAAAwBQTFRFAAAAFxcXGBgYGxsbHBwcHR0dHh4eHx8fICAgISEhIiIiIiMjJCQkJSUlJiYmJycnKCgoKSkpKioqKysrLCwsLS0tLi4uLy8vMDAwMTExMjIyMjMzNDQ0NTU1NjY2Nzc3Nzg4ODg3ODg4ODk5Ojo5Ojo6Ozs7PDw7PDw8PD09Pj4+Pz8/P0BAQEA/QEBAQEFBQkJCQkNDQ0RERERDRERERUVFRUZGRkdHR0hISEhISUlJSkpKS0tLTU1NTk5OT09PUlJSU1NTVFRUVVVVVlZWV1dXWFhYW1tbXFxcXV1dXl5eXl9fYGBgYWFhYmJiZmZmZ2dnaGhoaWlpampqa2trbGxsbW1tbm5ub29vcHBwcnJyc3Nzc3R0dHR0dXV1dnZ2eHh4eXl5enp6e3t7fHx8fX19f39/gICAgYGBgoKChYWFh4eHiIiIiYmJioqKi4uLjIyMjo6Oj4+PkJCQkZGRkpKSlJSUlZWVl5eXmJiYmZmZmpqanZ2dnp6en5+foKCgoqKio6Ojpqamp6enqKioqampq6urra2trq6ur6+vsLCwsbGxs7Oztra2uLi4ubm5u7u7vLy8vb29vr6+wMDAwsLCxMTExcXFx8fHyMjIycnJysrKy8vLzMzMzc3Nzs7Oz8/P0NDQ0dHR0tLS09PT1dXV1tbW19fX2NjY2dnZ3Nzc3d3d3t7e39/f4ODg4uLi4+Pj5OTk5ubm5+fn6Ojo6enp6urq6+vr7OzsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAob01kQAAAQB0Uk5T////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AFP3ByUAAAAJcEhZcwAACxEAAAsRAX9kX5EAAAAHdElNRQfaCBENBQGlDLlSAAAAGXRFWHRTb2Z0d2FyZQBQYWludC5ORVQgdjMuNS41SYr84AAACihJREFUeF7tnPtj09YVx9uNdm2T0ZB3SGR10qzqsclyK9uz09FmjGUwninjMTZooaRlYyUZSwqEDQZbSGgZK20pK4VRoILSLilstP3vtnPuQ76SrhWHH/jBzjW2pXtufHU+/p6je68sHvnfUokTeGQJSYLAEpOkKJaYLMREaeaymtMRdLK6mYEQ3z1Kpcqk6YkggCiTJSSEQFnQCUMyvGV8qhnL5JZhRqDKhFZs+HfQvOXeGxQCzyercMc40bxAiOfveAQDy7EEUBLJtYkdftejj36r0985ca0JgF2hQiHnHXIW3hBz+tqe9m8/0fp0e2dHe/vy1ieWrdjT+FjGiVAIE4InmksuvrisZUV3T18/WAb6+wf6utpblq262OhiKSOJkElEJl+uffzprj5lAIHAM0Ne+rqWP7b2y8amQvJsyOQNwdl3l7d29fcrA8BiIAM0sEDb/pWdra3vNjSUExEmk1VfD3+nvT+jKYqa0VRFVXRopym4mVH6Op462shQokymQle3tfQOgDbwH2BQn1FV2NThCTsZpevJbQ0MZSqik5DJ+tZuEAcQUFQVxIIcvgd4NBWQaFDR0zLSuFDkTF5tXYlIgAX8Ax4aRBDEDlIiyskova37GhaKlMmZll4MGE3LZDTyokKBLY3UASBVU/ta3m5UKDIm9zp6kAUBgSmWwIBHhrxRSybT3XEvCeXc6BAGY2Xrqbmk8erBIRuM/tDEDdE4T0ZGirImrJxhNfNYs4A5YG1jb2IHNyZIv7bY70b5nykK9Clj8osORKJpOngPL/gkIOgu7uB2puuXMbfvbhI7+umnEfM3b4pGffKb0MqdVk7yKimTGuYFmUziKZMXe4b1sUgm7y8foK5nNR0KwjHgqWezuAkWfIcN5buXI14fj6M/JpjPiUeGDfVL3BoyUbi25Ezk5gWYXEWFiGWYfhmLZPKzXu376HkWcBA2BAt9A04UCG71DYtMXkmqcSy0H5ZIdZpZq0w2spoaTKTmdCbnk/2+8ABM/tWWyRqGqWef1VQaNAQDixuIGt14Vs8auqFn2gQmY7IA5WmYOxltw3RcZaIwTDWYSM2pTC7LDmrz4nWyf2VWz+qmaWo7gk+lZaeWNaCNYfQdCKFIe1f0/5IGN+UJTSc5NEyi2IhGTy0mMnMqE1/a8flFx46iGib6bKpkBHdjfPr8gbndwfb5P7x34Y/Ei6lndFCJYRiKFTJZw3tffxvqTvPs8VZUqMT48Yu8LUUq6ESh4VGTicQcMqGAI+V0mFrfE/v1hUa8q2qYS8471zsBiGGalqmQSc1He0/Obrv1UvDSrb2zs3vJpx3NmGYWhGRk22+xj7/Oe2effYdB0dEeGnnS3cxbExmJTGh41GQiMacx4TKhKSQIeL8Xq1DqYnKkDwQADptZ5Qhh8tpfzu64PRT85Pa+s2f3EQZHBoAHlKzZ+2f26ceYl+EYg/Rl/+Yc2rmR58gg4AdLMkqECQmP2kyS5hQmYch+xo6S9rTu1OeLZPJrxTRMwwIulMn1w9N/PzD3q2Dn/PgFFjtHFcvCBqY5wAf46xgTwgDL1/4o6pUUMoyD8kF4KCdZzf4kEwSXwiRhTmEyzXrZHvb7ytaZL6o8cKsunazRLdN2TNu2aexICjJxHdOyTf3nzMyDQTJ6Db7mxrvhZ11lVSSyozrB8EhhkjDLcyzp6SDrBT6xZqmLiWs6tmU7rm2paUws+wfOD12rRDsL3ZL1PceZVI2R9jEm+lwqk7g5hQkfl0WHlg+gkwHTtlzLTdVJxrEdy7Ycx3LqYMJP0+uEo+GY8GTBmWxkeXmznEkN88Ng0mODq0DEcWrrRHUcaGDBi7kIJtUUG0SSAGcy9jYjNSONnRrmh8FEwbix7ZztpjDJuS5IBYq3CCaCTu6KKSZkws+VOk8EkXnxmNz8MJj4oAHyz9HEOZwYhcdUMLuu7eScSh1M6s0nY8F8bKIYYyI1PwwmayFNgAocJ2eM18jWY7qbA7ubyzk8HsT8QP/qd6NX2Z9LzjuXWPshMUHDcI9HDzPHmEjNKediLje+PhAEH2w9958HyLGvWm4+l8vn867Z2/JY6ycxLv988vGneqCJi60863Vm5im+OgRBt4ZnyBEkxyd8FBcZn+AQOBzhEipxJjJzChOelkgvpOyHD/UncYLBS13n4uOWl8PieY6VVbovxJjM9iiq6eXBjNyM08wcGYRhHe8L51tvsa99gXEsMpmLRE+CicScwuQz1i+ZYIiK3LVIJoHu5ekjD0rQ/hFnogEOQIJ2z9P4qPkODx62UhQePLqVmO+E6wqR+Q6ZKkVWFRJMJOa0+Q6fmPIJHldhNZjqG8cGpTyRADrtP58t7ZkVqPxtd8VAE+iIvPHJVRDs4lAmcbQ6w79uOqwOF7XovHg9bxudF9MjF6MnySRpTmMSrijRfvkvbhS6gkFKXbET/B6FgOU5H5KK2ileQ97YraPRgxd8d6tZODy5cH/p+03ScX3rJ5SJGB4SJglzjfUTOnaVrzCK59P6mFyHdPE8gQLF94yXBZ2MGC6p9QmSvHEnCTzChIu2rnU21lhoK2EiRg9dMYl+CXyPMonmH2arirtunQQj4G3R9wvFQjFf8D3/xElejrtewfeLBb/oFzF2dgq4AsmSK1nlI0W2HsuX6atjNtq2Gj0yJnFzKpPgcnxpHBbHI/PU+nQSfARaKBSLhQIIAuCY3W0r8LGira3b8KC6AMCK8Mxb0RN1uKrFvyvxWkdCKXp42o4zqX65UiYxczqT4FZ83d4WtF2/ToI9HvpdKhVKfqFQysOAFR4wV7ZdgsSHgmbvNVEmsP155PqO/WHEfPf1iMjfTF7fCZf/Qn5SJtXoWTh28Agi13eUydgx16mT4P5gsVgC7wEKICiVSuUS7MOjVERDCaKqADuV+7HPh124DohqjVxyC1t9SK8D6kMHI7jiOqmmRjmTMHPWxwSWlCeGyMLe0Gi45BUeU71MgvN54FBA7wmYUqEMOPCdPYBKqZB7P4mkMWrkvys45EFCAYGgLlAf+AJQsBIyL6nK0SX5Riw1fn+y3wONECwgDwwVFjg0oKD6udFGpEF9qsEk+G0O1UFyCUkkZVBI5UfwitulYu5g4yKpyST4K+QUFjcQQgAC4LBSLOSnGxhJjIn4u8dLPy6XKyVAUR5EFi+Ucbc0WC4PFld93MhIglN4kgp/C7pF9PU+JJVypVIeBBaDsIU7lcFK2R+tji0aks1khIkR9fGTXT6OQwAIyAMLZBd/d+RHRo0IhcyfiU7IL6rjw7wv/rQJoFRAIYMViJzipuOx62gNyOQKGXDTe9/I5pWEk1+dOTSyBbLsyMuHznzVgAgSLhFxsHtVDNxe1cx3NBE824k2+D2SZKfJb2q6SVQS3ufFokdZPXmmGe8GBJ/fmdpAiOBNkvxeWhI9S4XcTRveX7x0xzUqgtx1LdyHvqQSesu1yIQnlaZls4r9hwX/BxAivvPHvESpAAAAAElFTkSuQmCC';
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
