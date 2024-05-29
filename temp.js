const fs = require("fs");

const templete = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>;title;</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=M+PLUS+1+Code&family=M+PLUS+1p&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: "M PLUS 1p", sans-serif !important;
            font-weight: 400 !important;
            font-style: normal !important;
            padding: 10px !important;
            text-align: center !important;
        }
    </style>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>

    <link rel="manifest" href="/pwa/manifest.json">
    <script>      
        if (navigator.serviceWorker) {
          navigator.serviceWorker.register ('/pwa/service_worker.js')
        }
    </script>
</head>
<body>
    ;body;
</body>
</html>`;

module.exports = function(path, replaces=[]){
    const _data = fs.readFileSync(path, "utf8")
    let [title, data] = _data.split("///");
    for(let i = 0; i < replaces.length; i++){
        data = data.split(replaces[i][0]).join(replaces[i][1]);
    }

    return templete.replace(";body;", data).replace(";title;", title);
    
}