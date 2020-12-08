//const puppeteer = require("puppeteer")
const fs = require("fs-extra");

const { webkit, chromium } = require("playwright");

//const EDGE_PATH = edgePaths.getEdgePath();

// FAILED ON IFRAME CANNOT ACCESS MISSION ABORT

(async function scrape() {
  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext();
  // write CSVab
  const inputFile = "teliaMobileNr.csv";
  const maxLoops = 1400;
  const outFileName = "finals/mobilnr1M2M_1207.csv";
  const orgStartNr = 1; // börjar 12,3 neråt 0716
  // forsatter pa kevlistKLAR
  //borjar 15ner klar
  // 150-100k list start 0527
  //40-100k listan klar0527
  // 20-15900listan KLAR0616
  // 150k-200k lista 0508 ALLABOLAGKLARA0509
  // 20-10k listan 0503
  await fs.writeFile(
    outFileName,
    "Orgnummer; Name; Phone; Form; Bundet; BindningsTid\n",
    "utf8"
  );

  // go to TELIA LOGIN Site
  const page = await context.newPage();
  const url = "https://tholbox.telia.se/foeretag/mobil-telefoni/abonnemang";
  await page.goto(url);
  await page.setDefaultTimeout(10000);

  let loops = 0;
  let NrOfOrg = 0;

  const userName = "#UserName";
  const PW = "#Password";

  await page.waitForSelector(userName);
  await page.type(userName, "P-387675");
  await page.waitForSelector(PW);
  await page.type(PW, "123-Mikoto");

  // LOG IN SUCCESFULL
  //SMS CODE 20sek to input

  const LogButton = "#login";
  await page.waitForSelector(LogButton);
  await page.click(LogButton);
  const smsCode = "#SmsCode";
  await page.waitForSelector(smsCode);
  await page.waitForTimeout(30000);
  const LogButton2 = "#login";
  await page.waitForSelector(LogButton2);
  await page.click(LogButton2);
  await page.waitForSelector(
    "body > div.body.clearfix.container_20 > div.leftCol.grid_4 > ul.leftmenu_bd.attachOrderMenu > li:nth-child(9) > a"
  );
  await page.click(
    "body > div.body.clearfix.container_20 > div.leftCol.grid_4 > ul.leftmenu_bd.attachOrderMenu > li:nth-child(9) > a"
  );
  //SMS Code Succesfull
  fs.readFile(inputFile, "utf8", async (err, data) => {
    var dataArray = data.split(/\r?\n/); //Be careful if you are in a \r\n world...
    // Your array contains ['ID', 'D11', ... ]
    let bolags = dataArray.map((el) => el.replace(/-/g, ""));

    for (let i = orgStartNr; i < bolags.length; i++) {
      const bolag = bolags[i].split(",");
      const b = bolag[0].split(";");
      const [org, tel, abb] = b;

      try {
        await page.waitForTimeout(500);

        // click on byt ab
        await page.waitForSelector(
          "body > div.body.clearfix.container_20 > div.leftCol.grid_4 > ul.leftmenu_bd.attachOrderMenu > li:nth-child(9) > a"
        );
        await page.click(
          "body > div.body.clearfix.container_20 > div.leftCol.grid_4 > ul.leftmenu_bd.attachOrderMenu > li:nth-child(9) > a"
        );
        await page.waitForTimeout(300);

        await page.waitForSelector(
          "body > div.body.clearfix.container_20 > div.main.grid_12 > iframe"
        );

        // need to target IFRAME

        const frameHandle = await page.$(".orderFrame");
        const frame = await frameHandle.contentFrame();

        // paste tel
        const phoneInput1 =
          "#Netui_Form_0 > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > input[type=text]";
        await frame.waitForSelector(phoneInput1);
        await frame.type(phoneInput1, tel, { delay: 100 });

        NrOfOrg++;
        // click Next

        await frame.click(
          "#Netui_Form_0 > table > tbody > tr:nth-child(6) > td > table > tbody > tr > td > button"
        );
        await frame.waitForTimeout(500);
        // paste org
        const orgInput =
          "#Netui_Form_0 > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td > table:nth-child(2) > tbody > tr > td > input[type=text]";
        await frame.waitForSelector(orgInput);
        await frame.type(orgInput, org, { delay: 100 });
        await frame.click(
          "#Netui_Form_0 > table > tbody > tr:nth-child(6) > td > table > tbody > tr > td > button.tsButtonRichPurple24"
        );

        await frame.waitForTimeout(500);

        // TAKE DATA
        const DataTable =
          "#Netui_Form_0 > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td > table > tbody";
        await frame.waitForSelector(DataTable);
        const DataName = await frame.$(
          "#Netui_Form_0 > table > tbody > tr:nth-child(5) > td > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td:nth-child(1) > span"
        );
        const FinalName = await frame.evaluate(
          (DataName) => DataName.innerText,
          DataName
        );

        //const DataOrg = await frame2.$("#Netui_Form_0 > table > tbody > tr:nth-child(5) > td > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td:nth-child(2) > span");
        const FinalOrg = org;

        const DataForm = await frame.$(
          "#Netui_Form_0 > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td:nth-child(2) > span"
        );

        const FinalForm = await frame.evaluate(
          (DataForm) => DataForm.innerText,
          DataForm
        );

        const DataBundet = await frame.$(
          "#Netui_Form_0 > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td:nth-child(3) > span"
        );
        const FinalBundet = await frame.evaluate(
          (DataBundet) => DataBundet.innerText,
          DataBundet
        );

        await frame.waitForTimeout(200);

        if (FinalBundet == "Ja") {
          const bindning = await frame.$(
            "#Netui_Form_0 > table > tbody > tr:nth-child(4) > td > table > tbody > tr > td > table > tbody > tr:nth-child(5) > td.bold > span"
          );
          finalBindning = await frame.evaluate(
            (bindning) => bindning.innerText,
            bindning
          );
        } else {
          finalBindning = " ";
        }

        await fs.appendFile(
          outFileName,
          `"${FinalName}";"${org}";"${tel}";"${FinalForm}";"${FinalBundet}";"${finalBindning}"\n`,
          `utf-8`
        );

        //console.log(loops);
        //console.log(NrOfOrg);

        await page.waitForTimeout(200);
        loops++;
      } catch (err2) {
        console.log(err2);
      }
      if (loops > maxLoops) {
        await browser.close();
        break;
      }
    }
  });
  // end of ORG loop
})();
