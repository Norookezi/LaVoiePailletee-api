import { server } from 'fastifyServer';


await server.ready(()=>{
    const addresses = server.addresses();
    
    console.log(`Server started, listenning on ${addresses.map((addr) => `http://${addr.address}:${addr.port}`)}`);
});