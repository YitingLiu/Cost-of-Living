$(window).ready(function(){
    if( $("#expense_input").val()!='') $("#expense_input").parent().parent().addClass("filled");
    if( $("#name_input").val()!='') $("#name_input").parent().parent().addClass("filled");
    if( $("#quantity_input").val()!='') $("#quantity_input").parent().parent().addClass("filled");

    var c=$("#category_input").val();
    $("#"+c).addClass("selected");
})

// input label animation when focus/filled
$(".input_container input").focus(function(){
    $(this).parent().parent().addClass("active");
    $(this).parent().parent().removeClass("filled")
});

$(".input_container input").focusout(function(){
    if($(this).val()!="") $(this).parent().parent().addClass("filled");
    $(this).parent().parent().removeClass("active")
})

//select category, then send to input value
$(".category").click(function(){
    $(".category").removeClass("selected");
    $(this).addClass("selected");

    // console.log($(this).find("p").text());
    $("#category_input").val($(this).find("p").text());
})

// quantity label animation
$(".input_group #quantity_input").focus(function(){
    $(this).next().addClass("small");
});

$(".input_group #quantity_input").focusout(function(){
    if($(this).val()=='') $(this).next().removeClass("small");
});