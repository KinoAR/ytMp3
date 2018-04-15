const ffmpeg = require('fluent-ffmpeg');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
module.exports = {
  convertFile(url, format, source, outputName) {
    try {
      if (this.isAudio(format))
        this.convertAudio(url, format, source, outputName);
    } catch(err) {
      console.error(err);
    }
  },
  convertAudio(url, format, source, outputName) {
    const outPath = path.resolve(`${outputName}-out.${"mp4"}`);
    try {
      ffmpeg()
      .input(this.convertUrl(url))
      .videoCodec('copy')
      .input(source)
        .audioCodec("copy")
        .save(outPath)
        .on('error', (err) => { console.error(err); })
        .on('progress', this.handleProgress)
        .on('end', () => { 
          fs.unlink(source, err => {
            if(err)
              console.error(err);
            else
              console.log(chalk.yellow("\nFinished downloading"));
          });
          if(format === 'mp3')
            this.convertToMp3(outPath, outputName);
        });
    } catch (err) {
      console.error(err.message);
    }
  },
  isAudio(format) {
    return ['mp3', 'mp4', 'ogg', 'wav', 'wma', 'webm', 'mpc', 'flac']
      .some((value) => value === format.toLowerCase());
  },
  convertUrl(url) {
    return ytdl(url, {filter: format =>  {
      return format.container === 'mp4';
    }});
  },
  convertToMp3(file, out) {
    ffmpeg(file)
      .audioBitrate(128)
      .audioChannels(2)
      .audioQuality(5)
      .audioCodec("libmp3lame")
      .toFormat("mp3")
      .save(path.resolve(`${out}.mp3`))
      .on('error', (err) => console.error(err))
      .on('end', () => {
        console.log(chalk.yellow("MP3 conversion complete."));
      });
  },
  handleProgress(progress) {
    process.stdout.cursorTo(0);
    process.stdout.clearLine(1);
    process.stdout.write(chalk.yellow(progress.timemark)); 
  }
}