using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects
{
    public class SignalHub : Hub
    {
        public async Task SendUpdate(string updateType, object data)
        {
            await Clients.All.SendAsync("receiveupdate", updateType, data);
            await Clients.All.SendAsync("updatePayment", updateType, data);
            await Clients.All.SendAsync("updateNotification", updateType, data);
            await Clients.All.SendAsync("updatestatus", updateType);

        }
    }
}
