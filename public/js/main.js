$(".input_group input").focus(function(){
    $(this).parent().next().addClass("input_highlight")
});

$(".input_group input").focusout(function(){
    $(this).parent().next().removeClass("input_highlight")
})

$(".category button").click(function(){
    $(this).parent().addClass("selected");
    $(this).parent().siblings().removeClass("selected");

    $("#category_input").val($(this).find("p").text());
})