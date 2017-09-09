$(window).ready(function(){
    var h = $(window).width();
    var dis=0.03*h;

    $("img.title").css("top",0);
    $("img.background").css("top",0.05*h);
    $("img.buildings").css("top",0.04*h);
    $("img.other").css("top",0.3*h-dis);
    $("#newyork img.other").css("left",- dis);
    $("#suzhou img.other").css("right",- dis);

    $("img.title").animate({
        top:"-=" + String(dis),
        opacity:1
    },1000)

    $("#newyork img.graphic").each(function(i){
        $(this).delay(250*i+250).animate({
            top:"-=" + String(dis),
            opacity:1
        },1000,function(){
            $("#newyork .other").animate({
                left:0,
                opacity:1
            })
        })
    });

    $("#suzhou img.graphic").each(function(i){
        $(this).delay(250*i+250).animate({
            top:"-=" + String(dis),
            opacity:1
        },1000, function(){
            $("#suzhou .other").animate({
                right:0,
                opacity:1
            })
        })
    })
});


