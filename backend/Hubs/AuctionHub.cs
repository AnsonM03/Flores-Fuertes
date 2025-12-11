using Microsoft.AspNetCore.SignalR;

namespace FloresFuertes.Hubs
{
    public class AuctionHub : Hub
    {
        // wordt gebruikt om naar alle clients te broadcasten
        public async Task NotifyStart(string veilingId, DateTime startTijd, DateTime eindTijd)
        {
            await Clients.All.SendAsync("VeilingGestart", veilingId, startTijd, eindTijd);
        }

        public async Task NotifyProductKoop(string veilingId, string productId, int nieuweHoeveelheid)
        {
            await Clients.All.SendAsync("ProductGekocht", veilingId, productId, nieuweHoeveelheid);
        }
    }
}