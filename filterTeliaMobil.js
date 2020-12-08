const fs = require("fs-extra");
const { webkit, chromium } = require("playwright");

const inputFile = "outputFile.csv";
const outFile = "teliaMobileNr.csv";

fs.readFile(inputFile, "utf8", async (err, data) => {
  var dataArray = data.split(/\r?\n/); //Be careful if you are in a \r\n world...
  // Your array contains ['ID', 'D11', ... ]
  let bolags = dataArray.map((el) => el.replace(/-/g, ""));

  await fs.writeFile(outFile, "OrgNummer; TelNummer; Operator;\n", "utf8");
  for (let i = 0; i < bolags.length; i++) {
    const bolag = bolags[i].split(",");
    // const b = bolag.split(";");
    const b = bolag[0].split(";");
    const org = b[0].match(/[a-zA-Z0-9]/g).join("");
    const tel = b[1].match(/[a-zA-Z0-9]/g).join("");
    const regex = new RegExp(/\b(\w*telia\w*)\b/gi);
    if (b[2] === null) continue;
    const operator = b[2].match(/[a-zA-Z0-9]/g).join("");
    // console.log(regex.test(b[2]));
    if (tel[1] != 7) continue;

    if (!regex.test(b[2])) continue;
    console.log(org, tel, operator);
    await fs.appendFile(outFile, `${org}; ${tel}; ${operator}\n`);
  }
});
