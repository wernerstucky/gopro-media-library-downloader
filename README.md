# GoPro Media Downloader

 *  Downloads GoPro Media files from the API by giving the app a Bearer Token
 *  You need to be relatively skilled to use this node app
 *  Get the bearer token by logging into the web browser version https://plus.gopro.com/media-library/
 *  Use to download GoPro media files faster for achival purposes


### Installation

 1. git clone https://github.com/wernerstucky/gopro-media-library-downloader.git
 2. cd gopro-media-library-downloader
 3. npm install


### Usage
 1. node app.mjs
 2. [follow the prompts]


### Getting a Bearer token

 1. Login to https://plus.gopro.com/media-library/
 2. Open the developer tools and enable network recording
 3. Click the search and search for any period (irrelevant)
 4. In the network recorder click on the request that starts with : search?fields=camera_model
 5. Under the headers section, find Request Headers
 6. Copy the authorization header from after the Bearer word


### Licence

Copyright 2022 Werner Stucky

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
