const btoa = require('btoa');

exports = {
  // args is a JSON block containing the payload information.
  // args['iparam'] will contain the installation parameter values.
  onConversationCreateCallback : async function(data){
    console.log("Conversation Created",data);
    console.log("Conversation",data.iparams);
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
          "requester_id": requesterId
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
      console.log("this is the tag url",responses);
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
  }

};
