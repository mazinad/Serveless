var client;
init();

async function init() {
  console.log("App is initializing");
  client = await app.initialized();
  client.events.on('app.activated', getTicketData);
}

async function getTicketData() {
  var iparams = await client.iparams.get();
  var fdOptions = {
    headers: {
      Authorization: "Basic <%= encode(iparam.apiKey) %>",
      "content-type": "application/json",
    },
    json: true,
  };
  
  var fdUrl = `https://${iparams["domainName"]}/api/v2/tickets`;
  var ticketData = await client.request.get(fdUrl, fdOptions);

  console.log("ticketData: ", ticketData);

}

