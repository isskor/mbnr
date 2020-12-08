const fs = require("fs-extra");
const { webkit, chromium } = require("playwright");

const inputFile = "teliaMobileNr.csv";
const outFile = "teliaMobileNr.csv";

fs.readFile(inputFile, "utf8", async (err, data) => {
  var dataArray = data.split(/\r?\n/); //Be careful if you are in a \r\n world...
  // Your array contains ['ID', 'D11', ... ]
  let bolags = dataArray.map((el) => el.replace(/-/g, ""));

  for (let i = 0; i < 5; i++) {
    const bolag = bolags[i].split(",");
    const b = bolag[0].split(";");
    const [org, tel, abb] = b;
    console.log(org, tel, abb);
  }
});
