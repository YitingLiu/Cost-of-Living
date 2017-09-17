var display_year,display_month;

function msg(){
    console.log("click!");
}

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
    jQuery.ajax({
        url : '/item/get',
        dataType : 'json',
        success : function(response) {
            filterDataFromDB(response.item);
        }
    })
}

var dataToRender=[];
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
            dataToRender=[];
            dataToRender=items_filter_month;
            render();
}

function render(){
    renderBarChart(dataToRender);
    renderTable(dataToRender);
    renderPieChart(dataToRender);
}

function renderBarChart(items){
    $('#bar_chart svg').remove();
    var bardataObj=barObj(items);
    var bardata=bardataObj.data;
    var height=210;
    var width=$('.container').width();
    var bandWidth=(width-bardata.length+1)/bardata.length;
    var height_background=260;
    var extend_on_hover=10;
    var easeCurve =d3.easePoly;

    var chart_holder=d3.select('#bar_chart').append('svg')
                        .attr('width',width)
                        .attr('height',height_background+extend_on_hover)
                        .selectAll('rect').data(bardata).enter();

    var background=chart_holder.append('rect')
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
                .domain([0,d3.max(bardata)])
                .range([0,height]);
    var chart=chart_holder.append('rect')
                .style('fill','#4bfbd3')
                .attr('width',bandWidth)
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
        })

// expense number
    chart_holder.append('text')
        .attr('class','expense_hidden')
        .attr('id',function(d,i){
            return "number"+i;
        })
        .attr('text-anchor','middle')
        .attr('x',function(d,i){
            return bandWidth*i+i-1+bandWidth/2;
        })
        .attr('y',function(d){
            return height_background+extend_on_hover-yScale(d);
        })
        .text(function(d){
            return '$' + d.toFixed(2);
        });

// bar chart month label
var label=bardataObj.label;
    chart_holder.append('text')
        .attr('class','label')
        .attr('id',function(d,i){
            return "label"+i;
        })
        .attr('x',function(d,i){
            return bandWidth*i+i-1+6;
        })
        .attr('y',34)
        .text(function(d,i){
            return label[i];
        });

    function barchartMouseOverEffect(d,i){
        d3.select('#background'+i)
            .transition()
                .ease(easeCurve)
                .duration(500)
            .style('opacity','1')
            .attr('height',height_background+extend_on_hover)
            .attr('y',0);
        d3.select('#number'+i)
            .transition()
                .ease(easeCurve)
                .duration(500)
            .attr('class','expense')
            .attr('y',function(d){
                return height_background+extend_on_hover-yScale(d)-10;
            });
        d3.select('#label'+i)
            .transition()
                .ease(easeCurve)
                .duration(500)
            .attr('y',24)
            .attr('class','label_active')
    }

    function barchartMouseOutEffect(d,i){
        d3.select('#background'+i)
            .transition()
                .ease(easeCurve)
                .duration(500)
            .style('opacity','.5')
            .attr('height',height_background)
            .attr('y',extend_on_hover);
        d3.select('#number'+i)
            .transition()
                .ease(easeCurve)
                .duration(500)
            .attr('class','expense_hidden')
            .attr('y',function(d){
                return height_background+extend_on_hover-yScale(d);
            });
        d3.select('#label'+i)
            .transition()
                .ease(easeCurve)
                .duration(500)
            .attr('y',34)
            .attr('class','label')
    }
}

function barObj(items){
    var data=[];
    var label=[];
    if(display_month=='all') {
        for(var i=0;i<12;i++) data.push(0);
        items.forEach(function(e){
            var m=e.date.slice(5,7);
            data[m-1]+=e.expense;
        })
        label=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    } else {
        var length=new Date(display_year,convertMonth(display_month),0).getDate();
        for(var i=0;i<length;i++) {
            data.push(0);
            label.push(i+1);
        }
        items.forEach(function(e){
            var d=e.date.slice(8,10);
            data[d-1]+=e.expense;
        })
    }
    return {
        data:data,
        label:label
    }
}

function renderTable(items){
    $('#table svg').remove();
    var tabelData=new tableObj(items);
    var label=Object.keys(tabelData);
    label=label.slice(0,12);  // incase there is other category name extended over 12
    var data=Object.values(tabelData);
    data=data.slice(0,12);  // incase there is other category name extended over 12
    var height=(660-11)/12;//($('#category_charts').height()-11)/12;
    var width=$('div#table').width();
    var bandWidth=width;
    var easeCurve =d3.easePoly;

    var chart_holder=d3.select('#table').append('svg')
                        .attr('width',width)
                        .attr('height',height*12+11)
                        .selectAll('rect').data(data).enter();

    var table=chart_holder.append('rect')
                .attr('id',function(d,i){
                    return "cell"+i;
                })
                .attr('width',bandWidth)
                .attr('height',height)
                .attr('x',0)
                .attr('y',function(d,i){
                    return (height+1)*i;
                })
                .style('fill','#fff')
                .style('opacity',.5)
                .on('mouseover',function(d,i){
                    MouseOverEffect(i);
                })
                .on('mouseout',function(d,i){
                    MouseOutEffect(i);
                })
                .on('click',function(){
                    $('#categoryDetail').modal('show');
                });

    var colors=['#C578EA','#F7BA7F','#6ECFCB','#F780C0','#F46157','#90DAFF','#7DCD72','#F7C407','#869CFF','#BF8AAF','#F68281','#555555'];
    var bullet=chart_holder.append('circle')
                .attr('r',4)
                .attr('cx',20)
                .attr('cy',function(d,i){
                    return (height+1)*i+height/2
                })
                .style('fill',function(d,i){
                    return colors[i];
                });

//labels: category names
    var labels_Caps=[];
    label.forEach(function(e){
        labels_Caps.push(e[0].toUpperCase()+e.slice(1));
    });
    chart_holder.append('text')
        .attr('id',function(d,i){
            return "category_label"+i;
        })
        .attr("class",'label')
        .attr('alignment-baseline','middle')
        .attr('x',35)
        .attr('y',function(d,i){
            return (height+1)*i+height/2
        })
        .text(function(d,i){
            return labels_Caps[i];
        })
        .on('mouseover',function(d,i){
            MouseOverEffect(i);
        })
        .on('mouseout',function(d,i){
            MouseOutEffect(i);
        })
        .on('click',function(){
            $('#categoryDetail').modal('show');
        });

//expense numbers
    chart_holder.append('text')
        .attr('id',function(d,i){
            return "expense_number"+i
        })
        .attr('class','expense')
        .attr('text-anchor','end')
        .attr('alignment-baseline','middle')
        .attr('x',function(){
            return width*.9;
        })
        .attr('y',function(d,i){
            return (height+1)*i+height/2
        })
        .text(function(d,i){
            return '$' + d.toFixed(2);
        })
        .on('mouseover',function(d,i){
            MouseOverEffect(i);
        })
        .on('mouseout',function(d,i){
            MouseOutEffect(i);
        })
        .on('click',function(){
            $('#categoryDetail').modal('show');
        });




    function MouseOverEffect(i){
        d3.select("#cell"+i)
            .transition()
            .style('opacity',1);
        d3.select("#category_label"+i)
            .attr("class","label_active");
        d3.select("#expense_number"+i)
            .attr("class","expense_active")
    }

    function MouseOutEffect(i){
        d3.select("#cell"+i)
            .transition()
            .style('opacity',.5);
        d3.select("#category_label"+i)
            .attr("class","label")
        d3.select("#expense_number"+i)
            .attr("class","expense")
    }

}

var tableObj=function(items){
    var data={
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
        data[c]+=e.expense;
    })
    return data;
}

function renderPieChart(items){
    $('#pie_chart canvas').remove();
    $('#pie_chart').append('<canvas>');
    $('#pie_chart canvas').attr('height',function(){
        return $('#pie_chart').height();
    })
    $('#pie_chart canvas').attr('width',function(){
        return $('#pie_chart').width();
    })
    var ctx=$("#pie_chart canvas")[0].getContext('2d');
    var tabelData=new tableObj(items);
    var label=Object.keys(tabelData);
    label=label.slice(0,12);  // incase there is other category name extended over 12
    var expense=Object.values(tabelData);
    expense=expense.slice(0,12);  // incase there is other category name extended over 12
    expense.forEach(function(e,i){
        expense[i]=e.toFixed(2);
    })
    var colors=['#C578EA','#F7BA7F','#6ECFCB','#F780C0','#F46157','#90DAFF','#7DCD72','#F7C407','#869CFF','#BF8AAF','#F68281','#555555'];

    var data={
        datasets:[{
            data:expense,
            backgroundColor:colors,
            borderColor:'rgba(255,255,255,.2)',
            borderWidth:3,
        }],
        labels:label
    }

    var options={
        layout: {
            padding: {
                left: 100,
                right: 100,
                top: 0,
                bottom: 0
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


    var pieChart=new Chart(ctx,{
        type:'doughnut',
        data:data,
        options:options
    });

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


//window resized
var rtime;
var timeout=false;
var delta=200;
$(window).resize(function(){
    rtime=new Date();
    if(timeout===false){
        timeout=true;
        setTimeout(resizeend,delta);
    }
})

function resizeend(){
    if(new Date()-rtime<delta){
        setTimeout(resizeend,delta);
    }else{
        timeout=false;
        $('svg').remove();
        console.log("resized!")
        render();
    }
}

//modal
// $('#categoryDetail').modal('show');


$('#categoryDetail').on('shown.bs.modal',function(e){
    var category=$('#table .label_active').text();
    $('.modal .modal-header h4').html(category);
    renderDetails(category.toLowerCase(),dataToRender);

    var categoryID=$('#table .label_active').attr('id');
    var index=categoryID.slice(14);  //category_label10
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


function renderDetails(category,its){
    $('.modal .modal-body').empty();
    if(its.length>0){
        var items_filter_category=[];
        its.forEach(function(e){
            if(e.category==category) items_filter_category.push(e);
        });
        var item_order=reorder(items_filter_category);
        // console.log(items_filter_category.length);
        // items_filter_category=items_filter_category.slice(1);
        while(item_order.length>0) {
            var currentItems=[];
            currentItems.push(item_order[0]);
            var currentDate=item_order[0].date;
            // console.log(currentDate);
            item_order=item_order.slice(1);
            while(item_order.length>0){
                if(item_order[0].date==currentDate){
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
        var newDate=new Date(yr,mth,d,hr,min,sec);
        e.date=newDate;
    })

    itms.sort(function(a,b){
        return a.date - b.date;
    });

    itms.forEach(function(e){
        e.date=e.date.toDateString();
    });

    return itms;
}


// edit, delete buttons
// $('#categoryDetail .btns').click(function(){
//     $(this).children().css('display','flex');
// })
