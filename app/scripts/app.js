var client;
init();
const btoa=require('btoa');
async function init() {
  console.log("App is initializing");
  client = await app.initialized();
  client.events.on('app.activated', getTicketData);
  client.events.on('app.activated', filterTicketData);
  client.events.on('app.activated', createTicket);
  client.events.on('app.activated',filterTickets);
  // client.events.on('app.activated', checkDuplicateTickets);
  // client.events.on('app.activated', addTag);
}

function getTicketData() {
  client.request.get(`https://${data.iparams.domainName}/api/v2/tickets`,{
    headers:{
      'Authorization': 'Basic ' + btoa(`${data.iparams.apiKey}`),
    }
  }).then(
    function(data) {
      let ticketData=JSON.parse(data.response);
      ticketData.forEach((ticket)=>{
        console.log("Ticket Details Id  ",ticket.id);
        // let ticketId=ticket.reply_cc_emails;
        // console.log("Ticket Id",ticketId);
        console.log("Ticket Details Subject",ticket.subject);
        // console.log(typeof ticket.custom_fields.cf_payment_amount);
        // console.log(typeof ticket.custom_fields.cf_guaranteed_through_date);
      })
    },
    function(error) {
      console.log("This error occured",error);
    }
  );
}
async function filterTicketData(e) {
  e.preventDefault();
  let invoice=document.getElementById('invoice').value;
  let container=document.getElementById('container').value;
  let rbol=document.getElementById('rbol').value;
  let amount=document.getElementById('amount').value;
  // let gdate=document.getElementById('gdate').value;
  // const date=new Date(gdate); 
  // const d=date.getDate();
  // const m=date.getMonth()+1;
  // const y=date.getFullYear();
  // const fullDate=d+'-'+m+'-'+y;
  // const custom_date=fullDate.toString();
  // console.log('Full Date',fullDate);
  // const datee=new Date(fullDate);
  // console.log("This is the Date format",typeof fullDate);
  const response = await client.request.get(`https://${data.iparams.domainName}/api/v2/search/tickets?query="custom_string:${invoice.toString()} AND custom_string:${container.toString()} AND custom_string:${rbol.toString()} AND custom_string:${amount.toString()}"`,{
    headers:{ 
      'Authorization': 'Basic ' + btoa(`${data.iparams.apiKey}`),
    }
  })
  console.log("this is requested url",response);
  let output = JSON.parse(response.response);
  console.log(output);
  //check for duplicate tickets
  if(output.length>0){
    console.log("There is a duplicate ticket");
    let ticketId=output[0].id;
    console.log("Ticket Id",ticketId);
    const response = await client.request.put(`https://${data.iparams.domainName}/api/v2/tickets/${ticketId}`,{
      headers:{ 
        'Authorization': 'Basic ' + btoa(`${data.iparams.apiKey}`),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "tags": ["duplicate"]
      })
    })
    console.log("this is requested url",response);
    let output = JSON.parse(response.response);
    console.log(output);
  }else{
    console.log("There is no duplicate ticket");
  }
}

