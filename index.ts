import fs from "fs";
import path from "path";

const dirpath = "/Users/dh/Documents/SourceCode/type-challenges-solutions/zh";
const resultFilePath = path.join(__dirname, "index.md");

const f = fs.readdirSync(dirpath);
console.log(f);

f.forEach((filename) => {
  if (filename === ".DS_Store") return;
  const filepath = path.join(dirpath, filename);
  const extname = path.extname(filepath);
  if (extname !== ".md") return;
  const content = fs.readFileSync(filepath, "utf-8");
  fs.writeFileSync(resultFilePath, content, { flag: "a+" });
  fs.writeFileSync(
    resultFilePath,
    '<div STYLE="page-break-after: always;"></div>',
    { flag: "a+" }
  );
});
