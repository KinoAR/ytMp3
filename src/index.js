#! /usr/bin/env node
const chalk =  require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const questions = require("./questions");
clear();
console.log(
  chalk.yellow(
    figlet.textSync("ytMp3", {horizontalLayout: 'full'})
  )
);
console.log(
  chalk.yellow(
    figlet.textSync("=====", {horizontalLayout:'full'})
  )
);
questions.searchVideo().then(value => {
  questions.selectVideo(value, questions.outputFormat);
});

