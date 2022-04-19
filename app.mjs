#! /usr/bin/env node


import {promisify} from 'node:util';
const pipeline = promisify(stream.pipeline);
import stream from 'node:stream';

import nodeurl from 'node:url';

import config from './config.mjs';
import got from 'got';


const url_base = 'https://api.gopro.com';

import enquirer from 'enquirer';
const enquire = new enquirer();

const response = await enquire.prompt([
  {
    type: 'input',
    name: 'token',
    message: 'Please provide a recent Bearer token',
    initial: config.token
  },
  {
    type: 'input',
    name: 'from_date',
    message: 'Date from which to download (YYYY-MM-DD)',
    initial: config.default_from_date
  },
  {
    type: 'input',
    name: 'to_folder',
    message: 'Folder to save to (absolute)',
    initial: config.default_to_folder
  }
]);

console.log(response);

let files_list = await get_file_list(response.from_date);

if(files_list){

  let current_page = files_list._pages.current_page;
  let total_pages = files_list._pages.total_pages;

  if(current_page != total_pages){
    console.log('MORE THAN 1 PAGE NOT IMPLEMENTED');
    throw(new Error('not implemented'));
  }

  let list = files_list._embedded.media;



  console.log('========================================');
  //console.log(list);




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
    filename = response.to_folder + '/' + filename;

    if(config.enable_download){
      console.log('-----------');
      console.log('START ',filename,fileSizeHuman,"MB (raw size)");
      await pipeline(
        got.stream(dl_url),
        fs.createWriteStream(filename)
      );
      console.log('DONE ',filename);
    }
    else{
      console.log('ACTUAL downloading disabled');
    }






  }
}
else{
  console.log('ERROR');
}






async function get_file_list(from_date){


  let captured_range = `${from_date}T00:00:00+02:00,2050-12-01T23:59:59+02:00`;

  let fetch_opts = {
    'headers': {
      'Accept': 'application/vnd.gopro.jk.media+json; version=2.0.0',
      'Authorization': `Bearer ${response.token}`,
      'Content-Type' : 'application/json',
    },
    searchParams : {
      fields : 'camera_model,captured_at,content_title,content_type,created_at,gopro_user_id,gopro_media,filename,file_size,height,fov,id,item_count,moments_count,on_public_profile,orientation,play_as,ready_to_edit,ready_to_view,resolution,source_duration,token,type,width',
      order_by : 'captured_at',
      per_page : 100,
      page : 1,
      captured_range : captured_range,
      processing_states : 'pretranscoding,transcoding,failure,ready'

    }
  };

  let url = `${url_base}/media/search`;




  let data = await got(url, fetch_opts).json();

  console.log(data);

  return data;
}



