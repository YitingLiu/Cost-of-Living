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
                    .attr('y',extend_on_hover)
                    .on('mouseover',function(d,i){
                        barchartMouseOverEffect(d,i);
                    })
                    .on('mouseout',function(d,i){
                        barchartMouseOutEffect(d,i);
                    });

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
                .attr('y',height_background+extend_on_hover)
                .on('mouseover',function(d,i){
                    barchartMouseOverEffect(d,i);
                })
                .on('mouseout',function(d,i){
                    barchartMouseOutEffect(d,i);
                });

    var chartSZ=chart_holder.data(data.subtotalSZ)
                .enter().append('rect')
                .style('fill','#FFD580')
                .attr('width',bandWidth/2)
                .attr('height',0)
                .attr('x',function(d,i){
                   return bandWidth*i+i-1+bandWidth/2;
                })
                .attr('y',height_background+extend_on_hover)
                .on('mouseover',function(d,i){
                    barchartMouseOverEffect(d,i);
                })
                .on('mouseout',function(d,i){
                    barchartMouseOutEffect(d,i);
                });

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
        });

    var label=chart_holder.data(data.label)
                    .enter().append('text')
                    .attr('class','label')
                    .attr('id',function(d,i){
                        return "label"+i;
                    })
                    .attr('x',function(d,i){
                        return (bandWidth+1)*i+bandWidth/2;
                    })
                    .attr('y',25)
                    .attr('text-anchor','middle')
                    .attr('alignment-baseline','middle')
                    .style('fill','rgba(255,255,255,.8)')
                    .text(function(d){
                        return d;
                    })
                    .on('mouseover',function(d,i){
                        barchartMouseOverEffect(d,i);
                    })
                    .on('mouseout',function(d,i){
                        barchartMouseOutEffect(d,i);
                    });

    var tooltip=d3.select('body')
                .append('div')
                .style('position','absolute')
                .style('padding','0 10px')
                .style('background','white')
                .style('border-radius','2px')
                .style('opacity',0)
                .style('box-shadow',"1px 1px 4px 1px rgba(0,0,0,.5)");
                // .on('mouseover',function(d,i){
                //     barchartMouseOverEffect(d,i);
                // })
                // .on('mouseout',function(d,i){
                //     barchartMouseOutEffect(d,i);
                // });

    function barchartMouseOverEffect(d,i){
        tooltip.html("New York: $"+data.subtotal[i]+"<br>Suzhou: $"+data.subtotalSZ[i])
            .style('left',(d3.event.pageX)+'px')
            .style('top',(d3.event.pageY-50)+'px')
            .transition()
            .duration(200)
            .style('opacity',1);
        d3.select('#bar_chart #background'+i)
            .style('opacity',1);
        d3.select('#bar_chart #label'+i)
            .style('fill','rgba(0,0,0,.5)');
    }

    function barchartMouseOutEffect(d,i){
        tooltip.html("New York: $"+data.subtotal[i]+"<br>Suzhou: $"+data.subtotalSZ[i])
            .style('left',(d3.event.pageX)+'px')
            .style('top',(d3.event.pageY-30)+'px')
            .transition()
            .duration(200)
            .style('opacity',0);
        d3.select('#bar_chart #background'+i)
            .style('opacity',.5);
        d3.select('#bar_chart #label'+i)
            .style('fill','rgba(255,255,255,.8)');
    }
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
            label.push(j+1);
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
    var sum_ny=0,
        sum_sz=0;
    for(var i=0;i<12;i++){
        sum_ny+=expenseNY[i];
        sum_sz+=expenseSZ[i];
    }
    var persents_ny=[];
    var persents_sz=[];
    expenseNY.forEach(function(e){
        var persent=(e/sum_ny)*100;
        persents_ny.push(persent.toFixed(2));
    })
    expenseSZ.forEach(function(e){
        var persent=(e/sum_sz)*100;
        persents_sz.push(persent.toFixed(2));
    })

    $('#pie_chart_ny canvas').remove();
    $('#pie_chart_ny').append('<canvas>');
    $('#pie_chart_ny canvas').attr('height',function(){
        return $('#pie_chart_ny').height();
    })
    $('#pie_chart_ny canvas').attr('width',function(){
        return $('#pie_chart_ny').width();
    })

    $('#pie_chart_sz canvas').remove();
    $('#pie_chart_sz').append('<canvas>');
    $('#pie_chart_sz canvas').attr('height',function(){
        return $('#pie_chart_sz').height();
    })
    $('#pie_chart_sz canvas').attr('width',function(){
        return $('#pie_chart_sz').width();
    })

    var canvas_ny=$("#pie_chart_ny canvas")[0];
    var context_ny=$("#pie_chart_ny canvas")[0].getContext('2d');
    var canvas_sz=$("#pie_chart_sz canvas")[0];
    var context_sz=$("#pie_chart_sz canvas")[0].getContext('2d');

    var colors=['#C578EA','#F7BA7F','#6ECFCB','#F780C0','#F46157','#90DAFF','#7DCD72','#F7C407','#869CFF','#BF8AAF','#F68281','#555555'];



    drawDonut(canvas_ny,context_ny,persents_ny);
    drawDonut(canvas_sz,context_sz,persents_sz);
    function drawDonut(canvas,context,persents){
        var width = canvas.width,
            height = canvas.height,
            radius = Math.min(width, height) / 2;
        var arc = d3.arc()
            .outerRadius(radius - 60)
            .innerRadius(radius - 100)
            .padAngle(0.01)
            // .cornerRadius(5)
            .context(context);

        var pie = d3.pie();

        var arcs = pie(persents);

        context.translate(width / 2, height / 2);

        arcs.forEach(function(d, i) {
          context.beginPath();
          arc(d);
          context.fillStyle = colors[i];
          context.fill();
        });

        var outerArc = d3.arc()
            .outerRadius(radius -30)
            .innerRadius(radius -30);

        context.beginPath();
        arcs.forEach(function(d,i) {
            if(d.data>0){
                var c = outerArc.centroid(d);
                context.font="14px Alegreya Sans SC";
                context.textAlign="center";
                context.fillStyle="rgba(255,255,255,1)";
                context.fillText(label[i],c[0],c[1]);
                context.font="18px Alegreya Sans SC";
                context.fillText(d.data+"%",c[0],c[1]+20);
            }
        });

    }
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
        e.expenseSZ=getSuzhouPriceByName(e.name,priceSuzhou);
        dataSZ[c]+=e.expenseSZ;
    });
    return [dataNY,dataSZ];
}

///////////////// CARDS ////////////
function renderCards(items,priceSuzhou){
    $('#cards').empty();
    var data=prepPieData(items,priceSuzhou);
    // console.log(data);
    var category=Object.keys(data[0]);
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
        renderCardByCategory(category[i],expenseNY[i],expenseSZ[i],max,items);
    }
}
function renderCardByCategory(category,ny,sz,max,items) {  // one item
    $('#cards').append('<div class="col-12 col-sm-6 col-md-3" id="'+category+'"></div>');
    var data=[ny,sz];
     var categories=['food','drink','transport','shopping','health','beauty','housing','income','digital','recreation','learning','others'];
    var index=categories.indexOf(category);
    var colors=['#C578EA','#F7BA7F','#6ECFCB','#F780C0','#F46157','#90DAFF','#7DCD72','#F7C407','#869CFF','#BF8AAF','#F68281','#555555'];
    var color=colors[index];
    // $('#cards #'+name' svg').remove();
    // var tabelData=new tableObj(items);
    // var label=Object.keys(tabelData);
    // label=label.slice(0,12);  // incase there is other category name extended over 12
    // var data=Object.values(tabelData);
    // data=data.slice(0,12);  // incase there is other category name extended over 12
    var width=$('#cards #'+category).width();
    var titleHeight=40;
    var tableHeight=160;
    var height=titleHeight+tableHeight+1;
    var easeCurve =d3.easePoly;

    var chart_holder=d3.select('#cards #'+category).append('svg')
                        .attr('width',width)
                        .attr('height',height)
                        .selectAll('rect').data(data).enter();

    var title_holder=chart_holder.append('rect')
                    .style('display',function(d,i){
                        if(i>0) return "none";
                    })
                    .attr('class','title')
                    .style('fill','#fff')
                    .style('opacity','.5')
                    .attr('width',width)
                    .attr('height',titleHeight)
                    .on('mouseover',function(){
                        cardMouseOverEffect();
                    })
                    .on('mouseout',function(){
                        cardMouseOutEffect();
                    })
                    .on('click',function(){
                        renderDetail(category,items);
                        $('#categoryDetail').modal('show');
                    });

    var title=chart_holder.append('text')
                .style('display',function(d,i){
                    if(i>0) return "none";
                })
                .attr('x',function(){
                    return 10;
                })
                .attr('y',function(){
                    return 25;
                })
                .text(function(){
                    return category.charAt(0).toUpperCase()+category.slice(1);
                })
                .style('fill','white')
                .style('font','20px')
                .on('mouseover',function(){
                    cardMouseOverEffect();
                })
                .on('mouseout',function(){
                    cardMouseOutEffect();
                })
                .on('click',function(){
                    renderDetail(category,items);
                    $('#categoryDetail').modal('show');
                });;

    var background=chart_holder.append('rect')
                    .attr('class',function(){
                        return 'background';
                    })
                    .style('fill','#fff')
                    .style('opacity','.5')
                    .attr('width',(width-1)/2)
                    .attr('height', tableHeight)
                    .attr('x',function(d,i){
                        return ((width-1)/2+1)*i;
                    })
                    .attr('y',height-tableHeight)
                    .on('mouseover',function(){
                        cardMouseOverEffect();
                    })
                    .on('mouseout',function(){
                        cardMouseOutEffect();
                    })
                    .on('click',function(){
                        renderDetail(category,items);
                        $('#categoryDetail').modal('show');
                    });

    var table=chart_holder.append('rect')
                .style('fill',function(d,i){
                    return color;
                })
                .style('opacity',function(d,i){
                    if(i>0) return .8;
                    return 1;
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
                })
                .on('click',function(){
                    renderDetail(category,items);
                    $('#categoryDetail').modal('show');
                });

    var yScale=d3.scaleLinear()
                .domain([0,max])
                .range([0,tableHeight-20]);

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

        var label=chart_holder.append('text')
            .style('fill','white')
            .style('font','20px')
            .attr('text-anchor','middle')
            .attr('alignment-baseline','middle')
            .attr('x',function(d,i){
                return ((width-1)/2+1)*i+(width-1)/4;
            })
            .attr('y',function(d){
                return height-yScale(d)-9;
            })
            .text(function(d){
                if(d>0) return '$'+d;
            })
            .on('mouseover',function(){
                cardMouseOverEffect();
            })
            .on('mouseout',function(){
                cardMouseOutEffect();
            })
            .on('click',function(){
                renderDetail(category,items);
                $('#categoryDetail').modal('show');
            });;

    function cardMouseOverEffect(){
        d3.select('#'+category+' .title')
            .style('opacity','1');
        d3.selectAll('#'+category+' text')
            .style('fill','rgba(0,0,0,.6)');
        d3.selectAll('#'+category+' .background')
            .style('opacity','1');
    }

    function cardMouseOutEffect(){
        d3.select('#'+category+' .title')
            .style('opacity','.5');
        d3.selectAll('#'+category+' text')
            .style('fill','white');
        d3.selectAll('#'+category+' .background')
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
                $('.modal .modal-body').append('<div class="item"><div class="name">'
                    +e.name+'</div><div class="expense_holder"><div class="expense expense_left">$'
                    +e.expense+'</div><div class="expense expense_right">$'
                    +e.expenseSZ+'</div></div></div>');
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
    $('#categoryDetail .item div.expense').css('background-color',colors[index]);
    $('#categoryDetail .item div.expense_right').css('opacity','.8');

    $("#categoryDetail .modal-content").css('right','0');
    $("#categoryDetail .modal-content").css('opacity','1');

})

$('#categoryDetail').on('hide.bs.modal',function(e){
    $("#categoryDetail .modal-content").css('right','-25%');
    $("#categoryDetail .modal-content").css('opacity','.5');

})

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


//navbar scroll effects
$(document).scroll(function(){
    // console.log('scroll');
    var top=$(this).scrollTop();
    if(top>100){
        $('nav').addClass('white');
    } else {
        $('nav').removeClass('white');
    }
})