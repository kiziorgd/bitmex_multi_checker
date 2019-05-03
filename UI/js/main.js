$(function () {
    'use strict';
    let Checker = {
        fileReader: new FileReader(),

        rowsRendered: 0,

        rowsErrored: 0,

        credList: [],

        currentCreds: {
            api_key: '',
            api_secret: ''
        },

        spinner: $('.spinner-grow'),

        ajaxSettings: {
            type: 'POST',
            contentType: 'application/json',
            url: 'https://tadek.tele.com.pl/bitmex-multichecker/users/data',
            // url: 'http://127.0.0.1:8000/users/data',
        },

        satsToBtcFormat: function (sats) {
            return `${(sats / 100000000).toFixed(8)} ฿`;
        },

        appendRow: function (result, creds) {
            result.forEach(function (el) {
                Checker.rowsRendered++;

                let row = $('<tr></tr>');

                row.append('<th scope="row">' + Checker.rowsRendered + '</th>');
                row.append('<td>' + el.username + '</td>');
                row.append('<td>' + Checker.satsToBtcFormat(el.balance) + '</td>');
                row.append('<td>' + el.position + '</td>');
                row.append('<td>' + el.sellOrders + '</td>');
                row.append('<td>' + Checker.satsToBtcFormat(el.deposited) + '</td>');
                row.append('<td>' + Checker.satsToBtcFormat(el.withdrawn) + '</td>');
                row.append('<td>' + (el.referer == 777056 ? 'ok' : '-') + '</td>');
                row.append('<td>' + creds.api_key + '</td>');

                $('#table_body').append(row);
            });
        },

        handleError: function (creds) {
            Checker.rowsErrored++;
            let errorsDiv = $('.errors');
            let error = '<div id="alert-danger" class="alert alert-danger" role="alert">Error fetching data for api key: ' + creds.api_key +
                '<button type="button" class="retry-fetch btn btn-sm btn-outline-dark" data-key="' + creds.api_key + '" data-secret="' + creds.api_secret + '">retry</button></div>';
            errorsDiv.append(error);

            $('.retry-fetch').on('click', function (e) {
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('retrying...')
                $(this).parent('#alert-danger').remove();
                creds.api_key = $(this).data('key');
                creds.api_secret = $(this).data('secret');
                Checker.loadAccountData(creds);
            })
        },

        finishRendering: function () {
            if ((Checker.rowsRendered + Checker.rowsErrored) >= Checker.credList.length) {
                Checker.spinner.hide();
                console.log('fetching finished.')
            }
        },

        loadAccountData: function (creds) {
            Checker.spinner.show();
            Checker.ajaxSettings.data = JSON.stringify([creds]);
            console.log('fetching: ' + creds.api_key);
            $.ajax(
                Checker.ajaxSettings
            ).done(function (result) {
                Checker.appendRow(result, creds);
            }).fail(function () {
                Checker.handleError(creds);
            }).always(function () {
                Checker.finishRendering();
            })
        }
    };

    $('#api_credentials_file').on('change', function (e) {
        const creds_file = document.getElementById('api_credentials_file').files[0];
        if (creds_file) {
            Checker.fileReader.onload = function (e) {
                Checker.spinner.show();
                Checker.credList = JSON.parse(e.target.result);
                console.log('fetching data for ' + Checker.credList.length + ' accounts...');
                let i = 0;
                Checker.interval = setInterval(function () {
                        Checker.loadAccountData(Checker.credList[i])
                        i++;
                        if (i >= Checker.credList.length) {
                            clearInterval(Checker.interval);
                        }
                    }, 1500
                );
            };
            Checker.fileReader.readAsBinaryString(creds_file);
        }
    });
});
