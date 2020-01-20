'use strict';

function convertinit() {
    $('#dwfrm_currencies').submit(function (e) {
        var form = $(this);
        e.preventDefault();
        var url = form.attr('action');
        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            data: form.serialize(),
            success: function (data) {
            	$('#dwfrm_currencies_toCurrencyValue').val(data.toCurrencyValue);
            },
            error: function (data){
            	console.log(data);
            }
        });
        return false;
    });
}
$(document).ready(function(){
	convertinit();
});