var display_year,display_month;

function msg(){
    console.log("click!");
}


$('#year li').click(function(){
    if(!$(this).hasClass('active')) {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        display_year=$(this).text();
        console.log("change render year: "+display_year);
        getData();
    }
})

$('#month li').click(function(){
    if(!$(this).hasClass('active')) {
        $(this).siblings().removeClass('active');
        $(this).addClass('active');
        display_month=$(this).text().toLowerCase();
        console.log("change render month: "+display_month);
        $('#bar_chart svg').remove();
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
    console.log("get data!")
    var display_items=[];
    jQuery.ajax({
        url : '/item/get',
        dataType : 'json',
        success : function(response) {
            var items = response.item;
            items.forEach(function(e){
                var y=e.date.slice(0,4);
                if(y==display_year) display_items.push(e);
            });

            if(display_month=="all"){
                //render barchart by month
                renderBarMonth(display_items);
            } else {
                //render barchart by day)
                renderBarDay(display_items);
            }
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

function renderBarMonth(itms){
    var bardata=[0,0,0,0,0,0,0,0,0,0,0,0];
    itms.forEach(function(e){
        var m=e.date.slice(5,7);
        bardata[m-1]+=e.expense;
    })
    console.log(bardata);
    var height=210;
    var width=$('.container').width();
    var bandWidth=(width-11)/12;
    var height_background=260;
    var extend_on_hover=10;

    var chart_holder=d3.select('#bar_chart').append('svg')
                        .attr('width',width)
                        .attr('height',height_background+extend_on_hover)
                        .selectAll('rect').data(bardata).enter();

    var background=chart_holder.append('rect')
                    .attr('id',function(d,i){
                        return 'rect'+i;
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
        .duration(1000)
        .ease(d3.easeBounceOut)
        .delay(function(d,i){
            return i*50;
        })
        .attr('height',function(d){
            return yScale(d);
        })
        .attr('y',function(d){
            return height_background+extend_on_hover-yScale(d);
        })

// expense number
    chart_holder.append('text')
        .attr('class','hidden')
        .attr('id',function(d,i){
            return "text"+i;
        })
        .attr('text-anchor','middle')
        .attr('x',function(d,i){
            return bandWidth*i+i-1+bandWidth/2;
        })
        .attr('y',function(d){
            return height_background+extend_on_hover-yScale(d)-10;
        })
        .text(function(d){
            return '$' + d.toFixed(2);
        });

// bar chart month label
var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Otc','Nov','Dec'];
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
            return months[i];
        });




    function barchartMouseOverEffect(d,i){
        d3.select('#rect'+i)
            .transition()
            .style('opacity','1')
            .attr('height',height_background+extend_on_hover)
            .attr('y',0);
        d3.select('#text'+i)
            .transition()
            .attr('class','expense')
            .attr('y',function(d){
                return height_background+extend_on_hover-yScale(d)-10;
            });
        d3.select('#label'+i)
            .transition()
            .attr('y',24)
            .style('fill','#000')
    }

    function barchartMouseOutEffect(d,i){
        d3.select('#rect'+i)
            .transition()
            .style('opacity','.5')
            .attr('height',height_background)
            .attr('y',extend_on_hover);
        d3.select('#text'+i)
            .transition()
            .attr('class','hidden')
            .attr('y',function(d){
                return height_background+extend_on_hover-yScale(d);
            })
        d3.select('#label'+i)
            .transition()
            .attr('y',34)
            .style('fill','#fff')

    }
}

function renderBarDay(itms){

}