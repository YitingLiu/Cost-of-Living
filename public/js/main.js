// input underline animation when focus
$(".input_group input").focus(function(){
    $(this).parent().next().addClass("input_highlight")
});

$(".input_group input").focusout(function(){
    $(this).parent().next().removeClass("input_highlight")
})

//select category, then send to input value
$(".category button").click(function(){
    $(this).parent().addClass("selected");
    $(this).parent().siblings().removeClass("selected");

    $("#category_input").val($(this).find("p").text());
})

// quantity label animation
$(".input_group #quantity_input").focus(function(){
    $(this).next().addClass("small");
});

$(".input_group #quantity_input").focusout(function(){
    if($(this).val()=='') $(this).next().removeClass("small");
});

