var Service = require('node-windows').Service;
     // Create a new service object
     var svc = new Service({
          name:'PBL Server',
          description: 'The backend for PBL application.',
          script: 'C:\\pbl\\backend\\server.js'
     });

     // Listen for the "install" event, which indicates the
     // process is available as a service.

     svc.on('install',function(){
                svc.start();
     });

     svc.install();