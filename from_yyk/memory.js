app.service('memory', ['printer',function (printer) {
    var memory = {
        data: Array(256),
        lastAccess: -1,
        diskdata: Array(4096),
        statusnow: 0,
        myaddress: 0,
        youraddress: 0,
        sectorlength: 16,
        load: function (address) {
            var self = this;

            if (address < 0 || address >= self.data.length) {
                throw "Memory access violation at " + address;
            }

            self.lastAccess = address;

            if (address == 0xFE) {
                return printer.load();
            }
            return self.data[address];
        },
        store: function (address, value) {
            var self = this;
            
            if (address < 0 || address >= self.data.length) {
                throw "Memory access violation at " + address;
            }

            self.lastAccess = address;

            if (address == 0xFE) {
                return printer.store(value);
            }
            if(address == 0xFF)
            {
                //console.log("here");
                if(self.statusnow === 0)
                {
                    console.log("0");
                    self.statusnow = 1;
                    self.myaddress = value;
                }
                else if(self.statusnow === 1)
                {
                    console.log("1");
                    self.statusnow = 2;
                    self.youraddress = value;
                }
                else if(self.statusnow === 2)
                {
                    console.log("2");
                    self.statusnow = 0;
                    if(value === 0x00)
                    {
                        console.log("load");
                        console.log(self.youraddress);
                        console.log(self.myaddress);
                        for(var i = 0;i < self.sectorlength;i++)
                            self.data[self.youraddress+i] = self.diskdata[self.myaddress*self.sectorlength+i];
                    }
                    else if(value === 0x01)
                    {
                        console.log("store");
                        console.log(self.youraddress);
                        console.log(self.myaddress);
                        for(var j = 0;j < self.sectorlength;j++)
                            self.diskdata[self.myaddress*self.sectorlength+j] = self.data[self.youraddress+j];
                    }
                    self.myaddress = 0;
                    self.youraddress = 0;
                }
                else
                {
                    console.log("3");
                }
                console.log("over");
                return;
            }
            self.data[address] = value;
        },
        deal: function(address)
        {
            console.log("there");
            if(statusnow === 0)
            {
                console.log("0");
                statusnow = 1;
                myaddress = address;
            }
            else if(statusnow == 1)
            {
                console.log("1");
                statusnow = 2;
                youraddress = address;
            }
            else if(statusnow == 2)
            {
                console.log("2");
                statusnow = 0;
                if(address === 0x00)
                {
                    for(var i = 0;i < self.sectorlength;i++)
                        self.data[self.youraddress+i] = self.diskdata[self.myaddress*self.sectorlength+i];
                }
                else if(address === 0x01)
                {
                    for(var j = 0;j < self.sectorlength;j++)
                        self.diskdata[self.myaddress*self.sectorlength+j] = self.data[self.youraddress+j];
                }
                myaddress = 0;
                youraddress = 0;
            }
        },
        reset: function () {
            var self = this;

            self.lastAccess = -1;
            self.statusnow = 0;
            self.myaddress = 0;
            self.youraddress = 0;
            for (var i = 0, l = self.data.length; i < l; i++) {
                self.data[i] = 0;
            }
            for(i = 0;i < self.diskdata.length;i++)
            {
                self.diskdata[i] = 0;
            }
        }
    };

    memory.reset();
    return memory;
}]);

/*
 * Local variables:
 * c-basic-offset: 4
 * tab-width: 4
 * indent-tabs-mode: nil
 * End:
 */
