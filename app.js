const express = require("express");
const cookie = require("cookie-parser");
const app = express();
const temp = require("./temp");
const passManager = require("./passwordManager");
const fs = require("fs");
const dataManager = require("./dataManager");
const weatherManager = require("./weatherManager");


const userPasswordKey = "RFNB42UXQF46hy1mtExHQMChLuaON1ucLDXjg2gnsMxA8PXQL6ehmpsy5OIdVDOsk4WVCVIJIJv0BEmbnGQfEhTkXn1HIFeITLbWSvowURr6WXFBBQMd63whwjcnHwt08fFmJxcsyvQeTKDPvum6nVBKoU3g1Fk6dhPlKAtw2UaQuTPnX4yKpkmPGflfunDOP8okbkcEVgaMQybMldH6FARxQE0umWfrW6KQw3mAwNUkX3fgxabOoLptkuYUg6a5rlIf4tSCo1mouSuon8xdDfMKrMYIwHbdEynQ80CdrFaHWk2qVkRnS4ftGl7Nacjkm08yT15WmObML2WffVi8G8HHlIUbKCKTkFCgOmjLjgSxLmI2e7ULatspoKxwrvdp64qKV20HoUQVtb1CewlTkUUxhrhTOhm6TNjqvAaDSbl1gLFXyxVLDQhSyjTr5jxuTmWr82rVxc43fFxeqiD1ggVACelMJxgpiXBPdwrsm0yPhaAGbYiBQDEiDmEFHQfk";


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookie());
app.use(require("morgan")("short"));

// const staticServerKey = passManager.generateKey(8);
const staticServerKey = "";
console.log(staticServerKey);
fs.writeFileSync(__dirname+"/staticServerKey.txt", staticServerKey);

function auth(cookies){
    return passManager.auth(cookies, staticServerKey);
}
function check_ym(req){
    const y = Number(req.params.year);
    const m = Number(req.params.month);

    if(y < 2000 || y > 2050 || m < 1 || m > 12 || isNaN(y) || isNaN(m)) return false;
     
    if(dataManager.data.calendar[y+"/"+m] == undefined){
        dataManager.data.calendar[y+"/"+m] = {};
    }
    return true;
}
function passwordToHash(password){
    return passManager.hash(password, 512, userPasswordKey);
}
function registerUser({
    password,
    name
}){

    if(dataManager.data.users[name] != undefined) return false;

    dataManager.data.users[name] = {
        password: passwordToHash(password),
        name: name,
        info: {
            name: name,
            icon: "no_image",
            color: "green"
        }
    };

    dataManager.save();

    return true;
}




app.get("/login", (req, res) => {
    if(auth(req.cookies)) return res.redirect("/");

    res.send(temp("pub/login.html"));
});
app.post("/login", (req, res) => {
    if(req.body.onetime_password != staticServerKey) return res.redirect("/login");
    if(dataManager.data.users[req.body.user_name] == undefined) return res.redirect("/login");
    if(
        passManager.hash(req.body.user_password, 512, userPasswordKey) !=
        dataManager.data.users[req.body.user_name].password
    ) return res.redirect("/login");
    const cookies = passManager.getUserKeys(staticServerKey, req.body.user_name);
    res.cookie("t", cookies.t);
    res.cookie("u", cookies.u);
    res.cookie("s", cookies.s);
    res.cookie("j", cookies.j);

    res.redirect("/");
});

app.get("/register", (req, res) => {
    if(auth(req.cookies)) return res.redirect("/");

    res.send(temp("pub/register.html"));
});
app.post("/register", (req, res) => {
    if(req.body.onetime_password != staticServerKey) return res.redirect("/register");
    if(dataManager.data.users[req.body.user_name] != undefined) return res.redirect("/register");

    registerUser(req.body);

    res.redirect("/login");
});


app.use("/pwa", express.static(__dirname+"/pub/pwa/pub"));


app.use((req, res, next) => {
    if(!auth(req.cookies)) return res.redirect("/login");
    next();
});

app.get("/logout", (req, res) => {
    res.clearCookie("t");
    res.clearCookie("u");
    res.clearCookie("s");
    res.clearCookie("j");
    res.redirect("/");
});



app.get("/", (req, res) => {
    res.send(temp("pub/index.html", [
        ["{{myname}}", req.cookies.j]
    ]));
});
app.get("/profile", (req, res) => {
    let html = "";
    const mycolor = dataManager.data.users[req.cookies.j].info.color

    for(let i = 0; i < dataManager.colors.length; i++){
        const color = dataManager.colors[i];
        html += `<option value="${color}"${mycolor == color ? " selected" : ""}>${dataManager.colorToJa[color]}</option>`;
    }

    res.send(temp("pub/profile.html", [
        ["{{myname}}" , req.cookies.j],
        ["{{color-options}}", html]
    ]));
});
app.post("/profile", (req, res) => {
    dataManager.data.users[req.cookies.j].info.color = req.body.mycolor
    dataManager.save();

    res.redirect("/");
});
app.get("/logo", (req, res) => {
    res.sendFile(__dirname+"/pub/imgs/logo.png");
});
app.get("/add/:year/:month/:day/", (req, res) => {
    if(!check_ym(req)) return res.redirect("/");

    res.send(temp("pub/add.html", [
        ["{{year}}", req.params.year],
        ["{{month}}", req.params.month],
        ["{{day}}", req.params.day]
    ]));
});

app.get("/image/weather/icon/:id", (req,res)=>{
    const id = Number(req.params.id);
    
    if(isNaN(id)) return res.redirect("/");
    if(id < 0 || id > 7) return res.redirect("/");

    res.sendFile(__dirname+"/pub/imgs/weathers/"+id+".png");
});

app.get("/api/v1/calendar/:year/:month/", (req, res) => {
    
    if(!check_ym(req)) return res.json({});

    res.json(dataManager.data.calendar[req.params.year+"/"+req.params.month]);
});
app.get("/api/v1/users/", (req, res) => {
    const r = {};

    const list = Object.keys(dataManager.data.users);
    
    for(let i = 0; i < list.length; i++){
        r[list[i]] = dataManager.data.users[list[i]].info;
    }


    res.json(r);
});
app.post("/api/v1/calendar/:year/:month/", (req, res) =>{
    const body = req.body;
    
    if(!check_ym(req)) return res.send("bad");
    if(body.day > 31 || body.day < 1) return res.send("ng");

    const a = req.params.year+"/"+req.params.month;
    const b = req.body.day;

    if(dataManager.data.calendar[a][b] == undefined) dataManager.data.calendar[a][b] = {i:0};

    const dt = dataManager.data.calendar[a][b];

    if(body.type == "add"){
        if(body.all_day){
            dataManager.data.calendar[a][b][dt.i] = {
                title: body.title,
                user: req.cookies.j
            };
        }else{
            dataManager.data.calendar[a][b][dt.i] = {
                title: body.title,
                from: body.from,
                to: body.to,
                user: req.cookies.j
            };
        }
        dataManager.data.calendar[a][b].i++;
        dataManager.save();
        return res.redirect("/");
    }else if(body.type == "edit"){
        dataManager.data.calendar[a][b][body.id] = {
            title: body.title
        };
        if(!(body.all_day)){
            dataManager.data.calendar[a][b][body.id].from = body.from;
            dataManager.data.calendar[a][b][body.id].to = body.to;
        }
        dataManager.save();
    }else if(body.type == "delete"){
        delete dataManager.data.calendar[a][b][body.id];
        
        dataManager.save();
        return res.send("deleted");
    }else if(body.type == "vote"){
        if(body.vote_type == "start"){
            if(dataManager.data.calendar[a][b][body.id].vote == undefined)
                dataManager.data.calendar[a][b][body.id].vote = {
                    vote: true,
                    yes: [],
                    no: []
                };
            else dataManager.data.calendar[a][b][body.id].vote.vote = true;

            dataManager.save();
        }else if(body.vote_type == "finish"){
            dataManager.data.calendar[a][b][body.id].vote.vote = false;
            dataManager.save();
        }else if(body.vote_type == "vote"){
            if(dataManager.data.calendar[a][b][body.id].vote.vote == true){
                if(body.vote == "yes"){
                    dataManager.data.calendar[a][b][body.id].vote.yes.push(req.cookies.j);
                }else if(body.vote == "no"){
                    dataManager.data.calendar[a][b][body.id].vote.no.push(req.cookies.j);
                }
                dataManager.save();
            }
        }else if(body.vote_type == "unvote"){
            if(dataManager.data.calendar[a][b][body.id].vote.vote == true){
                if(body.unvote == "yes"){
                    if(dataManager.data.calendar[a][b][body.id].vote.yes.indexOf(req.cookies.j) != -1)
                        dataManager.data.calendar[a][b][body.id].vote.yes.splice(
                            dataManager.data.calendar[a][b][body.id].vote.yes.indexOf(req.cookies.j), 1);
                }else if(body.unvote == "no"){
                    if(dataManager.data.calendar[a][b][body.id].vote.no.indexOf(req.cookies.j) != -1)
                        dataManager.data.calendar[a][b][body.id].vote.no.splice(
                            dataManager.data.calendar[a][b][body.id].vote.no.indexOf(req.cookies.j), 1);
                }
                dataManager.save();
            }
        }
    }
    res.send("ok");
});
app.get("/api/v1/weather/", (req, res) => {
    res.json(weatherManager.weatherData());
});
app.get("/api/v1/today/", (req,res)=>{
    res.send(Date.now().toString());
});



app.use((req,res)=>{
    res.redirect("/"); 
});


// var https = require('https');
// var options = {
//   key:  fs.readFileSync('localhttps_key.pem'),
//   cert: fs.readFileSync('localhttps_cert.pem')
// };
// var server = https.createServer(options,app);

app.listen(3000, () => {
    console.log("listening on port 3000");
});
