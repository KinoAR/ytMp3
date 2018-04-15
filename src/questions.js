const fs = require("fs");
const inquirer = require('inquirer');
const ytdl = require('ytdl-core');
const ytsearch = require('youtube-search');
const chalk = require('chalk');
const ytapi = require("./key"); //Include your own YT API key obtained from google
const ffmpeg = require('./conversion');
const path = require('path');

module.exports = {
  searchVideo: () => {
    const question = [
      {
        name: "searchVideo",
        type: "input",
        message: "Enter your search string: ",
        validate(value) {
         return value.length > 0 ? true : "Enter your search string: ";
        }
      }
    ];
    return inquirer.prompt(question);
  },
  selectVideo: (value, outputFormat) => {
    const options = { maxResults: 10, key: ytapi.key }
    ytsearch(value.searchVideo, options, (err, results) => {
      if(err) return console.error(err);
      inquirer.prompt([{
        name: "searchList",
        type: "list",
        message: "List of YT Videos",
        choices: results.map(video => video.title),
        validate(value) {
          return value.length > 0 ? true : "Go back to the beginning";
        }
      }]).then (value => {
        const videoTitle = value.searchList;
        const data = results.filter(video => video.title === videoTitle)[0];
        outputFormat().then(value => {
          const outFileName = `${value.fileName}.${value.format}`;
          const outSource = path.resolve(`${value.fileName}.mp4`);
          ffmpeg.convertUrl(data.link, 'encoding')
            .pipe(fs.createWriteStream(outSource))
            .on('finish', () => {
              console.log(chalk.yellow(`${outFileName} processing...`));
              ffmpeg.convertFile(data.link, value.format, outSource, value.fileName);
            });
        });
      })
    });
  },
  outputFormat: () => {
    const questions = [
      {
        name: "fileName",
        type: "input",
        message: "Enter output file name:",
        validate(value) {
          return value.length > 0 ? true : "Enter output file name: ";
        }
      }, 
      {
        name: "format",
        type: "input",
        message: "Enter format (mp3, mp4, flv, etc): ",
        validate(value) {
          return value.length > 0 ? true : "Enter format: ";
        }
      }
    ];
    return inquirer.prompt(questions);
  }
}