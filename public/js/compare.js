var display_year,display_month;

$('#year li').click(function(){
    if(!$(this).hasClass('active')) {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        display_year=$(this).text();
        console.log("Year Changed: "+display_year);

        getData();
    }
})

$('#month li').click(function(){
    if(!$(this).hasClass('active')) {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        display_month=$(this).text().toLowerCase();
        console.log("Month Changed: "+display_month);

        getData();
    }
})

window.addEventListener('load', init())

// $(window).ready(init());
function init(){
    //set defaults!
    display_year="2017";
    display_month='all';
    getData();

}

function getData(){
    var items;
    var priceSuzhou;
    $.when(
        jQuery.ajax({
            url : '/item/get',
            dataType : 'json',
            success : function(response) {
                // filterDataFromDB(response.item);
                items=response.item;
            }
        }),
        jQuery.ajax({
            url:'/suzhou/get',
            dataType:'json',
            success:function(res){
                priceSuzhou=res.item;
            }
        })
    ).then(function(){
        checkSuzhouPriceAvailable(items,priceSuzhou);
    });
}

// var dataToRender=[];
function filterDataFromDB(items){
    var items_filter_year=[];
     items.forEach(function(e){
                var y=e.date.slice(0,4);
                if(y==display_year) items_filter_year.push(e);
            });

            var items_filter_month=[];
            if(display_month=="all"){
                items_filter_month = items_filter_year;
            } else {
                //render barchart by day)
                items_filter_year.forEach(function(e){
                    var m=e.date.slice(5,7);
                    if(m==convertMonth(display_month)) items_filter_month.push(e);
                });
            }
            // var dataToRender=[];
            // dataToRender=items_filter_month;
            render(items_filter_month);
}

function checkSuzhouPriceAvailable(item,priceSuzhou){
    var priceSuzhouNames=[];
    priceSuzhou.forEach(function(e){
        priceSuzhouNames.push(e.name);
    });
    var suzhouNeeded=[];
    item.forEach(function(e){
        if(priceSuzhouNames.indexOf(e.name)===-1){ //not exist
            suzhouNeeded.push(e.name);
        }
    });
    if(suzhouNeeded.length>1){
        $('#priceDataAlert').modal('show');
        $('#priceDataAlert .modal-body')
                .append('<div class="row"><form id="input_form" action="/addPriceSuzhou/create" method="POST"><div class="col-12"> <input type="text" id="name_input" name="Item" value="'+suzhouNeeded[0]+'" required> <input type="text" id="suzhou_input" name="suzhou" required> <input type="submit" value="Next"><div></form></div>')
    } else if(suzhouNeeded.length==1){
        $('#priceDataAlert').modal('show');
            $('#priceDataAlert .modal-body')
                .append('<div class="row"><form id="input_form" action="/addPriceSuzhou/create" method="POST"><div class="col-12"> <input type="text" id="name_input" name="Item" value="'+suzhouNeeded[0]+'" required> <input type="text" id="suzhou_input" name="suzhou" required> <input type="submit" value="Finish"><div></form></div>')
    } else {
        // start render
        filterDataFromDB(item);
    }
}

function render(item){
    console.log(item);
}

//convert month from sep to 09
function convertMonth(m){
    switch(m){
        case 'jan': return 01;
        case 'feb': return 02;
        case 'mar': return 03;
        case 'apr': return 04;
        case 'may': return 05;
        case 'jun': return 06;
        case 'jul': return 07;
        case 'aug': return 08;
        case 'sep': return 09;
        case 'oct': return 10;
        case 'nov': return 11;
        case 'dec': return 12;
    }
}

//cant close modal!
$('#priceDataAlert').on('hidden.bs.modal', function (e) {
    $('#priceDataAlert').modal('show');
})