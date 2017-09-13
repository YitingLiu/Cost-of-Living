var display_year,display_month;
var dataToRender;

function msg(){
    console.log("click!");
}

$('#year li').click(function(){
    if(!$(this).hasClass('active')) {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        display_year=$(this).text();
        console.log("Year Changed: "+display_year);
        $('svg').remove();

        getData();
    }
})

$('#month li').click(function(){
    if(!$(this).hasClass('active')) {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        display_month=$(this).text().toLowerCase();
        console.log("Month Changed: "+display_month);
        $('svg').remove();

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
    var items_filter_year=[];
    jQuery.ajax({
        url : '/item/get',
        dataType : 'json',
        success : function(response) {
            var items = response.item;
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

            dataToRender=items_filter_month;

            renderBarChart(items_filter_month);
            renderTable(items_filter_month);
            renderPieChart(items_filter_month);
            // console.log(item[0].date.slice(0,4));
            // for(var i=0;i<people.length;i++){
            //     var htmlToAdd = '<div class="col-md-4">'+
            //         '<img src='+people[i].imageUrl+' width="100">'+
            //         '<h1>'+people[i].name+'</h1>'+
            //         '<ul>'+
            //             '<li>Year: '+people[i].itpYear+'</li>'+
            //             '<li>Interests: '+people[i].interests+'</li>'+
            //         '</ul>'+
            //         '<a href="/edit/'+people[i]._id+'">Edit Person</a>'+
            //     '</div>';

            //     jQuery("#people-holder").append(htmlToAdd);
            // }
        }
    })
}

function renderBarChart(items){
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
    var tabelData=new tableObj(items);
    var label=Object.keys(tabelData);
    label=label.slice(0,12);  // incase there is other category name extended over 12
    var data=Object.values(tabelData);
    data=data.slice(0,12);  // incase there is other category name extended over 12
    var height=50;
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
    console.log("Pie Chart Rendered!")
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
        getData();
    }
}

//modal
// $('#categoryDetail').modal('show');
$('#categoryDetail').on('show.bs.modal',function(e){
    var category=$('#table .label_active').text();
    var categoryID=$('#table .label_active').attr('id');
    var index=categoryID.slice(14);  //category_label10
    $('.modal .modal-header h4').html($('#table .label_active').text());
})

$('#categoryDetail .btns').click(function(){
    $(this).children().css('display','flex');
})
