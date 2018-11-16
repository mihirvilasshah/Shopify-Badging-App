const express = require('express');
const path = require('path');
const app = express();
const routes = require('./server/routes/routes');




app.use(express.static(path.join(__dirname, 'dist/badger')));
app.use('/routes',routes);
app.get('*', (req, res)=>{

    res.sendFile(path.join(__dirname, 'dist/index.html'))
});

app.listen(4600,(req, res)=>{
    console.log("running");
    })