let sendMessageBtn = document.getElementById("msgBtn");
sendMessageBtn.addEventListener("click", (e) => {
    e.preventDefault();
    $.ajax({
        type: "POST",
        url: "/contact",
        data: $("#contactForm").serialize(),
        success: function (data) {
            console.log(data);
        }
    })
})
// console.log(sendMessageBtn);
// console.log($);