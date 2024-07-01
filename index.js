const { error } = require('console')
const http = require('http')
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(' Hello World\n modification \n another one \n sample tester')
})
server.listen(8000, (error)=>{
    if(error){
        console.log("unable to connect")
    }
    console.log("server is listening on port 8000");
})