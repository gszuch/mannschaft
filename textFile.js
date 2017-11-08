const express = require('express');
const app = express();

app.get('/', function(req,res) {
    var file =  'Hello to the World';

    res.setHeader('Content-type', "application/octet-stream");
    res.setHeader('Content-disposition', 'attachment; filename=helloWorld.txt');
    res.send(file);
});

app.listen(3000, function() {
    console.log("App listening on localhost:3000...");
});
