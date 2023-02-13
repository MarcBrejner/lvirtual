const vm = require('vm.js')

http.createServer((req,res) =>{

    res.writeHead(200,{
        'Content-Type' : 'text/plain'
    });

    res.write(JSON.stringify(registers['$x']));

    res.end();
    
}).listen(2000);