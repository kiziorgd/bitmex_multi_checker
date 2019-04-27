$(function() {

    function statsToBtcFormat(sats){
        return `${(sats/100000000).toFixed(8)} ฿`
    }


    $('#api_credentials_file').on('change', function(e){
        const creds_file = document.getElementById('api_credentials_file').files[0]

        if(creds_file){
            var reader = new FileReader();

            reader.onload = function(e)
            {
                $('.spinner-grow').toggle()

                $.ajax({
                    type: 'POST',
                    contentType: 'application/json',
                    url: 'https://tadek.tele.com.pl/bitmex-multichecker/users/data',
                    data: e.target.result,
                    dataType: 'json',
                }).done(function(result){
                    console.log(result)
                    let inc = 0;
                    result.forEach(function(el){
                        inc++;
                        let row = $('<tr></tr>')

                        row.append('<th scope="row">'+inc+'</th>')
                        row.append('<td>'+el.username+'</td>')
                        row.append('<td>'+statsToBtcFormat(el.balance)+'</td>')
                        row.append('<td>'+el.position+' contracts</td>')
                        row.append('<td>'+el.sellOrders+' contracts</td>')
                        row.append('<td>'+statsToBtcFormat(el.deposited)+'</td>')
                        row.append('<td>'+statsToBtcFormat(el.withdrawn)+'</td>')
                        row.append('<td>'+el.referer+'</td>')

                      $('#table_body').append(row)
                    })

                    $('.spinner-grow').toggle()
                })
            };

            reader.readAsBinaryString(creds_file);
        }
    })
})