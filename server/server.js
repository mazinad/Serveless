const btoa = require('btoa');

exports = {
  onConversationCreateCallback : async function(data){
    console.log("Conversation Created",data);
    console.log("Conversation",data.iparams.domainName);
    console.log("Conversation",data.iparams.apiKey);
    let ticketId=data.data.conversation.ticket_id;
    console.log("Ticket Id on Call Back",ticketId);
    try{
    const response = await $request.get(`https://${data.iparams.domainName}/api/v2/tickets/${ticketId}`,{  
    headers:{
         'Authorization': 'Basic ' + btoa(`${data.iparams.apiKey}`),
        'Content-Type': 'application/json'
      }
    })
    let output = JSON.parse(response.response);
    console.log("Response outputed: ",output);
    let status=output.status;
    console.log("Ticket Status",status);
    if(status==4 || status==5){
      console.log("This is a closed ticket or Resolved ticket");
      let subject=output.subject; 
      console.log("Ticket Subject",subject);
      let description=output.description;
      console.log("Ticket Description",description);
      let type=output.type;
      console.log("Ticket Type",type);
      let status=output.status;
      console.log("Ticket Status",status);
      let priority=output.priority;
      console.log(" Ticket Priority",priority);
      let requesterId=output.requester_id;
      let groupId=output.group_id;
      try{
        console.log("Checking if Process reached here");
      const response = await $request.post(`https://${data.iparams.domainName}/api/v2/tickets`,{
        headers:{ 
          'Authorization': 'Basic ' + btoa(`${data.iparams.apiKey}`),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "subject": subject,
          "description": description,
          "type": type,
          "status": status,
          "priority": priority,
          "requester_id": requesterId,
          "group_id": groupId
        })
      })
      let output = JSON.parse(response.response);
      console.log(output);
    
      let ticketId=output.id;

      console.log("Ticket Id",ticketId);
      const responses = await $request.put(`https://${data.iparams.domainName}/api/v2/tickets/${ticketId}`,{
        headers:{ 
          'Authorization': 'Basic ' + btoa(`${data.iparams.apiKey}`),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "tags": ["closed-reply"],
          "custom_fields": { 
            "cf_closed_ticket_id": JSON.stringify(ticketId)
          }
        })
      })
      let outputs = JSON.parse(responses.response);
      console.log(outputs);
      }
      catch(error){
        console.log("Error occured",error);
      }
    }
    else{
      console.log("This is an open ticket");
    }
    }
    catch(error){
      console.log("Error occured",error);
    }
  },

  onTicketCreateCallback : async function(data){
    let invoiceNumber=data.data.ticket.custom_fields.cf_invoice_number;
    console.log("Invoice Number", typeof invoiceNumber);
    let containerNumber=data.data.ticket.custom_fields.cf_container_number;
    let rbolNumber=data.data.ticket.custom_fields.cf_related_bol;
    let paymentNumber=data.data.ticket.custom_fields.cf_payment_amount;
    let guarantedDate=data.data.ticket.custom_fields.cf_guaranteed_through_date;
    console.log("Guaranteed Date", typeof guarantedDate);
    try{
    const response = await $request.get(`https://${data.iparams.domainName}/api/v2/search/tickets?query="custom_string:${invoiceNumber.toString()} AND custom_string:${containerNumber.toString()} AND custom_string:${rbolNumber.toString()} AND custom_string:${paymentNumber.toString()}"`,{
      headers:{
        'Authorization': 'Basic ' + btoa(`${data.iparams.apiKey}`),
        'Content-Type': 'application/json'
      }
    })
    let output = await JSON.parse(response.response);
    console.log("Response outputed: ",output);
    if(output.results.length>0){
      output.results.forEach(async function(ticket){
        console.log("Ticket Id",ticket.id);
        await updateTicket(ticket.id,data);
       await addNoteToTicket(ticket.id,data);
      })
      
    } 
    }
    catch(error){
      console.log("Error occured",error);
    }
  }

};
async function updateTicket(ticketId,data){
  try{
    const response = await $request.put(`https://${data.iparams.domainName}/api/v2/tickets/${ticketId}/no`,{
      headers:{ 
        'Authorization': 'Basic ' + btoa(`${data.iparams.apiKey}`),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "tags": ["Potential Duplicate"],
    })
    })
    let output = JSON.parse(response.response);
    console.log(output);

  }
    catch(error){
      console.log("Error occured",error);
    } 
}
async function addNoteToTicket(ticketId,data){
  try{
    const response = await $request.post(`https://${data.iparams.domainName}/api/v2/tickets/${ticketId}/notes`,{
      headers:{ 
        'Authorization': 'Basic ' + btoa('VYUDaISDETObHFtX84SE'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "body": `This ticket is flagged as a potential duplicate of ${ticketId}`,
        "private": false
    })
    })
    let output = JSON.parse(response.response);
    console.log(output);

  }
    catch(error){
      console.log("Error occured",error);
    } 
}
