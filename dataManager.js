const fs = require("fs");

module.exports = {
    data: JSON.parse(fs.readFileSync(__dirname+"/data.json", "utf8")),
    save: ()=>{
        fs.writeFileSync(__dirname+"/data.json", JSON.stringify(module.exports.data));
    },
    colors: [
        "red",
        "green",
        "blue",
        "skyblue",
        "yellow",
        "pink",
        "purple"
    ],
    colorToJa: {
        "red": "赤",
        "green": "緑",
        "blue": "青",
        "skyblue": "水色",
        "yellow": "黄色",
        "pink": "ピンク",
        "purple": "紫",
    }
}