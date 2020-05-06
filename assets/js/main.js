let client = undefined;

$(function() {
    client = ZAFClient.init();
    
    client.get('ticket').then(
        function(data) {
          let ticket = data['ticket'];
          searchRelatedTickets(client, ticket);
        }
    );

    client.invoke('resize', { width: '100%', height: '120px' });
});

function redirect(path, value) {
    client.context().then(function(context) {
        window.open('https://'+context.account.subdomain+'.zendesk.com'+path+'/'+value);        
    });    
}

function searchRelatedTickets(client, ticket) {
    let search_string = 
        '-' + ticket.id +  // Nao incluir este ticket na lista de relacionados a ele
        ' type:ticket '  +  // Buscar por tickets
        'tags:' + ticket.tags.reduce( 
            (total, element) => (total + ' tags:' + element)  // Tickets que contiverem qualquer uma das tags deste ticket
        )
    ;
    
    let settings = {
        url:'/api/v2/search.json?query=' + search_string + '&sort_by=status&sort_order=desc',
        type:'GET',
        dataType: 'json'
    };

    client.request(settings).then(
        function(data) { 
            showInfo(data); 
        },
        function(response) {
            console.error(response.responseText);
        }
    );
}

function showInfo(data) {
    let requester_data = { 
        'tickets' : data.results
    };
  
    let source = $("#requester-template").html();
    let template = Handlebars.compile(source);
    let html = template(requester_data);
    $("#content").html(html);
  }