$(function() {

    function satsToBtcFormat(sats){
        return `${(sats/100000000).toFixed(8)} ฿`
    }

    $('#api_credentials_file').on('change', function(e){
        const creds_file = document.getElementById('api_credentials_file').files[0]

        if(creds_file){
            var reader = new FileReader();

            reader.onload = function(e)
            {
                $('.spinner-grow').show()

                credsList = JSON.parse(e.target.result)
                let len = credsList.length
                let inc = 0;

                credsList.forEach(function(creds){
                    setTimeout(function(){
                        $.ajax({
                            type: 'POST',
                            contentType: 'application/json',
                            url: 'https://tadek.tele.com.pl/bitmex-multichecker/users/data',
//                            url: 'http://127.0.0.1:8000/users/data',
                            data: JSON.stringify([creds]),
                            dataType: 'json',
                        }).done(function(result){
                            result.forEach(function(el){
                                inc++;
                                let row = $('<tr></tr>')

                                row.append('<th scope="row">'+inc+'</th>')
                                row.append('<td>'+el.username+'</td>')
                                row.append('<td>'+satsToBtcFormat(el.balance)+'</td>')
                                row.append('<td>'+el.position+' contracts</td>')
                                row.append('<td>'+el.sellOrders+' contracts</td>')
                                row.append('<td>'+satsToBtcFormat(el.deposited)+'</td>')
                                row.append('<td>'+satsToBtcFormat(el.withdrawn)+'</td>')
                                row.append('<td>'+el.referer+'</td>')

                                $('#table_body').append(row)
                            })
                        }).fail(function(result){
                            $('#alert-danger').html(result)
                            $('#alert-danger').toggle()
                            $('.spinner-grow').hide()
                        }).always(function(){
                            if (len === inc){
                                $('.spinner-grow').hide()
                            }
                        })
                    }, 3000)

                })
            };

            reader.readAsBinaryString(creds_file);
        }
    })
})