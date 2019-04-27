$(function() {

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
                    url: 'http://127.0.0.1:8000/users/data',
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
                        row.append('<td>'+el.balance+'</td>')
                        row.append('<td>'+el.position+'</td>')
                        row.append('<td>'+el.sellOrders+'</td>')
                        row.append('<td>'+el.deposited+'</td>')
                        row.append('<td>'+el.withdrawn+'</td>')
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