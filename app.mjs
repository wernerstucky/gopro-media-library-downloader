#! /usr/bin/env node

import fs from "fs-extra";

import { promisify } from "node:util";
const pipeline = promisify(stream.pipeline);
import stream from "node:stream";

import nodeurl from "node:url";

import config from "./config.mjs";
import got from "got";

const url_base = "https://api.gopro.com";

import enquirer from "enquirer";
import { error } from "node:console";
const enquire = new enquirer();

const response = await enquire.prompt([
  {
    type: "input",
    name: "token",
    message: "Please provide a recent Bearer token",
    initial: config.token,
  },
  {
    type: "input",
    name: "from_date",
    message: "Date from which to download (YYYY-MM-DD)",
    initial: config.default_from_date,
  },
  ,
  {
    type: "input",
    name: "to_date",
    message: "Date to which to download (YYYY-MM-DD) (optional)",
    initial: "",
  },
  {
    type: "input",
    name: "to_folder",
    message: "Folder to save to (absolute)",
    initial: config.default_to_folder,
  },
]);

console.log(response);

const dirExists = await fs.pathExists(response.to_folder);
if (!dirExists) {
  console.log("directory does not exist, try again");
  process.exit();
}

//get the initial files list
let files_list = await get_file_list(response.from_date, response.to_date);
let not_ready_files = [];
let done_files = [];
let error_files = [];

if (files_list) {
  let current_page = files_list._pages.current_page;
  let total_pages = files_list._pages.total_pages;

  if (current_page != total_pages) {
    console.log("MORE THAN 1 PAGE - might take long");
    //throw(new Error('not implemented'));
  }

  while (current_page <= total_pages) {
    //to support more pages
    if (current_page != 1) {
      files_list = await get_file_list(
        response.from_date,
        response.to_date,
        current_page
      );
    }

    let list = files_list._embedded.media;
    console.log("========================================");
    console.log("===== PAGE ", current_page, "=======");
    //console.log(list);

    for (let file of list) {
      if (file.ready_to_view != "ready") {
        console.log("FILE NOT READY yet file:", file);
        not_ready_files.push(file);
        continue;
      }

      console.log("Starting on the following file:", file);
      let fileSizeHuman = file.file_size / 1024 / 1024;

      //do the download request to get file URLs
      let fetch_opts = {
        headers: {
          Accept: "application/vnd.gopro.jk.media+json; version=2.0.0",
          Authorization: `Bearer ${config.token}`,
        },
        parseJson: (text) => JSON.parse(text),
      };

      let url = `${url_base}/media/${file.id}/download`;
      console.log("URL for file", url);

      try {
        let data = await got(url, fetch_opts).json();
        //console.log(data);

        let dl_url = data._embedded.files[0].url;
        let filename = data.filename;

        //convert .360 to mp4 as the default URL is mp4
        if (filename.match(/\.360$/gi)) {
          filename = filename.replace(/\.360$/gi, ".mp4");
        }

        let dl_url_parsed = nodeurl.parse(dl_url);
        //console.log('parsed URL',dl_url_parsed);

        //add folder
        filename = response.to_folder + "/" + filename;

        if (config.enable_download) {
          console.log("-----------");
          console.log("START ", filename, fileSizeHuman, "MB (raw size)");
          await pipeline(got.stream(dl_url), fs.createWriteStream(filename));
          console.log("DONE ", filename);
        } else {
          console.log("ACTUAL downloading disabled", filename);
        }

        done_files.push(file);
      } catch (e) {
        console.log("ERROR downloading", filename);
        error_files.push(file);
      }
    }

    //after doing the list (page)
    current_page++;
  }

  console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
  console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
  console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
  console.log("DONE!");
  console.log("Total Files Downloaded : ", done_files.length);
  console.log("Total NOT READY Files : ", not_ready_files.length);
  console.log("Total ERROR Files : ", error_files.length);
  if (not_ready_files.length > 0) {
    console.log("---- LISTING NOT READY FILES ----");
    not_ready_files.forEach((f) => {
      console.log(`Filename : ${f.filename} Capured At : ${f.captured_at}`);
    });
  }
  if (error_files.length > 0) {
    console.log("---- LISTING ERROR FILES ----");
    error_files.forEach((f) => {
      console.log(`Filename : ${f.filename} Capured At : ${f.captured_at}`);
    });
  }
} else {
  console.log("ERROR");
}

async function get_file_list(from_date, to_date, req_page = 1) {
  if (to_date == "" || !to_date) {
    to_date = "2050-12-01";
  }
  let captured_range = `${from_date}T00:00:00+02:00,${to_date}T23:59:59+02:00`;

  let fetch_opts = {
    headers: {
      Accept: "application/vnd.gopro.jk.media+json; version=2.0.0",
      Authorization: `Bearer ${response.token}`,
      "Content-Type": "application/json",
    },
    searchParams: {
      fields:
        "camera_model,captured_at,content_title,content_type,created_at,gopro_user_id,gopro_media,filename,file_size,height,fov,id,item_count,moments_count,on_public_profile,orientation,play_as,ready_to_edit,ready_to_view,resolution,source_duration,token,type,width",
      order_by: "captured_at",
      per_page: 100,
      page: req_page,
      captured_range: captured_range,
      processing_states: "pretranscoding,transcoding,failure,ready",
    },
  };

  let url = `${url_base}/media/search`;

  let data = await got(url, fetch_opts).json();

  console.log(data);

  return data;
}
