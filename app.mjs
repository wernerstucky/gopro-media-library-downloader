//import list from './media_list.json';

import fs from 'fs';
let list = JSON.parse(fs.readFileSync('./media_list.json', 'utf-8'))
import {promisify} from 'node:util';
const pipeline = promisify(stream.pipeline);
import stream from 'node:stream';

import nodeurl from 'node:url';

import config from './config.mjs';
import got from 'got';

console.log('========================================');
//console.log(list);


const url_base = 'https://api.gopro.com';


for(let file of list) {
  console.log(file);
  let fileSizeHuman = file.file_size / 1024 / 1024;

  //do the download request to get file URLs
  let fetch_opts = {
    'headers': {
      'Accept': 'application/vnd.gopro.jk.media+json; version=2.0.0',
      'Authorization': `Bearer ${config.token}`
    },
    parseJson: text => JSON.parse(text)
  }

  let url = `${url_base}/media/${file.id}/download`;




  let data = await got(url, fetch_opts).json();
  //console.log(data);

  let dl_url = data._embedded.files[0].url;
  let filename = data.filename;

  //convert .360 to mp4 as the default URL is mp4
  if(filename.match(/\.360$/gi)){
    filename = filename.replace(/\.360$/gi,'.mp4');
  }

  let dl_url_parsed = nodeurl.parse(dl_url);
  //console.log(dl_url_parsed);

  //add folder
  filename = 'downloads/' + filename;

  if(config.enable_download){
    console.log('-----------');
    console.log('START ',filename,fileSizeHuman,"MB (raw size)");
    await pipeline(
      got.stream(dl_url),
      fs.createWriteStream(filename)
    );
    console.log('DONE ',filename);
  }






}




