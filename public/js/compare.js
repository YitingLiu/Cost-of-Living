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
        })
    }
    // var dataToRender=[];
    // dataToRender=items_filter_month;
    return items_filter_month;
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
        var dataToRender=filterDataFromDB(item);
        render(dataToRender,priceSuzhou);
    }
}

function render(item,priceSuzhou){
    renderBarChart(item,priceSuzhou);
    renderPieChart(item,priceSuzhou);
    renderCards(item,priceSuzhou);
}

function renderBarChart(items,priceSuzhou){
    $('#bar_chart svg').remove();
    var data=prepBarData(items,priceSuzhou);
    var height=210;
    var width=$('#bar_chart').width();
    var bandWidth=(width-data.subtotal.length+1)/data.subtotal.length;
    var height_background=260;
    var extend_on_hover=10;
    var easeCurve =d3.easePoly;

    var chart_holder=d3.select('#bar_chart').append('svg')
                        .attr('width',width)
                        .attr('height',height_background+extend_on_hover)
                        .selectAll('rect');

    var background=chart_holder.data(data.subtotalSZ)
                    .enter().append('rect')
                    .attr('id',function(d,i){
                        return 'background'+i;
                    })
                    .style('fill','#fff')
                    .style('opacity','.5')
                    .attr('width',bandWidth)
                    .attr('height', height_background)
                    .attr('x',function(d,i){
                        return bandWidth*i+i-1;
                    })
                    .attr('y',extend_on_hover);
                    // .on('mouseover',function(d,i){
                    //     barchartMouseOverEffect(d,i);
                    // })
                    // .on('mouseout',function(d,i){
                    //     barchartMouseOutEffect(d,i);
                    // });

    var yScale=d3.scaleLinear()
                .domain([0,d3.max(data.subtotal)])
                .range([0,height]);
    var chart=chart_holder.data(data.subtotal)
                .enter().append('rect')
                .style('fill','#4bfbd3')
                .attr('width',bandWidth/2)
                .attr('height',0)
                .attr('x',function(d,i){
                   return bandWidth*i+i-1;
                })
                .attr('y',height_background+extend_on_hover);
                // .on('mouseover',function(d,i){
                //     barchartMouseOverEffect(d,i);
                // })
                // .on('mouseout',function(d,i){
                //     barchartMouseOutEffect(d,i);
                // });
    var chartSZ=chart_holder.data(data.subtotalSZ)
                .enter().append('rect')
                .style('fill','#FFD580')
                .attr('width',bandWidth/2)
                .attr('height',0)
                .attr('x',function(d,i){
                   return bandWidth*i+i-1+bandWidth/2;
                })
                .attr('y',height_background+extend_on_hover);

    chart.transition()
        .duration(500)
        .ease(easeCurve)
        .delay(function(d,i){
            return i*20;
        })
        .attr('height',function(d){
            return yScale(d);
        })
        .attr('y',function(d){
            return height_background+extend_on_hover-yScale(d);
        });

    chartSZ.transition()
        .duration(500)
        .ease(easeCurve)
        .delay(function(d,i){
            return i*20;
        })
        .attr('height',function(d){
            return yScale(d);
        })
        .attr('y',function(d){
            return height_background+extend_on_hover-yScale(d);
        })

}

function prepBarData(items,priceSuzhou){
    var subtotal=[];  //example: subtotal[0]: Jan (display all) / 01 (display Jan)
    var subtotalSZ=[];
    var label=[];
    if(display_month=='all'){
        label=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        for(var i=0;i<12;i++){
            subtotal.push(0); // initialize subtotal array!!!
            subtotalSZ.push(0);
        }
        items.forEach(function(e){
            var m=e.date.slice(5,7);
            subtotal[m-1]+=e.expense;
            subtotalSZ[m-1]+=getSuzhouPriceByName(e.name,priceSuzhou);
        })
    } else {
        var monthLength=new Date(display_year,convertMonth(display_month),0).getDate();
        for(var j=0;j<monthLength;j++){
            subtotal.push(0);
            subtotalSZ.push(0);
            label.push(i+1);
        }
        items.forEach(function(e){
            var d=e.date.slice(8,10);
            subtotal[d-1]+=e.expense;
            subtotalSZ[d-1]+=getSuzhouPriceByName(e.name,priceSuzhou);
        })
    }

    return {
        label:label,
        subtotal:subtotal,
        subtotalSZ:subtotalSZ

    }
}

function getSuzhouPriceByName(name,priceSuzhou){
    var price=0;
    priceSuzhou.forEach(function(e){
        if(e.name==name) {
            price=e.price;
        }
    })
    return price;
}

////////////////// pie charts ////////////////
function renderPieChart(item,priceSuzhou){
    var data=prepPieData(item,priceSuzhou);
    var label=Object.keys(data[0]);
    label=label.slice(0,12);  // incase there is other category name extended over 12
    var expenseNY=Object.values(data[0]);
    var expenseSZ=Object.values(data[1]);
    expenseNY=expenseNY.slice(0,12);  // incase there is other category name extended over 12
    expenseSZ=expenseSZ.slice(0,12);  // incase there is other category name extended over 12
    expenseNY.forEach(function(e,i){
        expenseNY[i]=e.toFixed(2);
    });
    expenseSZ.forEach(function(e,i){
        expenseSZ[i]=e.toFixed(2);
    })
    var colors=['#C578EA','#F7BA7F','#6ECFCB','#F780C0','#F46157','#90DAFF','#7DCD72','#F7C407','#869CFF','#BF8AAF','#F68281','#555555'];

    var pieDataNY={
        datasets:[{
            data:expenseNY,
            backgroundColor:colors,
            borderColor:'rgba(255,255,255,.2)',
            borderWidth:3,
        }],
        labels:label
    }

    var pieDataSZ={
        datasets:[{
            data:expenseSZ,
            backgroundColor:colors,
            borderColor:'rgba(255,255,255,.2)',
            borderWidth:3,
        }],
        labels:label
    }

    var options={
        layout: {
            padding: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20
            }
        },
        legend:{
            display:false,
        },
        tooltips:{
            bodyFontFamily: "'Alegreya Sans SC', sans-serif",
            bodyFontSize: 16

        }
    };

    $('#pie_chart_ny canvas').remove();
    $('#pie_chart_ny').append('<canvas>');
    $('#pie_chart_ny canvas').attr('height',function(){
        return $('#pie_chart_ny').height();
    })
    $('#pie_chart_ny canvas').attr('width',function(){
        return $('#pie_chart_ny').width();
    })
    var ctx_ny=$("#pie_chart_ny canvas")[0].getContext('2d');

    var pieChartNY=new Chart(ctx_ny,{
        type:'doughnut',
        data:pieDataNY,
        options:options
    });

    $('#pie_chart_sz canvas').remove();
    $('#pie_chart_sz').append('<canvas>');
    $('#pie_chart_sz canvas').attr('height',function(){
        return $('#pie_chart_sz').height();
    })
    $('#pie_chart_sz canvas').attr('width',function(){
        return $('#pie_chart_sz').width();
    })
    var ctx_ny=$("#pie_chart_sz canvas")[0].getContext('2d');

    var pieChartNY=new Chart(ctx_ny,{
        type:'doughnut',
        data:pieDataSZ,
        options:options
    });
}

function prepPieData(items,priceSuzhou){
    var dataNY={
        'food':0,
        'drink':0,
        'transport':0,
        'shopping':0,
        'health':0,
        'beauty':0,
        'housing':0,
        'income':0,
        'digital':0,
        'recreation':0,
        'learning':0,
        'others':0
    };
    var dataSZ={
        'food':0,
        'drink':0,
        'transport':0,
        'shopping':0,
        'health':0,
        'beauty':0,
        'housing':0,
        'income':0,
        'digital':0,
        'recreation':0,
        'learning':0,
        'others':0
    };
    items.forEach(function(e){
        var c=e.category;
        dataNY[c]+=e.expense;
        dataSZ[c]+=getSuzhouPriceByName(e.name,priceSuzhou)
    });
    return [dataNY,dataSZ];
}

///////////////// CARDS ////////////
function renderCards(items,priceSuzhou){
    $('#cards').empty();
    var data=prepPieData(items,priceSuzhou);
    // console.log(data);
    var name=Object.keys(data[0]);
    var expenseNY=Object.values(data[0]);
    var expenseSZ=Object.values(data[1]);
    expenseNY=expenseNY.slice(0,12);  // incase there is other category name extended over 12
    expenseSZ=expenseSZ.slice(0,12);  // incase there is other category name extended over 12
    expenseNY.forEach(function(e,i){
        expenseNY[i]=e.toFixed(2);
    });
    expenseSZ.forEach(function(e,i){
        expenseSZ[i]=e.toFixed(2);
    });

    var max1 = Math.max(...expenseNY);
    var max2 = Math.max(...expenseSZ);
    var max =Math.max(max1,max2);

    for(var i=0;i<12;i++){
        renderCardByCategory(name[i],expenseNY[i],expenseSZ[i],max,items);
    }
}
function renderCardByCategory(name,ny,sz,max,items) {  // one item
    console.log(name);
    $('#cards').append('<div class="col-12 col-sm-6 col-md-3" id="'+name+'"><div class="title"></div><div class="table"></div></div>');
    var data=[ny,sz];
    var colors=['#4bfbd3','#FFD580'];
    // $('#cards #'+name' svg').remove();
    // var tabelData=new tableObj(items);
    // var label=Object.keys(tabelData);
    // label=label.slice(0,12);  // incase there is other category name extended over 12
    // var data=Object.values(tabelData);
    // data=data.slice(0,12);  // incase there is other category name extended over 12
    var height=$('#cards #'+name+' .table').height()-1;
    var width=$('#cards #'+name+' .table').width();
    // var bandWidth=width;
    var easeCurve =d3.easePoly;

    var chart_holder=d3.select('#cards #'+name+' .table').append('svg')
                        .attr('width',width)
                        .attr('height',height)
                        .selectAll('rect').data(data).enter();

    var background=chart_holder.append('rect')
                    .attr('class',function(){
                        return 'background';
                    })
                    .style('fill','#fff')
                    .style('opacity','.5')
                    .attr('width',(width-1)/2)
                    .attr('height', height)
                    .attr('x',function(d,i){
                        return ((width-1)/2+1)*i;
                    })
                    .attr('y',0)
                    .on('mouseover',function(){
                        cardMouseOverEffect();
                    })
                    .on('mouseout',function(){
                        cardMouseOutEffect();
                    })
                    .on('click',function(){
                        renderDetail(name,items);
                        $('#categoryDetail').modal('show');
                    });

    var table=chart_holder.append('rect')
                .style('fill',function(d,i){
                    return colors[i];
                })
                .attr('width',(width-1)/2)
                .attr('height',0)
                .attr('x',function(d,i){
                    return ((width-1)/2+1)*i;
                })
                .attr('y',function(d,i){
                    return height;
                })
                .on('mouseover',function(){
                    cardMouseOverEffect();
                })
                .on('mouseout',function(){
                    cardMouseOutEffect();
                });

    var yScale=d3.scaleLinear()
                .domain([0,max])
                .range([0,height]);

    table.transition()
        .duration(500)
        .ease(easeCurve)
        .delay(function(d,i){
            return i*20;
        })
        .attr('height',function(d){
            return yScale(d);
        })
        .attr('y',function(d){
            return height-yScale(d);
        });

    function cardMouseOverEffect(){
        d3.select('#'+name+' .title')
            .style('background','white');
        d3.selectAll('#'+name+' .background')
            .style('opacity','1');
    }

    function cardMouseOutEffect(){
        d3.select('#'+name+' .title')
            .style('background','rgba(255,255,255,.5)');
        d3.selectAll('#'+name+' .background')
            .style('opacity','.5');
    }

}


function renderDetail(name,items){
    $('.modal .modal-header h4').html(name);
    $('.modal .modal-body').empty();

    if(items.length>0){
        var items_filter_category=[];
        items.forEach(function(e){
            if(e.category==name) items_filter_category.push(e);
        });
        var item_order=reorder(items_filter_category);
        while(item_order.length>0) {
            var currentItems=[];
            currentItems.push(item_order[0]);
            var currentDate=item_order[0].displayDate;
            // console.log(currentDate);
            item_order=item_order.slice(1);
            while(item_order.length>0){
                if(item_order[0].displayDate==currentDate){
                    currentItems.push(item_order[0]);
                    item_order=item_order.slice(1);
                } else {
                    break;
                }
            }
            // console.log(currentItems);
            //render to html
            $('.modal .modal-body').append('<div class="time"><h5>- ' + currentDate + ' -</h5></div>');
            currentItems.forEach(function(e){
                $('.modal .modal-body').append('<div class="item"><div class="name">' + e.name +
                    '</div><div class="expense">$' + e.expense +
                    '</div><div class="btns"><a class="first" href="item/edit/' + e._id + '"><i class="material-icons">mode_edit</i></a><a id="'+e._id+'" onclick="deleteItem(event)"><i id="'+e._id+'"class="material-icons">delete</i></a></div></div>'
                    );
            })
        }
    }
}

$('#categoryDetail').on('shown.bs.modal',function(e){
    var name=$('.modal .modal-header h4').html();
    var categories=['food','drink','transport','shopping','health','beauty','housing','income','digital','recreation','learning','others'];
    var index=categories.indexOf(name);
    var colors=['#C578EA','#F7BA7F','#6ECFCB','#F780C0','#F46157','#90DAFF','#7DCD72','#F7C407','#869CFF','#BF8AAF','#F68281','#555555'];
    $('#categoryDetail .modal-content .modal-header').css('background-color',colors[index]);
    $('#categoryDetail .item div.btns').css('background-color',colors[index]);

    $("#categoryDetail .modal-content").css('right','0');
    $("#categoryDetail .modal-content").css('opacity','1');

})

$('#categoryDetail').on('hide.bs.modal',function(e){
    $("#categoryDetail .modal-content").css('right','-25%');
    $("#categoryDetail .modal-content").css('opacity','.5');

})

function deleteItem(event){
    var targetId=event.target.id;
    jQuery.ajax({
        url:'/item/delete/'+targetId,
        dataType:'json',
        success:function(res){
            console.log("success delete!");
            dataToRender=[];
            jQuery.ajax({
                url : '/item/get',
                dataType : 'json',
                success : function(response) {
                    filterDataFromDB(response.item);
                    var category=$('.modal .modal-header h4').html();
                    renderDetails(category.toLowerCase(),dataToRender);
                    var currentColor=$('.modal .modal-header').css('background-color');
                    $('#categoryDetail .item div.btns').css('background-color',currentColor);
                }
            })
        }
    })
}

function reorder(itms){
    itms.forEach(function(e){
        var yr=e.date.slice(0,4);
        var mth=e.date.slice(5,7)-1;
        var d=e.date.slice(8,10);
        var hr=e.date.slice(11,13);
        var min=e.date.slice(14,16);
        var sec=e.date.slice(17,19);
        e.displayDate=new Date(yr,mth,d,hr,min,sec);
    })

    itms.sort(function(a,b){
        return a.displayDate - b.displayDate;
    });

    itms.forEach(function(e){
        e.displayDate=e.displayDate.toDateString();
    });

    return itms;
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